import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import svg2font from 'svgicons2svgfont';
import svg2ttf from 'svg2ttf';
import ttf2eot from 'ttf2eot';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';
import * as prettier from 'prettier';
import * as stylelint from 'stylelint';
import * as csstree from 'css-tree';
import * as cwlog from 'chowa-log';
import mergeOptions, { defaultOptions, Options } from './options';
import * as utils from './utils';
import { manifestFileName } from './config';

interface Metadata {
    name: string;
    unicode: string[];
}

interface Glyph {
    name: string;
    point: number;
    path: string;
    hex: string;
}

export interface Manifest {
    stamp: number;
    hash: string;
    glyphs: Glyph[];
}

// step 1
function clear(cwd: string) {
    const manifestPath = path.join(cwd, manifestFileName);

    if (!utils.isFile(manifestPath)) {
        return ;
    }

    let files = [];

    try {
        const manifest = fs.readFileSync(manifestPath).toString();
        const preManifest = JSON.parse(manifest);
        if (Array.isArray(preManifest.files)) {
            files = preManifest.files;
        }
    }
    catch (e) {
        cwlog.error(e);
        return;
    }

    files.forEach((file) => {
        utils.remove(file);
    });
}

// step2
async function scanSvgConvertToGlyph(opts: Options): Promise<{ glyphs: Buffer; map: Glyph[] }> {
    const { cwd, compile: compileOpts, input: inputOpts } = opts;
    const { svgsDir } = inputOpts;
    const { fontName, startPoint } = compileOpts;
    const scanDir = path.resolve(cwd, svgsDir);

    return new Promise((resolve) => {
        let buffer = Buffer.alloc(0);
        const svgFiles = [];
        const map: Glyph[] = [];

        fs.readdirSync(scanDir).forEach((file) => {
            if (path.extname(file) === '.svg') {
                svgFiles.push(file);
            }
        });

        if (svgFiles.length === 0) {
            cwlog.warning('Svg file not scanned');
            process.exit();
        }

        cwlog.info(`Scanned a total of ${svgFiles.length} svg files`);

        const stream = new svg2font({
            fontName,
            normalize: true,
            fontHeight: 1024,
            round: 1000,
            fontWeight: 400,
            log: () => {
                cwlog.info('Scan completed and ready for vector font generation');
            }
        }).on('data', (glyphBuffer: Buffer) => {
            buffer = Buffer.concat([buffer, glyphBuffer]);
        }).on('finish', () => {
            resolve({ glyphs: buffer, map });
        });

        svgFiles.forEach((file, index) => {
            const svgPath = path.join(scanDir, file);
            const glyph: fs.ReadStream & { metadata?: Metadata } = fs.createReadStream(svgPath);
            const point = startPoint + index;
            const name = path.parse(file).name
                .replace(/^\s+|\s+$/g, '')
                .replace(/[[,\]`~!@#$%^&*:;><|.\\ /=，。；‘”…【】·！（）()]+/g, '_');

            glyph.metadata = {
                name,
                unicode: [String.fromCharCode(point)]
            };

            map.push({
                name,
                point,
                path: svgPath,
                hex: point.toString(16)
            });

            stream.write(glyph);
        });

        stream.end();
    });
}

function computedHash(str: string): string {
    const handle = crypto.createHash('md5');

    return handle.update(str).digest('hex');
}

function generateFontsFile(glyphs: Buffer, hash: string, opts: Options): string[] {
    const {
        cwd,
        compile: compileOpts,
        output: outputOpts,
        hash: hashOpts
    } = opts;
    const { font: fontHash, len: hashLen } = hashOpts;
    const { fontName } = compileOpts;
    const { font: fontPath } = outputOpts;
    const { buffer: ttfContent } = svg2ttf(glyphs.toString());
    const { buffer: eotContent } = ttf2eot(ttfContent);
    const { buffer: woffContent } = ttf2woff(ttfContent);
    const woff2Content = ttf2woff2(ttfContent);
    const fontFils = [];

    [
        { ext: 'svg', content: glyphs },
        { ext: 'ttf', content: ttfContent },
        { ext: 'eot', content: eotContent },
        { ext: 'woff', content: woffContent },
        { ext: 'woff2', content: woff2Content }
    ].forEach(({ ext, content }) => {
        const fontSaveDir = path.resolve(cwd, fontPath);
        const fontSavePath = path.join(
            fontSaveDir,
            utils.createHashFileName(fontName, ext, fontHash, hash, hashLen)
        );

        utils.mkdir(fontSaveDir);

        try {
            fs.writeFileSync(fontSavePath, content);
        }
        catch (e) {
            cwlog.error(`Generate ${ext} font ${fontSavePath} error`);
            process.exit();
        }

        cwlog.success(`Generate ${ext} font file on ${fontSavePath}`);
        fontFils.push(fontSavePath);
    });

    return fontFils;
}

function generateStyleSelector(
    tpl: string,
    selector: string,
    map: Glyph[],
    hash: string,
    savePath: string,
    opts: Options
): string {
    const {
        cwd,
        compile: compileOpts,
        output: outputOpts,
        hash: hashOpts
    } = opts;
    const { fontName } = compileOpts;
    const { font: fontSavePath } = outputOpts;
    const { font: fontHash, len: hashLen } = hashOpts;
    const globalSelector = utils.computedParentSelector(selector);
    const fontSaveName = utils.createHashFileName(fontName, '', fontHash, hash, hashLen);
    let fontRelativePath = path.join(
        path.relative(
            path.parse(savePath).dir,
            path.parse(path.resolve(cwd, fontSavePath, fontSaveName)).dir
        ),
        fontSaveName
    );

    if (process.platform === 'win32') {
        fontRelativePath = utils.win2posix(fontRelativePath);
    }

    // glyph
    const selectors = [];

    map.forEach(({ name, hex }) => {
        selectors.push(`${selector.replace(/{{glyph}}/, name)}:before {content: "\\${hex}";}`);
    });

    return tpl
        .replace(/{{fontName}}/g, fontName)
        .replace(/{{fontPath}}/g, fontRelativePath)
        .replace(/{{selector}}/g, globalSelector)
        .replace(/{{glyphs}}/g, selectors.join('\n\n'));
}

function generateStyleFile(map: Glyph[], hash: string, opts: Options): Promise<string> {
    const {
        cwd,
        compile: compileOpts,
        input: inputOpts,
        format: formatOpts,
        output: outputOpts,
        global,
        stylelint: formatWithStylelint,
        hash: hashOpts
    } = opts;
    const { syntax, styleFileName, selector } = compileOpts;
    const { style: styleHash, len: hashLen } = hashOpts;
    const { styleTpl: styleTplPath } = inputOpts;
    const { style: stylePath } = outputOpts;

    const styleTplContent = fs.readFileSync(path.resolve(cwd, styleTplPath)).toString();
    const styleSaveDir = path.resolve(cwd, stylePath);
    const styleSavePath = path.join(
        styleSaveDir,
        utils.createHashFileName(styleFileName, syntax, styleHash, hash, hashLen)
    );

    utils.mkdir(styleSaveDir);

    let result = generateStyleSelector(styleTplContent, selector, map, hash, styleSavePath, opts);

    // 豁免css module
    if (global) {
        const ast = csstree.parse(result);

        csstree.walk(ast, (node, item, list) => {
            if (node.type !== 'ClassSelector' && node.type !== 'IdSelector') {
                return;
            }

            const aa = list.createItem({
                type: 'PseudoClassSelector',
                name: `global(${node.type === 'ClassSelector' ? '.' : '#'}${node.name})`,
                children: null
            });

            list.replace(item, aa);
        });

        result = csstree.generate(ast);
    }

    // 格式化
    result = prettier.format(result, { ...formatOpts, parser: syntax });

    return new Promise((resolve) => {
        const finish = (content: string) => {
            fs.writeFileSync(styleSavePath, content);

            cwlog.success(`Generate style file on ${styleSavePath}`);

            resolve(styleSavePath);
        };

        if (formatWithStylelint) {
            stylelint.lint({
                configBasedir: cwd,
                fix: true,
                code: result,
                syntax: syntax as stylelint.SyntaxType
            }).then(({ output }) => finish(output));
        }
        else {
            finish(result);
        }
    });
}

function generatePreviewFile(map: Glyph[], hash: string, opts: Options): string {
    const {
        cwd,
        input: inputOpts,
        output: outputOpts,
        compile: compileOpts,
        format: formatOpts
    } = opts;
    const { compile: defaultCompile } = defaultOptions;
    const { previewTpl: previewTplPath } = inputOpts;
    const { preview: previewPath } = outputOpts;
    const { selector: customSelector } = compileOpts;
    const { selector: defaultSelector } = defaultCompile;
    const globalSelector = utils.computedParentSelector(defaultSelector);
    const previewSaveDir = path.resolve(cwd, previewPath);
    const previewSavePath = path.join(previewSaveDir, 'cwfont-preview.html');
    const styleContent = generateStyleSelector(
        fs.readFileSync(path.join(__dirname, 'template/style.tpl')).toString(),
        defaultSelector,
        map,
        hash,
        previewSavePath,
        opts
    );
    const htmlTplContent = fs.readFileSync(path.resolve(cwd, previewTplPath)).toString();

    utils.mkdir(previewSaveDir);

    // icons
    const icons = [];
    map.forEach(({ name }) => {
        const iconCustomSelector = customSelector.replace(/{{glyph}}/, name);
        const iconDefaultSelector = defaultSelector.replace(/{{glyph}}/, name);

        icons.push(
            `<li title="${iconCustomSelector}">
                <div class="icon">
                    <i class="${globalSelector.replace(/\./, '')} ${iconDefaultSelector.replace(/\./, '')}"></i>
                </div>
                <div class="name">${iconCustomSelector}</div>
            </li>`
        );
    });

    let result = htmlTplContent
        .replace(/{%styles%}/, styleContent)
        .replace(/{%icons%}/, icons.join(''));

    result = prettier.format(result, { ...formatOpts, parser: 'html' });
    fs.writeFileSync(previewSavePath, result);

    cwlog.success(`Generate preview file on ${previewSavePath}`);

    return previewSavePath;
}

function createManifestFile(cwd: string, map: Glyph[], hash: string, files: string[]) {
    const mainifset = {
        stamp: +new Date(),
        hash: hash,
        glyphs: map,
        files
    };

    const result = prettier.format(JSON.stringify(mainifset), { ...defaultOptions.format, parser: 'json' });
    fs.writeFileSync(path.join(cwd, manifestFileName), result);
}

async function generator(options: Options) {
    cwlog.info('Generating, please wait');

    const opts = mergeOptions(options);
    const { cwd, preview } = opts;

    // 执行清理
    clear(cwd);

    // 提取svg
    const { glyphs, map } = await scanSvgConvertToGlyph(opts);

    // 计算md5
    const hash = computedHash(glyphs.toString());

    // 生成字体文件
    const fontFiles = generateFontsFile(glyphs, hash, opts);

    // 生成样式文件
    const styleFile = await generateStyleFile(map, hash, opts);

    const files = [].concat(fontFiles, styleFile);

    // 生成预览
    if (preview) {
        const previewFile = generatePreviewFile(map, hash, opts);
        files.push(previewFile);
    }

    createManifestFile(cwd, map, hash, files);

    cwlog.info('Mission completed');
}

export default generator;

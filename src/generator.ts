import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import svgToFont from 'svgicons2svgfont';
import svgToTtf from 'svg2ttf';
import ttfToEot from 'ttf2eot';
import ttfToWoff from 'ttf2woff';
import ttfToWoff2 from 'ttf2woff2';
import * as prettier from 'prettier';
import * as stylelint from 'stylelint';
import mergeOptions, { Options, defaultOptions } from './options';
import * as utils from './utils';
import * as log from './log';

interface Metadata {
    name: string;
    unicode: string[];
}

interface SelectorMap {
    name: string;
    point: number;
    path: string;
    hex: string;
}

export interface Manifest {
    stamp: number;
    hash: string;
    glyphs: SelectorMap[];
}

const manifestFileName = '.cwiconfont.manifest';

class ChowaGenerator {

    private options: Options;

    public constructor(options: Options) {
        log.info('正在生成，请稍后……');

        this.options = mergeOptions(options);

        // 执行清理
        this.clean();

        this.convertSvgFileToGlyphFile()
            .then(async ({ svgContent, map }) => {
                // 计算md5
                const md5 = this.computedMd5(svgContent.toString());

                // 生成字体文件
                const fontFiles = this.createFontsFile(svgContent, md5);

                // 生成样式文件
                const styleFile = await this.createStyleFile(map, md5);

                // 生成预览文件
                const previewFile = this.createPreviewFile(map, md5);

                const files = [].concat(fontFiles, styleFile);

                if (this.options.preview) {
                    files.push(previewFile);
                }

                // manifest
                this.createManifest(map, md5, files);

                log.info('任务完成');
            }, () => {
                log.warning('未扫描到svg文件，或无字体生成，程序已退出');
            });
    }

    private autoCreateHashName(name: string, hash: string, ext: string, bindHash = false): string {
        const { len } = this.options.hash;

        const hashFix = bindHash ? `_${hash.substr(0, len)}` : '';

        return `${name}${hashFix}.${ext}`;
    }

    private async convertSvgFileToGlyphFile(): Promise<{ svgContent: Buffer; map: SelectorMap[] }> {
        const { cwd, compile, input } = this.options;
        const { svgsDir } = input;
        const { fontName, startPoint } = compile;
        const scanDir = path.resolve(cwd, svgsDir);

        return new Promise((resolve, reject) => {
            let buffer = Buffer.alloc(0);
            const svgFiles = [];
            const map: SelectorMap[] = [];

            fs.readdirSync(scanDir).forEach((file) => {
                if (path.extname(file) === '.svg') {
                    svgFiles.push(file);
                }
            });

            if (svgFiles.length === 0) {
                return reject();
            }

            log.info(`共扫描到${svgFiles.length}个svg文件`);

            const stream = new svgToFont({
                fontName,
                normalize: true,
                fontHeight: 1024,
                round: 1000,
                fontWeight: 400,
                log: () => {
                    log.info('扫描完成，准备进行矢量字体生成');
                }
            }).on('data', (glyphBuffer: Buffer) => {
                buffer = Buffer.concat([buffer, glyphBuffer]);
            }).on('finish', () => {
                resolve({ svgContent: buffer, map });
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

    private clean() {
        const { cwd } = this.options;
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
            log.error(e);
            return;
        }

        files.forEach((file) => {
            utils.remove(file);
        });
    }

    private computedMd5(computedMd5: string): string {
        const handle = crypto.createHash('md5');

        return handle.update(computedMd5).digest('hex');
    }

    private createFontsFile(svgContent: Buffer, md5: string): string[] {
        const { cwd, compile, output, hash } = this.options;
        const { font: fontHash } = hash;
        const { fontName } = compile;
        const { font: fontPath } = output;
        const { buffer: ttfContent } = svgToTtf(svgContent.toString());
        const { buffer: eotContent } = ttfToEot(ttfContent);
        const { buffer: woffContent } = ttfToWoff(ttfContent);
        const woff2Content = ttfToWoff2(ttfContent);
        const fontFils = [];

        [
            { ext: 'svg', content: svgContent },
            { ext: 'ttf', content: ttfContent },
            { ext: 'eot', content: eotContent },
            { ext: 'woff', content: woffContent },
            { ext: 'woff2', content: woff2Content }
        ].forEach(({ ext, content }) => {
            const fontSaveDir = path.resolve(cwd, fontPath);

            utils.mkdir(fontSaveDir);

            const fontSavePath = path.join(fontSaveDir, this.autoCreateHashName(fontName, md5, ext, fontHash));

            try {
                fs.writeFileSync(fontSavePath, content);
            }
            catch (e) {
                log.error(`生成${ext}字体 ${fontSavePath} 错误`);
                process.exit();
            }

            log.success(`生成${ext}字体 ${fontSavePath}`);
            fontFils.push(fontSavePath);
        });

        return fontFils;
    }

    private computedGlobalSelector(selector: string): string {
        return selector.substr(0, selector.indexOf('{{glyph}}') - 1);
    }

    private computedStyleContent(
        tpl: string,
        selector: string,
        map: SelectorMap[],
        md5: string,
        savePath: string
    ): string {
        const { cwd, compile, output, hash } = this.options;
        const { fontName } = compile;
        const { font: fontHash } = hash;
        const { font: fontSavePath } = output;
        const globalSelector = this.computedGlobalSelector(selector);
        const fontSaveName = this.autoCreateHashName(fontName, md5, '', fontHash);

        // glyph
        const glyphs = [];

        map.forEach(({ name, hex }) => {
            glyphs.push(`${selector.replace(/{{glyph}}/, name)}:before {content: "\\${hex}";}`);
        });
        const glyphsContent = glyphs.join('\n\n');

        return tpl
            .replace(/{{fontName}}/g, fontName)
            .replace(/{{fontPath}}/g, path.join(
                path.relative(
                    path.parse(savePath).dir,
                    path.parse(path.resolve(cwd, fontSavePath, fontSaveName)).dir
                ),
                fontSaveName
            ))
            .replace(/{{selector}}/g, globalSelector)
            .replace(/{{glyphs}}/g, glyphsContent);
    }

    private async createStyleFile(map: SelectorMap[], md5: string): Promise<string> {
        const { cwd, compile, input, format, output, module, stylelint: formatWithStylelint, hash } = this.options;
        const { syntax, styleFileName, selector } = compile;
        const { style: styleHash } = hash;
        const { styleTpl: styleTplPath } = input;
        const { style: stylePath } = output;
        const styleTplContent = fs.readFileSync(path.resolve(cwd, styleTplPath)).toString();
        const styleSaveDir = path.resolve(cwd, stylePath);
        const styleSavePath = path.join(styleSaveDir, this.autoCreateHashName(styleFileName, md5, syntax, styleHash));

        utils.mkdir(styleSaveDir);

        let result = this.computedStyleContent(styleTplContent, selector, map, md5, styleSavePath);

        if (module && syntax !== 'css') {
            result = `:global{\n${result}\n}`;
        }

        result = prettier.format(result, { ...format, parser: syntax });

        return new Promise((resolve) => {
            const last = (content: string) => {
                fs.writeFileSync(styleSavePath, content);

                log.success(`生成样式文件 ${styleSavePath}`);

                resolve(styleSavePath);
            };

            if (formatWithStylelint) {
                stylelint.lint({
                    configBasedir: cwd,
                    fix: true,
                    code: result,
                    syntax: syntax as stylelint.SyntaxType
                }).then(({ output }) => last(output));
            }
            else {
                last(result);
            }
        });
    }

    private createPreviewFile(map: SelectorMap[], md5: string): string {
        const { cwd, preview, input, output, compile, format } = this.options;
        const { compile: defaultCompile } = defaultOptions;

        if (!preview) {
            return;
        }

        const { previewTpl: previewTplPath } = input;
        const { preview: previewPath } = output;
        const { selector: customSelector } = compile;
        // 解决scss、less 自定义变量问题
        const { selector: defaultSelector } = defaultCompile;
        const globalSelector = this.computedGlobalSelector(defaultSelector);
        const previewSaveDir = path.resolve(cwd, previewPath);
        const previewSavePath = path.join(previewSaveDir, 'cwiconfont-preview.html');
        const styleContent = this.computedStyleContent(
            fs.readFileSync(path.join(__dirname, 'template/style.tpl')).toString(),
            defaultSelector,
            map,
            md5,
            previewSavePath
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

        result = prettier.format(result, { ...format, parser: 'html' });
        fs.writeFileSync(previewSavePath, result);

        log.success(`生成预览html文件 ${previewSavePath}`);

        return previewSavePath;
    }

    private createManifest(map: SelectorMap[], md5: string, files: string[]) {
        const { cwd, format } = this.options;
        const mainifset = {
            stamp: +new Date(),
            hash: md5,
            glyphs: map,
            files
        };

        const result = prettier.format(JSON.stringify(mainifset), { ...format, parser: 'json' });
        fs.writeFileSync(path.join(cwd, manifestFileName), result);
    }
}

export default ChowaGenerator;

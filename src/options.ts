import * as path from 'path';
import cwlog from 'chowa-log';
import * as utils from './utils';

export type Style = 'scss' | 'css' | 'less';

export interface CompileOptions {
    syntax?: Style;
    startPoint?: number;
    fontName?: string;
    styleFileName?: string;
    selector?: string;
}

export interface HashOptions {
    font?: boolean;
    style?: boolean;
    len?: number;
}

type EndOfLine = 'lf' | 'crlf' | 'cr';

export interface FormatOptions {
    printWidth?: number;
    tabWidth?: number;
    useTabs?: boolean;
    semi?: boolean;
    endOfLine?: EndOfLine;
}

export interface InputOptions {
    svgsDir?: string;
    styleTpl?: string;
    previewTpl?: string;
}

export interface OutputOptions {
    font?: string;
    style?: string;
    preview?: string;
}

export interface Options {
    cwd: string;
    compile?: CompileOptions;
    preview?: boolean;
    hash?: HashOptions;
    // css module
    global?: boolean;
    // stylelint format
    stylelint?: boolean;
    format?: FormatOptions;
    input?: InputOptions;
    output?: OutputOptions;
}

export const defaultOptions = {
    compile: {
        syntax: 'css' as Style,
        startPoint: 51666,
        fontName: 'chowa-iconfont',
        styleFileName: 'chowa-iconfont',
        // 配置必须前面有分隔符
        selector: '.cw-icon-{{glyph}}'
    },
    global: false,
    stylelint: false,
    hash: {
        font: false,
        style: false,
        len: 8
    },
    preview: true,
    format: {
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        semi: true,
        endOfLine: 'lf' as EndOfLine
    },
    input: {
        svgsDir: './svg-icons',
        styleTpl: null,
        previewTpl: null
    },
    output: {
        font: './',
        style: './',
        preview: './'
    }
};

const padInput = (input: InputOptions): InputOptions => {
    const ret = { ...input };

    if (!utils.isDir(ret.svgsDir)) {
        cwlog.error('Parameter error, svg file directory does not exist');
        process.exit();
    }

    if (!utils.isFile(ret.styleTpl)) {
        ret.styleTpl = path.join(__dirname, 'template/style.tpl');
    }

    if (!utils.isFile(ret.previewTpl)) {
        ret.previewTpl = path.join(__dirname, 'template/preview.tpl');
    }

    return ret;
};

const mergeOptions = (opt: Options): Options => {
    const { cwd, global, compile, preview, format, output, input, hash, stylelint } = opt;

    if (!utils.isDir(cwd)) {
        cwlog.error('Parameter error, execution directory does not exist');
        process.exit();
    }

    const ret = {
        cwd,
        compile: {
            ...defaultOptions.compile,
            ...compile
        },
        hash: {
            ...defaultOptions.hash,
            ...hash
        },
        global: Boolean(global),
        stylelint: Boolean(stylelint),
        preview: Boolean(preview),
        format: {
            ...defaultOptions.format,
            ...format
        },
        output: {
            ...defaultOptions.output,
            ...output
        },
        input: padInput(input)
    };

    return ret;
};

export default mergeOptions;

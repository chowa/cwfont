import * as fs from 'fs';
import * as path from 'path';
import cwlog from 'chowa-log';

export function isDir(str: string): boolean {
    return fs.existsSync(str) && fs.statSync(str).isDirectory();
}

export function isFile(str: string): boolean {
    return fs.existsSync(str) && fs.statSync(str).isFile();
}

export function remove(str: string) {
    if (isFile(str)) {
        cwlog.info(`Cleaning up ${str}`);
        fs.unlinkSync(str);
    }
}

export function mkdir(dir: string) {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                mkdir(path.dirname(dir));
                mkdir(dir);
            }
        }
    }
}

export function createHashFileName(name: string, ext: string, bindHash = false, hash: string, len: number): string {
    const hashFix = bindHash ? `_${hash.substr(0, len)}` : '';

    return `${name}${hashFix}.${ext}`;
}

export function computedParentSelector(selector: string): string {
    return selector.substr(0, selector.indexOf('{{glyph}}') - 1);
}

// fix font path in style on win32
export function win2posix(str: string): string {
    return str.replace(/\\+/g, '/');
}

import * as fs from 'fs';
import * as path from 'path';
import * as cwlog from 'chowa-log';

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
                this.mkdir(path.dirname(dir));
                this.mkdir(dir);
            }
        }
    }
}

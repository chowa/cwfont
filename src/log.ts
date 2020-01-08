import colors from 'colors/safe';

const concat = (msg: string) => {
    return `【cwfont】 ${msg}`; // eslint-disable-line
};

export function success(msg: string) {
    console.log(colors.green(concat(msg)));
}

export function warning(msg: string) {
    console.log(colors.yellow(concat(msg)));
}

export function error(msg: string) {
    console.log(colors.red(concat(msg)));
}

export function info(msg: string) {
    console.log(colors.grey(concat(msg)));
}

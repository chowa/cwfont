const path = require('path');
const fs = require('fs');
const { utils, log, config } = require('../es');

const logo = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400px" height="411px" viewBox="0 0 400 411" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="logo" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M10.6789533,199.498867 L195.250617,13.9211347 C197.798244,11.3596218 201.928762,11.3596218 204.476388,13.9211347 L389.048052,199.498867 L312.729344,199.498867 L200.197155,86.3532847 L87.664966,199.498867 L10.6789533,199.498867 Z M10,212.617196 L88.9611151,212.617196 L151.025259,273.833442 L199.863503,223.162366 L254.361408,274.926065 L314.416493,212.617196 L389.727005,212.617196 L250.256125,352.848308 L201.214558,299.872339 L150.821936,350.539642 L10,212.617196 Z M237.57069,365.602889 L204.476388,396.864482 C201.928762,399.425995 197.798244,399.425995 195.250617,396.864482 L163.507371,363.294223 L201.214558,325.381501 L237.57069,365.602889 Z" fill="#444" fill-rule="nonzero"></path>
    </g>
</svg>`;

const defaultConfigContent = `module.exports = ${JSON.stringify(config, null, 4)}`;

function create(dir) {
    log.info(`正在 ${dir} 目录创建工程`);
    utils.mkdir(dir);

    log.info(`创建 svg-icons 目录`);
    utils.mkdir(path.join(dir, 'svg-icons'));

    log.info(`生成测试 svg 文件`);
    fs.writeFileSync(path.join(dir, 'svg-icons', 'chowa.svg'), logo);

    log.info(`生成配置文件 cwiconfont.config.js`);
    fs.writeFileSync(path.join(dir, 'cwiconfont.config.js'), defaultConfigContent);

    log.success('创建工程成功');
}

module.exports = create;

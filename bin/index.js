#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');
const colors = require('colors');
const packageJson = require('../package.json');
const { Generator, utils, log } = require('../es');
const open = require('open');
const create = require('./create');

function loadCustomOptions() {
    let options = {};

    if (utils.isFile(path.join(process.cwd(), 'cwfont.config.js'))) {
        options = require(path.join(process.cwd(), 'cwfont.config.js'));
    }
    else {
        log.warning('未检测到配置文件，请参考 https://github.com/chowa/iconfont#cli 进行配置');
        process.exit();
    }

    return options;
}

program.version(packageJson.version);

program
    .command('create <dir> [创建目录]')
    .description('创建 iconfont 工程')
    .action((dir) => {
        const createPath = path.resolve(process.cwd(), dir);

        create(createPath);
    });

program
    .command('compile')
    .description('生成iconfont')
    .action(() => {
        new Generator({
            ...loadCustomOptions(),
            cwd: process.cwd()
        });
    });

program
    .command('preview')
    .description('预览iconfont')
    .action(() => {
        const { output } = loadCustomOptions();

        const previewFilePath = path.resolve(process.cwd(), output.preview, 'cwfont-preview.html');

        if (!utils.isFile(previewFilePath)) {
            return log.error('未检测到预览html文件');
        }

        log.info(`正在打开${previewFilePath}`);

        open(previewFilePath);
    });

program.parse(process.argv);

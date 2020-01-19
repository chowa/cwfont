#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');
const rcfile = require('rcfile');
const cwlog = require('chowa-log');
const open = require('open');
const packageJson = require('../package.json');
const { generator, utils } = require('../es');
const { configFileName } = require('../es/config');
const create = require('./create');

function loadCustomOptions() {
    let options = {};
    const configFilePath = path.join(process.cwd(), configFileName);

    if (utils.isFile(configFilePath)) {
        options = rcfile('cwfont');
    }
    else {
        cwlog.warning('No configuration file detected, please refer to https://github.com/chowa/cwfont#cli-usage');
        process.exit();
    }

    return options;
}

program.version(packageJson.version);

program
    .command('create <dir> [Create directory]')
    .description('Create cwfont project')
    .action((dir) => {
        const createPath = path.resolve(process.cwd(), dir);

        create(createPath);
    });

program
    .command('compile')
    .description('Generate iconfont')
    .action(() => {
        new generator({
            ...loadCustomOptions(),
            cwd: process.cwd()
        });
    });

program
    .command('preview')
    .description('Preview iconfont glyphs')
    .action(() => {
        const { output } = loadCustomOptions();

        const previewFilePath = path.resolve(process.cwd(), output.preview, 'cwfont-preview.html');

        if (!utils.isFile(previewFilePath)) {
            return cwlog.error('No preview html file detected');
        }

        cwlog.info(`opening${previewFilePath}`);

        open(previewFilePath);
    });

program.parse(process.argv);

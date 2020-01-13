#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');
const cwlog = require('chowa-log');
const packageJson = require('../package.json');
const { Generator, utils } = require('../es');
const open = require('open');
const create = require('./create');

function loadCustomOptions() {
    let options = {};

    if (utils.isFile(path.join(process.cwd(), 'cwfont.config.js'))) {
        options = require(path.join(process.cwd(), 'cwfont.config.js'));
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
        new Generator({
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

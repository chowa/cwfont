const path = require('path');
const fs = require('fs');
const json2yaml = require('json2yaml');
const cwlog = require('chowa-log');
const { utils, config } = require('../es');
const { configFile } = require('./config');

const logo = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400px" height="411px" viewBox="0 0 400 411" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="logo" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M10.6789533,199.498867 L195.250617,13.9211347 C197.798244,11.3596218 201.928762,11.3596218 204.476388,13.9211347 L389.048052,199.498867 L312.729344,199.498867 L200.197155,86.3532847 L87.664966,199.498867 L10.6789533,199.498867 Z M10,212.617196 L88.9611151,212.617196 L151.025259,273.833442 L199.863503,223.162366 L254.361408,274.926065 L314.416493,212.617196 L389.727005,212.617196 L250.256125,352.848308 L201.214558,299.872339 L150.821936,350.539642 L10,212.617196 Z M237.57069,365.602889 L204.476388,396.864482 C201.928762,399.425995 197.798244,399.425995 195.250617,396.864482 L163.507371,363.294223 L201.214558,325.381501 L237.57069,365.602889 Z" fill="#444" fill-rule="nonzero"></path>
    </g>
</svg>`;

function create(dir) {
    cwlog.info(`Creating project directory: ${dir}`);
    utils.mkdir(dir);

    cwlog.info(`Creating svg files directory`);
    utils.mkdir(path.join(dir, 'svg-icons'));

    cwlog.info(`Generate test svg file`);
    fs.writeFileSync(path.join(dir, 'svg-icons', 'chowa.svg'), logo);

    cwlog.info(`Generate a configuration file: ${configFile}`);
    fs.writeFileSync(path.join(dir, configFile), json2yaml.stringify(config));

    cwlog.success('Project created successfully');
}

module.exports = create;

<p align="center">
    <img src="http://upload.ouliu.net/i/202001081600304i7x6.png" width="240">
</p>


# cwfont

Vector font generation tool(svg files convert to iconfont)

[![Build Status](https://travis-ci.org/chowa/cwfont.svg?branch=master)](https://travis-ci.org/chowa/cwfont)
[![npm](https://img.shields.io/npm/v/cwfont.svg)](https://www.npmjs.com/package/cwfont)
[![npm](https://img.shields.io/npm/dm/cwfont.svg)](https://www.npmjs.com/package/cwfont)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)

## Install

```
npm i cwfont -g
```

## Cli Usage

### Create

```
cwfont create <dir>
```

### Compile

```
cwfont compile
```

Modify `.cwfontrc`，Customize the configuration input and output directories, enable hash and exempt CSS modules, and view the specific configuration [options](#options). (You can use js/json/yaml/yml to write it)

### Preview

```
cwfont preview
```

## API

```js
const ChowaFont = require('cwfont');
```

### Generate font

```js
ChowaFont.generator({
    // executive directory
    cwd: 'xxx',
    ...options
});
```

## Options

```js
{
    // compile options
    compile: {
        // compile syntax, optional CSS | SCSS | less
        syntax: 'css',
        // start value corresponding to font Unicode
        startPoint: 51666,
        // font name
        fontName: 'chowa-iconfont',
        // font file name
        styleFileName: 'chowa-iconfont',
        // font selector, {glyph}} must be preceded by a separator, such as: -
        selector: '.cw-icon-{{glyph}}'
    },
    // exempt CSS module
    global: false,
    // using stylelint to format output code
    stylelint?: boolean;
    // has options
    hash: {
        // font file with hash
        font: false,
        // style file with hash
        style: false,
        // length of hash
        len: 8
    },
    // create preview file
    preview: true,
    // format specific configuration view https://prettier.io/docs/en/options.html
    format: {
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        semi: true,
        endOfLine: 'lf'
    },
    // input options
    input: {
        // svg file directory
        svgsDir: './svg-icons',
        // style file template
        styleTpl: null,
        // preview file template
        previewTpl: null
    },
    // output options
    output: {
        // font file saving directory
        font: './',
        // style file saving directory
        style: './',
        // preview file saving directory
        preview: './'
    }
}
```

## Customize template

* [style template](src/template/style.tpl)
* [preview template](src/template/preview.tpl)

## Attention

* Svg file names should be free of spaces and special symbols
* The 'selector' option '{{glyph}}' in the configuration file must be preceded by a separator
* Drawing SVG graph with single path

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present, chowa.cn

<p align="center">
    <img src="http://upload.ouliu.net/i/202001081600304i7x6.png" width="240">
</p>


# cwfont

> cwfont

[![Build Status](https://travis-ci.org/chowa/cwfont.svg?branch=master)](https://travis-ci.org/chowa/cwfont)
[![npm](https://img.shields.io/npm/v/cwfont.svg)](https://www.npmjs.com/package/cwfont)
[![npm](https://img.shields.io/npm/dm/cwfont.svg)](https://www.npmjs.com/package/cwfont)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)

## 安装

```
npm i cwfont -g
```

## CLI

### 创建工程

```
cwfont create <dir>
```

### 编译

```
cwfont compile
```

可以修改`cwfont.config.js`，自定义配置输入、输出目录，开启hash、豁免css modules；具体配置查看[options](#options)


### 预览

```
cwfont preview
```

## API

```js
const ChowaFont = require('cwfont');
```

### 生成字体

```js
ChowaFont.Generator({
    // 执行目录
    cwd: 'xxx',
    ...options
});
```

[options](#options)

## options

```js
{
    // 编译选项
    compile: {
        // 编译语法，可选css | scss | less
        syntax: 'css',
        // 字体Unicode对应的起始数值
        startPoint: 51666,
        // 字体名称
        fontName: 'chowa-iconfont',
        // 字体文件名称
        styleFileName: 'chowa-iconfont',
        // 字体选择器，{{glyph}}前必须带有分隔符，如：- _等
        selector: '.cw-icon-{{glyph}}'
    },
    // 豁免 css module
    module: false,
    // 使用stylelint进行产出代码格式化
    stylelint?: boolean;
    // 哈希配置
    hash: {
        // 字体文件加哈希
        font: false,
        // 样式文件加哈希
        style: false,
        // 哈希值长度
        len: 8
    },
    // 生成预览
    preview: true,
    // 格式化 具体配置查看 https://prettier.io/docs/en/options.html
    format: {
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        semi: true,
        endOfLine: 'lf'
    },
    // 输入配置
    input: {
        // svg图标目录
        svgsDir: './svg-icons',
        // 样式模板位置
        styleTpl: null,
        // 预览模板位置
        previewTpl: null
    },
    // 产出配置
    output: {
        // 字体保存目录
        font: './',
        // 样式文件保存目录
        style: './',
        // 预览文件保存目录
        preview: './'
    }
}
```

## 自定义模板

* [样式模板](src/template/style.tpl)
* [预览模板](src/template/preview.tpl)

## 常见问题

* svg文件名尽量不要带有空格、特殊符号
* 配置文件中的`selector`选项`{{glyph}}`前必须带有分隔符

## 生成原理

* 读取svg文件
* 遍历svg文件中存在的节点形状(path、rect、polyline、line等等)
* 对svg文件中的形状进行合并（原则上，形状合并很难保证字体100%显示正常，所以建议svg图标里面只存在一个path，不建议存在多余形状）
* 获取svg文件中的路径(d属性)
* 生成一个唯一的unicode值，对应字体（也就是伪类中content对应的值）
* 生成svg 字体文件

    ```xml
    <?xml version="1.0" standalone="no"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg class="icon" width="200px" height="200.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path fill="#333333" d="M746.4 384.1c6 6 9 13.2 9 21.4s-3 15.4-9 21.4l-213 213c-6 6-13.2 9-21.4 9s-15.4-3-21.4-9l-213-213c-6-6-9-13.1-9-21.4 0-8.2 3-15.4 9-21.4s13.1-9 21.4-9h426c8.3-0.1 15.4 2.9 21.4 9z" />
    </svg>
    ```

    ```xml
    <?xml version="1.0" standalone="no"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
        <defs>
            <font id="iconfont" horiz-adv-x="1024" >
                <glyph glyph-name="arrow-down-insert" unicode="&#59278;" d="M746.4 511.9c6-6 9-13.2 9-21.4s-3-15.4-9-21.4l-213-213c-6-6-13.2-9-21.4-9s-15.4 3-21.4 9l-213 213c-6 6-9 13.1-9 21.4 0 8.2 3 15.4 9 21.4s13.1 9 21.4 9h426c8.3 0.1 15.4-2.9 21.4-9z"  horiz-adv-x="1024" />
            </font>
        </defs>
    </svg>
    ```
* 由生成的svg字体文件生成ttf字体文件
* ttf字体文件生成eot字体文件
* ttf字体文件生成woff字体文件
* ttf字体文件生成woff2字体文件


## windows环境安装报错

```
npm i -g windows-build-tools
```

## Demo

[ SmokingRabbit personal website ](https://github.com/SmokingRabbit/SmokingRabbit.github.io)

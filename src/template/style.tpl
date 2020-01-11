@font-face {
    font-family: "{{fontName}}";
    src: url("{{fontPath}}eot");
    src: url("{{fontPath}}eot#iefix") format('embedded-opentype'),
        url("{{fontPath}}ttf") format('truetype'),
        url("{{fontPath}}woff") format('woff'),
        url("{{fontPath}}woff2") format('woff2'),
        url("{{fontPath}}svg") format('svg');
}

{{selector}} {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "{{fontName}}" !important;
    font-style: normal;
    font-weight: 400;
    display: inline-block;
    vertical-align: middle;
}

{{glyphs}}

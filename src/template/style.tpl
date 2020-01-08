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
    display: inline-block;
    font-family: "{{fontName}}";
    font-style: normal;
    font-weight: 400;
    font-variant: normal;
    line-height: 1;
    text-decoration: inherit;
    text-rendering: optimizeLegibility;
    text-transform: none;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-smoothing: antialiased;
}

{{glyphs}}

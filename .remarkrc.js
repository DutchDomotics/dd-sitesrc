var remarkrc = {
    settings: {
        bullet: '-',
        commonmark: true,
        emphasis: '_',
        fence: '`',
        incrementListMarker: true,
        listItemIndent: 1,
        strong: '*'
    },
    plugins: [
        ["frontmatter"],
        "preset-lint-markdown-style-guide",
        "remark-lint-no-dead-urls",
        ["lint-maximum-line-length", false],
        ["lint-no-file-name-irregular-characters", false],
        ["lint-maximum-heading-length", false],
        ["lint-heading-style", false],
        ["lint-rule-style", false],
        ["lint-emphasis-marker", false],
        ["lint-unordered-list-marker-style", false],
        ["lint-ordered-list-marker-value", false],
        ["lint-list-item-indent", "space"],
        ["lint-no-emphasis-as-heading", false],
        ["lint-list-item-spacing", false]
    ]
};

module.exports = remarkrc;
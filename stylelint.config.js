export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order', 'stylelint-config-html/svelte'],
  plugins: ['stylelint-no-unsupported-browser-features', 'stylelint-declaration-strict-value'],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    'color-named': 'never',
    'color-no-hex': true,
    'custom-property-pattern': null,
    'declaration-block-no-duplicate-properties': true,
    'declaration-property-value-no-unknown': true,
    'font-weight-notation': 'numeric',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'color'],
    'max-nesting-depth': 3,
    'media-feature-name-value-no-unknown': true,
    'no-descending-specificity': true,
    'no-empty-source': null,
    'plugin/no-unsupported-browser-features': [
      true,
      {
        ignore: ['css-clip-path', 'css-marker-pseudo', 'css-display-contents', 'css-touch-action', 'css3-cursors'],
      },
    ],
    'scale-unlimited/declaration-strict-value': [
      ['/color$/', 'fill', 'stroke'],
      { ignoreValues: ['currentcolor', 'transparent', 'inherit', 'initial', 'unset', 'revert', 'none'] },
    ],
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message: 'Expected class to follow BEM: block, block__element, block--modifier, or block__element--modifier',
      },
    ],
    'selector-max-compound-selectors': 4,
    'selector-max-id': 1,
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
  },
};

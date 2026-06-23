export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recess-order',
    'stylelint-config-html/svelte',
  ],
  plugins: [
    'stylelint-no-unsupported-browser-features',
    'stylelint-declaration-strict-value',
  ],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message:
          'Expected class to follow BEM: block, block__element, block--modifier, or block__element--modifier',
      },
    ],
    'no-empty-source': null,
    'custom-property-pattern': null,
    'declaration-property-value-no-unknown': true,
    'selector-max-id': 1,
    'max-nesting-depth': 3,
    'selector-max-compound-selectors': 4,
    'font-weight-notation': 'numeric',
    'media-feature-name-value-no-unknown': true,
    'declaration-block-no-duplicate-properties': true,
    'no-descending-specificity': true,
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'color'],
    'scale-unlimited/declaration-strict-value': [
      ['/color$/', 'fill', 'stroke'],
      { ignoreValues: ['currentcolor', 'transparent', 'inherit', 'initial', 'unset', 'revert', 'none'] },
    ],
    'plugin/no-unsupported-browser-features': [
      true,
      {
        ignore: [
          'css-clip-path', // .sr-only uses clip-path: inset(50%), the modern visually-hidden technique; the only flag-free alternative (`clip`) is itself deprecated
          'css-marker-pseudo', // ::marker { content: initial } in the CSS reset — no non-pseudo equivalent
          'css-display-contents', // .grid__row pass-through into the parent grid — rewrite collides with the shared grid utility
          'css-touch-action', // touch-action: manipulation — only CSS way to kill double-tap-zoom; no fallback
          'css3-cursors', // cursor: not-allowed on :disabled buttons — only flag-free option (default) drops the affordance
        ],
      },
    ],
  },
};

/**
 * commitlint 設定
 *
 * scope-enum は `.project-config.yml` の scopes と同期させる。
 * 変更する際は両方更新すること。
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // Domain
        'kit',
        'paint',
        'project',
        'stock',
        // FSD layer
        'shared',
        'entities',
        'features',
        'widgets',
        'views',
        'routes',
        // Cross-cutting
        'auth',
        'nav',
        'ui',
        'infra',
        'deps',
        'ci',
        'docs',
        'tooling',
      ],
    ],
    // 日本語 subject を許容するため subject-case は無効化
    'subject-case': [0],
  },
}

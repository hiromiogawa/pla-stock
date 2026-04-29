/**
 * ============================================================================
 * commitlint-config.cjs — Conventional Commits + scope-enum
 * ----------------------------------------------------------------------------
 * 役割:
 *   commit message の書式を `type(scope): subject` 形式で強制する。
 *   git hook (commit-msg) で全 commit を検証。
 *
 * 採用方針:
 *   - type は @commitlint/config-conventional の標準セット
 *     (feat, fix, docs, chore, refactor, style, test, perf, build, ci, revert)
 *   - scope は project 固有 enum (.project-config.yml と同期)
 *   - subject は日本語 OK (subject-case を無効化)
 *
 * 関連:
 *   - ADR-0001 (Phase B Tooling 採用)
 *   - .project-config.yml (scopes フィールド: 必ず本ファイルと同期)
 *   - PR #49 (commitlint 導入)
 * ============================================================================
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // scope は厳密に enum で限定。新しい scope 追加時は .project-config.yml も更新。
    'scope-enum': [
      2,
      'always',
      [
        // ---- Domain (MVP 範囲) ----
        'kit',
        'paint',
        'project',
        'stock',

        // ---- FSD layer (アーキテクチャ層への変更) ----
        'shared',
        'entities',
        'features',
        'widgets',
        'views',
        'routes',

        // ---- Cross-cutting ----
        'auth', // Clerk 認証
        'nav', // ナビゲーション (Sidebar / BottomTabBar)
        'ui', // shared/ui コンポーネント
        'infra', // Cloudflare Workers / D1 / env
        'deps', // dependency add/upgrade
        'ci', // GitHub Actions
        'docs', // documentation
        'tooling', // lint / format / commit hook 等の開発ツール
      ],
    ],

    // 日本語 subject (例: "新規 view 追加") を許容するため case 検証を無効化。
    'subject-case': [0],
  },
}

/**
 * ============================================================================
 * dep-cruiser-fsd.cjs — dependency-cruiser FSD レイヤー単方向依存検査
 * ----------------------------------------------------------------------------
 * 役割:
 *   FSD (Feature-Sliced Design) のレイヤー序列を機械強制する。
 *   下位レイヤーが上位レイヤーを import するのを禁止 (= 単方向依存)。
 *
 * レイヤー序列 (低 → 高):
 *   1. shared    (汎用ユーティリティ)
 *   2. entities  (ドメインモデル + mock/server fn API)
 *   3. features  (再利用可能なドメイン機能 = use case 単位)
 *   4. widgets   (複合 UI ブロック = AppShell 等)
 *   5. views     (画面単位の UI / Presenter)
 *   6. routes    (TanStack Router の Container)
 *
 * 加えて運用上必須の共通 rule:
 *   - no-circular         循環依存禁止
 *   - no-orphans          孤立ファイル warn
 *   - not-to-unresolvable 解決不能 import 禁止
 *
 * 適用範囲:
 *   src/** 全部
 *
 * 関連:
 *   - ADR-0001 (Phase B Tooling 採用)
 *   - PR #49 (dependency-cruiser 導入)
 *   - PR #49 で発覚した shared/api/mock → entities への違反を解消
 * ============================================================================
 */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ------------------------------------------------------------------------
    // 共通: 言語的・構造的な禁止事項
    // ------------------------------------------------------------------------
    {
      name: 'no-circular',
      severity: 'error',
      comment: '循環依存は禁止 (build / 型推論を破壊する温床)',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment:
        'どこからも import されていない孤立ファイル。entry point (route, start, router 等) は除外',
      from: {
        orphan: true,
        pathNot: [
          // dotfile (eslintrc 等)
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$',
          // 型定義 .d.ts
          '\\.d\\.ts$',
          // 設定ファイル系
          '(^|/)tsconfig\\.json$',
          '(^|/)(babel|webpack|vite|rollup|tailwind|postcss)\\.config\\.(js|cjs|mjs|ts)$',
          // TanStack Start / Router の entry point
          'src/routeTree\\.gen\\.ts$',
          'src/start\\.ts$',
          'src/router\\.tsx$',
          'src/routes/.+\\.tsx?$',
        ],
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      severity: 'warn',
      comment: 'Node.js の deprecated コア API を使わない',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: ['^(punycode|domain|constants|sys|_linklist|_stream_wrap)$'],
      },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment:
        '解決不能な import は型エラーになる前に止める (例外: cloudflare:* は workerd 提供の virtual module で型は worker-configuration.d.ts が解決)',
      from: {},
      to: { couldNotResolve: true, pathNot: '^cloudflare:' },
    },
    {
      name: 'no-duplicate-dep-types',
      severity: 'warn',
      comment: '同じ依存が型と値の両方で import されているケースを警告',
      from: {},
      to: { moreThanOneDependencyType: true, dependencyTypesNot: ['type-only'] },
    },

    // ------------------------------------------------------------------------
    // FSD レイヤー単方向依存 (低位は高位を import 不可)
    // ------------------------------------------------------------------------
    {
      name: 'fsd-shared-no-upper',
      severity: 'error',
      comment:
        'shared から entities/features/widgets/views/routes への import 禁止 (例外: dev seed は全 entity の schema/mock を要するため許容)',
      from: { path: '^src/shared/', pathNot: '^src/shared/lib/db/seed\\.ts$' },
      to: { path: '^src/(entities|features|widgets|views|routes)/' },
    },
    {
      name: 'fsd-entities-no-upper',
      severity: 'error',
      comment: 'entities から features/widgets/views/routes への import 禁止',
      from: { path: '^src/entities/' },
      to: { path: '^src/(features|widgets|views|routes)/' },
    },
    {
      name: 'fsd-features-no-upper',
      severity: 'error',
      comment: 'features から widgets/views/routes への import 禁止',
      from: { path: '^src/features/' },
      to: { path: '^src/(widgets|views|routes)/' },
    },
    {
      name: 'fsd-widgets-no-upper',
      severity: 'error',
      comment: 'widgets から views/routes への import 禁止',
      from: { path: '^src/widgets/' },
      to: { path: '^src/(views|routes)/' },
    },
    {
      name: 'fsd-views-no-upper',
      severity: 'error',
      comment: 'views から routes への import 禁止',
      from: { path: '^src/views/' },
      to: { path: '^src/routes/' },
    },

    // ------------------------------------------------------------------------
    // Container/Hook/Presenter (#43 / #155 / #217)
    // ------------------------------------------------------------------------
    // View 本体 (*View.tsx) から features への **直接参照を全般禁止** (mutation /
    // schema 問わず)。同じ view dir 内の useXxx hook (use*.ts) や dialog/form 部品
    // (*Dialog.tsx / *Form.tsx 等) は対象外 = hook 経由 / form schema 用途は許容。
    //
    // regex 制約: `views/<dir>/<name>View.tsx` の 1 階層ネスト前提。将来 views を
    // domain group で 2 階層化 (例: `views/Kit/Detail/KitDetailView.tsx`) する場合は
    // `[^/]+/[^/]*` を `(?:[^/]+/){1,2}[^/]*` 等に拡張要。
    //
    // 名前付き import (useState 等) の禁止は oxlint 1.61 で困難 (FAIL-005)、
    // OSS 検討は Issue #217 で別途、現状は review 担保。
    {
      name: 'fsd-view-component-no-features-direct',
      severity: 'error',
      comment:
        'View 本体 (*View.tsx) は ~/features/* を直接 import しない (mutation / schema 問わず features への参照全般を禁止)。mutation は useXxx hook 経由、schema は dialog/form 部品から (Container/Hook/Presenter、#43 / #155)',
      from: { path: '^src/views/[^/]+/[^/]*View\\.tsx$' },
      to: { path: '^src/features/' },
    },

    // ------------------------------------------------------------------------
    // test-utils → production 依存禁止 (ADR-0016)
    // ------------------------------------------------------------------------
    {
      name: 'no-test-utils-from-production',
      severity: 'error',
      comment:
        'production code (test 以外の src/**) が src/test-utils/** を import するのを禁止する。test fixture / helper は test ファイルからのみ使用すること',
      from: {
        path: '^src/',
        pathNot: '\\.test\\.(ts|tsx)$',
      },
      to: {
        path: '^src/test-utils/',
      },
    },

    // ------------------------------------------------------------------------
    // seed → production 依存禁止 (#148)
    // ------------------------------------------------------------------------
    // src/entities/<x>/api/seed/** は dev seed 専用 (src/shared/lib/db/seed.ts から
    // のみ参照される)。production の read query / mutation が seed データに依存
    // すると Phase C で実 DB に移行した意味が無くなる。例外は src/shared/lib/db/
    // seed.ts と test ファイル (test 用 fixture として流用可)。
    {
      name: 'no-seed-from-production',
      severity: 'error',
      comment:
        'production code (src/shared/lib/db/seed.ts と test を除く) が src/entities/*/api/seed/** を import するのを禁止する',
      from: {
        path: '^src/',
        pathNot: ['^src/shared/lib/db/seed\\.ts$', '\\.test\\.(ts|tsx)$'],
      },
      to: {
        path: '^src/entities/[^/]+/api/seed/',
      },
    },
  ],

  options: {
    doNotFollow: { path: ['node_modules'] },

    // routeTree.gen.ts は auto-generated なので解析対象から外す
    exclude: { path: ['src/routeTree\\.gen\\.ts$'] },

    tsConfig: { fileName: 'tsconfig.json' },

    // 型のみの import (`import type`) も依存関係として追跡。
    // FSD 違反検出と orphan 判定の両方に必要。
    tsPreCompilationDeps: true,

    // TS path alias (`~/`) を tsconfig.json から読む
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },

    reporterOptions: {
      dot: { collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)' },
      archi: { collapsePattern: '^(node_modules|packages|src|lib|app|test|spec)/[^/]+' },
      text: { highlightFocused: true },
    },
  },
}

/**
 * dependency-cruiser 設定
 *
 * FSD レイヤーの単方向依存を強制する。
 *
 * レイヤー序列 (低 → 高、低が高を import するのは forbidden):
 *   1. shared
 *   2. entities
 *   3. features
 *   4. widgets
 *   5. views
 *   6. routes
 *
 * 加えて:
 *   - circular import 禁止
 *   - orphan ファイル warning
 *   - to-non-existing 等の標準 ruleset
 */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '循環依存は禁止',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'どこからも import されていない孤立ファイル',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$',
          '\\.d\\.ts$',
          '(^|/)tsconfig\\.json$',
          '(^|/)(babel|webpack|vite|rollup|tailwind|postcss)\\.config\\.(js|cjs|mjs|ts)$',
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
      comment: 'Node.js の deprecated コア API を使わない',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: ['^(punycode|domain|constants|sys|_linklist|_stream_wrap)$'],
      },
    },
    {
      name: 'not-to-unresolvable',
      comment: '解決不能な import 禁止',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-duplicate-dep-types',
      comment: '依存タイプの重複禁止',
      severity: 'warn',
      from: {},
      to: { moreThanOneDependencyType: true, dependencyTypesNot: ['type-only'] },
    },
    // ----- FSD layer rules: 低位レイヤーは高位レイヤーを import 不可 -----
    {
      name: 'fsd-shared-no-upper',
      severity: 'error',
      comment: 'shared から entities/features/widgets/views/routes への import 禁止',
      from: { path: '^src/shared/' },
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
  ],
  options: {
    doNotFollow: {
      path: ['node_modules'],
    },
    exclude: {
      path: ['src/routeTree\\.gen\\.ts$'],
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    // 型のみの import (`import type`) も依存関係として追跡。
    // FSD 違反検出と orphan 判定の両方に必要。
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)',
      },
      archi: {
        collapsePattern: '^(node_modules|packages|src|lib|app|test|spec)/[^/]+',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
}

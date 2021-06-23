# 浅析webpack源码之Stat.js粗解(十)


从compilation出来
接着我们看

```js
const stats = new Stats(compilation);
```

## Stats.js
log大法，打印一下 stats 


```js
let Stats = {
  compilation:{
     _pluginCompat:
      SyncBailHook {
        _args: [Array],
        taps: [Array],
        interceptors: [],
        call: [Function: lazyCompileHook],
        promise: [Function: lazyCompileHook],
        callAsync: [Function: lazyCompileHook],
        _x: undefined },
     hooks:
      { buildModule: [SyncHook],
        rebuildModule: [SyncHook],
        failedModule: [SyncHook],
        succeedModule: [SyncHook],
        addEntry: [SyncHook],
        failedEntry: [SyncHook],
        succeedEntry: [SyncHook],
        dependencyReference: [SyncWaterfallHook],
        finishModules: [SyncHook],
        finishRebuildingModule: [SyncHook],
        unseal: [SyncHook],
        seal: [SyncHook],
        beforeChunks: [SyncHook],
        afterChunks: [SyncHook],
        optimizeDependenciesBasic: [SyncBailHook],
        optimizeDependencies: [SyncBailHook],
        optimizeDependenciesAdvanced: [SyncBailHook],
        afterOptimizeDependencies: [SyncHook],
        optimize: [SyncHook],
        optimizeModulesBasic: [SyncBailHook],
        optimizeModules: [SyncBailHook],
        optimizeModulesAdvanced: [SyncBailHook],
        afterOptimizeModules: [SyncHook],
        optimizeChunksBasic: [SyncBailHook],
        optimizeChunks: [SyncBailHook],
        optimizeChunksAdvanced: [SyncBailHook],
        afterOptimizeChunks: [SyncHook],
        optimizeTree: [AsyncSeriesHook],
        afterOptimizeTree: [SyncHook],
        optimizeChunkModulesBasic: [SyncBailHook],
        optimizeChunkModules: [SyncBailHook],
        optimizeChunkModulesAdvanced: [SyncBailHook],
        afterOptimizeChunkModules: [SyncHook],
        shouldRecord: [SyncBailHook],
        reviveModules: [SyncHook],
        optimizeModuleOrder: [SyncHook],
        advancedOptimizeModuleOrder: [SyncHook],
        beforeModuleIds: [SyncHook],
        moduleIds: [SyncHook],
        optimizeModuleIds: [SyncHook],
        afterOptimizeModuleIds: [SyncHook],
        reviveChunks: [SyncHook],
        optimizeChunkOrder: [SyncHook],
        beforeChunkIds: [SyncHook],
        optimizeChunkIds: [SyncHook],
        afterOptimizeChunkIds: [SyncHook],
        recordModules: [SyncHook],
        recordChunks: [SyncHook],
        beforeHash: [SyncHook],
        contentHash: [SyncHook],
        afterHash: [SyncHook],
        recordHash: [SyncHook],
        record: [SyncHook],
        beforeModuleAssets: [SyncHook],
        shouldGenerateChunkAssets: [SyncBailHook],
        beforeChunkAssets: [SyncHook],
        additionalChunkAssets: [SyncHook],
        additionalAssets: [AsyncSeriesHook],
        optimizeChunkAssets: [AsyncSeriesHook],
        afterOptimizeChunkAssets: [SyncHook],
        optimizeAssets: [AsyncSeriesHook],
        afterOptimizeAssets: [SyncHook],
        needAdditionalSeal: [SyncBailHook],
        afterSeal: [AsyncSeriesHook],
        chunkHash: [SyncHook],
        moduleAsset: [SyncHook],
        chunkAsset: [SyncHook],
        assetPath: [SyncWaterfallHook],
        needAdditionalPass: [SyncBailHook],
        childCompiler: [SyncHook],
        normalModuleLoader: [SyncHook],
        optimizeExtractedChunksBasic: [SyncBailHook],
        optimizeExtractedChunks: [SyncBailHook],
        optimizeExtractedChunksAdvanced: [SyncBailHook],
        afterOptimizeExtractedChunks: [SyncHook] },
     name: undefined,
     compiler: {
        _pluginCompat: [SyncBailHook],
        hooks: [Object],
        name: undefined,
        parentCompilation: undefined,
        outputPath: '/Users/orion/Desktop/react-beauty-highcharts/dist',
        outputFileSystem: [NodeOutputFileSystem],
        inputFileSystem: [CachedInputFileSystem],
        recordsInputPath: undefined,
        recordsOutputPath: undefined,
        records: [Object],
        removedFiles: Set {},
        fileTimestamps: Map {},
        contextTimestamps: Map {},
        resolverFactory: [ResolverFactory],
        resolvers: [Object],
        options: [Object],
        context: '/Users/orion/Desktop/react-beauty-highcharts',
        requestShortener: [RequestShortener],
        running: true,
        watchMode: false,
        watchFileSystem: [NodeWatchFileSystem],
        dependencies: undefined,
        _lastCompilationFileDependencies: [SortableSet],
        _lastCompilationContextDependencies: [SortableSet] },
     resolverFactory:
      ResolverFactory {
        _pluginCompat: [SyncBailHook],
        hooks: [Object],
        cache1: [WeakMap],
        cache2: [Map] },
     inputFileSystem:
      CachedInputFileSystem {
        fileSystem: NodeJsInputFileSystem {},
        _statStorage: [Storage],
        _readdirStorage: [Storage],
        _readFileStorage: [Storage],
        _readJsonStorage: [Storage],
        _readlinkStorage: [Storage],
        _stat: [Function: bound bound ],
        _statSync: [Function: bound bound ],
        _readdir: [Function: bound readdir],
        _readdirSync: [Function: bound readdirSync],
        _readFile: [Function: bound bound readFile],
        _readFileSync: [Function: bound bound readFileSync],
        _readJson: [Function],
        _readJsonSync: [Function],
        _readlink: [Function: bound bound readlink],
        _readlinkSync: [Function: bound bound readlinkSync] },
     requestShortener:
      RequestShortener {
        currentDirectoryRegExp: /(^|!)\/Users\/orion\/Desktop\/react\-beauty\-highcharts/g,
        parentDirectoryRegExp: /(^|!)\/Users\/orion\/Desktop/g,
        buildinsAsModule: true,
        buildinsRegExp:
         /(^|!)\/Users\/orion\/Desktop\/react\-beauty\-highcharts\/node_modules\/webpack/g,
        cache: [Map] },
     options:
      { entry: './src/index.js',
        output: [Object],
        module: [Object],
        devServer: [Object],
        externals: [Array],
        mode: 'development',
        plugins: [Array],
        devtool: 'eval-cheap-module-source-map',
        context: '/Users/orion/Desktop/react-beauty-highcharts',
        cache: true,
        target: 'web',
        node: [Object],
        performance: false,
        optimization: [Object],
        resolve: [Object],
        resolveLoader: [Object] },
     outputOptions:
      { filename: 'index.js',
        path: '/Users/orion/Desktop/react-beauty-highcharts/dist',
        libraryTarget: 'commonjs2',
        pathinfo: true,
        chunkFilename: '[id].index.js',
        webassemblyModuleFilename: '[modulehash].module.wasm',
        library: '',
        hotUpdateFunction: 'webpackHotUpdate',
        jsonpFunction: 'webpackJsonp',
        chunkCallbackName: 'webpackChunk',
        globalObject: 'window',
        devtoolNamespace: '',
        sourceMapFilename: '[file].map[query]',
        hotUpdateChunkFilename: '[id].[hash].hot-update.js',
        hotUpdateMainFilename: '[hash].hot-update.json',
        crossOriginLoading: false,
        jsonpScriptType: false,
        chunkLoadTimeout: 120000,
        hashFunction: 'md4',
        hashDigest: 'hex',
        hashDigestLength: 20,
        devtoolLineToLine: false,
        strictModuleExceptionHandling: false },
     bail: undefined,
     profile: undefined,
     performance: false,
     mainTemplate: {
        _pluginCompat: [SyncBailHook],
        outputOptions: [Object],
        hooks: [Object],
        requireFn: '__webpack_require__' },
     chunkTemplate: {
        _pluginCompat: [SyncBailHook],
        outputOptions: [Object],
        hooks: [Object] },
     hotUpdateChunkTemplate:{
        _pluginCompat: [SyncBailHook],
        outputOptions: [Object],
        hooks: [Object] },
     runtimeTemplate:{
        outputOptions: [Object],
        requestShortener: [RequestShortener] },
     moduleTemplates:
      { javascript: [ModuleTemplate], webassembly: [ModuleTemplate] },
     semaphore:{
        available: 100,
        waiters: [],
        _continue: [Function: bound _continue] },
     entries: [ [NormalModule] ],
     _preparedEntrypoints: [ [Object] ],
     entrypoints: Map { 'main' => [Entrypoint] },
     chunks: [ [Chunk] ],
     chunkGroups: [ [Entrypoint] ],
     namedChunkGroups: Map { 'main' => [Entrypoint] },
     namedChunks: Map { 'main' => [Chunk] },
     modules: [ [NormalModule] ],
     _modules:{
        '/Users/orion/Desktop/react-beauty-highcharts/node_modules/babel-loader/lib/index.js!/Users/orion/Desktop/react-beauty-highcharts/src/index.js' => [NormalModule] },
     cache:
      { 'm/Users/orion/Desktop/react-beauty-highcharts/node_modules/babel-loader/lib/index.js!/Users/orion/Desktop/react-beauty-highcharts/src/index.js': [NormalModule],
        chunkmain: [Object] },
     records: { modules: [Object], chunks: [Object] },
     additionalChunkAssets: [],
     assets: { 'index.js': [CachedSource] },
     errors: [],
     warnings: [],
     children: [],
     dependencyFactories:{
        [Function] => NullFactory {},
        [Function: WebAssemblyImportDependency] => [NormalModuleFactory],
        [Function: WebAssemblyExportImportedDependency] => [NormalModuleFactory],
        [Function: SingleEntryDependency] => [NormalModuleFactory],
        [Function] => NullFactory {},
        [Function] => NullFactory {},
        [Function] => [NormalModuleFactory],
        [Function] => [NormalModuleFactory],
        [Function] => NullFactory {},
        [Function] => NullFactory {},
        [Function] => NullFactory {},
        [Function] => [NormalModuleFactory],
        [Function] => NullFactory {},
        [Function] => [NormalModuleFactory],
        [Function] => NullFactory {},
        [Function] => [NormalModuleFactory],
        [Function] => NullFactory {},
        [Function] => [ContextModuleFactory],
        [Function] => NullFactory {},
        [Function] => NullFactory {},
        [Function] => NullFactory {},
        [Function] => [NormalModuleFactory],
        [Function] => [ContextModuleFactory],
        [Function] => [NormalModuleFactory],
        [Function] => [ContextModuleFactory],
        [Function] => NullFactory {},
        [Function] => NullFactory {},
        [Function: LoaderDependency] => [NormalModuleFactory],
        [Function] => [NormalModuleFactory],
        [Function] => [NormalModuleFactory],
        [Function] => NullFactory {},
        [Function] => [ContextModuleFactory],
        [Function: ContextElementDependency] => [NormalModuleFactory],
        [Function] => [NormalModuleFactory],
        [Function] => [NormalModuleFactory],
        [Function] => [NormalModuleFactory],
        [Function] => [ContextModuleFactory] },
     dependencyTemplates:{
        'hash' => '',
        [Function] => ConstDependencyTemplate {},
        [Function] => HarmonyExportDependencyTemplate {},
        [Function] => HarmonyInitDependencyTemplate {},
        [Function] => HarmonyImportSideEffectDependencyTemplate {},
        [Function] => HarmonyImportSpecifierDependencyTemplate {},
        [Function] => HarmonyExportDependencyTemplate {},
        [Function] => HarmonyExportDependencyTemplate {},
        [Function] => HarmonyExportSpecifierDependencyTemplate {},
        [Function] => HarmonyExportImportedSpecifierDependencyTemplate {},
        [Function] => HarmonyAcceptDependencyTemplate {},
        [Function] => HarmonyAcceptImportDependencyTemplate {},
        [Function] => AMDRequireDependencyTemplate {},
        [Function] => ModuleDependencyTemplateAsRequireId {},
        [Function] => AMDRequireArrayDependencyTemplate {},
        [Function] => ContextDependencyTemplateAsRequireCall {},
        [Function] => AMDDefineDependencyTemplate {},
        [Function] => UnsupportedDependencyTemplate {},
        [Function] => LocalModuleDependencyTemplate {},
        [Function] => ModuleDependencyTemplateAsId {},
        [Function] => ContextDependencyTemplateAsRequireCall {},
        [Function] => ModuleDependencyTemplateAsId {},
        [Function] => ContextDependencyTemplateAsId {},
        [Function] => RequireResolveHeaderDependencyTemplate {},
        [Function] => RequireHeaderDependencyTemplate {},
        [Function] => RequireIncludeDependencyTemplate {},
        [Function] => NullDependencyTemplate {},
        [Function] => RequireEnsureDependencyTemplate {},
        [Function] => ModuleDependencyTemplateAsRequireId {},
        [Function] => ImportDependencyTemplate {},
        [Function] => ImportEagerDependencyTemplate {},
        [Function] => ImportDependencyTemplate {},
        [Function] => ContextDependencyTemplateAsRequireCall {} },
     childrenCounters: {},
     usedChunkIds: null,
     usedModuleIds: null,
     fileTimestamps: Map {},
     contextTimestamps: Map {},
     compilationDependencies: Set {},
     _buildingModules: Map {},
     _rebuildingModules: Map {},
     fullHash: '41d7d3a4c3eeb4a7fe6a4dcb5b927f6b',
     hash: '41d7d3a4c3eeb4a7fe6a',
     fileDependencies: {
        '/Users/orion/Desktop/react-beauty-highcharts/.babelrc',
        '/Users/orion/Desktop/react-beauty-highcharts/src/index.js',
        _sortFn: undefined,
        _lastActiveSortFn: undefined,
        _cache: undefined,
        _cacheOrderIndependent: undefined },
     contextDependencies: {
        _sortFn: undefined,
        _lastActiveSortFn: null,
        _cache: undefined,
        _cacheOrderIndependent: undefined },
     missingDependencies:{
        _sortFn: undefined,
        _lastActiveSortFn: null,
        _cache: undefined,
        _cacheOrderIndependent: undefined } },
  hash: '41d7d3a4c3eeb4a7fe6a',
  startTime: undefined,
  endTime: undefined }
```

感觉之前所以的对象都放在了一个合集里，给人而全的感觉

里面主要含有一个对象
inputFileSyste，options，输出的outputOptions，dependencyFactories等
给每次打包一个hash值，代表唯一性


天啊😱我竟然恍然大悟，发现了惊天大秘密

## jsonToString函数
打印
```
'Hash: \u001b[1m41d7d3a4c3eeb4a7fe6a\u001b[39m\u001b[22m\n
Version: webpack \u001b[1m4.28.2\u001b[39m\u001b[22m\n
Time: \u001b[1m500\u001b[39m\u001b[22mms\n
Built at: 2019-01-19 \u001b[1m16:48:03\u001b[39m\u001b[22m\n   \u001b[1mAsset\u001b[39m\u001b[22m      \u001b[1mSize\u001b[39m\u001b[22m  \u001b[1mChunks\u001b[39m\u001b[22m  \u001b[1m\u001b[39m\u001b[22m           \u001b[1m\u001b[39m\u001b[22m\u001b[1mChunk Names\u001b[39m\u001b[22m\n\u001b[1m\u001b[32mindex.js\u001b[39m\u001b[22m  27.3 KiB    \u001b[1mmain\u001b[39m\u001b[22m  \u001b[1m\u001b[32m[emitted]\u001b[39m\u001b[22m  main\n
Entrypoint \u001b[1mmain\u001b[39m\u001b[22m = \u001b[1m\u001b[32mindex.js\u001b[39m\u001b[22m\n
[\u001b[1m./src/index.js\u001b[39m\u001b[22m] 7.42 KiB {\u001b[1m\u001b[33mmain\u001b[39m\u001b[22m}\u001b[1m\u001b[32m [built]\u001b[39m\u001b[22m'
```
这不是就是平常我们 npm run build 的输出吗
在终端上显示的页面

```
Hash: 41d7d3a4c3eeb4a7fe6a
Version: webpack 4.28.2
Time: 500ms
Built at: 2019-01-19 16:48:03
   Asset      Size  Chunks             Chunk Names
index.js  27.3 KiB    main  [emitted]  main
Entrypoint main = index.js
[./src/index.js] 7.42 KiB {main} [built]
```

```
// obj输出的对象，useColors颜色配置
static jsonToString(obj, useColors){
    // ...    
}
```
这个静态方法所做的事情就就是传入JSON对象和配置，返回字符串
## toJson函数

```js
/* options = { context: '/Users/orion/Desktop/react-beauty-highcharts',
  colors: { level: 3, hasBasic: true, has256: true, has16m: true },
  cached: false,
  cachedAssets: false,
  exclude: [ 'node_modules', 'bower_components', 'components' ],
  infoVerbosity: 'info' }
  forToString = true*/
toJson(options, forToString) {
    // ...
    
    /*{ errors: [],
  warnings: [],
  version: '4.28.2',
  hash: '41d7d3a4c3eeb4a7fe6a',
  time: 623,
  builtAt: 1547888599671,
  assetsByChunkName: { main: 'index.js' },
  assets:
   [ { name: 'index.js',
       size: 27997,
       chunks: [Array],
       chunkNames: [Array],
       emitted: true,
       isOverSizeLimit: undefined } ],
  filteredAssets: 0,
  entrypoints:
   { main:
      { chunks: [Array],
        assets: [Array],
        children: {},
        childAssets: {},
        isOverSizeLimit: undefined } },
  modules:
   [ { id: './src/index.js',
       identifier:
        '/Users/orion/Desktop/react-beauty-highcharts/node_modules/babel-loader/lib/index.js!/Users/orion/Desktop/react-beauty-highcharts/src/index.js',
       name: './src/index.js',
       index: 0,
       index2: 0,
       size: 7597,
       cacheable: true,
       built: true,
       optional: false,
       prefetched: false,
       chunks: [Array],
       issuer: null,
       issuerId: null,
       issuerName: null,
       issuerPath: null,
       profile: undefined,
       failed: false,
       errors: 0,
       warnings: 0 } ],
  filteredModules: 0,
  children: [] }*/
    retrun obj
}
```
不言而喻，toJson函数主要做的是输出一些打包后的文件信息，大小，时间，hash，路径等



```js
//toJson后返回的对象传给jsonToString
const obj = this.toJson(options, true);
return Stats.jsonToString(obj, useColors);
```


Stat.js模块功能更多是辅助功能，就像它的名字一样，状态展示


选了一个Baker-Miller pink，用ps简单勾画，目前的学习进度
![1.png](https://wx4.sinaimg.cn/mw690/bfc0264aly1fzc1be2tksj20tu0k0dhw.jpgo)
基本核心全在chunk压缩生成文件处理这里，想要深入，还需细细的研究🤔


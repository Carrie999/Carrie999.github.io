


# 浅析webpack源码之Compiler.js模块(八)

我们先看一下 compilation是什么？
是一个很大的对象
打印key值

```js
[ '_pluginCompat',
  'hooks',
  'name',
  'compiler',
  'resolverFactory',
  'inputFileSystem',
  'requestShortener',
  'options',
  'outputOptions',
  'bail',
  'profile',
  'performance',
  'mainTemplate',
  'chunkTemplate',
  'hotUpdateChunkTemplate',
  'runtimeTemplate',
  'moduleTemplates',
  'semaphore',
  'entries',
  '_preparedEntrypoints',
  'entrypoints',
  'chunks',
  'chunkGroups',
  'namedChunkGroups',
  'namedChunks',
  'modules',
  '_modules',
  'cache',
  'records',
  'additionalChunkAssets',
  'assets',
  'errors',
  'warnings',
  'children',
  'dependencyFactories',
  'dependencyTemplates',
  'childrenCounters',
  'usedChunkIds',
  'usedModuleIds',
  'fileTimestamps',
  'contextTimestamps',
  'compilationDependencies',
  '_buildingModules',
  '_rebuildingModules'
```
我们看有熟悉的chunks，entries，options，
这些是Compilation定义的属性


```js
const EntryModuleNotFoundError = require("./EntryModuleNotFoundError");
const ModuleNotFoundError = require("./ModuleNotFoundError");
const ModuleDependencyWarning = require("./ModuleDependencyWarning");
const ModuleDependencyError = require("./ModuleDependencyError");
const ChunkGroup = require("./ChunkGroup");
const Chunk = require("./Chunk");
const Entrypoint = require("./Entrypoint");
const MainTemplate = require("./MainTemplate");
const ChunkTemplate = require("./ChunkTemplate");
const HotUpdateChunkTemplate = require("./HotUpdateChunkTemplate");
const ModuleTemplate = require("./ModuleTemplate");
const RuntimeTemplate = require("./RuntimeTemplate");
const ChunkRenderError = require("./ChunkRenderError");
const AsyncDependencyToInitialChunkError = require("./AsyncDependencyToInitialChunkError");
const Stats = require("./Stats");
const Semaphore = require("./util/Semaphore");
const createHash = require("./util/createHash");
const Queue = require("./util/Queue");
const SortableSet = require("./util/SortableSet");
const GraphHelpers = require("./GraphHelpers");
const ModuleDependency = require("./dependencies/ModuleDependency");
const compareLocations = require("./compareLocations");
```
从这一堆的模块引入里，也可以猜出Compilation主要做了Modules变成Chunks编译的过程

里面有一些方法

1.对模块的处理，创建搜索添加构建/模块依赖处理，添加模块依赖，分类模块等
addModule/getModule/ findModule/buildModule/sortModules
2.对Chunk的处理，创建Chunk
3.哈希值


```js
Compilation.prototype.applyPlugins
```

在原型上添加了applyPlugins方法


Compilation.js也是对Tapable 的拓展
主要处理Chunk、Module等


## webpack术语表定义
我们学习一下
模块：离散的功能块，提供比完整程序更小的表面积。编写良好的模块提供了可靠的抽象和封装边界，构成了一致的设计和明确的目的。

块：此Webpack特定术语在内部用于管理捆绑过程。捆绑包由块组成，其中有几种类型（例如入口和子）。通常，块直接与输出束相对应，但是，有些配置不会产生一对一的关系。

Bundle：由许多不同的模块生成，bundle包含已经过加载和编译过程的源文件的最终版本。

总结
a chunk is a group of modules within the webpack process, a bundle is an emitted chunk or set of chunks.

一个块是webpack进程中的一组模块，一个bundle是一个发出的块或一组块。


```js
{
  entry: {
    foo: ["webpack/hot/only-dev-server.js","./src/foo.js"],
    bar: ["./src/bar.js"]
  },
  output: {
    path: "./dist",
    filename: "[name].js"
  }
}
Modules: "webpack/hot/only-dev-server.js", "./src/foo.js", "./src/bar.js" ( + any other modules that are dependencies of these entry points!)
Chunks: foo, bar
Bundles: foo, bar
```
通俗的解释一下，Modules是引入的模块，Chunks就是编译的模块，Bundles是提交的Chunks ，Chunks和Bundles是1:1的关系，配置map会有例外
## 总结
Compilation主要做了Modules变成Chunks编译的过程

## chunks
不细看逻辑，好像太虚了，我们看一下this.chunks

它是一个数组,目前Chunk的长度是1，因为只是引入了一个模块
```
[ Chunk {
    id: 'main',
    ids: [ 'main' ],
    debugId: 1000,
    name: 'main',
    preventIntegration: false,
    entryModule:
     NormalModule {
       dependencies: [],
       blocks: [],
       variables: [],
       type: 'javascript/auto',
       context: '/Users/orion/Desktop/react-beauty-highcharts/src',
       debugId: 1000,
       hash: 'a6388d29fa15bd58c6cffb10246992a5',
       renderedHash: 'a6388d29fa15bd58c6cf',
       resolveOptions: {},
       factoryMeta: {},
       warnings: [],
       errors: [],
       buildMeta: [Object],
       buildInfo: [Object],
       reasons: [Array],
       _chunks: [SortableSet],
       id: './src/index.js',
       index: 0,
       index2: 0,
       depth: 0,
       issuer: null,
       profile: undefined,
       prefetched: false,
       built: true,
       used: null,
       usedExports: null,
       optimizationBailout: [],
       _rewriteChunkInReasons: undefined,
       useSourceMap: true,
       _source: [SourceMapSource],
       request:
        '/Users/orion/Desktop/react-beauty-highcharts/node_modules/babel-loader/lib/index.js!/Users/orion/Desktop/react-beauty-highcharts/src/index.js',
       userRequest: '/Users/orion/Desktop/react-beauty-highcharts/src/index.js',
       rawRequest: './src/index.js',
       binary: false,
       parser: [Parser],
       generator: JavascriptGenerator {},
       resource: '/Users/orion/Desktop/react-beauty-highcharts/src/index.js',
       matchResource: undefined,
       loaders: [Array],
       error: null,
       _buildHash: '488efbd43aa05371d3f44d94c89abd57',
       buildTimestamp: 1547884969828,
       _cachedSources: Map {},
       lineToLine: false,
       _lastSuccessfulBuildMeta: [Object],
       _ast: null },
    _modules:
     SortableSet [Set] {
       [NormalModule],
       _sortFn: [Function: sortByIdentifier],
       _lastActiveSortFn: null,
       _cache: undefined,
       _cacheOrderIndependent: undefined },
    filenameTemplate: undefined,
    _groups:
     SortableSet [Set] {
       [Entrypoint],
       _sortFn: [Function: sortChunkGroupById],
       _lastActiveSortFn: null,
       _cache: undefined,
       _cacheOrderIndependent: undefined },
    files: [],
    rendered: false,
    hash: '0988e8454f1915ec05fee482db8d0a6f',
    contentHash: { javascript: '4b8695ca3c1d42e76c52' },
    renderedHash: '0988e8454f1915ec05fe',
    chunkReason: undefined,
    extraAsync: false,
    removedModules: undefined } ]
```

我们看到在entryModule下，记录了入口的绝对地址，相对地址，编译的hash，文件类型等信息


```js
// 文件写入，文件输出，文件缓存，里面具体的template.getRenderManifest，chunk.hasRuntime()，CachedSource具体的逻辑不能够一一的去研究详解，但是从名字能知道这个函数是做什么的
createChunkAssets() {
		const outputOptions = this.outputOptions;
		const cachedSourceMap = new Map();
		/** @type {Map<string, {hash: string, source: Source, chunk: Chunk}>} */
		const alreadyWrittenFiles = new Map();
		for (let i = 0; i < this.chunks.length; i++) {
			const chunk = this.chunks[i];
			chunk.files = [];
			let source;
			let file;
			let filenameTemplate;
			try {
				const template = chunk.hasRuntime()
					? this.mainTemplate
					: this.chunkTemplate;
				const manifest = template.getRenderManifest({
					chunk,
					hash: this.hash,
					fullHash: this.fullHash,
					outputOptions,
					moduleTemplates: this.moduleTemplates,
					dependencyTemplates: this.dependencyTemplates
				}); // [{ render(), filenameTemplate, pathOptions, identifier, hash }]
				for (const fileManifest of manifest) {
					const cacheName = fileManifest.identifier;
					const usedHash = fileManifest.hash;
					filenameTemplate = fileManifest.filenameTemplate;
					file = this.getPath(filenameTemplate, fileManifest.pathOptions);

					// check if the same filename was already written by another chunk
					const alreadyWritten = alreadyWrittenFiles.get(file);
					if (alreadyWritten !== undefined) {
						if (alreadyWritten.hash === usedHash) {
							if (this.cache) {
								this.cache[cacheName] = {
									hash: usedHash,
									source: alreadyWritten.source
								};
							}
							chunk.files.push(file);
							this.hooks.chunkAsset.call(chunk, file);
							continue;
						} else {
							throw new Error(
								`Conflict: Multiple chunks emit assets to the same filename ${file}` +
									` (chunks ${alreadyWritten.chunk.id} and ${chunk.id})`
							);
						}
					}
					if (
						this.cache &&
						this.cache[cacheName] &&
						this.cache[cacheName].hash === usedHash
					) {
						source = this.cache[cacheName].source;
					} else {
						source = fileManifest.render();
						// Ensure that source is a cached source to avoid additional cost because of repeated access
						if (!(source instanceof CachedSource)) {
							const cacheEntry = cachedSourceMap.get(source);
							if (cacheEntry) {
								source = cacheEntry;
							} else {
								const cachedSource = new CachedSource(source);
								cachedSourceMap.set(source, cachedSource);
								source = cachedSource;
							}
						}
						if (this.cache) {
							this.cache[cacheName] = {
								hash: usedHash,
								source
							};
						}
					}
					if (this.assets[file] && this.assets[file] !== source) {
						throw new Error(
							`Conflict: Multiple assets emit to the same filename ${file}`
						);
					}
					this.assets[file] = source;
					chunk.files.push(file);
					this.hooks.chunkAsset.call(chunk, file);
					alreadyWrittenFiles.set(file, {
						hash: usedHash,
						source,
						chunk
					});
				}
			} catch (err) {
				this.errors.push(
					new ChunkRenderError(chunk, file || filenameTemplate, err)
				);
			}
		}
	}
```
## modules


```js
[ {
    dependencies: [],
    blocks: [],
    variables: [],
    type: 'javascript/auto',
    context: '/Users/orion/Desktop/react-beauty-highcharts/src',
    debugId: 1000,
    hash: 'a6388d29fa15bd58c6cffb10246992a5',
    renderedHash: 'a6388d29fa15bd58c6cf',
    resolveOptions: {},
    factoryMeta: {},
    warnings: [],
    errors: [],
    buildMeta: { providedExports: true },
    buildInfo:
     { cacheable: true,
       fileDependencies: [Set],
       contextDependencies: Set {},
       temporaryProvidedExports: false },
    reasons: [ [ModuleReason] ],
    _chunks:{
       [Chunk],
       _sortFn: [Function: sortById],
       _lastActiveSortFn: null,
       _cache: undefined,
       _cacheOrderIndependent: undefined },
    id: './src/index.js',
    index: 0,
    index2: 0,
    depth: 0,
    issuer: null,
    profile: undefined,
    prefetched: false,
    built: true,
    used: null,
    usedExports: null,
    optimizationBailout: [],
    _rewriteChunkInReasons: undefined,
    useSourceMap: true,
    _source:{
       _value:
        'module.exports = {\n  doubleLine: function doubleLine(arr) {\n    if (arr && !Array.isArray(arr)) {\n      console.error(\'the first params type must be Array\');\n      return;\n    }\n\n    return {\n      credits: {\n        enabled: false // 禁用版权信息\n\n      },\n      chart: {\n        width: \'400\',\n        height: \'400\',\n        type: \'area\',\n        backgroundColor: {\n          linearGradient: [0, 0, 500, 500],\n          stops: [[0, \'rgba(14, 8, 55,1)\'], [1, \'rgba(14, 8, 55,1)\']]\n        }\n      },\n      title: {\n        text: \'\',\n        style: {\n          color: \'#a6aed2\',\n          font: \'bold 16px "Trebuchet MS", Verdana, sans-serif\'\n        }\n      },\n      xAxis: {\n        categories: [\'10:00\', \'10:30\', \'11:00\', \'11:30\', \'12:00\', \'12:30\', \'13:00\', \'13:30\', \'14:00\', \'14:30\', \'15:00\', \'15:30\', \'16:00\', \'16:30\', \'16:30\', \'17:00\', \'17:30\', \'18:00\', \'18:30\', \'19:00\'],\n        labels: {\n          format: \'{value} \',\n          style: {\n            color: \'#746f95\',\n            fontSize: \'12px\',\n            fontFamily: \'微软雅黑\'\n          }\n        },\n        maxPadding: 0.05,\n        showLastLabel: true,\n        // tickmarkPlacement:\'on\',\n        tickColor: \'#746f95\',\n        lineWidth: 1,\n        lineColor: \'#746f95\',\n        tickLength: 5,\n        minRange: 5,\n        tickInterval: 1 // 坐标轴刻度间隔为一星期\n\n      },\n      yAxis: {\n        gridLineWidth: \'0px\',\n        startOnTick: true,\n        endOnTick: false,\n        maxPadding: 0.35,\n        title: {\n          text: null\n        },\n        labels: {\n          // format: \'{value} m\',\n          style: {\n            color: \'#746f95\',\n            fontSize: \'12px\',\n            fontFamily: \'微软雅黑\'\n          }\n        },\n        lineWidth: 1,\n        lineColor: \'#746f95\'\n      },\n      legend: {\n        itemStyle: {\n          font: \'9pt Trebuchet MS, Verdana, sans-serif\',\n          color: \'#a6aed2\'\n        },\n        itemHoverStyle: {\n          color: \'#fff\'\n        }\n      },\n      tooltip: {\n        pointFormat: \'{series.name}:  <b>{point.y:,.0f}</b>人\'\n      },\n      plotOptions: {\n        area: {\n          // pointStart: 1920,\n          marker: {\n            enabled: false,\n            symbol: \'circle\',\n            radius: 2,\n            states: {\n              hover: {\n                enabled: true\n              }\n            }\n          }\n        }\n      },\n      series: arr && arr[0] === \'pink\' ? [{\n        // data: [  110, 235, 369, 640,\n        //        1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,\n        //        27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,\n        //        26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,\n        //        24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,\n        //        22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,\n        //        10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104],\n        lineColor: \'#e88eb3\',\n        color: {\n          linearGradient: {\n            x1: 0,\n            x2: 0,\n            y1: 0,\n            y2: 1\n          },\n          stops: [[0, \'rgba(231,142,179,0.8)\'], [1, \'rgba(135,56,89,0.5)\']]\n        },\n        fillOpacity: 0.5,\n        name: \'进\',\n        marker: {\n          enabled: false\n        } // threshold: null // 是否显示负数\n\n      }, {\n        // data: ,\n        lineColor: \'#b946ff\',\n        color: {\n          linearGradient: {\n            x1: 0,\n            x2: 0,\n            y1: 0,\n            y2: 1\n          },\n          stops: [[0, \'rgba(152,60,210,0.8)\'], [1, \'rgba(65,25,90,0.35)\']]\n        },\n        fillOpacity: 0.5,\n        name: \'出\',\n        marker: {\n          enabled: false\n        },\n        threshold: null\n      }] : [{\n        // data: [  110, 235, 369, 640,\n        //        1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,\n        //        27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,\n        //        26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,\n        //        24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,\n        //        22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,\n        //        10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104],\n        lineColor: \'#b946ff\',\n        color: {\n          linearGradient: {\n            x1: 0,\n            x2: 0,\n            y1: 0,\n            y2: 1\n          },\n          stops: [[0, \'rgba(152,60,210,0.8)\'], [1, \'rgba(65,25,90,0.35)\']]\n        },\n        fillOpacity: 0.5,\n        name: \'进\',\n        marker: {\n          enabled: false\n        } // threshold: null // 是否显示负数\n\n      }, {\n        // data: ,\n        lineColor: \'#68d5ee\',\n        color: {\n          linearGradient: {\n            x1: 0,\n            x2: 0,\n            y1: 0,\n            y2: 1\n          },\n          stops: [[0, \'rgba(104,213,238,0.8)\'], [1, \'rgba(7,44,96,0.5)\']]\n        },\n        fillOpacity: 0.5,\n        name: \'出\',\n        marker: {\n          enabled: false\n        },\n        threshold: null\n      }]\n    };\n  },\n  columns: function columns() {\n    return {\n      credits: {\n        enabled: false\n      },\n      chart: {\n        type: \'column\',\n        backgroundColor: {\n          linearGradient: [0, 0, 500, 500],\n          stops: [[0, \'rgb(14, 8, 55)\'], [1, \'rgb(14, 8, 55)\']]\n        }\n      },\n      title: {\n        text: \'月平均降雨量\',\n        style: {\n          color: \'#a6aed2\',\n          font: \'bold 16px "Trebuchet MS", Verdana, sans-serif\'\n        }\n      },\n      xAxis: {\n        gridLineWidth: \'0px\',\n        startOnTick: true,\n        endOnTick: false,\n        maxPadding: 0.35,\n        categories: [\'一月\', \'二月\', \'三月\', \'四月\', \'五月\', \'六月\', \'七月\', \'八月\', \'九月\', \'十月\', \'十一月\', \'十二月\'],\n        labels: {\n          format: \'{value} \',\n          style: {\n            color: \'#746f95\',\n            fontSize: \'12px\',\n            fontFamily: \'微软雅黑\'\n          }\n        },\n        crosshair: true,\n        lineWidth: 1,\n        lineColor: \'#746f95\',\n        tickLength: 5,\n        tickColor: \'#746f95\'\n      },\n      yAxis: {\n        gridLineWidth: \'0px\',\n        startOnTick: true,\n        endOnTick: false,\n        maxPadding: 0.35,\n        min: 0,\n        labels: {\n          format: \'{value} \',\n          style: {\n            color: \'#746f95\',\n            fontSize: \'12px\',\n            fontFamily: \'微软雅黑\'\n          }\n        },\n        title: {\n          // 平均时长 (min)\n          text: \'\',\n          style: {\n            color: \'#746f95\',\n            fontSize: \'12px\',\n            fontFamily: \'微软雅黑\'\n          }\n        },\n        lineWidth: 1,\n        lineColor: \'#746f95\'\n      },\n      tooltip: {\n        // head + 每个 point + footer 拼接成完整的 table\n        headerFormat: \'<span style="font-size:10px">{point.key}</span><table>\',\n        pointFormat: \'<tr><td style="color:{series.color};padding:0">{series.name}: </td>\' + \'<td style="padding:0"><b>{point.y} </b></td></tr>\',\n        footerFormat: \'</table>\',\n        shared: true,\n        useHTML: true\n      },\n      plotOptions: {\n        column: {\n          borderWidth: 0\n        }\n      },\n      legend: {\n        itemStyle: {\n          font: \'9pt Trebuchet MS, Verdana, sans-serif\',\n          color: \'#a6aed2\'\n        },\n        itemHoverStyle: {\n          color: \'#fff\'\n        }\n      },\n      series: [{\n        color: \'#3453d4\',\n        name: \'>120s\',\n        data: [1, 2, 3, 4, 5, 6, 7]\n      }, {\n        color: \'#ff2674\',\n        name: \'60~120s\',\n        data: [3, 4, 3, 1, 3, 2, 2]\n      }, {\n        color: \'#66c3e3\',\n        // color:\'#66c3e3\',\n        name: \'<60s\',\n        data: [7, 4, 3, 4, 2, 6, 8]\n      }]\n    };\n  }\n};',
       _name:
        '/Users/orion/Desktop/react-beauty-highcharts/node_modules/babel-loader/lib/index.js!/Users/orion/Desktop/react-beauty-highcharts/src/index.js',
       _sourceMap: [Object],
       _originalSource: undefined,
       _innerSourceMap: undefined },
    request:
     '/Users/orion/Desktop/react-beauty-highcharts/node_modules/babel-loader/lib/index.js!/Users/orion/Desktop/react-beauty-highcharts/src/index.js',
    userRequest: '/Users/orion/Desktop/react-beauty-highcharts/src/index.js',
    rawRequest: './src/index.js',
    binary: false,
    parser:{
       _pluginCompat: [SyncBailHook],
       hooks: [Object],
       options: {},
       sourceType: 'auto',
       scope: undefined,
       state: undefined,
       comments: undefined },
    generator: JavascriptGenerator {},
    resource: '/Users/orion/Desktop/react-beauty-highcharts/src/index.js',
    matchResource: undefined,
    loaders: [ [Object] ],
    error: null,
    _buildHash: '488efbd43aa05371d3f44d94c89abd57',
    buildTimestamp: 1547885885262,
    _cachedSources: Map {},
    lineToLine: false,
    _lastSuccessfulBuildMeta: { providedExports: true },
    _ast: null } ]
```

我们看到module的长度也是一个，一样有类型，路径，hash
其中
_source的_value下的module.exports，已经是略微压缩版的了，里面还有\n 

里面值得分析的还有很多，关于怎么压缩，压缩算法是怎么处理的，二次读源码再详解

周六快乐，刚刚抓娃娃机一个都没抓上，哈哈哈哈，但是我抓的激动开心啊😄
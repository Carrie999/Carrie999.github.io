# 浅析webpack源码之Compiler.js模块(八)


## webpack.js小尾巴
```js
const webpack = (options, callback) => {
    //... 
    if (callback) {
		if (typeof callback !== "function") {
			throw new Error("Invalid argument: callback");
		}
		if (
			options.watch === true ||
			(Array.isArray(options) && options.some(o => o.watch))
		) {
			const watchOptions = Array.isArray(options)
				? options.map(o => o.watchOptions || {})
				: options.watchOptions || {};
			return compiler.watch(watchOptions, callback);
		}
		compiler.run(callback);
	}
    return compiler;
}
```
最终返回了compiler


```js
exports.version = version;

// ...属性挂载,把引入的函数模块全部暴露出来
webpack.WebpackOptionsDefaulter = WebpackOptionsDefaulter;
webpack.WebpackOptionsApply = WebpackOptionsApply;
webpack.Compiler = Compiler;
webpack.MultiCompiler = MultiCompiler;
webpack.NodeEnvironmentPlugin = NodeEnvironmentPlugin;
// @ts-ignore Global @this directive is not supported
webpack.validate = validateSchema.bind(this, webpackOptionsSchema);
webpack.validateSchema = validateSchema;
webpack.WebpackOptionsValidationError = WebpackOptionsValidationError;
```

下面暴露了一些插件
```js
const exportPlugins = (obj, mappings) => {
	for (const name of Object.keys(mappings)) {
		Object.defineProperty(obj, name, {
			configurable: false,
			enumerable: true,
			get: mappings[name]
		});
	}
};

exportPlugins(exports, {
	AutomaticPrefetchPlugin: () => require("./AutomaticPrefetchPlugin"),
	BannerPlugin: () => require("./BannerPlugin"),
	CachePlugin: () => require("./CachePlugin")}
)
```
再通俗一点的解释： <br> 
比如当你api.AutomaticPrefetchPlugin你能
调用AutomaticPrefetchPlugin文件下的方法
<br> 这个和上面的不同在于上面的是挂在webpack函数对象上的




## Compiler.js正题
要想理解Compiler.js  <br> 必须要理解tapable
再写一遍 [git地址](https://github.com/webpack/tapable/) 

我们先简单的理解它为一个通过tap 注册插件
call是run插件的事件流，里面还有一些异步的操作

 Compiler整理如下

```js
class Compiler extends Tapable {
	constructor(context) {
		super();
		this.hooks = {
		    //罗列一些出现频率比较高的
			shouldEmit: new SyncBailHook(["compilation"]),
			done: new AsyncSeriesHook(["stats"]),
			beforeRun: new AsyncSeriesHook(["compiler"]),
			run: new AsyncSeriesHook(["compiler"]),
			emit: new AsyncSeriesHook(["compilation"]),
			afterEmit: new AsyncSeriesHook(["compilation"]),
			thisCompilation: new SyncHook(["compilation", "params"]),
			compilation: new SyncHook(["compilation", "params"]),
			beforeCompile: new AsyncSeriesHook(["params"]),
			compile: new SyncHook(["params"]),
			make: new AsyncParallelHook(["compilation"]),
			afterCompile: new AsyncSeriesHook(["compilation"]),
			watchRun: new AsyncSeriesHook(["compiler"]),
			//...
			
		}
		// 添加事件流
	    this._pluginCompat.tap("Compiler", options => {
			switch (options.name) {
				case "additional-pass":
				case "before-run":
				case "run":
				case "emit":
				case "after-emit":
				case "before-compile":
				case "make":
				case "after-compile":
				case "watch-run":
					options.async = true;
					break;
			}
		});
	    
	}
	watch(){
	   	//...
	}
    
	run(callback) {
	    //... 
	}
	// 清除输入文件系统
	purgeInputFileSystem() {
		if (this.inputFileSystem && this.inputFileSystem.purge) {
			this.inputFileSystem.purge();
		}
	}
	emitAssets(compilation, callback) {
	    //...
	}
	createChildCompiler(
		compilation,
		compilerName,
		compilerIndex,
		outputOptions,
		plugins
	) {
		//...
	
	    
	}
    //...
    compile(callback){
        //...
    }	
}
```
和tapable用法一个模子里刻出来的，我们仔细的研究run函数


compiler.js是webpack 的核心

```js
run(callback) {
   //如果正在running，返回报错处理
	if (this.running) return callback(new ConcurrentCompilationError());
    
    //running调用finalCallback 
	const finalCallback = (err, stats) => {
		this.running = false;

		if (callback !== undefined) return callback(err, stats);
	};
    //记录初始化running时间
	const startTime = Date.now();
    //设置running标志，防止多次running
	this.running = true;
	
    //正在编译
	const onCompiled = (err, compilation) => {
	    //如果报错，编译结束
		if (err) return finalCallback(err);

        //如果没有编译完成
		if (this.hooks.shouldEmit.call(compilation) === false) {
		     // Stats模块有1400行，
		     // compiler.js是webpack 的核心，new Stats(compilation)是compiler.js的核心
			const stats = new Stats(compilation);
			 //	stats对象挂载startTime，endTime 
			stats.startTime = startTime;
			stats.endTime = Date.now();
			// 异步调用完成事件流，running结束
			this.hooks.done.callAsync(stats, err => {
				if (err) return finalCallback(err);
				return finalCallback(null, stats);
			});
			return;
		}
        // 调用emitAsset方法，emitAsset主要负责写入文件输出文件，不影响我们先看编译
		this.emitAssets(compilation, err => {
		    // 类似同上, 如果报错，编译结束
			if (err) return finalCallback(err);
            // 如果需要额外的编译，上次的没编译完成吗😰
			if (compilation.hooks.needAdditionalPass.call()) {
				compilation.needAdditionalPass = true;
                //再来一遍new Stats
				const stats = new Stats(compilation);
				stats.startTime = startTime;
				stats.endTime = Date.now(); 
				//继续异步调用时间流
				this.hooks.done.callAsync(stats, err => {
					if (err) return finalCallback(err);
                    //  这次多了一个时间流,调用额外编译，告知编译终于编完了
					this.hooks.additionalPass.callAsync(err => {
						if (err) return finalCallback(err);
						//调用compile，把onCompiled的返回值传入compile函数，onCompiled的返回值也就是new Stats的对象
						this.compile(onCompiled);
					});
				});
				return;
			}
            // 如果都不走上面的分支，即编译完成，不需要额外的编译
            // 调用emitRecords方法，主要用来记录输出的
			this.emitRecords(err => {
				if (err) return finalCallback(err);
                // 同样new Stats
				const stats = new Stats(compilation);
				stats.startTime = startTime;
				stats.endTime = Date.now();
				// 异步调用完成事件
				this.hooks.done.callAsync(stats, err => {
					if (err) return finalCallback(err);
					return finalCallback(null, stats);
				});
			});
			//最终总结，无论走那个分支都是 new Stats(compilation) 返回stats的回调函数,按照目前的流程走的是最后一个分支，调用 this.emitRecords
		});
	};
	
	// 调用beforeRun钩子
	this.hooks.beforeRun.callAsync(this, err => {
		if (err) return finalCallback(err);
        // 调用run钩子
		this.hooks.run.callAsync(this, err => {
			if (err) return finalCallback(err);
            //读文件记录
			this.readRecords(err => {
				if (err) return finalCallback(err);
                //把onCompiled函数传入，调用compile
				this.compile(onCompiled);
			});
		});
	});
}
```
#### new Stats(compilation)是compiler.js的核心
compilation和Stats分别对应两个模块
<br>compilation.js 2500行，Stats.js 1400行

接下来我们看一下compile函数
```js
newCompilationParams() {
		const params = {
		    // 普通模块工厂
			normalModuleFactory: this.createNormalModuleFactory(),
			// 上下文模块工厂
			contextModuleFactory: this.createContextModuleFactory(),
			// 编译依赖
			compilationDependencies: new Set()
		};
		return params;
	}


compile(callback) {
    // params值如下
	const params = this.newCompilationParams();
	// 异步调用beforeCompile钩子
	this.hooks.beforeCompile.callAsync(params, err => {
		if (err) return callback(err);
        // 调用compile钩子
		this.hooks.compile.call(params);
        // 终于出现了compilation，之前一直没有讲了compilation是什么，newCompilation我们看如下函数
		const compilation = this.newCompilation(params);

		this.hooks.make.callAsync(compilation, err => {
			if (err) return callback(err);

			compilation.finish();

			compilation.seal(err => {
				if (err) return callback(err);
                // 异步调用afterCompile，返回回调函数
				this.hooks.afterCompile.callAsync(compilation, err => {
					if (err) return callback(err);

					return callback(null, compilation);
				});
			});
		});
	});
}

newCompilation(params) {
   // compilation 是 this.createCompilation()，继续往下
	const compilation = this.createCompilation();
	//给compilation对象挂载属性
	compilation.fileTimestamps = this.fileTimestamps;
	compilation.contextTimestamps = this.contextTimestamps;
	compilation.name = this.name;
	compilation.records = this.records;
	compilation.compilationDependencies = params.compilationDependencies;
	//告知钩子调用完毕
	this.hooks.thisCompilation.call(compilation, params);
	this.hooks.compilation.call(compilation, params);
	return compilation;
}

createCompilation() {
   // 原来compilation 是 newCompilation而来，Compilation一共2500行，堪称整个compiler.js的核心
	return new Compilation(this);
}

```

params如下

```js
{ normalModuleFactory:
   NormalModuleFactory {
     _pluginCompat:
      SyncBailHook {
      // key是tapable 方法名
        _args: [Array],
        taps: [Array],
        interceptors: [],
        call: [Function: lazyCompileHook],
        promise: [Function: lazyCompileHook],
        callAsync: [Function: lazyCompileHook],
        _x: undefined },
     hooks:
      { resolver: [SyncWaterfallHook],
        factory: [SyncWaterfallHook],
        beforeResolve: [AsyncSeriesWaterfallHook],
        afterResolve: [AsyncSeriesWaterfallHook],
        createModule: [SyncBailHook],
        module: [SyncWaterfallHook],
        createParser: [HookMap],
        parser: [HookMap],
        createGenerator: [HookMap],
        generator: [HookMap] },
     resolverFactory:
      ResolverFactory {
        _pluginCompat: [SyncBailHook],
        hooks: [Object],
        cache1: [WeakMap],
        cache2: Map {} },
     ruleSet: RuleSet { references: {}, rules: [Array] },
     cachePredicate: [Function: bound Boolean],
     //文件路径
     context: '/Users/orion/Desktop/react-beauty-highcharts',
     parserCache: {},
     generatorCache: {} },
  contextModuleFactory:
   ContextModuleFactory {
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
      { beforeResolve: [AsyncSeriesWaterfallHook],
        afterResolve: [AsyncSeriesWaterfallHook],
        contextModuleFiles: [SyncWaterfallHook],
        alternatives: [AsyncSeriesWaterfallHook] },
     resolverFactory:
      ResolverFactory {
        _pluginCompat: [SyncBailHook],
        hooks: [Object],
        cache1: [WeakMap],
        cache2: Map {} } },
  compilationDependencies: Set {} }
```


## 终极总结

- Compiler构造函数 -> 
- run方法 -> 
- this.compile(onCompiled) ->
- this.compile()执行有了compilation ->
- onCompiled执行 const stats = new Stats(compilation) 
- 最后返回 finalCallback(null, stats);
 
this.compile(onCompiled) 是个高阶函数，可以简单的理解为参数是函数，并且返回一个函数

撒花🌹  🎉🍀我要买瓶skii犒赏自己

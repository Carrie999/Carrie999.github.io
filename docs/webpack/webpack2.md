# 浅析webpack源码之convert-argv模块（二）


打开webpeck-cli下的convert-argv.js文件
```js
// 定义options为空数组
 const options = [];
 // webpack -d 检查 -d指令
  if (argv.d) { 
      //...
  }
  // webpack -p
  if (argv.p) {
      //...
  }
  if (argv.output) {
      //...
  }
   //...
   /*如果有 --config   --config webpack.config.js   config就是webpack.config.js
    可以这样理解 
    "dev": "webpack-dev-server --inline --progress --hot --config webpack.config.js",当我们npm run dev的时候执行这段
    package.json的内容 此时有config读取webpack.config.js的内容 当我们npm run build时 执行 "webpack" 此时没有config走else分支*/
    if (argv.config) {
        // ... 获取文件
    }else{
        /*读取默认配置 ts co 等后缀类
         defaultConfigFiles是 数组[{ path:
	     '/Users/orion/Desktop/react-beauty-highcharts/webpack.config.js',
		 ext: '.js'
		 },{path:'/Users/orion/Desktop/react-beauty-highcharts/webpack.config.ts', ext: '.ts'},{},...] */
        for (i = 0; i < defaultConfigFiles.length; i++) {
			const webpackConfig = defaultConfigFiles[i].path;
			// 读取文件,如果有的话push推进去
			if (fs.existsSync(webpackConfig)) {
				configFiles.push({
					path: webpackConfig,
					ext: defaultConfigFiles[i].ext
				});
				// 	最终结果configFiles is the Array [ { path:'/Users/orion/Desktop/react-beauty-highcharts/webpack.config.js',
				//  ext: '.js' } ]
				break;
			}
		
		}
    }
```

process.cwd() 是node.js里读取文件路径的一个API

```js
//configFiles长度大于0时
if (configFiles.length > 0) {
	// ...
	const requireConfig = function requireConfig(configPath) {
        // 这是局部options不要和全局的options数组混淆
		let options = (function WEBPACK_OPTIONS() {
			if (argv.configRegister && argv.configRegister.length) {
				module.paths.unshift(
					path.resolve(process.cwd(), "node_modules"),
					process.cwd()
				);
				argv.configRegister.forEach(dep => {
					require(dep);
				});
				return require(configPath);
			} else {
				// 读取路径下的文件内容返回
				return require(configPath);
			}
		})();
		// 预处理options，options若是数组的话，处理成对象之类的
		options = prepareOptions(options, argv);
		return options;
	};
	configFiles.forEach(function(file) {
			/// interpret.extensions[.js]为null
            // 这里直接跳出
			registerCompiler(interpret.extensions[file.ext]);
			// options这里是全局options空数组 
			options.push(requireConfig(file.path));
		});
		// configFileLoaded 加载完毕
		configFileLoaded = true;
 	}
 }
```


```js
 // 如果没有加载完毕，调用函数传递空数组
if (!configFileLoaded) {
	return processConfiguredOptions({});
} else if (options.length === 1) {
   // 如果只有一个，把仅有的传进去 
	return processConfiguredOptions(options[0]);
} else {
    // 传options
	return processConfiguredOptions(options);
}
```	
注意了，这里有一个return 也就是这个convert-argv模块的最终返回结果，函数到这里就结束了。接下来我看看一下processConfiguredOptions函数

我们先按照npm run build分支走options.length为1,读取options[0]是webpack.config.js里的module.exports ={} 对象，饶了这大的一个圈子，那么接下来一起来看一看对你的输入配置做了怎么样的处理吧😁

```js
function processConfiguredOptions(options) {
	// 非法输出类型检测
	const webpackConfigurationValidationErrors = validateSchema(
		webpackConfigurationSchema,
		options
	);
	if (webpackConfigurationValidationErrors.length) {
		const error = new WebpackOptionsValidationError(
			webpackConfigurationValidationErrors
		);
		// 报错处理，具体什么是非法，不影响主流程先过😁
		console.error(
			error.message,
			`\nReceived: ${typeof options} : ${JSON.stringify(options, null, 2)}`
		);
		process.exit(-1); // eslint-disable-line
	}
	
	// 如果options是Promise😱，以后待查，按照我们的npm run build 流程走不是Promise
	if (typeof options.then === "function") { 
		return options.then(processConfiguredOptions);
	}
	
	/* process ES6 default 检测,虽说咱们的webpack.congfig.js 的内容是用的 ES6 module.exports 写的，但是options是对象已经被读出来了，所以不走这个分支，
	可是为什么要再写一遍呢？看来还是有这种情况的，继续往下读*/
	if (typeof options === "object" && typeof options.default === "object") {
		return processConfiguredOptions(options.default);
	}
	
	// filter multi-config by name,对于多配置的处理，我们先不走这个分支
	if (Array.isArray(options) && argv["config-name"]) {
	  //...
	}
	if (Array.isArray(options)) {
		options.forEach(processOptions);
	} else {
	    /* 看了这个多判断终于有没有找到家的感觉，回家的路程好艰辛,接下来我们看看processOptions函数对options做了什么
	    それは何をしましたか？🤔 */
		processOptions(options);
	}
	// ... 
	 // 这个return 正好对应上个return，是最终的模块返回值
	return options;
}
```



```js
function processOptions(options) {
        // 基本处理函数
        function ifArg(name, fn, init, finalize) {
            //... 
        }
        function ifArgPair(name, fn, init, finalize){
            //... 
        }
        function ifBooleanArg(name, fn) {
            //... 
        }
}
```
我们看到processOptions先定义了几个函数
ifArg，ifArgPair，ifBooleanArg，loadPlugin 根据名字可以翻译
如果是参数，如果是键值对形式参数 如果是布尔参数，如果是插件 
提起插件，是不是就想起了我们如下写的 plugins,对这个配置的处理，读源码联想大法和通过名称翻译的方法还是很重要的，自己写的时候，尽量起好懂的名称，不要用中文拼音😑

```js
{
	plugins: [
    new HtmlWebpackPlugin({ // 实例化生成html插件
      title: 'title',
      template: './src/index.html', 
      filename: 'index.html', 
      inlineSource:  '.(js|css))$',  
      minify: {
          removeComments: true,
          collapseWhitespace: true
      },
      chunks: ["index"]
   }),        
    new HtmlWebpackPlugin()
  ],
}
```
接下来是真正的函数调用

```js
ifArg("mode", function(value) {
	options.mode = value;
});

function ifArg(name, fn, init, finalize) {
    const isArray = Array.isArray(argv[name]);
	const isSet = typeof argv[name] !== "undefined" && argv[name] !== null;
	// isArray为false 直接返回
	if (!isArray && !isSet) return;
	

	init && init();
	if (isArray) argv[name].forEach(fn);
	else if (isSet) fn(argv[name], -1);
	finalize && finalize();
}
```
- 说一下argv目前argv是这么个对象
-  webpakck -p 有- p的时候有p=true
- 有 -d的时候有d=true
- '$0'是webpack的目前地址
- 其他的自己悟，哈哈哈哈哈🤣 听说90后喜欢用这个表情

```js
{ 
    _: [],
    cache: null,
    bail: null,
    profile: null,
    color: [Function: getSupportLevel],
    colors: [Function: getSupportLevel],
    d: true,
    p: true,
    'info-verbosity': 'info',
    infoVerbosity: 'info',
    '$0':
    '/Users/orion/Desktop/react-beauty-highcharts/node_modules/.bin/webpack',
    debug: true,
    'output-pathinfo': true,
    devtool: 'eval-cheap-module-source-map',
    mode: 'development',
    'optimize-minimize': true,
    define: [ 'process.env.NODE_ENV="production"' ] 
}
```

我们接着读这个函数

```js
function ifArg(name, fn, init, finalize) {
    //如果argv[name]是数组 
    const isArray = Array.isArray(argv[name]);
    //如果argv[name]存在
	const isSet = typeof argv[name] !== "undefined" && argv[name] !== null;
	// isArray和isSet同时为false的时候返回
	if (!isArray && !isSet) return;
	// 按照目前的流程走，能过来的name有define，output-pathinfo，debug，devtool，optimize-minimize
	//如果init函数存在就执行init函数,目前流程只有define有init，执行函数defineObject = {};
	init && init();
	//如果是数组，执行传入的fn
	if (isArray) argv[name].forEach(fn);
	else if (isSet) fn(argv[name], -1);
	finalize && finalize();
}
//这里只有一个是数组define，我们追踪define
    ifArgPair(
			"define",
			function(name, value) {
				if (name === null) {
					name = value;
					value = true;
				}
				defineObject[name] = value;
			},
			function() {
				defineObject = {};
			},
			function() {
				const DefinePlugin = require("webpack").DefinePlugin;
				addPlugin(options, new DefinePlugin(defineObject));
			}
		);
	}
	
	function ifArgPair(name, fn, init, finalize) {
		ifArg(
			name,
			function(content, idx) {
				const i = content.indexOf("=");
				if (i < 0) {
					return fn(null, content, idx);
				} else {
				    // 根据
					return fn(content.substr(0, i), content.substr(i + 1), idx);
				}
			},
			init,
			finalize
		);
	}
  // 接着，ifArgPair会调用ifArg对fn进行了处理
  //从fn到
  function(content, idx) {
				const i = content.indexOf("=");
				if (i < 0) {
					return fn(null, content, idx);
				} else {
				    // 根据
					return fn(content.substr(0, i), content.substr(i + 1), idx);
				}
			}
 
	// 目前define是数组,define =[ 'process.env.NODE_ENV="production"' ]
	 if (isArray) argv[name].forEach(fn);
	 // 执行fn 的参数把 等号分割，执行
	 function(name, value) {
		  // name = process.env.NODE_ENV
		  // value = production
		
			if (name === null) {
				name = value;
				value = true;
			}
			defineObject[name] = value;
			
		}
	// 函数执行结果就是
	 defineObject.process.env.NODE_ENV =  production

    // 最后返回的是options，此后还有执行第三个参数出入了defineObject最终影响了options配置		
```

我们接着往下读

```js
// 如果不为数组，而且存在执行fn
else if (isSet) fn(argv[name], -1);
```
我们追踪output-pathinfo
```js
ifBooleanArg("output-pathinfo", function() {
	ensureObject(options, "output");
	options.output.pathinfo = true;
});

function ifBooleanArg(name, fn) {
		ifArg(name, function(bool) {
			if (bool) {
			   // 如果配置是true那么执行函数
				fn();
			}
		});
	}
// 函数执行结果就是
options.output.pathinfo = true;
```
再往下读
```js
finalize && finalize();
//对于define字段传入了finalize函数，即第三个函数
function() {
    // 从webpack引入DefinePlugin对象
	const DefinePlugin = require("webpack").DefinePlugin;
	// 调用addPlugin
	addPlugin(options, new DefinePlugin(defineObject));
}

function addPlugin(options, plugin) {
		ensureArray(options, "plugins");
		options.plugins.unshift(plugin);
}
// 最终结果对options做了处理
```
其他同理
😵这个模块终于写完了，我们
## 总结一下
这个模块做的就是从webpack配置文件读取配置赋值给options，然后根据配置，对options做了附加的对象处理比如options.output.pathinfo = true;然后返回options，国外小哥哥好能绕
我们在bin/cli文件里打印一下最后的config


```js
{ entry: './src/index.js',
  output:
   { filename: 'index.js',
     path: '/Users/orion/Desktop/react-beauty-highcharts/dist',
     libraryTarget: 'commonjs2',
     pathinfo: true },
  module: { rules: [ [Object], [Object] ] },
  devServer: { openPage: './src/index.html', open: true, hot: true },
  externals: [ [Function] ],
  mode: 'development',
  plugins:
   [ LoaderOptionsPlugin { options: [Object] },
     LoaderOptionsPlugin { options: [Object] },
     DefinePlugin { definitions: [Object] } ],
  devtool: 'eval-cheap-module-source-map',
  context: '/Users/orion/Desktop/react-beauty-highcharts' }
```
鼓掌👏给自己一朵小红花🌹 







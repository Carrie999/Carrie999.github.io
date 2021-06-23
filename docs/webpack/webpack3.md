# 浅析webpack源码之processOptions处理Options以及入口函数（三）

我们打开bin/cli.js
根据上次所返回的Options


processOptions(options)
这个因为有了上次的基础，比较容易读了,大体逻辑是这样的

先定义一个 outputOptions 空对象
同上次的ifArg一个逻辑，argv还是一个
```js
function ifArg(name, fn, init) {
	if (Array.isArray(argv[name])) {
		if (init) init();
		argv[name].forEach(fn);
	} else if (typeof argv[name] !== "undefined") {
		if (init) init();
		fn(argv[name], -1);
	}
}
```
目前的方式只有一个满足 
info-verbosity
如果满足的会执行fn, init一系列函数

```js
ifArg("info-verbosity", function(value) {
	outputOptions.infoVerbosity = value;
});
```
这个函数直接结果是

```js
outputOptions.infoVerbosity = 'info';
```
outputOptions.infoVerbosity的影响是打log
	
比如如果 watch满足的话

```js
if (outputOptions.infoVerbosity !== "none"){
	console.log("\nwebpack is watching the files…\n");
}
```
当你npm run dev的时候就会在页面上出现

webpack is watching the files…


这样一句话了

> 其他逻辑类此，通过调用ifArg 对outputOptions对象添加数据，然后根据属性的值来打不同的log
> 这就是processOptions的函数所做的事情


这些都不影响主进程


## webpack序幕 
最重要的是里面这一句

```js
const webpack = require("webpack");
let compiler;
compiler = webpack(options);
// ... 
compiler.run(compilerCallback);
```
拉开了webpack的序幕 

 
#### 那么问题来了webpack从那里引进来的 
なに（纳尼）,经过一番搜索在webpack/lib/webpack.js,先不纠结为什么找到了lib下,我们继续读

打开webpack.js
```js
const Compiler = require("./Compiler");
// ...模块引入

function webpack(options, callback) {
    // 错误检测
    const webpackOptionsValidationErrors = validateSchema(webpackOptionsSchema, options);
    if(webpackOptionsValidationErrors.length) {
        throw new WebpackOptionsValidationError(webpackOptionsValidationErrors);
    }
    let compiler;
    // 多配置
    if(Array.isArray(options)) {
        compiler = new MultiCompiler(options.map(options => webpack(options)));
    }
    // 单配置 
    else if(typeof options === "object") { /*...*/ } 
    else {
        throw new Error("Invalid argument: options");
    }
    if(callback) { /*...*/ }
    return compiler;
}
exports = module.exports = webpack;

webpack.WebpackOptionsDefaulter = WebpackOptionsDefaulter;
// ...属性挂载

function exportPlugins( /*...*/ )

exportPlugins( /*...*/ );
exportPlugins( /*...*/ );

```
## 总结
可以主要分为以下几块：

1、工具模块引入

2、对配置对象进行错误检测

3、分多配置或单配置进行处理

4、执行回调函数

5、在webpack函数上挂载引入的模块

6、输出一些插件









# 浅析webpack源码之WebpackOptionsApply 模块(七)


NodeEnvironmentPlugin还做了watch处理，NodeWatchFileSystem是webpack之所以能根据变化自己更新的核心，好凌乱，我们先从那个坑跳出来

```js
compiler.options = new WebpackOptionsApply().process(options, compiler);
```

进入 WebpackOptionsApply.js 这个大坑

进入这个页面看到前面一大堆的模块引入，已经给跪了，但是马马虎虎的完成也比放弃好
<br>前面一大堆的引入，主要是lib下dependencies和optimize文件夹下的模块

```js
class WebpackOptionsApply extends OptionsApply {
	constructor() {
		super();
	}
	process(options, compiler) {
	    
	}
}
```
OptionsApply父类就只是定义了接口
主要核心在process方法里主要做了

1.处理options.target参数

2.处理options.output，options.externals，options.devtool参数

3.对于引用了巨量的模块把把this指向compiler对象


```js
new CompatibilityPlugin().apply(compiler);
new HarmonyModulesPlugin(options.module).apply(compiler);
new AMDPlugin(options.module, options.amd || {}).apply(compiler);
new CommonJsPlugin(options.module).apply(compiler);
new LoaderPlugin().apply(compiler);
new NodeStuffPlugin(options.node).apply(compiler);
//...
```
4.处理options.optimization 的moduleIds和chunkIds属性

5.处理如下插件
```js
new TemplatedPathPlugin().apply(compiler);

new RecordIdsPlugin({
	portableIds: options.optimization.portableRecords
}).apply(compiler);

new WarnCaseSensitiveModulesPlugin().apply(compiler);
```
6.hooks事件流


## 终极总结
这个模块主要是根据options选项的配置，设置compile的相应的插件，属性，里面写了大量的 apply(compiler); 使得模块的this指向compiler
<br>没有对options做任何处理

过！！！




# 浅析webpack源码之Tapable粗解（五）

打开compile

```js
class Compiler extends Tapable {
	constructor(context) {
	    super();
	    	this.hooks = {
	    	    //...
	    	}
	}
}
```
Compiler是个构造函数，定义了一些静态属性和方法

我们先看 Tapable

Tapable在node_modules插件下
[git地址](https://github.com/webpack/tapable/)
上面写的解释Just a little module for plugins就跟没写一样
<br>在lib/index.js 文件下

```js
exports.__esModule = true;
exports.Tapable = require("./Tapable");
exports.SyncHook = require("./SyncHook");
exports.SyncBailHook = require("./SyncBailHook");
exports.SyncWaterfallHook = require("./SyncWaterfallHook");
exports.SyncLoopHook = require("./SyncLoopHook");
exports.AsyncParallelHook = require("./AsyncParallelHook");
exports.AsyncParallelBailHook = require("./AsyncParallelBailHook");
exports.AsyncSeriesHook = require("./AsyncSeriesHook");
exports.AsyncSeriesBailHook = require("./AsyncSeriesBailHook");
exports.AsyncSeriesWaterfallHook = require("./AsyncSeriesWaterfallHook");
exports.HookMap = require("./HookMap");
exports.MultiHook = require("./MultiHook");

```
我们看到输出的一些对象方法
<br>每一个对应一个模块

而在webpakck Compiler.js下引入的下面

```js
const {
	Tapable,
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");
```
so，我们先研究引入的对象


tap 的英文单词解释，除了最常用的 点击 手势之外，还有一个意思是 水龙头 
<br>进一步可以理解为tapable是管理事件流的意思
<br>借用网上的一张图，tapable是事件管家
之所以名称有差距，是版本问题导致的，目前的是1.1.0版本，我们看看git果然证明了v0.2.8以前的全部都是下图函数所示😥看个源码好艰辛
![image](http://ww4.sinaimg.cn/large/006tNbRwgw1fa8r9bnodhj30sg0lcwhd.jpg)
我们还是看一看git上的readme.md文档吧


```js
class Car {
	constructor() {
		this.hooks = {
			accelerate: new SyncHook(["newSpeed"]),
			break: new SyncHook(),
			calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
		};
	}

	/* ... */
}

const myCar = new Car();

// 可以理解为trigger触发，consument是消费者的意思
// Use the tap method to add a consument
myCar.hooks.break.tap("WarningLampPlugin", () => warningLamp.on());


myCar.hooks.accelerate.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`));

//异步方法
myCar.hooks.calculateRoutes.tapAsync("BingMapsPlugin", (source, target, routesList, callback) => {
	bing.findRoute(source, target, (err, route) => {
		if(err) return callback(err);
		routesList.add(route);
		// call the callback
		callback();
	});
});
// 异步方法
// You can still use sync plugins
myCar.hooks.calculateRoutes.tap("CachedRoutesPlugin", (source, target, routesList) => {
	const cachedRoute = cache.get(source, target);
	if(cachedRoute)
		routesList.add(cachedRoute);
})

```

上面写的tap对应如下的call方法
```js
class Car {
	/* ... */

	setSpeed(newSpeed) {
		this.hooks.accelerate.call(newSpeed);
	}

	useNavigationSystemPromise(source, target) {
		const routesList = new List();
		return this.hooks.calculateRoutes.promise(source, target, routesList).then(() => {
			return routesList.getRoutes();
		});
	}

	useNavigationSystemAsync(source, target, callback) {
		const routesList = new List();
		this.hooks.calculateRoutes.callAsync(source, target, routesList, err => {
			if(err) return callback(err);
			callback(null, routesList.getRoutes());
		});
	}
}
```
很像监听者模式，当你call是执行你on的函数，也就是按照这个文档所说的running your plugins

这就是这个插件所做的，当然这个插件还做了异步处理等一些其他的事情
之所以用这个插件，是因为能很好的处理时间流异步回调的情况

具体的Tapable如何实现，很复杂

webpack很多核心功能本身是以插件的形式开发的
### 参考文章
[Webpack 源码（一）—— Tapable 和 事件流](https://segmentfault.com/a/1190000008060440)
<br>[浅析webpack源码之Tapable介绍](https://www.cnblogs.com/QH-Jimmy/p/8036962.html)
<br>[git文档](https://github.com/webpack/tapable/tree/v1.1.0) 
<br>[Tapable中文文档](https://www.jianshu.com/p/c71393db6287）)
<br>[webpack源码分析（一）— Tapable插件架构](https://www.jianshu.com/p/01a606c97d76)
<br>[探索webpack源码（三）--- Tapable插件使用 2018-04-10](https://www.jianshu.com/p/4544e030c6b7)

话说看了这么多，感觉还是很凌乱，Tapable到底是怎么做的，以及优点在哪里，我们往下读，也许读着读着就会豁然开朗，所以标题就从Tapable详解到粗解

# 浅析webpack源码之NodeEnvironmentPlugin模块总览（六）

进入webpack.js

```js
// 传入地址,new Compiler出来一个复杂对象
compiler = new Compiler(options.context);
// 把options挂载到对象上
compiler.options = options;
new NodeEnvironmentPlugin().apply(compiler);
```
compiler太复杂
<br>我们先看NodeEnvironmentPlugin

```js
const NodeWatchFileSystem = require("./NodeWatchFileSystem");
const NodeOutputFileSystem = require("./NodeOutputFileSystem");
const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");
const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");

class NodeEnvironmentPlugin {
	apply(compiler) {
	    // 可以缓存输入的文件系统
		compiler.inputFileSystem = new CachedInputFileSystem(
			new NodeJsInputFileSystem(),
			60000
		);
		// 输入文件系统
		const inputFileSystem = compiler.inputFileSystem;
		// 输出文件系统，挂载到compiler对象
		compiler.outputFileSystem = new NodeOutputFileSystem();
		// 传入输入文件，监视文件系统，挂载到compiler对象
		compiler.watchFileSystem = new NodeWatchFileSystem(
			compiler.inputFileSystem
		);
		// 添加事件流before-run
		compiler.hooks.beforeRun.tap("NodeEnvironmentPlugin", compiler => {
			if (compiler.inputFileSystem === inputFileSystem) inputFileSystem.purge();
		});
	}
}
module.exports = NodeEnvironmentPlugin;

```

打开插件NodeJsInputFileSystem.js


```js

"use strict";

const fs = require("graceful-fs");

class NodeJsInputFileSystem {
     //读取目录下文件
	readdir(path, callback) {
		fs.readdir(path, (err, files) => {
			callback(err, files && files.map(file => {
			  // 对文件名进行NFC格式化
				return file.normalize ? file.normalize("NFC") : file;
			}));
		});
	}
     //异步读取目录下文件
	readdirSync(path) {
		const files = fs.readdirSync(path);
		return files && files.map(file => {
			return file.normalize ? file.normalize("NFC") : file;
		});
	}
}

const fsMethods = [
	"stat",
	"statSync",
	"readFile",
	"readFileSync",
	"readlink",
	"readlinkSync"
];
// 同步fs方法
for(const key of fsMethods) {
	Object.defineProperty(NodeJsInputFileSystem.prototype, key, {
		configurable: true,
		writable: true,
		value: fs[key].bind(fs)
	});
}

module.exports = NodeJsInputFileSystem;

```

graceful-fs就是对node 原生fs 做了一层封装，显得更优雅

总体看来NodeEnvironmentPlugin这个模块就是对文件做了处理，又重新封装了node.js 对fs模块做了以一些处理，文件的输入，输出，缓存，监听...






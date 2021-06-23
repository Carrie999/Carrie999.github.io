# 浅析webpack源码之CachedInputFileSystem模块(六)(1)

原本写的误操作被吞了，下面是代码记录
这个模块主要做了缓存文件操作
```js
module.exports = class CachedInputFileSystem {
	constructor(fileSystem, duration) {
		this.fileSystem = fileSystem;
		//生成缓存容器,目前他们是一样样的都是new Storage(duration)，区别在于调用方法传递参数不一样，分别储存不一个类型的缓存
		this._statStorage = new Storage(duration);
		this._readdirStorage = new Storage(duration);
		this._readFileStorage = new Storage(duration);
		this._readJsonStorage = new Storage(duration);
		this._readlinkStorage = new Storage(duration);
		// 把文件信息赋值给对应属性
		this._stat = this.fileSystem.stat ? this.fileSystem.stat.bind(this.fileSystem) : null;
		if(!this._stat) this.stat = null;

		//...

		if(this.fileSystem.readJson) {
			this._readJson = this.fileSystem.readJson.bind(this.fileSystem);
		} else if(this.readFile) {
			 // 自定义JSON读取
			this._readJson = (path, callback) => {
				// fs.readFile读取文件
				this.readFile(path, (err, buffer) => {
					if(err) return callback(err);
					let data;
					try {
						data = JSON.parse(buffer.toString("utf-8"));
					} catch(e) {
						return callback(e);
					}
					callback(null, data);
				});
			};
		} else {
			this.readJson = null;
		}
            //...

	
	}
	//调用Storage对象方法
	stat(path, callback) {
		this._statStorage.provide(path, this._stat, callback);
	}

    //...

	readlinkSync(path) {
		return this._readlinkStorage.provideSync(path, this._readlinkSync);
	}
	//分别清除对应的Storage，what是传入什么，清除什么，purge的中文的意思又整肃的意思，和clear有点区别，有完整清除不能被回退的感觉
	purge(what) {
		this._statStorage.purge(what);
		this._readdirStorage.purge(what);
		this._readFileStorage.purge(what);
		this._readlinkStorage.purge(what);
		this._readJsonStorage.purge(what);
	}
};
```

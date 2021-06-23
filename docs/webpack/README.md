# 浅析webpack源码之前言（一）


## 为什么读webpack源码
- 因为前端框架离不开webpack，天天都在用的东西啊，怎能不研究
- 读源码能学到很多做项目看书学不到的东西，比如说架构，构造函数，es6很边缘的用法，甚至给函数命名也会潜移默化的影响等
- 想写源码，不看源码怎么行，虽然现在还不知道写什么，就算不写什么，看看别人写的总可以吧
- 知道世界的广阔，那么多插件，那么多软件开发师，他们在做什么，同样是写js的，怎么他们能这么伟大
- 好奇心


本以为用框架以及用熟练后，到达了一个美丽的小湖泊，读源码发现原来还有一望无际的海洋，壮丽的雪山，浩淼的星辰。

读webpack对面试也没什么用（刷leetcode，面试题更有用），你说你看webpack学会了啥，一时半会也说不清楚，但就是想看，想就去做，只要不危害他人

## 为什么写webpack源码系列文章博客
- 我可以只读不写的，这样还读的更快，只是后面想起了，不知道读了啥，读vue的时候好多都没有记录，但是即便那样当我再次看到那个函数我知道那是做什么
- 给公司写的项目代码，如果项目被砍，感觉白写了一样
- 为了证明自己的存在，证明自己来过
- 如果通过看这个文章你能能学到丝毫的知识，是我之幸✌️ 


## 看这个你能学到什么

如果你想知道webpack的算法实现
<br>我建议你看这个[git地址](https://github.com/lihongxun945/diving-into-webpack)
<br>虽然写的不够好，但是已经是我能找到的中写的最好的
<br>里面更多记录了怎么跟踪的过程
<br>你能学到如何调试以及阅读源码
<br>知道webpack页面架构
<br>webpack哪些模块实现了什么功能

## 如何读webpack
### 准备
自己用webpack搭建一个项目,甚至是现成的读webpack都可以

### 当你npm run build 发生了什么？
<br>参考npm的[run-script文档](https://docs.npmjs.com/cli/run-script#description)
<br>npm run会自动添加node_module/.bin 到当前命令所用的PATH变量中，
因此，npm run build 会执行package.json配置的build，目前我配置的是webpack，
实际会调用 node_modules/.bin/webpack
打开项目找到node_modules/.bin/webpack，需要点耐心，需要翻很多
webpack是一个符号连接
指到了webpack/bin/webpack.js

### log大法
第一行是

```
#!/usr/bin/env node
```

它被称为 Shebang。

/usr/bin/env 不是一个路径，而是一个命令，
后面跟node 参数，就会找到node并调用它。

```
$ /usr/bin/env node --version
v10.11.0
```
log 调试

[颜色log DEGUB](https://github.com/visionmedia/debug)

用这个打印log会区分颜色，事实上我用着，也没那么好用


顺便讲一下吧

安装

```
npm i -D debug
```

在要调试的文件中
定义

```js
const log = require('debug')('debug-webpack webpack webpack.js');
log('你想打印的')
```

 请把react-beauty-highcharts替换成你的文件名，这样才会有log
```
DEBUG=react-beauty-highcharts* npm run build
```

这个有个缺点就是如果json比较大，每一行都会打印一遍debug-webpack webpack webpack.js名字，不好复制,还是console.log() 好使


我们打开文件，里面主要处理了一些安装的逻辑
没安装包报错之类的
找到

```js
const cliPath = path.resolve(path.dirname(pkgPath), pkg.bin[installedClis[0].binName]);
// 引入了路径看到打印了路径是node_modules/webpack-cli/bin/cli.js
require(cliPath);
```
接下来打开webpack-cli/bin/cli.js

241行
```js
let options;
try {
	options = require("./convert-argv")(argv);
} catch (err) {
    
}
```
我们分析convert-argv模块













[[toc]]
# Koa源码阅读-中间件原理分析

网上有很多bolg分析Koa源码阅读的项目，但是我依然想写，
因为每个人和每个人的表述语言不一样，每个人和每个人的侧重点也不一样。
写这篇希望给不用读源码的人，一眼就能很轻松的看明白。

so，开始吧
## 下载koa并启动
[koa官方开源项目](https://github.com/koajs/koa)
[koa文档](https://koajs.com)

```js
// 安装
npm install 
```
koa没有例子，所以我们自己建一个（ 我认为这是非常重要的一步，好多人多没写）

通过package.json

```js
"main": "lib/application.js",
```
我们知道lib文件夹下的application.js就是入口，只要引入它，我们就能引入整个Koa

在Koa第一层新建index.js

输入
```js
// 把require('koa') 换成相对路径文件
const Koa = require('./lib/application.js');
const app = new Koa();

// logger
app.use(async (ctx, next) => {
  console.log(1)
  await next();
  console.log(5)
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
  console.log(2)
  const start = Date.now();
  await next();
  console.log(4)
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// response
app.use(async ctx => {
    console.log(3)
    ctx.body = 'Hello World';
});

app.listen(3000);
```

在命令行输入

```
node index.js
```

开启项目
访问 http://localhost:3000/

终端打印 1，2，3，4，5
这就是洋葱模型

```
疑问一，洋葱模型怎么实现的？
疑问二，洋葱模型有什么好处？
```

## koa很迷你


文档mini，源码也很小，只有4个js文件（
Application.js,context.js request.js,response.js）由于主线是解释中间件，就只解释中间件有关的


```js
class Application extends Emitter {
    constructor() {
        super();
        // 定义middleware为数组类型
        this.middleware = [];
    }
    
    listen() {
        debug('listen');
        const server = http.createServer(this.callback());
        return server.listen.apply(server, arguments);
    }
    //把异步函数全部放到this.middleware数组
    use(fn) {
        this.middleware.push(fn);
        return this;
    }
    
    
  callback() {
    const fn = compose(this.middleware);
    if (!this.listeners('error').length) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      res.statusCode = 404;
      const ctx = this.createContext(req, res);
      const onerror = err => ctx.onerror(err);
      const handleResponse = () => respond(ctx);
      onFinished(res, onerror);
      fn(ctx).then(handleResponse).catch(onerror);
    };

    return handleRequest;
  }

}
```
执行app.listen(3000);调用listen()，listen() 调用callback()

app.use(),把异步函数全部放到this.middleware数组

callback() 

```js
// 把包含多个异步函数的数组经过compose变成一个函数
fn = compose(this.middleware)
```
我们打开node_modules下的koa-compose文件index.js

核心就这一个函数
```js
const Promise = require('any-promise')

function compose (middleware) {
  // middleware必须是数组
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  // middleware数组里面必须是函数
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

compose有点绕，我们慢慢分析

compose返回一个函数，这个函数返回一个立即执行函数dispatch(0)
这个是执行的，特地强调，然后dispatch(i)返回的是Promise

一般我们用 promise 是这样用
```js
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```
这样用也可以

```js
let a = ()=>{
   console.log(1)
   return 1
}
await Promise.resolve(a());
```
返回的是a函数执行的结果，如果函数没有返回那么就是undifined

```js
const fn = compose(this.middleware);
fn(ctx).then(handleResponse).catch(onerror);
```

fn是返回的最外层函数，当fn执行的时候传入(ctx)返回的是promise


```js
return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    // 从0开始递归
    function dispatch (i) {
      index = i
      // 获取middleware第i个异步函数
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, function next () {
          //等下一个Promise结果
          return dispatch(i + 1)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
```
在们的例子里一共有3个异步函数，middleware.length的长度为3，第一个和第二个传递了next，第三个没有，所以i = 2就结束了
没有走到如下这里
```js
 if (i === middleware.length) fn = next
 if (!fn) return Promise.resolve()
```
return dispatch(i + 1)
所以 await next(); 等得是下一个异步函数的Promise


```js
return Promise.resolve(fn(context, function next () {
    //等下一个Promise结果
    return dispatch(i + 1)
}))
```
fn有两个参数 第一个是context，第二个是next 函数返回Promise，

Promise返回的是异步函数的执行结果

```js
app.use(async (ctx, next) => {
  console.log(1)
  let c = await next();
  // 这里能获取到值111111
  console.log(c)
  console.log(5)
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});


// x-response-time
app.use(async (ctx, next) => {
  console.log(2)
  const start = Date.now();
  let a = await next();
  console.log(4)
  // 这里返回数字
  return 111111
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});
```
当第三个函数执行，返回promise，结果是undified，然后执行第二个异步函数，最后执行第一个

总结：compose函数写的真妙，tj是个天才

## 洋葱模型（中间件）有什么意义？

 不用写回调，有点一本道的感觉。
 await 的好处是不用写回调，不要牵强附会。
 
 好处就是最初给的例子：
 
 比如一个服务器处理时间/日志的中间件的开发：
 请求一开始记录时间
 
```js
const start = Date.now();
```

 请求结束回来再记录一次时间

```js
const ms = Date.now() - start;
```

 
 可以很方便的统计请求时间，解耦。
 
 代码是写给人看的，顺便让机器执行而已。
 
 koa的优势不在能实现更强的功能，而是可以更简单地完成功能。



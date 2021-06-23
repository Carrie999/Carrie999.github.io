[[toc]]
# Koa源码阅读-详解
承接上一章
## Application函数
```js
module.exports = class Application extends Emitter {
    constructor() {
        super();
    
        this.proxy = false;
        this.middleware = [];
        this.subdomainOffset = 2;
        this.env = process.env.NODE_ENV || 'development';
        // context,request,response是空对象，能访问相应原型对象上的属性和方法
        this.context = Object.create(context);
        this.request = Object.create(request);
        this.response = Object.create(response);
    }
}
```
#### Emitter
Application继承自Emitter

Emitter主要是观察订阅者模式，在index.js可以这样写，会出现结果

```js
const app = new Koa();

app.on('a',(element)=>{
  // 111
  console.log(element)
})
app.emit('a',111)
```


#### 学习一下Object.create
```js
const a = {a:1,b:2}
const b = Object.create(a); // {}
console.log(b.__proto__ === a) //true
console.log(b.a) //1
```
a在b的原型链上，b能访问a的属性

#### 单元测试
```js
toJSON() {
    return only(this, [
      'subdomainOffset',
      'proxy',
      'env'
    ]);
}

inspect() {
    return this.toJSON();
}
```
only函数返回新对象，并且只返回包含key，key的值不为null
```js
module.exports = function(obj, keys){
  obj = obj || {};
  if ('string' == typeof keys) keys = keys.split(/ +/);
  return keys.reduce(function(ret, key){
    if (null == obj[key]) return ret;
    ret[key] = obj[key];
    return ret;
  }, {});
};
```


```js
//执行app.inspect() 
describe('app.inspect()', () => {
  it('should work', () => {
    const app = new Koa();
    const util = require('util');
    const str = util.inspect(app);
    // 相等则通过
    assert.equal("{ subdomainOffset: 2, proxy: false, env: 'test' }", str);
  });
});
```
这里有个疑问，为什么在index.js 实例后的对象也只有这3个属性？？？

#### listen
调用listen执行callback
```js
  listen() {
    debug('listen');
    const server = http.createServer(this.callback());
    return server.listen.apply(server, arguments);
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
```
在这里顺便说一下，原生 http创建一个服务是这样子滴


```js
const http = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('okay');
});
http.listen(8000)
```


#### createContext

```js
createContext(req, res) {
    // 以this.context为蓝本建立对象，此时引入的this.context已经两次实例了。request和response同理，并且作为属性挂在context上
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    // context  request response都能拿到this,req,res
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    // request response有context;
    request.ctx = response.ctx = context;
    // request和response能互相拿到各自的对象
    request.response = response;
    response.request = request;
    // context 和 request的originalUrl有了req.url
    context.originalUrl = request.originalUrl = req.url;
    // context能拿到cookie
    context.cookies = new Cookies(req, res, {
      keys: this.keys,
      secure: request.secure
    });
    request.ip = request.ips[0] || req.socket.remoteAddress || '';
    context.accept = request.accept = accepts(req);
    context.state = {};
    // 返回 context
    return context;
}
```
#### respond
经过中间件的处理，respond

```js
function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  const res = ctx.res;
  if (!ctx.writable) return;
  //拿到body
  let body = ctx.body;
  const code = ctx.status;
  // 如果body不存在,那么返回默认not found
  // status body
  if (null == body) {
    body = ctx.message || String(code);
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }
  // 如果body是二进制，是字符串，Stream流，直接返回
  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json  json的处理
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
```
## context函数
前面主要做了onerror和暴露属性的处理
来看最重要的

```js
/**
* context能够使用response下attachment redirect的方法， 
* 能够设置respons下status message的属性， 
* 能读headerSent和writable的值
*/
delegate(proto, 'response')
  .method('attachment')
  .method('redirect')
  .method('remove')
  .method('vary')
  .method('set')
  .method('append')
  .method('flushHeaders')
  .access('status')
  .access('message')
  .access('body')
  .access('length')
  .access('type')
  .access('lastModified')
  .access('etag')
  .getter('headerSent')
  .getter('writable');
```

```js
function Delegator(proto, target) {
  // 调用函数即返回实例后的自己，每调用一次都是不同的this，好处能够调用原型对象上的方法
  if (!(this instanceof Delegator)) return new Delegator(proto, target);
  this.proto = proto;
  this.target = target;
  this.methods = [];
  this.getters = [];
  this.setters = [];
  this.fluents = [];
}
```

```js
// 把target的上的方法挂载在proto上，而执行的this却是target的
Delegator.prototype.method = function(name){
  var proto = this.proto;
  var target = this.target;
  this.methods.push(name);

  proto[name] = function(){
    return this[target][name].apply(this[target], arguments);
  };

  return this;
};
```

proto[name]能读取target[name]
```js
Delegator.prototype.getter = function(name){
  var proto = this.proto;
  var target = this.target;
  this.getters.push(name);

  proto.__defineGetter__(name, function(){
    return this[target][name];
  });

  return this;
};
```
proto[name]能设置target[name]
```js
Delegator.prototype.setter = function(name){
  var proto = this.proto;
  var target = this.target;
  this.setters.push(name);

  proto.__defineSetter__(name, function(val){
    return this[target][name] = val;
  });

  return this;
};
```
可读可写
```js
Delegator.prototype.access = function(name){
  return this.getter(name).setter(name);
};
```
## request对象
一句话，request对象主要做了拿到请求的信息
我们看几个例子

```js
// 返回this.req.headers信息
get header() {
    return this.req.headers;
},

get(field) {
    const req = this.req;
    switch (field = field.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return req.headers.referrer || req.headers.referer || '';
      default:
        return req.headers[field] || '';
}
},
// 获取请求头的内容铲毒
get length() {
    const len = this.get('Content-Length');
    if (len == '') return;
    return ~~len;
},
//获得query信息
get querystring() {
    if (!this.req) return '';
    return parse(this.req).query || '';
}
```
## response对象
response对象主要做了相应头的的信息

```js
set(field, val) {
    if (2 == arguments.length) {
      if (Array.isArray(val)) val = val.map(String);
      else val = String(val);
      this.res.setHeader(field, val);
    } else {
      for (const key in field) {
        this.set(key, field[key]);
      }
    }
},
set lastModified(val) {
    if ('string' == typeof val) val = new Date(val);
    this.set('Last-Modified', val.toUTCString());
    },
    set etag(val) {
    if (!/^(W\/)?"/.test(val)) val = `"${val}"`;
    this.set('ETag', val);
}

redirect(url, alt) {
    // location
    if ('back' == url) url = this.ctx.get('Referrer') || alt || '/';
    this.set('Location', url);
    
    // status
    if (!statuses.redirect[this.status]) this.status = 302;
    
    // html
    if (this.ctx.accepts('html')) {
      url = escape(url);
      this.type = 'text/html; charset=utf-8';
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }
    
    // text
    this.type = 'text/plain; charset=utf-8';
    this.body = `Redirecting to ${url}.`;
}
```

结合[官网](https://koajs.com/)看更好

以上，🌹谢谢你的阅读，你的点赞是我写文章的动力。


[git博客地址](https://carrie999.github.io/blog/node/)



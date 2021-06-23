[[toc]]
# 教你从写一个迷你koa-router到阅读koa-router源码

本打算教一步步实现koa-router，因为要解释的太多了，所以先简化成mini版本，从实现部分功能到阅读源码，希望能让你好理解一些。
希望你之前有读过koa源码，没有的话，给你[链接](https://carrie999.github.io/blog/node/)


## 最核心需求-路由匹配

router最重要的就是路由匹配，我们就从最核心的入手
```js
router.get('/string',async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json',async (ctx, next) => {
  ctx.body = 'koa2 json'
})
```
我们希望
- 路径访问 /string 页面显示 'koa2 string'
- 路径访问 /json 页面显示 'koa2 json'


### 先分析
##### 收集开发者输入的信息配置
1.我们需要一个数组，数组里每个都是一个对象，每个对象包含路径，方法，函数，传参等信息
这个数组我们起个名字叫stack
```js
const stack = []
```
2.对于每一个对象，我们起名叫layer
我们把它定义成一个函数

```js
function Layer() {
    
}
```
我们把页面比喻成一个箱子，箱子是对外的，箱子需要有入口，需要容纳。把每一个router比作放在箱子里的物件，物件是内部的

定义两个js页面，router.js做为入口，对于当前页面的访问的处理，layer.js包含开发者已经约定好的规则

router.js

```
module.exports = Router;

function Router(opts) {
  // 容纳layer层
  this.stack = [];
};
```
layer.js
```
module.exports = Layer;

function Layer() {

};
```
我们在Router要放上许多方法，我们可以在Router内部挂载方法，也可以在原型上挂载函数

但是要考虑多可能Router要被多次实例化，这样里面都要开辟一份新的空间，挂载在原型就是同一份空间。
最终决定挂载在原型上

方法有很多，我们先实现约定几个常用的吧


```js
const methods = [
  'get',
  'post',
  'put',
  'head',
  'delete',
  'options',
];
```

```js
methods.forEach(function(method) {
  Router.prototype[method] = function(path,middleware){
    // 对于path,middleware，我们需要把它交给layer，拿到layer返回的结果
    // 这里交给另一个函数来是实现，我们叫它register就是暂存的意思
    this.register(path, [method], middleware);
    // 因为get还可以继续get，我们返回this
    return this
  };
});
```
#### 实现layer的沟通
```js
Router.prototype.register = function (path, methods, middleware) {
  let stack = this.stack;
  let route = new Layer(path, methods, middleware);
  stack.push(route);
  
  return route
};
```
这里我们先去写layer

```js

const pathToRegExp = require('path-to-regexp');

function Layer(path, methods, middleware) {
  // 把方法名称放到methods数组里
  this.methods = [];
  // stack盛放中间件函数
  this.stack = Array.isArray(middleware) ? middleware : [middleware];
  // 路径
  this.path = path;
  // 对于这个路径生成匹配规则，这里借助第三方
  this.regexp = pathToRegExp(path);
  // methods
  methods.forEach(function(method) {
    this.methods.push(method.toUpperCase());
    // 绑定layer的this，不然匿名函数的this指向window
  }, this);

};
// 给一个原型方法match匹配返回true
Layer.prototype.match = function (path) {
  return this.regexp.test(path);
};
```
回到router层

定义match方法,根据Developer传入的path, method返回 一个对象(包括是否匹配，匹配成功layer，和匹配成功的方法)
```js
Router.prototype.match = function (path, method) {
  const layers = this.stack;
  let layer;
  const matched = {
    path: [],
    pathAndMethod: [],
    route: false
  };
   //循环寄存好的stack层的每一个layer
  for (var len = layers.length, i = 0; i < len; i++) {
    layer = layers[i];

    //layer是提前存好的路径， path是过来的path
    if (layer.match(path)) {
      // layer放入path，为什么不把path传入，一是path已经没用了，匹配了就够了，layer含有更多信息需要用
      matched.path.push(layer);
      //如果methods什么也没写，或者如果方法里含有你的过来的方法，那么把layer放入pathAndMethod
      if (layer.methods.length === 0 || ~layer.methods.indexOf(method)) {
        matched.pathAndMethod.push(layer);
        // 路径匹配，并且有方法
        if (layer.methods.length) matched.route = true;
      }
    }
  }

  return matched;
};

```
给Developer一个方法

```js
app.use(index.routes())
```
这里不考虑传多个id，和多次匹配情况，拿到匹配的函数
```js
Router.prototype.routes = function(){
  var router = this;

  const dispatch = function dispatch(ctx, next) {
    const path = ctx.path
    const method = ctx.method
    const matched = router.match(path, ctx.method);

    if (!matched.route) return next();
    const matchedLayers = matched.pathAndMethod
    // 先不考虑多matchedLayers多stack情况
    return matchedLayers[0].stack[0](ctx, next);
  }

  return dispatch
}
```

此时一个迷你koa-router已经实现了



## 读源码

## 需求实现
### 实现匹配
方法名匹配，路径匹配，还要满足动态参数的传递

并且还要给很懒的开发者一个router.all()
也就是说不用区分方法了🙄
```js
 router
    .get('/', (ctx, next) => {
          ctx.body = 'Hello World!';
    })
    .post('/users', (ctx, next) => {
         // ...
    })
    .put('/users/:id', (ctx, next) => {
        // ...
    })
    .del('/users/:id', (ctx, next) => {
        // ...
    })
    .all('/users/:id', (ctx, next) => {
        // ...
   });
```
### 写法的多样性

为了方便众多的开发者使用

```js
router.get('user', '/users/:id', (ctx, next) => {
 // ...
});
 
router.url('user', 3);
```
如下写法
都是一个路径
```js
// => "/users/3"
```

### 支持中间件

```js
router.get(
    '/users/:id',
    (ctx, next) => {
        return User.findOne(ctx.params.id).then(function(user)  
            ctx.user = user;
            next();
       });
    },
    ctx => {
        console.log(ctx.user);
        // => { id: 17, name: "Alex" }
    })
```
### 多层嵌套

```js
 var forums = new Router();
 var posts = new Router();
 posts.get('/', (ctx, next) => {...});
 posts.get('/:pid', (ctx, next) => {...});
 forums.use('/forums/:fid/posts', posts.routes(), posts.allowedMethods());
 //responds to "/forums/123/posts" and "/forums/123/posts/123"
 app.use(forums.routes());
```

### 路径前缀（Router prefixes）

```
var router = new Router({
     prefix: '/users'
});
router.get('/', ...); 
// responds to "/users"
router.get('/:id', ...); 
// responds to "/users/:id"
```
### URL parameters

```js
router.get('/:category/:title', (ctx, next) => {
    console.log(ctx.params);
  // => { category: 'programming', title: 'how-to-node' }
});
```

## router.js

```js
methods.forEach(function (method) {
  Router.prototype[method] = function (name, path, middleware) {
    var middleware;

    if (typeof path === 'string' || path instanceof RegExp) {
      // 第二个参数是否是路径，如果是路径字符串那么从下表[2]开始才是中间件
      middleware = Array.prototype.slice.call(arguments, 2);
    } else {
      middleware = Array.prototype.slice.call(arguments, 1);
      path = name;
      name = null;
    }

    this.register(path, [method], middleware, {
      name: name
    });

    return this;
  };
});

//别名
Router.prototype.del = Router.prototype['delete'];
```
methods引用第三方包含

```js
function getBasicNodeMethods() {
  return [
    'get',
    'post',
    'put',
    'head',
    'delete',
    'options',
    'trace',
    'copy',
    'lock',
    'mkcol',
    'move',
    'purge',
    'propfind',
    'proppatch',
    'unlock',
    'report',
    'mkactivity',
    'checkout',
    'merge',
    'm-search',
    'notify',
    'subscribe',
    'unsubscribe',
    'patch',
    'search',
    'connect'
  ];
}
```
```js
Router.prototype.routes = Router.prototype.middleware = function () {
  var router = this;

  var dispatch = function dispatch(ctx, next) {
    var path = router.opts.routerPath || ctx.routerPath || ctx.path;
    var matched = router.match(path, ctx.method);
    var layerChain, layer, i;

    if (ctx.matched) {
      ctx.matched.push.apply(ctx.matched, matched.path);
    } else {
      ctx.matched = matched.path;
    }
    // ctx挂载router
    ctx.router = router;

    if (!matched.route) return next();
    // 拿到既匹配到路径又匹配到方法的layer
    var matchedLayers = matched.pathAndMethod
    // 取出最后一个layer
    var mostSpecificLayer = matchedLayers[matchedLayers.length - 1]
    // 挂载_matchedRoute属性
    ctx._matchedRoute = mostSpecificLayer.path;
    // 如果有name,既如下写法会有name, name是string
    // router.get('/string','/string/:1',async (ctx, next) => {
    //   ctx.body = 'koa2 string'
    // })
    if (mostSpecificLayer.name) {
      // 挂载_matchedRouteName属性
      ctx._matchedRouteName = mostSpecificLayer.name;
    }
    // layerChain就是中间件数组，目前是两个函数
    layerChain = matchedLayers.reduce(function(memo, layer) {
      memo.push(function(ctx, next) {
        ctx.captures = layer.captures(path, ctx.captures);
        ctx.params = layer.params(path, ctx.captures, ctx.params);
        // console.log('captures2', ctx.captures)
        // ctx.captures是 :id 的捕捉，正则匹配slice截取得到
        // ctx.params是对象 {id:1}
        ctx.routerName = layer.name;
        return next();
      });
      return memo.concat(layer.stack);
    }, []);
    // 中间件调用layerChain
    return compose(layerChain)(ctx, next);
  };

  // routes挂载router对象
  dispatch.router = this;
  // 每次调用routes返回一个dispatch函数(layer.stack和memo)，函数还有一个属于这个路径下的router属性对象
  return dispatch;
};

```
这里使用compose-koa中间件的方式来处理传递多个函数和多种匹配的情况
captures和params  处理自定义路径传参

## param
实现如下需求，访问/users/:1
在param中能拿到user
```js
router
  .param('user', (user, ctx, next) => {
    ctx.user = user;
  if (!ctx.user) return ctx.status = 404;
  return next();
   })
  .get('/users/:user', ctx => {
    ctx.body = ctx.user;
  })
```

```js
Router.prototype.param = function (param, middleware) {
  this.params[param] = middleware;
  this.stack.forEach(function (route) {
    route.param(param, middleware);
  });
  return this;
};
```

```js
Layer.prototype.param = function (param, fn) {
  var stack = this.stack;
  var params = this.paramNames;
  var middleware = function (ctx, next) {
   // 第一个参数是 ctx.params[param], params拿到了user
    return fn.call(this, ctx.params[param], ctx, next);
  };
};
```

## params
实现如下需求
```javascript
router.get('/:category/:title', (ctx, next) => {
  console.log(ctx.params);
 // => { category: 'programming', title: 'how-to-node' }
});
```

例子
```js
router.get('/string/:id',async (ctx, next) => {
  ctx.body = 'koa2 string'
})
```
访问  string/1
```js
// 拿到{id:1}
ctx.params = layer.params(path, ctx.captures, ctx.params);

  
Layer.prototype.params = function (path, captures, existingParams) {
  var params = existingParams || {};
    
  for (var len = captures.length, i=0; i<len; i++) {
    if (this.paramNames[i]) {
      var c = captures[i];
      // 找到name赋值
      params[this.paramNames[i].name] = c ? safeDecodeURIComponent(c) : c;
    }
  }
  // 返回{id:1}
  return params;
};
```

有兴趣的可以研究一下allowedMethods，prefix，use，redirect等原型方法，这里已经把最核心的展示了，至此，koa源码系列解读完毕。

## 尾声
从vue源码读到webpack再到koa，深感源码架构的有趣，比做业务有趣太多，有意义太多。
以后源码阅读应该不会记录blog了，这样学起来太慢了。当然也会继续研究源码。
<br>
我觉得程序员不做开源不去github贡献源码的人生是没有意义的。
<br>
不想当将军的士兵不是好士兵。
<br>
所以以后大部分时间会去做开源，谢谢阅读。



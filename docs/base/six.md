[[toc]]
# 一道很有意思的题
## 实现下面这道题中的machine函数
```js
function machine() {
    
}
machine('ygy').execute() 
// start ygy
machine('ygy').do('eat').execute(); 
// start ygy
// ygy eat
machine('ygy').wait(5).do('eat').execute();
// start ygy
// wait 5s（这里等待了5s）
// ygy eat
machine('ygy').waitFirst(5).do('eat').execute();
// wait 5s
// start ygy
// ygy eat
```
## 原型写法
维护一个数组，异步就push函数，不是异步就push字符串
```js
function machine(name) {
  if(!(this instanceof machine)){
    return new machine(name)
  }  
  this.name = name
  this.logs = []
  this.logs.push(`start ${name}`)
}
machine.defer = function(time){
  const times = time
  return function(){
    console.log(`wait ${times}s`)
      return new Promise((resolve)=>{
      setTimeout(()=>{resolve()},times*1000)
    })
  }
}
machine.prototype.execute = async function(){
  const logs = this.logs
  if(logs.length > 0){
    for(let i=0; i<logs.length; i++){
      if(typeof(logs[i]) === 'function'){
        await logs[i]()
      }else {
        console.log(logs[i])
      }
    }
  }
};
machine.prototype.do = function(argument){
  this.logs.push(`${this.name} ${argument}s`)
  return this
};

machine.prototype.wait = function(item){
    this.logs.push(machine.defer(item))
    return this
};

machine.prototype.waitFirst = function(item){
    this.logs.unshift(machine.defer(item))
    return this
};
```

## es6写法
维护一个queue队列数组，里面全部是构造函数，第一个参数代码是否异步，第二个是callback


```js
function machine(name) {
    return new Action(name)
}


const defer = (time, callback) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(callback())
        }, time * 1000)
    })
}
class QueueItem {
    constructor(defer, callback) {
        this.defer = defer;
        this.callback = callback;
    }
}
class Action {
    queue = []
    constructor(name) {
        this.name = name;
        this.queue.push(new QueueItem(0, () => console.log(`start ${this.name}`)))
    }
    do(eat) {
        this.queue.push(new QueueItem(0, () => console.log(`${this.name} ${eat}`)))
        return this;
    }
    wait(time) {
        this.queue.push(new QueueItem(time, () => console.log(`wait ${time}s`)))
        return this;
    }
    waitFirst(time) {
        this.queue.unshift(new QueueItem(time, () => console.log(`wait ${time}s`)))
        return this;
    }
    async execute() {
        while(this.queue.length > 0) {
            const curItem = this.queue.shift();
            if (!curItem.defer) {
                curItem.callback();
                continue;
            }
            await defer(curItem.defer, curItem.callback)
        }
    }
}
```
### 比较
数组每一个都是构造函数有点浪费空间















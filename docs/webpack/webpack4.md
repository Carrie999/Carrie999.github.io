# 浅析webpack源码之入口函数webpack.js详解（四）

我们打开webpack.js


```js
const validateSchema = require("./validateSchema");
const webpackOptionsSchema = require("../schemas/WebpackOptions.json");

const webpackOptionsValidationErrors = validateSchema(
	webpackOptionsSchema,
	options
);
```


webpackOptionsSchema是一个很大的json文件

我们随便看一段

```json
{
"entry": {
      "description": "The entry point(s) of the compilation.",
      "anyOf": [
        {
          "$ref": "#/definitions/Entry"
        }
      ]
    },
    "externals": {
      "description": "Specify dependencies that shouldn't be resolved by webpack, but should become dependencies of the resulting bundle. The kind of the dependency depends on `output.libraryTarget`.",
      "anyOf": [
        {
          "$ref": "#/definitions/Externals"
        }
      ]
    },
    "loader": {
      "description": "Custom values available in the loader context.",
      "type": "object"
    }
}
```
这是对你输入options的规定
<br>loader的type要求是object
<br>$ref是 #/definitions/Externals其实就是本json下的definitions/Externals
<br>这样写可以提取公用的配置，避免代码冗余
<br> 一共2100行，其中definitions就占了1800行

接下里进入validateSchema.js函数


```js{2}
// 引入ajv
const Ajv = require("ajv");
const ajv = new Ajv({
	errorDataPath: "configuration",
	allErrors: true,
	verbose: true
});
```
引入了ajv，我们在gihub搜索ajv [链接](https://github.com/epoberezkin/ajv)
<br>我们看到，在文档里这样的描述的用法

```js
var Ajv = require('ajv');
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) console.log(validate.errors);
```
这个逻辑比较简单
<br>new一个 ajv，调用方法 ajv.compile(schema)，schema就是你规定的对象
<br>validate是返回的一个函数
<br>把要验证的数据传入参数，如果有错误会记在valid里

```js
const validateObject = (schema, options) => {
	const validate = ajv.compile(schema);
	const valid = validate(options);
	return valid ? [] : filterErrors(validate.errors);
};
```
很显然，webpack也是这样使用的，如果有错误，调用filterErrors，又对错误进行了一层包装


<br>validate函数实在是太长了就不贴了，对ajv有兴趣的可以研究研究，输入什么，输出的错误会又怎样的格式输出等
<br>这个不影响主线，我们接着往下读


```js
// 如果有错误就交给WebpackOptionsValidationError对象处理
if (webpackOptionsValidationErrors.length) {
	throw new WebpackOptionsValidationError(webpackOptionsValidationErrors);
}
```
接下来

```js
let compiler;
//多配置
if (Array.isArray(options)) {
	compiler = new MultiCompiler(options.map(options => webpack(options)));
} else if (typeof options === "object") {
	options = new WebpackOptionsDefaulter().process(options);

	compiler = new Compiler(options.context);
	compiler.options = options;
	new NodeEnvironmentPlugin().apply(compiler);
	if (options.plugins && Array.isArray(options.plugins)) {
		for (const plugin of options.plugins) {
			if (typeof plugin === "function") {
				plugin.call(compiler, compiler);
			} else {
				plugin.apply(compiler);
			}
		}
	}
	compiler.hooks.environment.call();
	compiler.hooks.afterEnvironment.call();
	compiler.options = new WebpackOptionsApply().process(options, compiler);
} else {
	throw new Error("Invalid argument: options");
}
```

```js
options = new WebpackOptionsDefaulter().process(options);`

```

我们走单配置即传值为对象的时候，
传进去一个options 输入一个options
很明显是是给options添加默认配置
就是给options多挂在几个默认属性，至于怎么添加的，添加了什么，不是重点，感兴趣的可以读读WebpackOptionsDefaulter函数
<br>大部分的复杂架构，无论是vue和react,都会对你传入的对象作出相应的默认处理，接着往下
<br>


```js
// 调用Compile，传入当前文件路径
compiler = new Compiler(options.context);
// compiler对象上挂载属性options
compiler.options = options;
// compiler对象上挂载属性options
//给compiler加载node环境
new NodeEnvironmentPlugin().apply(compiler);
//options.plugins存在且为数组
if (options.plugins && Array.isArray(options.plugins)) {
	for (const plugin of options.plugins) {
		if (typeof plugin === "function") {
			plugin.call(compiler, compiler);
		} else {
	     //plugin是对象怎么会有改变this的apply方法？后续代查
			plugin.apply(compiler);
		}
	}
}
compiler.hooks.environment.call();
compiler.hooks.afterEnvironment.call();
compiler.options = new WebpackOptionsApply().process(options, compiler);
```
接下来，我们看Compiler模块




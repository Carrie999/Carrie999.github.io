(window.webpackJsonp=window.webpackJsonp||[]).push([[34],{175:function(t,s,a){"use strict";a.r(s);var n=a(0),o=Object(n.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"content"},[a("h1",{attrs:{id:"浅析webpack源码之webpackoptionsapply-模块-七"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#浅析webpack源码之webpackoptionsapply-模块-七","aria-hidden":"true"}},[t._v("#")]),t._v(" 浅析webpack源码之WebpackOptionsApply 模块(七)")]),t._v(" "),a("p",[t._v("NodeEnvironmentPlugin还做了watch处理，NodeWatchFileSystem是webpack之所以能根据变化自己更新的核心，好凌乱，我们先从那个坑跳出来")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("options "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("WebpackOptionsApply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("process")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("options"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("进入 WebpackOptionsApply.js 这个大坑")]),t._v(" "),a("p",[t._v("进入这个页面看到前面一大堆的模块引入，已经给跪了，但是马马虎虎的完成也比放弃好\n"),a("br"),t._v("前面一大堆的引入，主要是lib下dependencies和optimize文件夹下的模块")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("WebpackOptionsApply")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("extends")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("OptionsApply")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t"),a("span",{attrs:{class:"token function"}},[t._v("constructor")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t\t"),a("span",{attrs:{class:"token keyword"}},[t._v("super")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\t"),a("span",{attrs:{class:"token function"}},[t._v("process")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("options"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t    \n\t"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("OptionsApply父类就只是定义了接口\n主要核心在process方法里主要做了")]),t._v(" "),a("p",[t._v("1.处理options.target参数")]),t._v(" "),a("p",[t._v("2.处理options.output，options.externals，options.devtool参数")]),t._v(" "),a("p",[t._v("3.对于引用了巨量的模块把把this指向compiler对象")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("CompatibilityPlugin")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("apply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("HarmonyModulesPlugin")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("options"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("module"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("apply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("AMDPlugin")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("options"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("module"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" options"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("amd "),a("span",{attrs:{class:"token operator"}},[t._v("||")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("apply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("CommonJsPlugin")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("options"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("module"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("apply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("LoaderPlugin")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("apply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("NodeStuffPlugin")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("options"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("node"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("apply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{attrs:{class:"token comment"}},[t._v("//...")]),t._v("\n")])])]),a("p",[t._v("4.处理options.optimization 的moduleIds和chunkIds属性")]),t._v(" "),a("p",[t._v("5.处理如下插件")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("TemplatedPathPlugin")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("apply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("RecordIdsPlugin")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\tportableIds"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" options"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("optimization"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("portableRecords\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("apply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{attrs:{class:"token class-name"}},[t._v("WarnCaseSensitiveModulesPlugin")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("apply")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("compiler"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[t._v("6.hooks事件流")]),t._v(" "),a("h2",{attrs:{id:"终极总结"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#终极总结","aria-hidden":"true"}},[t._v("#")]),t._v(" 终极总结")]),t._v(" "),a("p",[t._v("这个模块主要是根据options选项的配置，设置compile的相应的插件，属性，里面写了大量的 apply(compiler); 使得模块的this指向compiler\n"),a("br"),t._v("没有对options做任何处理")]),t._v(" "),a("p",[t._v("过！！！")])])}],!1,null,null,null);o.options.__file="webpack7.md";s.default=o.exports}}]);
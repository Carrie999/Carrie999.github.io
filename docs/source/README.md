
# 读marked.js源码 -- markdown是怎么变成html的


很好奇markdown是怎么变成html的,偶然间看到
[github](https://github.com/markedjs/marked)上的这一篇星星✨很高的源码,就来研究研究
下载打开在lib文件夹下的marked.js大概1600行左右的样子,没有组件化,所有的js都是在一个页面,读着很是顺畅哈~(这里没有贬低多个文件的啊,不要生气,嘻嘻😄其实是有的,一个文件就是看着简单)
在html引入js
```js·
 <script src="./marked.js"></script>
```
 然后在js中写下
 
```js
<script>
    document.getElementById('content').innerHTML =
    marked('# Marked in the browser\n\nRendered by **marked**.');
</script>
```
神奇的现象发生了页面变漂亮了???
那么就随marked函数看一看是如何实现的吧
首先我们定位到1461行,看到了一个我们所熟悉亲切的marked函数,接受3个参数,src是markdown, opt是配置{}, callback是回调
```js
 // 1461 
mark(src, opt, callback)
// 1544
Parser.parse(Lexer.lex(src, opt), opt);
// 返回了真正的带有标签的文本,所以接下来研究Lexer对象和Parser.parse
Lexer.lex(src, opt)
```



```js
// 163 
Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};
```

```js
Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');
  // console.log('178#', src)
  console.log('178#',this.token(src, true)[0],this.token(src, true)[1])
  // {type: "heading", depth: 1, text: "Marked in the browser"}
  // {type: "paragraph", text: "Rendered by  **marked**."}
  return this.token(src, true);
};
```
this.token(src, true);返回数组,数组长度为3,[0]是Marked in the browser,
[1]是Rendered by **marked**.字段



我们看185行
Lexer.prototype.token
cap = this.rules.heading.exec(src)成立

["# Marked in the browser↵↵", "#", "Marked in the browser", index: 0, input: "# Marked in the browser↵↵Rendered by **marked**.", groups: undefined]



```js
if (cap = this.rules.heading.exec(src)) {
  src = src.substring(cap[0].length);
  this.tokens.push({
    type: 'heading',
    depth: cap[1].length,
    text: cap[2]
  });
  continue;
}
```

追踪

```js
  this.rules.heading.exec(src)
  Lexer.rules = block;
```
inline是一个对象,包含一整套匹配规则
```js
// 14
var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
  nptable: noop,
  blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: '^ {0,3}(?:' // optional indentation
    + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
    + '|comment[^\\n]*(\\n+|$)' // (2)
    + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
    + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
    + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
    + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
    + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
    + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
    + ')',
  def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
  table: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading| {0,3}>|<\/?(?:tag)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/,
  text: /^[^\n]+/
};
```
我们找到了 this.rules.heading是block里的heading,那么接下来就是exec
exec就是正则!正则!正则!
```js
/^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/.exec('# Marked in the browser\n\nRendered by **marked**.')
```
正则匹配结果是
数组 ["# Marked in the browser↵↵,"#","Marked in the browser"]
```js
// 236
if (cap = this.rules.heading.exec(src)) {
  // src是剩下的也就说Rendered by **marked**.,当src长度为0的时候,循环结束
  src = src.substring(cap[0].length);
  // 判断 是heading 
  // push type
  // depth是正则匹配"#"的长度
  // text 是匹配出来的的结果
  this.tokens.push({
    type: 'heading',
    depth: cap[1].length,
    text: cap[2]
  });
  continue;
}
```
接下来继续解析src,我们看到第491行这里被解析了,上面第正则都未匹配成功

```js
if (top && (cap = this.rules.paragraph.exec(src))) {
  src = src.substring(cap[0].length);
  this.tokens.push({
    type: 'paragraph',
    text: cap[1].charAt(cap[1].length - 1) === '\n'
      ? cap[1].slice(0, -1)
      : cap[1]
  });
  continue;
}
```
我们看一下paragraph和以及被处理的结果
paragraph在block声明的时候被定义了
```
{ paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading| {0,3}>|<\/?(?:tag)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/}
```

```js
cap[0]=  "Rendered by **marked**."
cap[1]=  "Rendered by **marked**."
```
此时src为空字符串,直接停止,跳出循环

此时this.tokens为
```js
this.tokens = [
{type: "heading", depth: 1, text: "Marked in the browser"},
{type: "paragraph", text: "Rendered by **marked**."]
```

此时返回了最初的Parser.parse(Lexer.lex(src, opt), opt);
词法分析器
Lexer.lex(src, opt)调用的结果是this.tokens
接下来就让我们分析Parser.parse吧


```js

// Static Parse Method 静态方法,为什么不直接new,还需要绕这么一个大圈子
Parser.parse = function(src, options) {
  var parser = new Parser(options);
  return parser.parse(src);
};

/**
 * Parse Loop
 */
//1115
Parser.prototype.parse = function(src) {
//this.options是默认配置
  this.inline = new InlineLexer(src.links, this.options);
  // use an InlineLexer with a TextRenderer to extract pure text
  this.inlineText = new InlineLexer(
    src.links,
    merge({}, this.options, {renderer: new TextRenderer()})
  );
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};
//1138
Parser.prototype.next = function() {
  // tokens被反转然后pop即吧tokens的[0]赋值给this.token
  return this.token = this.tokens.pop();
};
```
this.inline和
this.inlineText
很相似都是InlineLexer的实例化,区别在于this.inlineTextlink里有一写配置
// 1167

tok原型对象里是对this.token的处理
```js
Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    // 我们来到heading这里,接下来就是分析最重要的render对象了
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        unescape(this.inlineText.output(this.token.text)));
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = '',
          body = '',
          i,
          row,
          cell,
          j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      body = '';
      var ordered = this.token.ordered,
          start = this.token.start;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered, start);
    }
    case 'list_item_start': {
      body = '';
      var loose = this.token.loose;

      if (this.token.task) {
        body += this.renderer.checkbox(this.token.checked);
      }

      while (this.next().type !== 'list_item_end') {
        body += !loose && this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      // TODO parse inline content if parameter markdown=1
      return this.renderer.html(this.token.text);
    }
    case 'paragraph': {
     //this.inline.output把**marked**处理成<strong>marked</strong>
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

```


```js
// this.inline.output把**marked**处理成<strong>marked</strong>
this.renderer.paragraph(this.inline.output(this.token.text));
/**
 * Static Lexing/Compiling Method
 */
InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};
output对象里匹配到strong,调用renderer.strong
// strong
if (cap = this.rules.strong.exec(src)) {
  src = src.substring(cap[0].length);
  out += this.renderer.strong(this.output(cap[4] || cap[3] || cap[2] || cap[1]));
  continue;
}

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

    
```


```js
 // 1574
 renderer: new Renderer(),
 marked.Renderer = Renderer;
 // 911
 function Renderer(options) {
  this.options = options || marked.defaults;
 }
 // 946
 Renderer.prototype.heading = function(text, level, raw) {
  // 如果配置中就id就返回带有id
  if (this.options.headerIds) {
    return '<h'
      + level
      + ' id="'
      + this.options.headerPrefix
      + raw.toLowerCase().replace(/[^\w]+/g, '-')
      + '">'
      + text
      + '</h'
      + level
      + '>\n';
  }
  // ignore IDs
  没有id就直接返回标签加纹板
  return '<h' + level + '>' + text + '</h' + level + '>\n';
};
// 同理

// paragraph对this.token说[2]做了处理
Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};
```


heading接受三个参数text是文本内容,level是heading的级别 1就是H1,2就是H2,raw目前是和level是一样的
经过两轮处理
此时我们的out已经有了结果

```js
  <h1 id="marked-in-the-browser">Marked in the browser</h1>
  <p>Rendered by <strong>marked</strong>.</p>
```
document.getElementById('content').innerHTML =marked('# Marked in the browser\n\nRendered by **marked**.');
就这样被渲染了.
这个实例就分析完毕了,当然里面还有其他的细节,有兴趣的可以仔细看看,比如什么时候会带有id等等
我们总结一下marked.js是如何处理的
最重要的就是

1. 先是正则,把符号匹配出来,#是heading,然后推入this.tokens数组里
 每处理一行,推入一个(把scr通过正则处理成this.tokens))
2. 对this.tokens的处理,通过正则匹配到就调用相应的render对象里的方法
3. render对象对输入的tokens进行处理返回out处理结果

优点

1. 每一个功能都分别定义一个函数 render渲染用, laxer词法解析用,实现定义好各种正则,很清晰明明了
2. 静态方法的使用

总之看着很复杂,当你分析完一个或者写完一个明白一个后,其他的都是依此类推,就是力气活了


以上
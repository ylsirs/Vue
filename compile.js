//   01:23:00
// 编译器 （将html模板 与 实例对象连接起来 ）
class Compile {
  //  el: 绑定的app的根元素   vm: 实例对象
  constructor(el, vm) {
    // console.log(el);
    this.$el = document.querySelector(el)
    this.$vm = vm
    if (this.$el) {
      this.$fragment = this.nodeFragment(this.$el)
      this.compileElement(this.$fragment)
      this.$el.appendChild(this.$fragment)
    }
  }
  // 碎片化文档
  nodeFragment (el) {
    var fragment = document.createDocumentFragment()
    let child
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }

  // 判断节点类型 进行对应的compile
  compileElement (el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach((node) => {
      if (this.isElementNode(node)) {
        this.compile(node)
      } else if (this.isTextNode(node)) {
        // 文本类型  并且有{{}}
        this.compileText(node)
      }
      // 遍历编译子节点
      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }


  // 编译元素节点
  compile (node) {
    let nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach((attrs) => {
      let attrName = attrs.name // 要编译的属性名称
      let exp = attrs.value  // 属性值
      // console.log(attrName, exp);
      if (this.isEvrntDirective(attrName)) {
        let dir = attrName.substring(1)
        // console.log(node, attrName, exp, dir);
        this.compileEvent(node, this.$vm, exp, dir)
      } else if (this.isDirective(attrName)) {
        // console.log(attrName, 'k-');
        let dir = attrName.substring(2) // text
        this[dir] && this[dir](node, this.$vm, exp)
        // console.log(dir, node, this.$vm, exp);
      }

    })
  }

  // 编译插值文本 {{}}
  compileText (node) {
    // console.log(RegExp.$1);  正则对象下的第一组，要编译的属性名
    this.text(node, this.$vm, RegExp.$1)
  }

  // 编译事件 @ / v-on:
  compileEvent (node, vm, exp, dir) { // 元素节点  实例对象  函数名称  事件类型
    let fn = vm.$options.methods && vm.$options.methods[exp]
    console.log(exp, dir, fn);
    node.addEventListener(dir, fn.bind(vm), false)

  }
  // 初始化模板  初始化订阅者 watcher
  update (node, vm, exp, dir) {
    let updaterFn = this[dir + 'Updater']
    // 初始化
    updaterFn && updaterFn(node, vm.$data[exp])
    new Watcher(vm, exp, function (value) {
      // console.log(value);
      updaterFn && updaterFn(node, value)
    })
  }

  text (node, vm, exp) {
    this.update(node, vm, exp, 'text')
  }

  html (node, vm, exp) {
    this.update(node, vm, exp, 'html')
  }

  model (node, vm, exp) {
    this.update(node, vm, exp, 'model')
    console.log(node);
    node.addEventListener('input', function (e) {
      let newVal = e.target.value
      // 改变实例中的data 触发set函数
      vm.$data[exp] = newVal
    })
  }

  // 插值文本更新
  textUpdater (node, value) {
    node.textContent = value
  }

  modelUpdater (node, value) {
    // console.log(node, value);
    node.value = value
  }

  htmlUpdater (node, value) {
    node.innerHTML = value
  }

  isElementNode (node) {
    return node.nodeType === 1
  }
  isTextNode (node) {
    //节点类型为文本节点  并且 文本中包含 {{}} 表达式  
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  // 事件指令 @
  isEvrntDirective (dir) {
    return dir.indexOf('@') === 0
  }

  // k- 指令
  isDirective (dir) {
    return dir.indexOf('k-') == 0
  }
}
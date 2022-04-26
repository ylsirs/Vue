// 接受对象 new mVue({})

class MVue {
  constructor(options) {
    this.$data = options.data
    this.$options = options
    this.observe(this.$data)

    // 模拟一下watcher创建
    // new Watcher();
    // // 通过访问test属性触发get函数，添加依赖
    // this.$data.test

    new Compile(options.el, this)

    // 执行created
    if (options.created) {
      options.created.call(this)
    }

  }

  observe (obj) {
    if (!obj || typeof obj !== 'object') return
    Object.keys(obj).forEach(key => {
      // 对象  属性名 属性值
      this.defineReactive(obj, key, obj[key])
    })
  }
  defineReactive (obj, key, val) {
    this.observe(val)
    const dep = new Dep()
    // console.log(dep);
    Object.defineProperty(obj, key, {
      get () {
        Dep.target && dep.addDep(Dep.target)
        return val
      },
      set (newValue) {
        if (val === newValue) return
        val = newValue
        // 对应dep中 所有watcher更新数据
        dep.notify();
      }
    })
  }
}

// 用来管理 watcher   一个属性会对应（new）一个Dep  
class Dep {
  constructor() {
    // 属性在页面上每用一次 会在dep这个数组中多一个元素（watcher）
    this.deps = []
  }
  addDep (dep) {
    this.deps.push(dep)
  }
  notify () {
    // 元素发生变化 页面上所有的都会变化
    // console.log(this);
    this.deps.forEach(dep => dep.update());
  }
}

class Watcher {
  constructor(vm, key, callback) {
    // 缓存数据
    this.vm = vm
    this.key = key
    this.cb = callback

    // 把这个watcher实例 添加到 Dep的静态属性 target
    Dep.target = this
    this.vm.$data[this.key]  // 触发getter，添加依赖
    console.log('缓存', this);
    Dep.target = null  // 制空，防止重复添加
  }
  update () {
    this.cb.call(this.vm, this.vm.$data[this.key])
  }
}
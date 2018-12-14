// 判断是否在iframe中
if (self == top) {
  console.log('%c mobile-debug:脚本注入成功', 'color:red;font-size:30px;')

  // 是否DOM对象
  const isDomObject = (el) => {
    let isDom = false
    let proto = Object.getPrototypeOf(el)
    while (proto && !isDom) {
      proto = Object.getPrototypeOf(proto)
      if (proto === Element.prototype || proto === Document.prototype) {
        isDom = true
      }
    }
    return isDom
  }

  // 用DOM对象传换成普通对象
  const getChildNodesToObject = (el) => {
    if (isDomObject(el)) {
      // console.log(el.childNodes, Array.from(el.childNodes))

      const childres = Array.from(el.childNodes).map(child => ({
        tagName: child.tagName,
        // attrs: Array.from(child.attributes).map(attr => ({
        //   key: attr,
        //   value: child.getAttribute(attr)
        // })),
        childElementCount: child.childElementCount,
        innerText: child.innerText
      }))
      console.log(el.childNodes[1])
    } else {
      throw new Error(`el is not DOM Object`)
    }
  }

  getChildNodesToObject(document.body)
}

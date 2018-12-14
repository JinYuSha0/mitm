// 判断是否在iframe中
if (self == top) {
  console.log('%c mobile-debug:脚本注入成功', 'color:red;font-size:30px;')
  console.log(document.body.attributes)
}

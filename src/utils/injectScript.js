// 注入脚本
module.exports = function injectScript(content, scriptSrc) {
  if (Object.getPrototypeOf(content) !== String.prototype) {
    return content
  }
  const cspReg = new RegExp(/<meta[\s\S]+Content-Security-Policy[\s\S]+>/gi)
  // CSP影响脚本加载 去除 Content-Security-Policy meta头
  content = content.replace(cspReg, '')
  const bodyReg = new RegExp(/([\s\S]+)<\/body>([\s\S]+)/)
  const bodyMatch = content.match(bodyReg)
  if (bodyMatch) {
    let html = ''
    html += bodyMatch[1]
    if (Object.getPrototypeOf(scriptSrc) === Array.prototype) {
      scriptSrc.forEach(src => {
        html += `<script src="${src}"><\/script>\n`
      })
    } else {
      html += `<script src="${scriptSrc}"><\/script>\n`
    }
    html += '</body>' + bodyMatch[2]
    return html
  } else {
    return content
  }
}

// 注入脚本
module.exports = function injectScript(content, scriptSrc) {
  if (Object.getPrototypeOf(content) !== String.prototype) {
    return content
  }
  const reg = new RegExp(/([\s\S]+)<\/body>([\s\S]+)/)
  const match = content.match(reg)
  if (match) {
    let html = ''
    html += match[1]
    if (Object.getPrototypeOf(scriptSrc) === Array.prototype) {
      scriptSrc.forEach(src => {
        html += `<script src="${src}"><\/script>\n`
      })
    } else {
      html += `<script src="${scriptSrc}"><\/script>\n`
    }
    html += '</body>' + match[2]
    return html
  } else {
    return content
  }
}

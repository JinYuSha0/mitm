// 注入脚本
function injectScript(content, scriptSrc) {
	let html = ''
	const reg = new RegExp(/([\s\S]+)<\/body>([\s\S]+)/)
	const match = content.match(reg)
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
}

module.exports = injectScript

const url = require('url')

// 获取请求参数
module.exports = (req, res, useStream = true) => {
	const urlObject = url.parse(req.url)
	const protocol = urlObject.protocol || 'https:'

	const URL = protocol + '//' + req.headers.host + urlObject.path
	let headers = Object.create(null)
	if (!useStream) {
		// 不使用流的方式 去掉请求头中的 Accept-Encoding 防止返回内容编码压缩
		Object.keys(req.headers).forEach(k => {
			if (!String.prototype.toLowerCase.call(k).match(/accept-encoding/)) {
				headers[k] = req.headers[k]
			}
		})
	}

	return {
		method: req.method,
		url: URL,
		headers,
	}
}

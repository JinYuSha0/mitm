const url = require('url')
const querystring = require('querystring')

// 获取请求参数
module.exports = (req, res) => {
	const urlObject = url.parse(req.url)
	const protocol = !!req.connection.encrypted ? 'https:' : 'http:'
	const URL = protocol + '//' + req.headers.host + urlObject.path
	const defalutOptions = {
		method: req.method,
		url: URL,
		headers: req.headers,
		encoding: null,
	}

	if (req.method.toLowerCase() === 'get') {
		return defalutOptions
	} else {
		let body = ''
		req.on('data', chunk => {
			body += chunk
		})
		req.on('end', () => {
			body = querystring.parse(body)
			const params = Object.create(null)
			const contentType = req.headers['content-type']
			if (contentType && body != null) {
				if (contentType.match('application/json')) {
					Object.assign(params, { body })
				} else if (contentType.match('application/x-www-form-urlencoded')) {
					Object.assign(params, { form: body })
				} else if (contentType.match('multipart/form-data')) {
					Object.assign(params, { formData: body })
				}
			}
			return Object.assign(defalutOptions, { ...params })
		})
	}
}

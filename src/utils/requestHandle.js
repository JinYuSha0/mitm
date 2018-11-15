const fs = require('fs')
const path = require('path')
const request = require('request')
const getRequestOptions = require('./getRequestOptions')
const injectScript = require('./injectScript')

module.exports = (req, res) => {
	try {
		if (req.headers.host === 'www.cert.com') {
			// 定义一个域名下载根证书便于安装
			res.writeHead(200, {
				'Content-Type': 'application/force-download',
				'Content-Disposition': 'attachment; filename=CA.cert'
			})
			fs.createReadStream(path.resolve(__dirname, '../../ssl/rootCA.crt')).pipe(res)
		} else if (req.method.toLowerCase() === 'get' && req.headers.accept.match('text/html')) {
			// 区别处理html请求 用于注入script
			request(getRequestOptions(req, res, false), (error, response, body) => {
				if (error) {
					res.end()
				}
				if (response) {
					res.writeHead(response.statusCode, response.headers)
				}
				if (body) {
					body = injectScript(body, '/static/inject.js')
					res.end(body)
				}
			})
		} else {
			// 其余请求走流的形式
			request(getRequestOptions(req, res)).pipe(res)
		}
	} catch (e) {
		res.end()
	}
}

const fs = require('fs')
const url = require('url')
const path = require('path')
const request = require('request')
const getRequestOptions = require('./getRequestOptions')
const decode = require('./decode')
const injectScript = require('./injectScript')

const randomPath = Math.random().toString(36).split('.')[1]

module.exports = (req, res) => {
	try {
		if (req.headers.host === 'www.cert.com') {
			// 定义一个域名下载根证书便于安装
			res.writeHead(200, {
				'Content-Type': 'application/force-download',
				'Content-Disposition': 'attachment; filename=CA.cert'
			})
			fs.createReadStream(path.resolve(__dirname, '../../ssl/rootCA.crt')).pipe(res)
		} else if (!!req.url.match(randomPath)) {
			// 返回静态资源
			const splits = url.parse(req.url).pathname.split('/')
			const fileName = splits[splits.length - 1]
			const filePath = path.resolve(__dirname, `../../static/js/${fileName}`)
			if (fs.existsSync(filePath)) {
				fs.createReadStream(filePath).pipe(res)
			} else {
				res.end()
			}
		} else if (req.method.toLowerCase() === 'get' && req.headers.accept.match('text/html')) {
			// 区别处理html请求 用于注入script
			request(getRequestOptions(req, res), async (error, response, body) => {
				if (error) {
					res.end()
				}
				// 判断返回头中的content-encoding 选择解码方式
				const encode = response.headers['content-encoding']
				if (encode) {
					body = await decode(encode, body)
				}
				if (response) {
					// fixme
					delete response.headers['content-encoding']
					res.writeHead(response.statusCode, response.headers)
					if (body) {
						body = injectScript(body, `/${randomPath}/inject.js`)
						res.end(body)
					} else {
						res.end()
					}
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

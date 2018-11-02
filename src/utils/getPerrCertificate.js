const https = require('https')

// 获取证书信息
function getPerrCertificate (host) {
	return new Promise((resolve, reject) => {
		const req = https.request({
			host,
			port: 443,
			method: 'GET'
		}, res => {
			resolve(res.connection.getPeerCertificate())
		})

		req.on('error', err => {
			reject(new Error('获取证书信息失败!'))
		})

		req.end()
	})
}

module.exports = getPerrCertificate

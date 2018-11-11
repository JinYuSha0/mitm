const url = require('url')
const fs = require('fs')
const path = require('path')
const injectScript = require('./injectScript')
const request = require('request')

const mimeTypes = {
	'htm': 'text/html',
	'html': 'text/html',
	'jpeg': 'image/jpeg',
	'jpg': 'image/jpeg',
	'png': 'image/png',
	'gif': 'image/gif',
	'js': 'text/javascript',
	'css': 'text/css',
	'json':'text/json'
}

module.exports = (req, res) => {
	const urlObject = url.parse(req.url)
	const protocol = urlObject.protocol || 'https:'

	try {
		if (req.headers.host === 'www.cert.com') {
			res.writeHead(200, {
				'Content-Type': 'application/force-download',
				'Content-Disposition': 'attachment; filename=CA.cert'
			})
			fs.createReadStream(path.resolve(__dirname, '../../ssl/rootCA.crt')).pipe(res)
		} else {
			const readStream = request({
				method: req.method,
				url: protocol + '//' + req.headers.host + urlObject.path,
				headers: req.headers,
				// gzip: true,
			}, (error, response, body) => {
				if (error) {
					res.end()
				}
			})

			readStream.pipe(res)
		}
	} catch (e) {
		res.end()
	}
}

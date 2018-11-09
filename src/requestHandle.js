const url = require('url')
const injectScript = require('./utils/injectScript')
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
		const readStream = request({
			method: req.method,
			url: protocol + '//' + req.headers.host.split(':')[0] + urlObject.path,
			headers: req.headers,
			// gzip: true,
		}, (error, response, body) => {
			if (error) {
				res.end()
			}
		})

		readStream.pipe(res)
	} catch (e) {
		console.log(req.url)
		res.end()
	}
}

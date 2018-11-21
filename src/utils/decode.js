const zlib = require('zlib')
const brotli = require('brotli')

const gzip = (body) => {
	return new Promise((resolve, reject) => {
		zlib.gunzip(body, (err, dezipped) => {
			if (err || dezipped == null) {
				reject(err || new Error('dezipped is null'))
				return
			}
			resolve(dezipped.toString())
		})
	})
}

// chrome Accept-Encoding: gzip, deflate, br
module.exports = async (encode, body) => {
	switch (encode) {
		case 'gzip':
			return (await gzip(body))
		case 'br': // Brotli
			console.log(brotli.decompress(body).toString())
			return brotli.decompress(body)
		case 'deflate':
			return body
		default:
			return body
	}
}

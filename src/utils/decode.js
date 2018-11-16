const zlib = require('zlib')

const gzip = (body) => {
	return new Promise((resolve, reject) => {
		zlib.gunzip(body, (err, dezipped) => {
			if (err) {
				reject(err)
			}
			resolve(dezipped.toString())
		})
	})
}

module.exports = async (encode, body) => {
	switch (encode) {
		case 'gzip':
			return (await gzip(body))
		default:
			return body
	}
}

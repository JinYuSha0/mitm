const https = require('https')
const url = require('url')
const axios = require('axios')
const createFakeCertificate = require('./createFakeCertificate')

async function createFakeHttpsWebSite(domain, successFunc) {
	try {
		const fakeCertObj = await createFakeCertificate(domain)

		const fakeServer = new https.createServer({
			key: fakeCertObj.keyPem,
			cert: fakeCertObj.certPem,
		})

		fakeServer.listen(0, () => {
			const address = fakeServer.address()
			successFunc(address.port)
		})

		fakeServer.on('request', async (req, res) => {
			const urlObject = url.parse(req.url)
			let options = {
				protocol: 'https:',
				hostname: req.headers.host.split(':')[0],
				method: req.method,
				port: req.headers.host.split(':')[1] || 80,
				path: urlObject.path,
				headers: req.headers
			}
			res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
			res.write(`<html><body>我是伪造的站点: ${JSON.stringify(options)}</body></html>`)
			res.end()
		})

		fakeServer.on('error', (e) => {
			console.error(e);
		})
	} catch (err) {
		// throw err
	}
}

module.exports = createFakeHttpsWebSite

const https = require('https')

const options = {
	host: 'www.tmall.com',
	port: 443,
	method: 'GET'
}

const req = https.request(options, res => {
	console.log(res.connection.getPeerCertificate())
})

req.end()

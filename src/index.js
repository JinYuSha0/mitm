const createFakeCertificate = require('./utils/createFakeCertificate')

async function main () {
	const certificate = await createFakeCertificate('tmall.com')
	console.log(certificate)
}

main()

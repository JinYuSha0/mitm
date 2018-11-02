const fs = require('fs')
const getPerrCertificate = require('./getPerrCertificate')

async function createFakeCertificate (host) {
	try {
		const certInfo = await getPerrCertificate(host)
		const CN = certInfo.subject.CN
		const subjectaltname = certInfo.subjectaltname
		return ''
	} catch (err) {
		throw err
	}
}

module.exports = createFakeCertificate

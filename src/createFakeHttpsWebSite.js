const https = require('https')
const websocket = require('./websocket')
const {createFakeCertificate} = require('./createFakeCertificate')

async function createFakeHttpsWebSite(domain, requestHandle, successFunc) {
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

    websocket(fakeServer)

    fakeServer.on('request', requestHandle)

    fakeServer.on('error', (e) => {
      console.error(e)
    })
  } catch (err) {
    // throw err
  }
}

module.exports = createFakeHttpsWebSite

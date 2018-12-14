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

    // wss服务
    const ws = websocket(fakeServer)
    ws.on('connection', ws.handlerFunc)

    fakeServer.on('request', requestHandle)

    fakeServer.on('close', () => {
      ws.close()
    })

    fakeServer.on('error', (e) => {
      console.error(e)
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

module.exports = createFakeHttpsWebSite

const http = require('http')
const url = require('url')
const net = require('net')
const utils = require('./utils/utils')
const websocket = require('./websocket')
const requestHandle = require('./requestHandle')
const createFakeHttpsWebSite = require('./createFakeHttpsWebSite')
const {createFakeCaCertificate} = require('./createFakeCertificate')

const httpTunnel = new http.createServer(requestHandle)
// 注: keepAliveTimeout 超时后会导致websocket也断开连接 0为永不超时
httpTunnel.timeout = httpTunnel.keepAliveTimeout = 0
const port = 1111

// 创建ca根证书
createFakeCaCertificate()

httpTunnel.listen(port, () => {
  console.log(`HTTPS中间人代理启动成功，端口${port}`)
})

httpTunnel.on('error', (e) => {
  if (e.code == 'EADDRINUSE') {
    console.error(`端口：${port}，已被占用`);
  } else {
    console.error(e)
  }
})

httpTunnel.on('connect', (req, cltSocket, head) => {
  const isSSL = req.headers.host.split(':')[1] === '443'
  const protocol = isSSL ? 'https' : 'http'
  const srvUrl = url.parse(`${protocol}://${req.url}`)

  if (isSSL) {
    createFakeHttpsWebSite(srvUrl.hostname, requestHandle, (port) => {
      httpTunnelForward(port, cltSocket, head)
    })
  } else {
    const httpServer = new http.createServer()
    httpServer.listen(0, () => {
      const port = httpServer.address()
      httpTunnelForward(port, cltSocket, head)
    })
    const wss = websocket(httpServer)
    wss.on('connection', wss.handlerFunc)
    httpServer.on('close', () => {
      wss.close()
    })
    httpServer.on('error', (e) => {
      console.error(e)
    })
  }
})

function httpTunnelForward (address, cltSocket, head) {
  const srvSocket = net.connect(address, '127.0.0.1', () => {
    cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
      'Proxy-agent: MITM-proxy\r\n' +
      '\r\n')
    srvSocket.write(head)
    srvSocket.pipe(cltSocket)
    cltSocket.pipe(srvSocket)
  })
  srvSocket.on('error', (e) => {
    console.error(e)
  })
}

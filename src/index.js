const http = require('http')
const url = require('url')
const net = require('net')
const requestHandle = require('./requestHandle')
const createFakeHttpsWebSite = require('./utils/createFakeHttpsWebSite')

let httpTunnel = new http.createServer(requestHandle)
let port = 1111

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
	const srvUrl = url.parse(`http://${req.url}`)
	createFakeHttpsWebSite(srvUrl.hostname, requestHandle, (port) => {
		const srvSocket = net.connect(port, '127.0.0.1', () => {
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
	})
})

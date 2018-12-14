const WebSocket = require('../packages/mitm-node-websocket/src/index')
const fs = require('fs')

module.exports = (server) => {
  const wss = new WebSocket(server)

  /**
   * wss.getClients 获取所有连接用户
   * wss.broadcast  广播所有用户
   *
   * socket.on      添加事件句柄
   * socket.send    发送数据
   * socket.close   关闭连接
   */

  WebSocket.prototype.handlerFunc = (socket, req) => {
    socket.on('package', () => {
      wss.broadcast('broadcast', { PayloadType: 'text' })
      socket.send('1111', { PayloadType: 'text' })
    })
  }

  return wss
}

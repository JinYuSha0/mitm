const WebSocket = require('../../packages/mitm-node-websocket/src/index')
const config = require('../config')
const fs = require('fs')

const randomPath = config.randomPath

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
      wss.broadcast('这是一条广播信息', { PayloadType: 'text' })
      socket.send(`/${randomPath}/js/mobile-debug.js`, { PayloadType: 'inject' })
    })
  }

  return wss
}

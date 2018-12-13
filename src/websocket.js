const WebSocket = require('../packages/mitm-node-websocket/src/index')
const fs = require('fs')

module.exports = (server) => {
  return new WebSocket(server)
}

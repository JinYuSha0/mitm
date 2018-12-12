const websocket = require('../packages/mitm-node-websocket/src')
const fs = require('fs')

module.exports = (server) => {
  websocket(server, [
    {
      eventName: 'pic',
      listener: ({ payload, socket, generateFrame }) => {
        socket.write(generateFrame(fs.readFileSync(path.resolve(__dirname, './static/pic.jpg')), 'image'))
      }
    }, {
      eventName: 'package',
      listener: ({ payload, socket,  generateFrame, encodeDataFrame }) => {
        socket.write(generateFrame('this is a package', 'text'))
      }
    }
  ])
}

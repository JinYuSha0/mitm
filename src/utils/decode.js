const zlib = require('zlib')
const iltorb = require('iltorb')

const decode = {
  gzip: (body) => {
    return new Promise((resolve, reject) => {
      zlib.gunzip(body, (err, dezipped) => {
        if (err || dezipped == null) {
          reject(err || new Error('dezipped is null'))
          return
        }
        resolve(dezipped.toString())
      })
    })
  },
  brotli: (body) => {
    return new Promise((resolve, reject) => {
      iltorb.decompress(body).then(value => {
        resolve(value.toString())
      }).catch(err => {
        reject(err)
      })
    })
  }
}

// chrome Accept-Encoding: gzip, deflate, br
module.exports = async (encode, body) => {
  switch (encode) {
    case 'gzip':
      return (await decode.gzip(body))
    case 'br':
      return (await decode.brotli(body))
    case 'deflate':
      return body
    default:
      return body
  }
}

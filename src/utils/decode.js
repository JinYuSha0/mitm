const zlib = require('zlib')
const iltorb = require('iltorb')

const decode = {
  gzip: (body) => {
    return new Promise((resolve, reject) => {
      if (body == null) reject('body is null')
      zlib.gunzip(body, (err, dezipped) => {
        if (err || dezipped == null) {
          reject(err || new Error('decide(gzip) is null'))
          return
        }
        resolve(dezipped.toString())
      })
    })
  },
  deflate: (body) => {
    return new Promise((resolve, reject) => {
      if (body == null) reject('body is null')
      zlib.inflateRaw(body, (err, decode) => {
        if (err || decode == null) {
          reject(err || new Error('decode(deflate) is null'))
          return
        }
        resolve(decode.toString())
      })
    })
  },
  brotli: (body) => {
    return new Promise((resolve, reject) => {
      if (body == null) reject('body is null')
      iltorb.decompress(body).then(value => {
        resolve(value.toString())
      }).catch(err => {
        reject(err)
      })
    })
  },
}

// chrome Accept-Encoding: gzip, deflate, br
module.exports = async (encode, body) => {
  switch (encode) {
    case 'gzip':
      return (await decode.gzip(body))
    case 'br':
      return (await decode.brotli(body))
    case 'deflate':
      return (await decode.deflate(body))
    default:
      return body
  }
}

const zlib = require('zlib')
const iltorb = require('iltorb')

const decode = {
  gzip: (body) => {
    return new Promise((resolve, reject) => {
      if (!body) reject('body is null')
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
      if (!body) reject('body is null')
      iltorb.decompress(body).then(value => {
        resolve(value.toString())
      }).catch(err => {
        reject(err)
      })
    })
  },
  deflate: (body) => {
    return new Promise((resolve, reject) => {
      if (!body) reject('body is null')
      zlib.inflate(body, (err, dedeflate) => {
        if (err || dedeflate == null) {
          reject(err || new Error('dedeflate is null'))
          return
        }
        resolve(dedeflate)
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
      return (await decode.deflate(body))
    default:
      return body
  }
}

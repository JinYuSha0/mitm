const url = require('url')
const querystring = require('querystring')

// 获取请求参数
module.exports = (req, res) => {
  return new Promise((resolve, reject) => {
    const urlObject = url.parse(req.url)
    const protocol = !!req.connection.encrypted ? 'https:' : 'http:'
    const URL = protocol + '//' + req.headers.host + urlObject.path
    const defaultOptions = {
      method: req.method,
      url: URL,
      headers: req.headers,
      encoding: null,
    }

    if (req.method.toLowerCase() === 'get') {
      resolve(defaultOptions)
    } else {
      let body = ''
      req.on('data', chunk => {
        body += chunk
      })
      req.on('end', () => {
        const params = Object.create(null)
        const contentType = req.headers['content-type']
        if (contentType && body != null) {
          if (contentType.match('application/json')) {
            Object.assign(params, {body})
          } else if (contentType.match('application/x-www-form-urlencoded')) {
            Object.assign(params, {form: body})
          } else if (contentType.match('multipart/form-data')) {
            Object.assign(params, {formData: body})
          } else {
            Object.assign(params, {body})
          }
        }
        resolve(Object.assign(defaultOptions, {...params}))
      })
      req.on('error', (err) => {
        reject(err)
      })
    }
  })
}

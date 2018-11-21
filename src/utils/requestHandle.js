const fs = require('fs')
const url = require('url')
const path = require('path')
const request = require('request')
const getRequestOptions = require('./getRequestOptions')
const decode = require('./decode')
const injectScript = require('./injectScript')

const randomPath = Math.random().toString(36).split('.')[1]

module.exports = async (req, res) => {
  try {
    if (req.headers.host === 'www.cert.com') {
      // 定义一个域名下载根证书便于安装
      res.writeHead(200, {
        'Content-Type': 'application/force-download',
        'Content-Disposition': 'attachment; filename=CA.crt'
      })
      fs.createReadStream(path.resolve(__dirname, '../../ssl/rootCA.crt')).pipe(res)
    } else if (!!req.url.match(randomPath)) {
      // 返回静态资源
      const splits = url.parse(req.url).pathname.split('/')
      const fileName = splits[splits.length - 1]
      const filePath = path.resolve(__dirname, `../../static/js/${fileName}`)
      if (fs.existsSync(filePath)) {
        fs.createReadStream(filePath).pipe(res)
      } else {
        res.end()
      }
    } else if (req.method.toLowerCase() === 'get' && req.headers.accept.match('text/html')) {
      // 区别处理html请求 用于注入script
      try {
        const options = await getRequestOptions(req, res)
        request(options, async (error, response, body) => {
          if (error) {
            res.end()
          }
          // 判断返回头中的content-encoding 选择解码方式
          const encode = response.headers['content-encoding']
          if (encode) {
            try {
              body = await decode(encode, body)
            } catch (err) {
              res.writeHead(500)
              res.end('Decode Error')
              throw err
            }
          }
          if (response) {
            // 为什么要去这两个头
            // 1.content-encoding：因为代理已经解码过了 不需要浏览器再次解码
            // 2.content-length：因为解压前的长度比解压后的长度小，会导致原内容丢失
            // 浅拷贝 response.headers
            const headers = Object.assign({}, response.headers)
            delete headers['content-encoding']
            delete headers['content-length']
            res.writeHead(response.statusCode, headers)
            if (body) {
              body = injectScript(body, `/${randomPath}/inject.js`)
              res.end(body)
            } else {
              res.end('No Response Body')
            }
          }
        })
      } catch (err) {
        throw err
      }
    } else {
      // 其余请求走字节流的形式
      try {
        const options = await getRequestOptions(req, res)
        request(options, (err, response, body) => {
          if (err) {
            res.end()
          }
        }).pipe(res)
      } catch (err) {
        throw err
      }
    }
  } catch (e) {
    res.end()
  }
}

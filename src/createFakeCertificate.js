const fs = require('fs')
const path = require('path')
const forge = require('node-forge')
const https = require('https')
const utils = require('./utils/utils')
const config = require('./config')
const systemBasicCommand = require('../packages/system-basic-command/src')

const pki = forge.pki
const sslDir = path.resolve(__dirname, '../ssl')
const otherDir = path.join(sslDir, '/other')
const caCertPath = path.join(sslDir, '/rootCA.crt')
const caKeyPath = path.join(sslDir, '/rootCA.key.pem')

function delay(ms, error) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    }, ms)
  })
}

// 获取https证书信息
function getCertificateInfo(host) {
  const timeoutPromise = delay(2000, new Error('获取https证书信息超时'))
  const requestPromise = new Promise((resolve, reject) => {
    const req = https.request({
      host,
      port: 443,
      method: 'GET',
    }, res => {
      resolve(res.connection.getPeerCertificate())
    })

    req.on('error', err => {
      reject(new Error('获取证书信息失败!'))
    })

    req.end()
  })

  return Promise.race([requestPromise, timeoutPromise])
}

// 生成CA根证书
function createFakeCaCertificate() {
  // 创建目录
  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir)
  }

  if (!fs.existsSync(caCertPath) && !fs.existsSync(caKeyPath)) {
    // 删除other目录下所有子证书
    utils.delDir(otherDir)

    const keys = pki.rsa.generateKeyPair(2048)
    const cert = pki.createCertificate()
    cert.publicKey = keys.publicKey

    // 设置有效时间
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear())
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1)

    const attrs = config.cert

    cert.setSubject(attrs)
    cert.setIssuer(attrs)
    cert.setExtensions([{
      name: 'basicConstraints',
      critical: true,
      cA: true
    }, {
      name: 'keyUsage',
      critical: true,
      keyCertSign: true
    }, {
      name: 'subjectKeyIdentifier'
    }])

    // 用自己的私钥签名
    cert.sign(keys.privateKey, forge.md.sha256.create())

    const certPem = pki.certificateToPem(cert)
    const keyPem = pki.privateKeyToPem(keys.privateKey)

    fs.writeFileSync(caCertPath, certPem)
    fs.writeFileSync(caKeyPath, keyPem)

    console.log(`根证书已经生成，路径:${caCertPath}，请先安装。`)

    systemBasicCommand.msgBox('mitm', '请先安装根证书!', () => {
      systemBasicCommand.fileManage(sslDir)
    })
  }
}

// 生成子证书
async function createFakeCertificate(domain) {
  try {
    // 创建目录
    if (!fs.existsSync(otherDir)) {
      fs.mkdirSync(otherDir)
    }

    const certPath = path.join(otherDir, `/cert_${domain}.crt`)
    const keyPath = path.join(otherDir, `/key_${domain}.pem`)

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const keyPem = fs.readFileSync(keyPath).toString()
      const certPem = fs.readFileSync(certPath).toString()
      return {
        key: pki.privateKeyFromPem(keyPem),
        cert: pki.certificateFromPem(certPem),
        keyPem,
        certPem,
      }
    }

    if (fs.existsSync(caCertPath) && fs.existsSync(caKeyPath)) {
      // 用ca根证书生成子证书
      const caCertPem = fs.readFileSync(caCertPath)
      const caKeyPem = fs.readFileSync(caKeyPath)
      const caCert = pki.certificateFromPem(caCertPem)
      const caKey = pki.privateKeyFromPem(caKeyPem)

      const keys = pki.rsa.generateKeyPair(1024)
      const cert = pki.createCertificate()
      cert.publicKey = keys.publicKey
      // cert.serialNumber = '01'

      // 设置有效时间
      cert.validity.notBefore = new Date()
      cert.validity.notAfter = new Date()
      cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear())
      cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1)

      // const { subject, issuer } = await getCertificateInfo(domain)
      const subject = config.cert.filter(i => i.name !== 'commonName').push({name: 'commonName', value: domain })

      // 设置发行者为根证书
      cert.setIssuer(caCert.subject.attributes)
      // 设置提供给站点的信息
      cert.setSubject(subject)
      cert.setExtensions([
        {
          name: 'basicConstraints',
          critical: true,
          cA: false
        },
        {
          name: 'keyUsage',
          critical: true,
          digitalSignature: true,
          contentCommitment: true,
          keyEncipherment: true,
          dataEncipherment: true,
          keyAgreement: true,
          keyCertSign: true,
          cRLSign: true,
          encipherOnly: true,
          decipherOnly: true
        },
        {
          name: 'subjectAltName',
          altNames: [{
            type: 2,
            value: domain
          }]
        },
        {
          name: 'subjectKeyIdentifier'
        },
        {
          name: 'extKeyUsage',
          serverAuth: true,
          clientAuth: true,
          codeSigning: true,
          emailProtection: true,
          timeStamping: true
        },
        {
          name: 'authorityKeyIdentifier'
        }
      ])

      // 用CA根证书私钥签名 生成子证书
      cert.sign(caKey, forge.md.sha256.create())

      const certPem = pki.certificateToPem(cert)
      const keyPem = pki.privateKeyToPem(keys.privateKey)
      fs.writeFileSync(certPath, certPem)
      fs.writeFileSync(keyPath, keyPem)

      return {
        cert,
        key: keys.privateKey,
        certPem,
        keyPem
      }
    } else {
      createFakeCaCertificate()
      return createFakeCertificate(domain)
    }
  } catch (err) {
    console.error(`${domain}: 生成证书失败,原因:${err.message}`)
    throw err
  }
}

module.exports = {
  createFakeCaCertificate,
  createFakeCertificate,
}

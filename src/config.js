const utils = require('./utils/utils')

module.exports = {
  randomPath: utils.randomStr(),
  cert: [
    {
      name: 'commonName',
      value: 'sjy-self-use'
    }, {
      name: 'countryName',
      value: 'CN'
    }, {
      shortName: 'ST',
      value: 'GuangDong'
    }, {
      name: 'localityName',
      value: 'ShengZhen'
    }, {
      name: 'organizationName',
      value: 'sjy'
    }, {
      shortName: 'OU',
      value: 'sjy'
    }
  ],
}

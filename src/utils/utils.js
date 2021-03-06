const fs = require('fs')

const randomStr = () => Math.random().toString(36).split('.')[1]

const delDir = (path) => {
  let files = []
  if(fs.existsSync(path)){
    files = fs.readdirSync(path)
    files.forEach((file, index) => {
      let curPath = path + "/" + file
      if(fs.statSync(curPath).isDirectory()){
        delDir(curPath) //递归删除文件夹
      } else {
        fs.unlinkSync(curPath) //删除文件
      }
    });
    fs.rmdirSync(path)
  }
}

module.exports = {
  randomStr,
  delDir,
}

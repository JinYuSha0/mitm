// 判断是否在iframe中
if (self == top) {
	// alert('脚本注入成功!');
	console.log('%c mitm:脚本注入成功', 'color:red;font-size:50px;');
  function Publisher (subscribers) {
    this.subscribers = subscribers || {}

    // 订阅
    Publisher.prototype.subscribe = (type, func) => {
      if (!this.subscribers[type]) {
        this.subscribers[type] = []
      }
      this.subscribers[type].push(func)
    }

    // 取消订阅
    Publisher.prototype.unsubscribe = (type, func) => {
      const index = this.subscribers[type].indexOf(func)
      if (index > -1) {
        this.subscribers[type].slice(index, 1)
      }
    }

    // 发布
    Publisher.prototype.publish = (type, publication) => {
      if (!this.subscribers[type] || this.subscribers[type].length <= 0) return
      this.subscribers[type].forEach(f => {
        f(publication)
      })
    }
  }
  const observer = new Publisher()
  function fr (blob, type) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = (e) => {
        resolve(e.target.result)
      }
      fr.onerror = (err) => {
        reject(err)
      }
      switch (type) {
        case 'dataUrl':
          fr.readAsDataURL(blob)
          break
        case 'arrayBuffer':
          fr.readAsArrayBuffer(blob)
          break
        case 'binaryString':
          fr.readAsBinaryString(blob)
          break
        default:
          fr.readAsText(blob, 'utf8')
          break
      }
    })
  }
  const imageHandler = async (blob) => {
    const src = await fr(blob, 'dataUrl')
    const image = new Image()
    image.src = src
    document.body.append(image)
  }
  const textHandler = async (blob) => {
    const text = await fr(blob)
    const div = document.createElement('div')
    div.innerText = text
    document.body.append(div)
  }
  observer.subscribe('image', imageHandler)
  observer.subscribe('text', textHandler)

  if ('WebSocket' in window) {
    WebSocket.prototype.sendBlob = function (PayloadType, PayloadData) {
      if (!PayloadType) throw new Error('type is null!')
      if (PayloadType.length !== 8) {
        if (PayloadType.length < 8) {
          const repair = 8 - PayloadType.length
          for (let i = 0; i < repair; i++) {
            PayloadType += ' '
          }
        } else {
          throw new Error('type length should be less 8!')
        }
      }
      ws.send(new Blob([PayloadType, PayloadData]))
    }
    const ws = window.ws = new WebSocket(`ws://${document.domain}/ws`)

    ws.onopen = () => {
      console.log('websocket连接')
      ws.sendBlob('package')
    }

    ws.onmessage = async (evt) => {
      if (Object.getPrototypeOf(evt.data) === Blob.prototype) {
        const type = await fr(evt.data.slice(0, 8))
        observer.publish(type.trim(), evt.data.slice(8, evt.data.length))
      } else {
        console.log(evt.data)
      }
    }

    ws.onclose = () => {
      console.log('websocket断开连接')
    }
  }
}

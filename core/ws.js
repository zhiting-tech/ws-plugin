/**
 * 心跳类
*/
class Heart {
  heartTimer = null

  OPTIONS = {
    HEART_BEAT_TIME: 60 * 1000 * 3 // 默认三分钟发一次心跳
  }

  constructor(ops) {
    Object.assign(this.OPTIONS, ops)
  }

  /**
   * 重置方法
  */
  reset() {
    clearInterval(this.heartTimer)
    return this
  }

  /**
   * 开始心跳
  */
  start(callback) {
    this.reset()
    callback()
    this.heartTimer = setInterval(() => {
      if (typeof cb === 'function') {
        callback()
      }
    }, this.OPTIONS.HEART_BEAT_TIME)
  }
}

// socket类
class Socket {
  // websock对象
  ws = null

  sendCash = [] // 未连接发送失败消息缓存

  heart = null

  reconnectTimer = null // 重连计时器

  INIT_RECONNET_COUNT = 10

  // 保存初始化重连次数
  OPTIONS = {
    url: null, // 链接的通道的地址
    heartTime: 60 * 1000 * 3, // 心跳时间间隔
    heartMsg: 'ping', // 心跳信息,默认为'ping'
    isRestroy: false, // 是否销毁
    reconnectCount: 10, // 自动重连次数，-1为无限次重连
    reconnectTime: 5000, // 自动重连时间间隔，单位毫秒，默认5秒
    onOpen: null, // 连接成功的回调
    onClose: null, // 关闭的回调
    onMessage: null, // 消息的回调
    onError: null // 错误的回调
  }

  constructor(ops) {
    Object.assign(this.OPTIONS, ops)
    this.INIT_RECONNET_COUNT = this.OPTIONS.reconnectCount
    this.heart = new Heart({
      HEART_BEAT_TIME: this.OPTIONS.heartTime
    })
    this.create()
  }

  /**
   * 建立连接
  */
  create() {
    const { url } = this.OPTIONS
    if (!url) {
      console.error('无效ws连接')
      return
    }
    const protocol = url.split(':')[0]
    const protocolList = ['ws', 'wss']
    if (!protocolList.includes(protocol)) {
      console.error('无效ws连接')
      return
    }
    if (!('WebSocket' in window)) {
      console.error('您的浏览器不支持websocket协议,建议使用新版谷歌、火狐等浏览器，请勿使用IE10以下浏览器，360浏览器请使用极速模式，不要使用兼容模式！"')
      return
    }
    this.ws = new WebSocket(url)
    // 连接成功回调
    this.onopen()
    // 连接关闭回调
    this.onclose()
    // 信息通讯回调
    this.onmessage()
    // 连接错误回调
    this.onerror()
  }

  /**
   * 自定义发送消息事件
   * @param { String } data 发送消息的文本
  */
  send(data) {
    const jsonStr = Object.prototype.toString.call(data) === '[object Object]' ? JSON.stringify(data) : data
    if (this.ws.readyState !== this.ws.OPEN) {
      // throw Error('没有连接到服务器，无法推送')
      // 未连接，先把发送的消息存缓存，连接成功再发送
      this.sendCash.push(jsonStr)
      return
    }
    this.ws.send(jsonStr)
  }

  /**
   * 自定义成功连接事件
   * 如果参数回调存在则调用参数种的回调，否则调用默认的回调
   * @param { Function } callback 回调函数
  */
  onopen(callback) {
    this.ws.onopen = (event) => {
      // 清除重连定时器
      clearTimeout(this.reconnectTimer)
      this.OPTIONS.reconnectCount = this.INIT_RECONNET_COUNT
      // 建立心跳包
      // this.heart.reset().start(() => {
      //   this.send(this.OPTIONS.heartMsg)
      // })
      // 发送缓存的信息
      while (this.sendCash.length) {
        const msg = this.sendCash.shift()
        this.ws.send(msg)
      }
      if (typeof callback === 'function') {
        callback(event)
      } else if (typeof this.OPTIONS.onOpen === 'function') {
        this.OPTIONS.onOpen()
      }
    }
  }

  /**
   * 自定义关闭事件
   * 如果参数回调存在则调用参数种的回调，否则调用默认的回调
   * @param { Function } callback 回调函数
  */
  onclose(callback) {
    this.ws.onclose = (event) => {
      console.error('ws关闭', event)
      this.heart.reset()
      // 看下是否需要重连，销毁不需要重连
      if (!this.OPTIONS.isRestroy) {
        this.onreconnect()
      }
      if (typeof callback === 'function') {
        callback(event)
      } else if (typeof this.OPTIONS.onClose === 'function') {
        this.OPTIONS.onClose()
      }
    }
  }

  /**
   * 自定义接受消息函数
   * 如果参数回调存在则调用参数种的回调，否则调用默认的回调
   * @param { Function } callback 回调函数
  */
  onmessage(callback) {
    this.ws.onmessage = (event) => {
      const { data } = event
      if (typeof callback === 'function') {
        callback(data)
      } else if (typeof this.OPTIONS.onMessage === 'function') {
        this.OPTIONS.onMessage(data)
      }
    }
  }

  /**
   * 自定义错误回调
   * 如果参数回调存在则调用参数种的回调，否则调用默认的回调
   * @param { Function } callback 回调函数
  */
  onerror(callback) {
    this.ws.onerror = (event) => {
      console.error('ws错误')
      this.ws.close()
      if (typeof callback === 'function') {
        callback(event)
      } else if (typeof this.OPTIONS.onError === 'function') {
        this.OPTIONS.onError()
      }
    }
  }

  /**
   * 重新连接
  */
  onreconnect() {
    const { reconnectCount } = this.OPTIONS
    // 重置销毁为false
    this.OPTIONS.isRestroy = false
    if (reconnectCount > 0 || reconnectCount === -1) {
      this.reconnectTimer = setTimeout(() => {
        this.create()
        if (this.OPTIONS.reconnectCount !== -1) {
          this.OPTIONS.reconnectCount = this.OPTIONS.reconnectCount - 1
        }
      }, this.OPTIONS.reconnectTime)
    } else {
      clearTimeout(this.reconnectTimer)
      this.OPTIONS.reconnectCount = this.INIT_RECONNET_COUNT
    }
  }

  /**
   * 销毁ws对象
  */
  destroy() {
    clearTimeout(this.reconnectTimer)
    this.heart.reset()
    this.OPTIONS.isRestroy = true
    this.ws.close()
  }

  /**
   * 更新参数
  */
  upadteOptions(ops) {
    Object.assign(this.OPTIONS, ops)
  }
}

export default Socket

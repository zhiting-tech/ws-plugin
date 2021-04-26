# ws-plugin

## 使用说明

```
npm i ws-plugin --save
```

```js
import Socket from 'ws-plugin'
const ws = new Socket({
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
})

// 方法调用
ws.onopen(() => {
  // do something here
})
```

## 参数说明

|    参数名称    |     参数说明     |               默认值               |
| :------------: | :--------------: | :--------------------------------: |
|      url       | 链接的通道的地址 |                 空                 |
|   heartTime    |   心跳时间间隔   |    3 \* 60 \* 1000(单位：毫秒)     |
|    heartMsg    |     心跳信息     |     默认为'ping'(String 类型)      |
| reconnectCount |   自动重连次数   | 默认为 10，-1 为无限次(Numbe 类型) |
| reconnectTime  | 自动重连时间间隔 |    默认值 5 \* 1000(单位：毫秒)    |
|     onOpen     |  连接成功的回调  |                null                |
|    onClose     |    关闭的回调    |                null                |
|   onMessage    |    消息的回调    |                null                |
|    onError     |    错误的回调    |                null                |

## 方法说明

|  方法名称   |      方法说明      |             参数             |
| :---------: | :----------------: | :--------------------------: |
|   onopen    | 连接成功的回调函数 |        传一个回调函数        |
|   onclose   |   关闭 ws 连接，   |        传一个回调函数        |
|  onmessage  |    接受信息回调    |        传一个回调函数        |
|   onerror   |    连接错误回调    |        传一个回调函数        |
| onreconnect |        重连        | 默认值 5 \* 1000(单位：毫秒) |

## 安装依赖

```
npm install
```

### 启动项目

```
npm run serve
```

### 项目构建

```
npm run build
```

### 构建 npm 包

```
npm run lib
```

### 规范检测

```
npm run lint
```

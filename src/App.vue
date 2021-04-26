<template>
  <div id="app">
    测试页面
  </div>
</template>

<script>
import Socket from '../core/ws'

export default {
  name: 'app',
  mounted() {
    new Socket({
      url: 'ws://192.168.0.222:8088/ws',
      onOpen() {
        window.console.log('---->连接成功')
      }
    })
  }
}
</script>

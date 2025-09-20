import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@nutui/touch-emulator'

import './app.scss'

const App = createApp({
  onShow(_options) {
    // 应用显示时的回调函数
    // 可以在这里处理应用启动逻辑
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

App.use(createPinia())

export default App

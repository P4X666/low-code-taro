<script lang="ts">
  export default {
    options: {
      addGlobalClass: true // 解决tabbar样式隔离导致的<IconFont />图标无法显示问题
    }
  }
</script>
<script setup lang="ts">
import { h } from 'vue'
import Taro from '@tarojs/taro'
import { storeToRefs } from 'pinia'
import { useSelectedStore } from '@/stores/tabbar-selected'
import { Home, Category, Find, Cart, My } from '@nutui/icons-vue-taro'

const store = useSelectedStore()
const { selected } = storeToRefs(store)

const deviceInfo = Taro.getDeviceInfo() // 获取设备基础信息
const windowInfo = Taro.getWindowInfo() // 获取窗口信息
const appBaseInfo = Taro.getAppBaseInfo() // 获取微信APP基础信息
// const theme:'light'|'dark' = appBaseInfo.theme || 'light'
console.log('deviceInfo', deviceInfo)
console.log('windowInfo', windowInfo)
console.log('appBaseInfo', appBaseInfo)
// console.log('theme', theme)

function switchTab (item: Record<string, unknown>, index: number) {
  console.log(item, index)
  store.setSelected(index);
  // const isAuthorized = Taro.getStorageSync('isAuthorized') || false
  // const authorizeInterception = ['/pages/profile/index']
  // if (!isAuthorized && authorizeInterception.includes(url)) {
  //   Taro.navigateTo({
  //     url: `/subpackages/login/index?redirect=${encodeURIComponent(url)}&index=${index}`
  //   })
  // } else {
  //   store.setSelected(index)
  //   Taro.switchTab({ url })
  // }
}


const TabbarList = [
  {
    title: 'Home',
    icon: h(Home),
    // url: '/pages/home/index'
  },
  {
    title: 'Category',
    icon: h(Category),
    // url: '/pages/category/index'
  },
  {
    title: 'Find',
    icon: h(Find),
    // url: '/pages/search/index'
  },
  {
    title: 'Cart',
    icon: h(Cart),
    // url: '/pages/cart/index'
  },
  {
    title: 'My',
    icon: h(My),
    // url: '/pages/profile/index'
  }
]

</script>
<template>
  <nut-tabbar v-model="selected" @tab-switch="switchTab" bottom safe-area-inset-bottom>
    <nut-tabbar-item v-for="(item, index) in TabbarList" :key="index" :tab-title="item.title" :icon="item.icon">
    </nut-tabbar-item>
  </nut-tabbar>
</template>
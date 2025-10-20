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
import { TABBARPATH } from '@/constants/common';

const store = useSelectedStore()
const { selected } = storeToRefs(store)

const TabbarList = [
  {
    title: 'Home',
    icon: h(Home),
    name: 'HOME',
  },
  {
    title: 'Category',
    icon: h(Category),
    name: 'MENU',
  },
  {
    title: 'Search',
    icon: h(Find),
    name: 'SEARCH',
  },
  {
    title: 'Cart',
    icon: h(Cart),
    name: 'CART',
  },
  {
    title: 'My',
    icon: h(My),
    name: 'PROFILE',
  }
]

function switchTab (_item: Record<string, any>, index: number) {
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
  const url = TABBARPATH[TabbarList[index].name]
  Taro.switchTab({ url })
}

</script>
<template>
  <nut-tabbar v-model="selected" @tab-switch="switchTab" bottom safe-area-inset-bottom>
    <nut-tabbar-item v-for="(item, index) in TabbarList" :key="index" :tab-title="item.title" :icon="item.icon">
    </nut-tabbar-item>
  </nut-tabbar>
</template>
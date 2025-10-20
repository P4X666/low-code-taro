import { defineStore } from 'pinia'
import { ref, h } from 'vue'
import { Home, Category, Find, Cart, My } from '@nutui/icons-vue-taro'

// 你可以任意命名 `defineStore()` 的返回值，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。
// (比如 `useUserStore`，`useCartStore`，`useProductStore`)
// 第一个参数是你的应用中 Store 的唯一 ID。

// Option Store
// export const useSelectedStore = defineStore('selected', {
//   state: () => ({ selected: 0 }),
//   getters: {
//     getSelected (state) {
//       return state.selected
//     }
//   },
//   actions: {
//     setSelected (context, index) {
//       context.commit('SET_SELECTED', index)
//     }
//   }
// })

// Setup Store
export const useSelectedStore = defineStore('tabbarSelected', () => {
  const selected = ref<number>(0)
  function setSelected (value: number) {
    selected.value = value
  }
  return { selected, setSelected }
})

export const TabbarList = [
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

// –nut-tabbar-height 默认值是50px
export const tabbarHeight = '100rpx'
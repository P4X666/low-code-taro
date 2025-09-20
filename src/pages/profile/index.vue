<template>
  <view class="profile-page">
    <!-- 用户信息区域 -->
    <view class="profile-header">
      <view class="profile-header__bg"></view>
      <view class="profile-header__content">
        <!-- 未登录状态 -->
        <view v-if="!userInfo.isLogin" class="profile-header__login" @click="handleLogin">
          <image 
            class="profile-header__avatar" 
            src="/static/images/default-avatar.png" 
            mode="aspectFill"
          />
          <view class="profile-header__info">
            <text class="profile-header__name">点击登录</text>
            <text class="profile-header__desc">登录后享受更多服务</text>
          </view>
          <nut-icon name="right" class="profile-header__arrow" />
        </view>

        <!-- 已登录状态 -->
        <view v-else class="profile-header__user">
          <image 
            class="profile-header__avatar" 
            :src="userInfo.avatar || '/static/images/default-avatar.png'" 
            mode="aspectFill"
          />
          <view class="profile-header__info">
            <text class="profile-header__name">{{ userInfo.nickname || '用户' }}</text>
            <text class="profile-header__desc">{{ userInfo.phone || '未绑定手机号' }}</text>
          </view>
          <view class="profile-header__vip" v-if="userInfo.isVip">
            <text class="profile-header__vip-text">VIP</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单统计 -->
    <view class="order-stats">
      <view class="order-stats__item" @click="goToOrders('all')">
        <text class="order-stats__title">全部订单</text>
        <nut-icon name="right" class="order-stats__arrow" />
      </view>
      
      <view class="order-stats__list">
        <view 
          v-for="stat in orderStats" 
          :key="stat.type"
          class="order-stats__stat"
          @click="goToOrders(stat.type)"
        >
          <view class="order-stats__icon">
            <nut-icon :name="stat.icon" size="24" />
            <view v-if="stat.count > 0" class="order-stats__badge">
              {{ stat.count > 99 ? '99+' : stat.count }}
            </view>
          </view>
          <text class="order-stats__label">{{ stat.label }}</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-section__title">我的服务</view>
      <view class="menu-list">
        <view 
          v-for="menu in serviceMenus" 
          :key="menu.key"
          class="menu-item"
          @click="handleMenuClick(menu)"
        >
          <view class="menu-item__icon">
            <nut-icon :name="menu.icon" size="20" />
          </view>
          <text class="menu-item__title">{{ menu.title }}</text>
          <view class="menu-item__extra" v-if="menu.extra">
            <text class="menu-item__extra-text">{{ menu.extra }}</text>
          </view>
          <nut-icon name="right" class="menu-item__arrow" />
        </view>
      </view>
    </view>

    <!-- 工具菜单 -->
    <view class="menu-section">
      <view class="menu-section__title">工具与设置</view>
      <view class="menu-list">
        <view 
          v-for="menu in toolMenus" 
          :key="menu.key"
          class="menu-item"
          @click="handleMenuClick(menu)"
        >
          <view class="menu-item__icon">
            <nut-icon :name="menu.icon" size="20" />
          </view>
          <text class="menu-item__title">{{ menu.title }}</text>
          <view class="menu-item__extra" v-if="menu.extra">
            <text class="menu-item__extra-text">{{ menu.extra }}</text>
          </view>
          <nut-icon name="right" class="menu-item__arrow" />
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view v-if="userInfo.isLogin" class="logout-section">
      <nut-button 
        type="default" 
        class="logout-button"
        @click="handleLogout"
      >
        退出登录
      </nut-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/stores'

// 用户状态管理
const userStore = useUserStore()

// 计算属性
const userInfo = computed(() => userStore.userInfo)
const orderStats = computed(() => [
  {
    type: 'pending',
    icon: 'clock',
    label: '待付款',
    count: userStore.orderStats.pending
  },
  {
    type: 'shipped',
    icon: 'logistics',
    label: '待收货',
    count: userStore.orderStats.shipped
  },
  {
    type: 'completed',
    icon: 'comment',
    label: '待评价',
    count: userStore.orderStats.completed
  },
  {
    type: 'refund',
    icon: 'service',
    label: '退款/售后',
    count: userStore.orderStats.refund
  }
])

// 服务菜单
const serviceMenus = ref([
  {
    key: 'address',
    title: '收货地址',
    icon: 'location',
    path: '/pages/address/list'
  },
  {
    key: 'coupon',
    title: '优惠券',
    icon: 'coupon',
    path: '/pages/coupon/list',
    extra: '3张可用'
  },
  {
    key: 'points',
    title: '积分商城',
    icon: 'star',
    path: '/pages/points/index'
  },
  {
    key: 'favorite',
    title: '我的收藏',
    icon: 'heart',
    path: '/pages/favorite/list'
  },
  {
    key: 'history',
    title: '浏览历史',
    icon: 'eye',
    path: '/pages/history/list'
  }
])

// 工具菜单
const toolMenus = ref([
  {
    key: 'customer-service',
    title: '联系客服',
    icon: 'service',
    action: 'contact'
  },
  {
    key: 'feedback',
    title: '意见反馈',
    icon: 'comment',
    path: '/pages/feedback/index'
  },
  {
    key: 'about',
    title: '关于我们',
    icon: 'info',
    path: '/pages/about/index'
  },
  {
    key: 'settings',
    title: '设置',
    icon: 'setting',
    path: '/pages/settings/index'
  }
])

/**
 * 处理登录
 */
const handleLogin = () => {
  Taro.navigateTo({
    url: '/pages/login/index'
  })
}

/**
 * 处理退出登录
 */
const handleLogout = () => {
  Taro.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        Taro.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 跳转到订单页面
 */
const goToOrders = (type: string) => {
  if (!userInfo.value.isLogin) {
    handleLogin()
    return
  }

  Taro.navigateTo({
    url: `/pages/orders/list?type=${type}`
  })
}

/**
 * 处理菜单点击
 */
const handleMenuClick = (menu: any) => {
  // 需要登录的功能
  const needLoginMenus = ['address', 'coupon', 'points', 'favorite', 'history']
  
  if (needLoginMenus.includes(menu.key) && !userInfo.value.isLogin) {
    handleLogin()
    return
  }

  // 特殊处理的功能
  if (menu.action === 'contact') {
    // 联系客服
    Taro.makePhoneCall({
      phoneNumber: '400-123-4567'
    }).catch(() => {
      Taro.showToast({
        title: '拨号失败',
        icon: 'none'
      })
    })
    return
  }

  // 普通页面跳转
  if (menu.path) {
    Taro.navigateTo({
      url: menu.path
    })
  }
}

/**
 * 页面加载时获取用户信息
 */
onMounted(() => {
  userStore.loadUserInfo()
  if (userInfo.value.isLogin) {
    userStore.loadOrderStats()
  }
})

/**
 * 页面显示时刷新数据
 */
const onShow = () => {
  if (userInfo.value.isLogin) {
    userStore.loadOrderStats()
  }
}

// 页面生命周期
Taro.useDidShow(onShow)
</script>

<style lang="scss">
@import './index.scss';
</style>
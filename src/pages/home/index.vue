<template>
  <view class="home safe-area-bottom" :style="{'padding-top': statusBarHeight + 'px'}">
    <!-- 搜索栏 -->
    <view class="home__search">
      <nut-searchbar
        v-model="searchValue"
        placeholder="搜索商品"
        @search="handleSearch"
      />
    </view>

    <!-- 轮播图 -->
    <view class="home__banner">
      <nut-swiper
        :init-page="0"
        :pagination-visible="true"
        pagination-color="#426543"
        auto-play="3000"
        height="200"
      >
        <nut-swiper-item v-for="(banner, index) in bannerList" :key="index">
          <image :src="banner.image" class="home__banner-image" @tap="handleBannerClick(banner)" />
        </nut-swiper-item>
      </nut-swiper>
    </view>

    <!-- 分类导航 -->
    <view class="home__categories">
      <view
        v-for="category in categoryList"
        :key="category.id"
        class="home__category-item"
        @tap="handleCategoryClick(category)"
      >
        <image :src="category.icon" class="home__category-icon" />
        <text class="home__category-name">{{ category.name }}</text>
      </view>
    </view>

    <!-- 推荐商品 -->
    <view class="home__products">
      <view class="home__section-title">推荐商品</view>
      <view class="home__product-grid">
        <view
          v-for="product in productList"
          :key="product.id"
          class="home__product-item"
          @tap="handleProductClick(product)"
        >
          <image :src="product.image" class="home__product-image" />
          <view class="home__product-info">
            <text class="home__product-name">{{ product.name }}</text>
            <view class="home__product-price">
              <text class="home__product-price--current">¥{{ product.price }}</text>
              <text v-if="product.originalPrice" class="home__product-price--original">
                ¥{{ product.originalPrice }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view :style="{'padding-bottom': tabbarHeight, height: '20rpx'}"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { tabbarHeight } from '@/stores/tabbar-selected'
import './index.scss'

/**
 * 轮播图数据类型定义
 */
interface Banner {
  id: number
  image: string
  link?: string
  title?: string
}

/**
 * 分类数据类型定义
 */
interface Category {
  id: number
  name: string
  icon: string
}

/**
 * 商品数据类型定义
 */
interface Product {
  id: number
  name: string
  image: string
  price: number
  originalPrice?: number
}

// 响应式数据
const searchValue = ref<string>('')
const bannerList = ref<Banner[]>([])
const categoryList = ref<Category[]>([])
const productList = ref<Product[]>([])

/**
 * 搜索处理函数
 * @param value 搜索关键词
 */
const handleSearch = (value: string) => {
  console.log('搜索关键词:', value)
  // TODO: 实现搜索逻辑
  Taro.navigateTo({
    url: `/pages/search/index?keyword=${encodeURIComponent(value)}`
  })
}

/**
 * 轮播图点击处理
 * @param banner 轮播图数据
 */
const handleBannerClick = (banner: Banner) => {
  console.log('点击轮播图:', banner)
  if (banner.link) {
    // TODO: 根据链接类型进行不同的跳转处理
  }
}

/**
 * 分类点击处理
 * @param category 分类数据
 */
const handleCategoryClick = (category: Category) => {
  console.log('点击分类:', category)
  Taro.navigateTo({
    url: `/pages/category/index?categoryId=${category.id}`
  })
}

/**
 * 商品点击处理
 * @param product 商品数据
 */
const handleProductClick = (product: Product) => {
  console.log('点击商品:', product)
  Taro.navigateTo({
    url: `/pages/product/detail?productId=${product.id}`
  })
}

/**
 * 加载首页数据
 * 采用懒加载策略，提升页面初始加载速度
 */
const loadHomeData = async () => {
  try {
    // TODO: 调用API获取真实数据
    // 模拟数据
    bannerList.value = [
      { id: 1, image: '', title: '轮播图1' },
      { id: 2, image: '', title: '轮播图2' },
      { id: 3, image: '', title: '轮播图3' }
    ]

    categoryList.value = [
      { id: 1, name: '数码', icon: '' },
      { id: 2, name: '服装', icon: '' },
      { id: 3, name: '家居', icon: '' },
      { id: 4, name: '美妆', icon: '' }
    ]

    productList.value = [
      { id: 1, name: 'iPhone 15 Pro', image: '', price: 7999, originalPrice: 8999 },
      { id: 2, name: 'MacBook Air', image: '', price: 8999 },
      { id: 3, name: 'AirPods Pro', image: '', price: 1999, originalPrice: 2299 },
      { id: 4, name: 'iPad Air', image: '', price: 4399 }
    ]
  } catch (error) {
    console.error('加载首页数据失败:', error)
    Taro.showToast({
      title: '加载失败，请重试',
      icon: 'error'
    })
  }
}

const windowInfo = Taro.getWindowInfo()
const { statusBarHeight } = windowInfo
console.log(windowInfo.statusBarHeight);


const menuButtonStyle = Taro.getMenuButtonBoundingClientRect()
console.log(menuButtonStyle);


// 页面加载时获取数据
onMounted(() => {
  loadHomeData()
})
</script>

<!--
  分类页面组件
  功能：展示商品分类，支持多级分类和筛选功能
  采用侧边栏+内容区的经典布局方式
-->
<template>
  <view class="category">
    <!-- 搜索栏 -->
    <view class="category__search">
      <nut-searchbar
        v-model="searchValue"
        placeholder="搜索分类商品"
        @search="handleSearch"
      />
    </view>

    <view class="category__content">
      <!-- 左侧分类导航 -->
      <scroll-view class="category__sidebar" scroll-y>
        <view
          v-for="(category, index) in categoryList"
          :key="category.id"
          class="category__sidebar-item"
          :class="{ 'category__sidebar-item--active': activeIndex === index }"
          @tap="handleCategorySelect(category, index)"
        >
          <text class="category__sidebar-text">{{ category.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧内容区 -->
      <scroll-view class="category__main" scroll-y>
        <!-- 二级分类 -->
        <view v-if="subCategoryList.length > 0" class="category__sub-categories">
          <view
            v-for="subCategory in subCategoryList"
            :key="subCategory.id"
            class="category__sub-item"
            @tap="handleSubCategoryClick(subCategory)"
          >
            <image :src="subCategory.image" class="category__sub-image" />
            <text class="category__sub-name">{{ subCategory.name }}</text>
          </view>
        </view>

        <!-- 筛选条件 -->
        <view class="category__filters">
          <view class="category__filter-item">
            <nut-button
              v-for="filter in filterOptions.sort"
              :key="filter.value"
              :type="activeFilters.sort === filter.value ? 'primary' : 'default'"
              size="small"
              @click="handleFilterChange('sort', filter.value)"
            >
              {{ filter.label }}
            </nut-button>
          </view>
          <view class="category__filter-item">
            <nut-button
              v-for="filter in filterOptions.price"
              :key="filter.value"
              :type="activeFilters.price === filter.value ? 'primary' : 'default'"
              size="small"
              @click="handleFilterChange('price', filter.value)"
            >
              {{ filter.label }}
            </nut-button>
          </view>
        </view>

        <!-- 商品列表 -->
        <view class="category__products">
          <view
            v-for="product in productList"
            :key="product.id"
            class="category__product-item"
            @tap="handleProductClick(product)"
          >
            <image :src="product.image" class="category__product-image" />
            <view class="category__product-info">
              <text class="category__product-name">{{ product.name }}</text>
              <view class="category__product-tags">
                <text
                  v-for="tag in product.tags"
                  :key="tag"
                  class="category__product-tag"
                >
                  {{ tag }}
                </text>
              </view>
              <view class="category__product-price">
                <text class="category__product-price--current">¥{{ product.price }}</text>
                <text v-if="product.originalPrice" class="category__product-price--original">
                  ¥{{ product.originalPrice }}
                </text>
              </view>
              <view class="category__product-sales">
                <text class="category__product-sales-text">已售{{ product.sales }}件</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore" class="category__load-more" @tap="loadMoreProducts">
          <nut-button loading="loading" type="default" size="small">
            {{ loading ? '加载中...' : '加载更多' }}
          </nut-button>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import Taro from '@tarojs/taro'

/**
 * 分类数据类型定义
 */
interface Category {
  id: number
  name: string
  children?: SubCategory[]
}

/**
 * 二级分类数据类型定义
 */
interface SubCategory {
  id: number
  name: string
  image: string
  categoryId: number
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
  sales: number
  tags: string[]
  categoryId: number
  subCategoryId?: number
}

/**
 * 筛选选项类型定义
 */
interface FilterOptions {
  sort: Array<{ label: string; value: string }>
  price: Array<{ label: string; value: string }>
}

/**
 * 筛选条件类型定义
 */
interface ActiveFilters {
  sort: string
  price: string
}

// 响应式数据
const searchValue = ref<string>('')
const activeIndex = ref<number>(0)
const categoryList = ref<Category[]>([])
const subCategoryList = ref<SubCategory[]>([])
const productList = ref<Product[]>([])
const loading = ref<boolean>(false)
const hasMore = ref<boolean>(true)
const currentPage = ref<number>(1)

// 筛选相关数据
const filterOptions = reactive<FilterOptions>({
  sort: [
    { label: '综合', value: 'default' },
    { label: '销量', value: 'sales' },
    { label: '价格', value: 'price' },
    { label: '新品', value: 'new' }
  ],
  price: [
    { label: '全部', value: 'all' },
    { label: '0-100', value: '0-100' },
    { label: '100-500', value: '100-500' },
    { label: '500+', value: '500+' }
  ]
})

const activeFilters = reactive<ActiveFilters>({
  sort: 'default',
  price: 'all'
})

/**
 * 搜索处理函数
 * @param value 搜索关键词
 */
const handleSearch = (value: string) => {
  console.log('分类页搜索:', value)
  // TODO: 实现分类页搜索逻辑
}

/**
 * 分类选择处理
 * @param category 选中的分类
 * @param index 分类索引
 */
const handleCategorySelect = (category: Category, index: number) => {
  activeIndex.value = index
  subCategoryList.value = category.children || []
  // 重置筛选条件和商品列表
  resetFiltersAndProducts()
  loadCategoryProducts(category.id)
}

/**
 * 二级分类点击处理
 * @param subCategory 二级分类数据
 */
const handleSubCategoryClick = (subCategory: SubCategory) => {
  console.log('点击二级分类:', subCategory)
  resetFiltersAndProducts()
  loadSubCategoryProducts(subCategory.id)
}

/**
 * 筛选条件变更处理
 * @param type 筛选类型
 * @param value 筛选值
 */
const handleFilterChange = (type: keyof ActiveFilters, value: string) => {
  activeFilters[type] = value
  resetProductList()
  loadFilteredProducts()
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
 * 重置筛选条件和商品列表
 */
const resetFiltersAndProducts = () => {
  activeFilters.sort = 'default'
  activeFilters.price = 'all'
  resetProductList()
}

/**
 * 重置商品列表
 */
const resetProductList = () => {
  productList.value = []
  currentPage.value = 1
  hasMore.value = true
}

/**
 * 加载分类商品
 * @param categoryId 分类ID
 */
const loadCategoryProducts = async (categoryId: number) => {
  try {
    loading.value = true
    // TODO: 调用API获取分类商品数据
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockProducts: Product[] = [
      {
        id: 1,
        name: `分类${categoryId}商品1`,
        image: 'https://via.placeholder.com/200x200',
        price: 299,
        originalPrice: 399,
        sales: 1234,
        tags: ['热销', '包邮'],
        categoryId
      },
      {
        id: 2,
        name: `分类${categoryId}商品2`,
        image: 'https://via.placeholder.com/200x200',
        price: 199,
        sales: 567,
        tags: ['新品'],
        categoryId
      }
    ]
    
    productList.value = mockProducts
  } catch (error) {
    console.error('加载分类商品失败:', error)
    Taro.showToast({
      title: '加载失败，请重试',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 加载二级分类商品
 * @param subCategoryId 二级分类ID
 */
const loadSubCategoryProducts = async (subCategoryId: number) => {
  // TODO: 实现二级分类商品加载逻辑
  console.log('加载二级分类商品:', subCategoryId)
}

/**
 * 加载筛选后的商品
 */
const loadFilteredProducts = async () => {
  try {
    loading.value = true
    // TODO: 根据筛选条件调用API
    console.log('筛选条件:', activeFilters)
    await new Promise(resolve => setTimeout(resolve, 500))
    // 模拟筛选后的数据
  } catch (error) {
    console.error('筛选商品失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 加载更多商品
 */
const loadMoreProducts = async () => {
  if (loading.value || !hasMore.value) return
  
  try {
    loading.value = true
    currentPage.value++
    // TODO: 加载下一页数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟没有更多数据
    if (currentPage.value >= 3) {
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载更多商品失败:', error)
    currentPage.value--
  } finally {
    loading.value = false
  }
}

/**
 * 初始化分类数据
 */
const initCategoryData = async () => {
  try {
    // TODO: 调用API获取分类数据
    // 模拟数据
    categoryList.value = [
      {
        id: 1,
        name: '数码电器',
        children: [
          { id: 11, name: '手机', image: 'https://via.placeholder.com/80x80', categoryId: 1 },
          { id: 12, name: '电脑', image: 'https://via.placeholder.com/80x80', categoryId: 1 },
          { id: 13, name: '相机', image: 'https://via.placeholder.com/80x80', categoryId: 1 }
        ]
      },
      {
        id: 2,
        name: '服装鞋包',
        children: [
          { id: 21, name: '男装', image: 'https://via.placeholder.com/80x80', categoryId: 2 },
          { id: 22, name: '女装', image: 'https://via.placeholder.com/80x80', categoryId: 2 },
          { id: 23, name: '鞋靴', image: 'https://via.placeholder.com/80x80', categoryId: 2 }
        ]
      },
      {
        id: 3,
        name: '家居生活',
        children: [
          { id: 31, name: '家具', image: 'https://via.placeholder.com/80x80', categoryId: 3 },
          { id: 32, name: '家电', image: 'https://via.placeholder.com/80x80', categoryId: 3 }
        ]
      },
      { id: 4, name: '美妆护肤' },
      { id: 5, name: '食品生鲜' }
    ]
    
    // 默认选中第一个分类
    if (categoryList.value.length > 0) {
      handleCategorySelect(categoryList.value[0], 0)
    }
  } catch (error) {
    console.error('初始化分类数据失败:', error)
  }
}

// 页面加载时初始化数据
onMounted(() => {
  initCategoryData()
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
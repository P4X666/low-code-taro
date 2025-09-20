<!--
  搜索栏组件
  功能：提供搜索输入、筛选、扫码等功能
  参数：placeholder - 占位符文本，showFilter - 是否显示筛选按钮
-->
<template>
  <view class="search-bar">
    <view class="search-bar__container">
      <!-- 搜索输入框 -->
      <view class="search-bar__input-wrapper">
        <nut-icon name="search" class="search-bar__search-icon" />
        <input
          v-model="searchValue"
          :placeholder="placeholder"
          class="search-bar__input"
          type="text"
          confirm-type="search"
          @input="handleInput"
          @confirm="handleSearch"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <nut-icon
          v-if="searchValue"
          name="close"
          class="search-bar__clear-icon"
          @click="handleClear"
        />
      </view>
      
      <!-- 筛选按钮 -->
      <view
        v-if="showFilter"
        :class="[
          'search-bar__filter',
          { 'search-bar__filter--active': hasActiveFilters }
        ]"
        @tap="handleFilterClick"
      >
        <nut-icon name="filter" />
        <text class="search-bar__filter-text">筛选</text>
        <view v-if="hasActiveFilters" class="search-bar__filter-dot"></view>
      </view>
      
      <!-- 扫码按钮 -->
      <view
        v-if="showScan"
        class="search-bar__scan"
        @tap="handleScanClick"
      >
        <nut-icon name="scan" />
      </view>
    </view>
    
    <!-- 搜索建议 -->
    <view
      v-if="showSuggestions && suggestions.length > 0"
      class="search-bar__suggestions"
    >
      <view
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="search-bar__suggestion-item"
        @tap="handleSuggestionClick(suggestion)"
      >
        <nut-icon name="search" class="search-bar__suggestion-icon" />
        <text class="search-bar__suggestion-text">{{ suggestion }}</text>
      </view>
    </view>
    
    <!-- 热门搜索 -->
    <view
      v-if="showHotSearch && hotSearchList.length > 0 && !searchValue"
      class="search-bar__hot-search"
    >
      <view class="search-bar__hot-title">热门搜索</view>
      <view class="search-bar__hot-tags">
        <text
          v-for="(keyword, index) in hotSearchList"
          :key="index"
          class="search-bar__hot-tag"
          @tap="handleHotSearchClick(keyword)"
        >
          {{ keyword }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Taro from '@tarojs/taro'

/**
 * 组件属性定义
 */
interface Props {
  /** 搜索值 */
  modelValue?: string
  /** 占位符文本 */
  placeholder?: string
  /** 是否显示筛选按钮 */
  showFilter?: boolean
  /** 是否显示扫码按钮 */
  showScan?: boolean
  /** 是否显示搜索建议 */
  showSuggestions?: boolean
  /** 是否显示热门搜索 */
  showHotSearch?: boolean
  /** 搜索建议列表 */
  suggestions?: string[]
  /** 热门搜索列表 */
  hotSearchList?: string[]
  /** 是否有激活的筛选条件 */
  hasActiveFilters?: boolean
  /** 是否自动聚焦 */
  autoFocus?: boolean
}

/**
 * 组件事件定义
 */
interface Emits {
  /** 更新搜索值 */
  (e: 'update:modelValue', value: string): void
  /** 搜索事件 */
  (e: 'search', keyword: string): void
  /** 输入事件 */
  (e: 'input', value: string): void
  /** 聚焦事件 */
  (e: 'focus'): void
  /** 失焦事件 */
  (e: 'blur'): void
  /** 筛选按钮点击事件 */
  (e: 'filter-click'): void
  /** 扫码按钮点击事件 */
  (e: 'scan-click'): void
  /** 清空事件 */
  (e: 'clear'): void
}

// 接收属性
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索商品',
  showFilter: true,
  showScan: true,
  showSuggestions: true,
  showHotSearch: true,
  suggestions: () => [],
  hotSearchList: () => ['手机', '电脑', '耳机', '充电器', '数据线', '保护壳'],
  hasActiveFilters: false,
  autoFocus: false
})

// 定义事件
const emit = defineEmits<Emits>()

// 搜索值
const searchValue = ref<string>(props.modelValue)

// 是否聚焦状态
const isFocused = ref<boolean>(false)

/**
 * 监听外部传入的值变化
 */
watch(
  () => props.modelValue,
  (newValue) => {
    searchValue.value = newValue
  }
)

/**
 * 监听搜索值变化，同步到外部
 */
watch(searchValue, (newValue) => {
  emit('update:modelValue', newValue)
})

/**
 * 处理输入事件
 * @param event 输入事件
 */
const handleInput = (event: any) => {
  const value = event.detail.value
  searchValue.value = value
  emit('input', value)
}

/**
 * 处理搜索事件
 */
const handleSearch = () => {
  const keyword = searchValue.value.trim()
  if (keyword) {
    emit('search', keyword)
    // 添加到搜索历史
    addToSearchHistory(keyword)
  }
}

/**
 * 处理聚焦事件
 */
const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

/**
 * 处理失焦事件
 */
const handleBlur = () => {
  // 延迟失焦，避免点击建议项时输入框失焦
  setTimeout(() => {
    isFocused.value = false
    emit('blur')
  }, 200)
}

/**
 * 处理清空事件
 */
const handleClear = () => {
  searchValue.value = ''
  emit('clear')
}

/**
 * 处理筛选按钮点击事件
 */
const handleFilterClick = () => {
  emit('filter-click')
}

/**
 * 处理扫码按钮点击事件
 */
const handleScanClick = () => {
  emit('scan-click')
  
  // 默认调用扫码功能
  Taro.scanCode({
    success: (res) => {
      console.log('扫码结果:', res)
      // 如果是商品条码，可以直接搜索
      if (res.result) {
        searchValue.value = res.result
        handleSearch()
      }
    },
    fail: (err) => {
      console.error('扫码失败:', err)
      Taro.showToast({
        title: '扫码失败',
        icon: 'error'
      })
    }
  })
}

/**
 * 处理搜索建议点击事件
 * @param suggestion 建议项
 */
const handleSuggestionClick = (suggestion: string) => {
  searchValue.value = suggestion
  handleSearch()
}

/**
 * 处理热门搜索点击事件
 * @param keyword 热门关键词
 */
const handleHotSearchClick = (keyword: string) => {
  searchValue.value = keyword
  handleSearch()
}

/**
 * 添加到搜索历史
 * @param keyword 搜索关键词
 */
const addToSearchHistory = async (keyword: string) => {
  try {
    // 获取现有搜索历史
    const historyRes = await Taro.getStorage({ key: 'searchHistory' }).catch(() => ({ data: [] }))
    let history: string[] = historyRes.data || []
    
    // 移除重复项
    history = history.filter(item => item !== keyword)
    
    // 添加到开头
    history.unshift(keyword)
    
    // 限制历史记录数量
    if (history.length > 10) {
      history = history.slice(0, 10)
    }
    
    // 保存到本地存储
    await Taro.setStorage({
      key: 'searchHistory',
      data: history
    })
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

/**
 * 获取搜索历史
 */
const getSearchHistory = async (): Promise<string[]> => {
  try {
    const res = await Taro.getStorage({ key: 'searchHistory' })
    return res.data || []
  } catch (error) {
    return []
  }
}

/**
 * 清空搜索历史
 */
const clearSearchHistory = async () => {
  try {
    await Taro.removeStorage({ key: 'searchHistory' })
  } catch (error) {
    console.error('清空搜索历史失败:', error)
  }
}

// 暴露方法给父组件
defineExpose({
  getSearchHistory,
  clearSearchHistory,
  focus: () => {
    // 在小程序中无法直接调用input的focus方法
    // 可以通过设置autoFocus来实现
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.search-bar {
  background: #fff;
}

.search-bar__container {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.search-bar__input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 16px;
}

.search-bar__search-icon {
  color: #999;
  font-size: 16px;
  margin-right: 8px;
}

.search-bar__input {
  flex: 1;
  font-size: 14px;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
  
  &::placeholder {
    color: #999;
  }
}

.search-bar__clear-icon {
  color: #999;
  font-size: 16px;
  margin-left: 8px;
  padding: 4px;
}

.search-bar__filter {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  position: relative;
  
  &--active {
    border-color: @primary-color;
    color: @primary-color;
  }
}

.search-bar__filter-text {
  font-size: 12px;
}

.search-bar__filter-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background: @primary-color;
  border-radius: 50%;
}

.search-bar__scan {
  padding: 8px;
  color: #666;
  font-size: 18px;
}

.search-bar__suggestions {
  background: #fff;
  border-top: 1px solid #f0f0f0;
  max-height: 200px;
  overflow-y: auto;
}

.search-bar__suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f8f8f8;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #f8f8f8;
  }
}

.search-bar__suggestion-icon {
  color: #999;
  font-size: 14px;
  margin-right: 12px;
}

.search-bar__suggestion-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.search-bar__hot-search {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.search-bar__hot-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.search-bar__hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search-bar__hot-tag {
  padding: 6px 12px;
  background: #f8f8f8;
  color: #666;
  font-size: 12px;
  border-radius: 12px;
  
  &:active {
    background: #e8e8e8;
  }
}
</style>
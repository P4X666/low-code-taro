<!--
  购物车页面组件
  功能：展示购物车商品，支持选择、编辑、结算等功能
  包含空购物车状态和商品列表状态
-->
<template>
  <view class="cart-page">
    <!-- 顶部导航 -->
    <nut-navbar 
      :title="'购物车'" 
      :left-show="false"
      :right-show="true"
    >
      <template #right>
        <view class="cart-page__nav-right" @click="toggleEditMode">
          {{ isEditMode ? '完成' : '编辑' }}
        </view>
      </template>
    </nut-navbar>

    <!-- 购物车内容 -->
    <view class="cart-page__content">
      <!-- 空购物车状态 -->
      <view v-if="cartItems.length === 0" class="cart-page__empty">
        <image 
          class="cart-page__empty-image" 
          src="/static/images/empty-cart.png" 
          mode="aspectFit"
        />
        <text class="cart-page__empty-text">购物车空空如也</text>
        <nut-button 
          type="primary" 
          class="cart-page__empty-button"
          @click="goToHome"
        >
          去逛逛
        </nut-button>
      </view>

      <!-- 购物车商品列表 -->
      <view v-else class="cart-page__list">
        <!-- 全选区域 -->
        <view class="cart-page__select-all">
          <nut-checkbox 
            v-model="isAllSelected"
            @change="handleSelectAll"
          >
            全选
          </nut-checkbox>
          <text class="cart-page__select-count">
            已选择 {{ selectedCount }} 件商品
          </text>
        </view>

        <!-- 商品列表 -->
        <view class="cart-page__items">
          <view 
            v-for="item in cartItems" 
            :key="item.id"
            class="cart-item"
          >
            <!-- 选择框 -->
            <view class="cart-item__checkbox">
              <nut-checkbox 
                v-model="item.selected"
                @change="handleItemSelect(item)"
              />
            </view>

            <!-- 商品信息 -->
            <view class="cart-item__content">
              <!-- 商品图片 -->
              <image 
                class="cart-item__image" 
                :src="item.image" 
                mode="aspectFill"
                @click="goToProduct(item.productId)"
              />

              <!-- 商品详情 -->
              <view class="cart-item__info">
                <text 
                  class="cart-item__title"
                  @click="goToProduct(item.productId)"
                >
                  {{ item.title }}
                </text>
                
                <view class="cart-item__specs">
                  <text 
                    v-for="spec in item.specs" 
                    :key="spec.name"
                    class="cart-item__spec"
                  >
                    {{ spec.name }}: {{ spec.value }}
                  </text>
                </view>

                <!-- 价格和数量 -->
                <view class="cart-item__bottom">
                  <view class="cart-item__price">
                    <text class="price">{{ formatPrice(item.price) }}</text>
                    <text 
                      v-if="item.originalPrice && item.originalPrice > item.price"
                      class="price price--original"
                    >
                      {{ formatPrice(item.originalPrice) }}
                    </text>
                  </view>

                  <!-- 数量控制 -->
                  <view class="cart-item__quantity">
                    <nut-inputnumber
                      v-model="item.quantity"
                      :min="1"
                      :max="item.stock"
                      @change="handleQuantityChange(item, $event)"
                    />
                  </view>
                </view>

                <!-- 库存提示 -->
                <view 
                  v-if="item.stock <= 10 && item.stock > 0"
                  class="cart-item__stock-tip"
                >
                  仅剩 {{ item.stock }} 件
                </view>
                
                <!-- 缺货提示 -->
                <view 
                  v-if="item.stock === 0"
                  class="cart-item__out-stock"
                >
                  商品缺货
                </view>
              </view>

              <!-- 删除按钮 -->
              <view 
                v-if="isEditMode"
                class="cart-item__delete"
                @click="handleDeleteItem(item)"
              >
                <nut-icon name="del" size="20" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view v-if="cartItems.length > 0" class="cart-page__footer">
      <view class="cart-footer">
        <view class="cart-footer__left">
          <nut-checkbox 
            v-model="isAllSelected"
            @change="handleSelectAll"
          >
            全选
          </nut-checkbox>
        </view>

        <view class="cart-footer__right">
          <view v-if="!isEditMode" class="cart-footer__price">
            <text class="cart-footer__price-label">合计:</text>
            <text class="cart-footer__price-value price">
              {{ formatPrice(totalPrice) }}
            </text>
          </view>

          <nut-button 
            type="primary"
            class="cart-footer__button"
            :disabled="selectedCount === 0"
            @click="handleAction"
          >
            {{ isEditMode ? `删除(${selectedCount})` : `结算(${selectedCount})` }}
          </nut-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useCartStore } from '@/stores'
import { formatPrice } from '@/utils'
import type { CartItem } from '@/stores'

// 购物车状态管理
const cartStore = useCartStore()

// 响应式数据
const isEditMode = ref(false)

// 计算属性
const cartItems = computed(() => cartStore.items)
const selectedCount = computed(() => cartStore.selectedCount)
const totalPrice = computed(() => cartStore.totalPrice)
const isAllSelected = computed({
  get: () => cartStore.isAllSelected,
  set: (value: boolean) => {
    // 通过 store 方法处理全选逻辑
  }
})

/**
 * 切换编辑模式
 */
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

/**
 * 处理全选
 */
const handleSelectAll = (checked: boolean) => {
  cartStore.selectAll(checked)
}

/**
 * 处理单个商品选择
 */
const handleItemSelect = (item: CartItem) => {
  cartStore.toggleItemSelect(item.id)
}

/**
 * 处理数量变化
 */
const handleQuantityChange = (item: CartItem, quantity: number) => {
  cartStore.updateQuantity(item.id, quantity)
}

/**
 * 删除商品
 */
const handleDeleteItem = (item: CartItem) => {
  Taro.showModal({
    title: '确认删除',
    content: '确定要删除这件商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartStore.removeItem(item.id)
      }
    }
  })
}

/**
 * 处理底部按钮操作
 */
const handleAction = () => {
  if (isEditMode.value) {
    // 删除选中商品
    const selectedItems = cartItems.value.filter(item => item.selected)
    if (selectedItems.length === 0) {
      Taro.showToast({
        title: '请选择要删除的商品',
        icon: 'none'
      })
      return
    }

    Taro.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedItems.length} 件商品吗？`,
      success: (res) => {
        if (res.confirm) {
          selectedItems.forEach(item => {
            cartStore.removeItem(item.id)
          })
          isEditMode.value = false
        }
      }
    })
  } else {
    // 去结算
    const selectedItems = cartItems.value.filter(item => item.selected)
    if (selectedItems.length === 0) {
      Taro.showToast({
        title: '请选择要结算的商品',
        icon: 'none'
      })
      return
    }

    // 检查库存
    const outOfStockItems = selectedItems.filter(item => item.stock === 0)
    if (outOfStockItems.length > 0) {
      Taro.showToast({
        title: '选中商品中有缺货商品',
        icon: 'none'
      })
      return
    }

    // 跳转到结算页面
    Taro.navigateTo({
      url: '/pages/checkout/index'
    })
  }
}

/**
 * 跳转到首页
 */
const goToHome = () => {
  Taro.switchTab({
    url: '/pages/home/index'
  })
}

/**
 * 跳转到商品详情
 */
const goToProduct = (productId: string) => {
  Taro.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

/**
 * 页面加载时获取购物车数据
 */
onMounted(() => {
  cartStore.loadCartItems()
})
</script>

<style lang="scss">
@import './index.scss';
</style>
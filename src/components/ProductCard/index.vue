<!--
  商品卡片组件
  功能：展示商品基本信息，支持不同布局模式
  参数：product - 商品信息，mode - 展示模式
-->
<template>
  <view 
    :class="[
      'product-card',
      `product-card--${mode}`,
      { 'product-card--disabled': !product.stock }
    ]"
    @tap="handleProductClick"
  >
    <!-- 商品图片 -->
    <view class="product-card__image">
      <image 
        :src="product.image" 
        :alt="product.name"
        class="product-card__img"
        mode="aspectFill"
        lazy-load
      />
      
      <!-- 标签 -->
      <view v-if="showTags && product.tags?.length" class="product-card__tags">
        <text 
          v-for="tag in product.tags.slice(0, 2)" 
          :key="tag"
          class="product-card__tag"
        >
          {{ tag }}
        </text>
      </view>
      
      <!-- 库存不足遮罩 -->
      <view v-if="!product.stock" class="product-card__mask">
        <text class="product-card__mask-text">暂时缺货</text>
      </view>
    </view>
    
    <!-- 商品信息 -->
    <view class="product-card__content">
      <!-- 商品名称 -->
      <view class="product-card__name">
        {{ product.name }}
      </view>
      
      <!-- 商品描述 -->
      <view 
        v-if="showDescription && product.description" 
        class="product-card__desc"
      >
        {{ product.description }}
      </view>
      
      <!-- 价格和销量 -->
      <view class="product-card__info">
        <view class="product-card__price">
          <text class="product-card__price-current">
            ¥{{ formatPrice(product.price) }}
          </text>
          <text 
            v-if="product.originalPrice && product.originalPrice > product.price"
            class="product-card__price-original"
          >
            ¥{{ formatPrice(product.originalPrice) }}
          </text>
        </view>
        
        <view v-if="showSales" class="product-card__sales">
          已售{{ formatNumber(product.sales) }}
        </view>
      </view>
      
      <!-- 评分 -->
      <view v-if="showRating" class="product-card__rating">
        <nut-rate 
          :value="product.rating" 
          readonly 
          size="12"
          active-color="#ff6b35"
        />
        <text class="product-card__rating-text">
          {{ product.rating }}({{ formatNumber(product.commentCount) }})
        </text>
      </view>
    </view>
    
    <!-- 操作按钮 -->
    <view v-if="showActions" class="product-card__actions">
      <nut-button 
        size="small" 
        type="primary"
        :disabled="!product.stock"
        @click.stop="handleAddToCart"
      >
        加入购物车
      </nut-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro from '@tarojs/taro'
import type { Product } from '@/stores'

/**
 * 组件属性定义
 */
interface Props {
  /** 商品信息 */
  product: Product
  /** 展示模式：grid-网格模式，list-列表模式，horizontal-横向模式 */
  mode?: 'grid' | 'list' | 'horizontal'
  /** 是否显示标签 */
  showTags?: boolean
  /** 是否显示描述 */
  showDescription?: boolean
  /** 是否显示销量 */
  showSales?: boolean
  /** 是否显示评分 */
  showRating?: boolean
  /** 是否显示操作按钮 */
  showActions?: boolean
}

/**
 * 组件事件定义
 */
interface Emits {
  /** 点击商品事件 */
  (e: 'click', product: Product): void
  /** 添加到购物车事件 */
  (e: 'add-to-cart', product: Product): void
}

// 接收属性
const props = withDefaults(defineProps<Props>(), {
  mode: 'grid',
  showTags: true,
  showDescription: false,
  showSales: true,
  showRating: false,
  showActions: false
})

// 定义事件
const emit = defineEmits<Emits>()

/**
 * 格式化价格
 * @param price 价格
 * @returns 格式化后的价格字符串
 */
const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

/**
 * 格式化数字（销量、评论数等）
 * @param num 数字
 * @returns 格式化后的数字字符串
 */
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

/**
 * 处理商品点击事件
 */
const handleProductClick = () => {
  emit('click', props.product)
  
  // 默认跳转到商品详情页
  Taro.navigateTo({
    url: `/pages/product/detail?id=${props.product.id}`
  })
}

/**
 * 处理添加到购物车事件
 */
const handleAddToCart = () => {
  if (!props.product.stock) {
    Taro.showToast({
      title: '商品暂时缺货',
      icon: 'none'
    })
    return
  }
  
  emit('add-to-cart', props.product)
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &--disabled {
    opacity: 0.6;
  }
  
  // 网格模式
  &--grid {
    .product-card__image {
      width: 100%;
      height: 200px;
    }
    
    .product-card__content {
      padding: 12px;
    }
    
    .product-card__name {
      font-size: 14px;
      line-height: 1.4;
      height: 40px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  
  // 列表模式
  &--list {
    display: flex;
    padding: 12px;
    
    .product-card__image {
      width: 100px;
      height: 100px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .product-card__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .product-card__name {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
    }
  }
  
  // 横向模式
  &--horizontal {
    display: flex;
    flex-direction: column;
    width: 120px;
    
    .product-card__image {
      width: 100%;
      height: 120px;
    }
    
    .product-card__content {
      padding: 8px;
    }
    
    .product-card__name {
      font-size: 12px;
      line-height: 1.3;
      height: 32px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .product-card__price {
      margin-top: 4px;
    }
    
    .product-card__price-current {
      font-size: 14px;
    }
  }
}

.product-card__image {
  position: relative;
  overflow: hidden;
}

.product-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__tags {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-card__tag {
  background: rgba(255, 107, 53, 0.9);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  line-height: 1;
}

.product-card__mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-card__mask-text {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.product-card__content {
  flex: 1;
}

.product-card__name {
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.product-card__desc {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-card__info {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 8px;
}

.product-card__price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.product-card__price-current {
  color: $primary-color;
  font-size: 16px;
  font-weight: 600;
}

.product-card__price-original {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}

.product-card__sales {
  color: #999;
  font-size: 12px;
}

.product-card__rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.product-card__rating-text {
  color: #666;
  font-size: 12px;
}

.product-card__actions {
  padding: 0 12px 12px;
}
</style>
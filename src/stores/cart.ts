/**
 * 购物车状态管理Store
 * 功能：管理购物车商品的增删改查、选中状态、数量等
 * 遵循Pinia状态管理规范，通过actions修改状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 购物车商品数据类型定义
 */
export interface CartItem {
  id: number
  productId: number
  name: string
  image: string
  price: number
  originalPrice?: number
  quantity: number
  selected: boolean
  skuId?: number
  skuName?: string
  stock: number
  attributes?: Array<{
    name: string
    value: string
  }>
}

/**
 * 购物车统计信息类型定义
 */
export interface CartSummary {
  totalCount: number
  selectedCount: number
  totalPrice: number
  selectedPrice: number
  totalSavings: number
}

export const useCartStore = defineStore('cart', () => {
  // 购物车商品列表
  const items = ref<CartItem[]>([])
  
  // 全选状态
  const selectAll = ref<boolean>(false)

  /**
   * 计算属性：购物车统计信息
   * 返回商品总数、选中数量、总价格等统计数据
   */
  const summary = computed<CartSummary>(() => {
    const totalCount = items.value.reduce((sum, item) => sum + item.quantity, 0)
    const selectedItems = items.value.filter(item => item.selected)
    const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
    const selectedPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalPrice = items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // 计算节省金额
    const totalSavings = selectedItems.reduce((sum, item) => {
      if (item.originalPrice) {
        return sum + ((item.originalPrice - item.price) * item.quantity)
      }
      return sum
    }, 0)

    return {
      totalCount,
      selectedCount,
      totalPrice,
      selectedPrice,
      totalSavings
    }
  })

  /**
   * 计算属性：是否有选中的商品
   */
  const hasSelectedItems = computed(() => {
    return items.value.some(item => item.selected)
  })

  /**
   * 计算属性：选中的商品列表
   */
  const selectedItems = computed(() => {
    return items.value.filter(item => item.selected)
  })

  /**
   * 添加商品到购物车
   * @param product 商品信息
   * @param quantity 数量，默认为1
   * @param skuId SKU ID（可选）
   * @param skuName SKU名称（可选）
   */
  const addToCart = (
    product: Omit<CartItem, 'id' | 'quantity' | 'selected'>,
    quantity: number = 1,
    skuId?: number,
    skuName?: string
  ) => {
    // 检查是否已存在相同商品（包括SKU）
    const existingItemIndex = items.value.findIndex(
      item => item.productId === product.productId && item.skuId === skuId
    )

    if (existingItemIndex > -1) {
      // 如果商品已存在，增加数量
      const existingItem = items.value[existingItemIndex]
      const newQuantity = existingItem.quantity + quantity
      
      // 检查库存
      if (newQuantity <= existingItem.stock) {
        existingItem.quantity = newQuantity
      } else {
        throw new Error('库存不足')
      }
    } else {
      // 如果是新商品，添加到购物车
      const newItem: CartItem = {
        id: Date.now(), // 简单的ID生成，实际项目中应使用更可靠的方式
        ...product,
        quantity,
        selected: true,
        skuId,
        skuName
      }
      items.value.push(newItem)
    }
  }

  /**
   * 从购物车移除商品
   * @param itemId 购物车商品ID
   */
  const removeFromCart = (itemId: number) => {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  /**
   * 更新商品数量
   * @param itemId 购物车商品ID
   * @param quantity 新数量
   */
  const updateQuantity = (itemId: number, quantity: number) => {
    const item = items.value.find(item => item.id === itemId)
    if (item) {
      if (quantity <= 0) {
        // 如果数量为0或负数，移除商品
        removeFromCart(itemId)
      } else if (quantity <= item.stock) {
        // 检查库存限制
        item.quantity = quantity
      } else {
        throw new Error('库存不足')
      }
    }
  }

  /**
   * 切换商品选中状态
   * @param itemId 购物车商品ID
   * @param selected 选中状态，可选，不传则切换当前状态
   */
  const toggleItemSelection = (itemId: number, selected?: boolean) => {
    const item = items.value.find(item => item.id === itemId)
    if (item) {
      item.selected = selected !== undefined ? selected : !item.selected
    }
    
    // 更新全选状态
    updateSelectAllState()
  }

  /**
   * 切换全选状态
   * @param selected 选中状态，可选，不传则切换当前状态
   */
  const toggleSelectAll = (selected?: boolean) => {
    const newSelectAll = selected !== undefined ? selected : !selectAll.value
    selectAll.value = newSelectAll
    
    // 更新所有商品的选中状态
    items.value.forEach(item => {
      item.selected = newSelectAll
    })
  }

  /**
   * 更新全选状态（内部方法）
   * 根据商品选中情况自动更新全选状态
   */
  const updateSelectAllState = () => {
    if (items.value.length === 0) {
      selectAll.value = false
    } else {
      selectAll.value = items.value.every(item => item.selected)
    }
  }

  /**
   * 清空购物车
   */
  const clearCart = () => {
    items.value = []
    selectAll.value = false
  }

  /**
   * 清空选中的商品
   */
  const clearSelectedItems = () => {
    items.value = items.value.filter(item => !item.selected)
    updateSelectAllState()
  }

  /**
   * 检查商品库存
   * @param itemId 购物车商品ID
   * @returns 是否有库存
   */
  const checkStock = (itemId: number): boolean => {
    const item = items.value.find(item => item.id === itemId)
    return item ? item.quantity <= item.stock : false
  }

  /**
   * 批量检查库存
   * @returns 库存不足的商品列表
   */
  const checkAllStock = (): CartItem[] => {
    return items.value.filter(item => item.quantity > item.stock)
  }

  /**
   * 获取购物车商品数量（用于显示角标）
   */
  const getCartBadgeCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  return {
    // 状态
    items,
    selectAll,
    
    // 计算属性
    summary,
    hasSelectedItems,
    selectedItems,
    getCartBadgeCount,
    
    // 方法
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleItemSelection,
    toggleSelectAll,
    clearCart,
    clearSelectedItems,
    checkStock,
    checkAllStock
  }
})
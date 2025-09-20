 /**
 * Pinia Store 统一入口文件
 * 功能：统一导出所有Store，便于管理和使用
 */

// 导出所有Store
export { useCounterStore } from './counter'
export { useCartStore } from './cart'
export { useUserStore } from './user'
export { useProductStore } from './product'

// 导出类型定义
export type { CartItem, CartSummary } from './cart'
export type { UserInfo, Address, OrderStats } from './user'
export type { Product, ProductSpec, Category, SearchFilters, Pagination } from './product'
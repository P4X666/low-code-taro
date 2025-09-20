/**
 * 商品状态管理Store
 * 功能：管理商品列表、分类、搜索、筛选等
 * 遵循Pinia状态管理规范
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'

/**
 * 商品数据类型定义
 */
export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  description?: string
  categoryId: number
  categoryName: string
  sales: number
  stock: number
  rating: number
  commentCount: number
  tags?: string[]
  specs?: ProductSpec[]
  isHot?: boolean
  isNew?: boolean
  isRecommend?: boolean
}

/**
 * 商品规格数据类型定义
 */
export interface ProductSpec {
  name: string
  values: string[]
}

/**
 * 商品分类数据类型定义
 */
export interface Category {
  id: number
  name: string
  icon?: string
  image?: string
  parentId?: number
  children?: Category[]
  sort: number
}

/**
 * 搜索筛选条件类型定义
 */
export interface SearchFilters {
  keyword?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: 'default' | 'price_asc' | 'price_desc' | 'sales' | 'rating'
  tags?: string[]
}

/**
 * 分页数据类型定义
 */
export interface Pagination {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export const useProductStore = defineStore('product', () => {
  // 商品列表
  const productList = ref<Product[]>([])
  
  // 分类列表
  const categoryList = ref<Category[]>([])
  
  // 热门商品
  const hotProducts = ref<Product[]>([])
  
  // 推荐商品
  const recommendProducts = ref<Product[]>([])
  
  // 搜索关键词
  const searchKeyword = ref<string>('')
  
  // 搜索筛选条件
  const searchFilters = ref<SearchFilters>({})
  
  // 分页信息
  const pagination = ref<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true
  })
  
  // 加载状态
  const loading = ref<boolean>(false)

  /**
   * 计算属性：一级分类列表
   */
  const primaryCategories = computed(() => {
    return categoryList.value.filter(category => !category.parentId)
  })

  /**
   * 计算属性：获取指定分类的子分类
   */
  const getSubCategories = computed(() => {
    return (parentId: number) => {
      return categoryList.value.filter(category => category.parentId === parentId)
    }
  })

  /**
   * 计算属性：筛选后的商品列表
   */
  const filteredProducts = computed(() => {
    let products = [...productList.value]
    const filters = searchFilters.value

    // 关键词搜索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      products = products.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword)
      )
    }

    // 分类筛选
    if (filters.categoryId) {
      products = products.filter(product => product.categoryId === filters.categoryId)
    }

    // 价格筛选
    if (filters.minPrice !== undefined) {
      products = products.filter(product => product.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter(product => product.price <= filters.maxPrice!)
    }

    // 标签筛选
    if (filters.tags && filters.tags.length > 0) {
      products = products.filter(product => 
        product.tags?.some(tag => filters.tags!.includes(tag))
      )
    }

    // 排序
    switch (filters.sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        products.sort((a, b) => b.price - a.price)
        break
      case 'sales':
        products.sort((a, b) => b.sales - a.sales)
        break
      case 'rating':
        products.sort((a, b) => b.rating - a.rating)
        break
      default:
        // 默认排序：推荐 > 热门 > 新品 > 其他
        products.sort((a, b) => {
          if (a.isRecommend && !b.isRecommend) return -1
          if (!a.isRecommend && b.isRecommend) return 1
          if (a.isHot && !b.isHot) return -1
          if (!a.isHot && b.isHot) return 1
          if (a.isNew && !b.isNew) return -1
          if (!a.isNew && b.isNew) return 1
          return 0
        })
    }

    return products
  })

  /**
   * 加载分类列表
   */
  const loadCategories = async () => {
    try {
      // TODO: 调用获取分类列表API
      console.log('加载分类列表')
      
      // 模拟数据
      const mockCategories: Category[] = [
        {
          id: 1,
          name: '手机数码',
          icon: 'https://via.placeholder.com/50x50',
          parentId: undefined,
          sort: 1
        },
        {
          id: 2,
          name: '服装鞋包',
          icon: 'https://via.placeholder.com/50x50',
          parentId: undefined,
          sort: 2
        },
        {
          id: 3,
          name: '家居生活',
          icon: 'https://via.placeholder.com/50x50',
          parentId: undefined,
          sort: 3
        },
        {
          id: 11,
          name: '手机',
          parentId: 1,
          sort: 1
        },
        {
          id: 12,
          name: '平板电脑',
          parentId: 1,
          sort: 2
        },
        {
          id: 21,
          name: '男装',
          parentId: 2,
          sort: 1
        },
        {
          id: 22,
          name: '女装',
          parentId: 2,
          sort: 2
        }
      ]
      
      categoryList.value = mockCategories
    } catch (error) {
      console.error('加载分类列表失败:', error)
    }
  }

  /**
   * 加载商品列表
   * @param params 查询参数
   * @param isLoadMore 是否为加载更多
   */
  const loadProducts = async (params: SearchFilters = {}, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        loading.value = true
        pagination.value.page = 1
      }

      // TODO: 调用获取商品列表API
      console.log('加载商品列表:', params, isLoadMore)
      
      // 模拟数据
      const mockProducts: Product[] = Array.from({ length: 10 }, (_, index) => ({
        id: (pagination.value.page - 1) * 10 + index + 1,
        name: `商品名称 ${(pagination.value.page - 1) * 10 + index + 1}`,
        price: Math.floor(Math.random() * 1000) + 100,
        originalPrice: Math.floor(Math.random() * 1500) + 200,
        image: 'https://via.placeholder.com/300x300',
        images: [
          'https://via.placeholder.com/300x300',
          'https://via.placeholder.com/300x300'
        ],
        description: `这是商品 ${(pagination.value.page - 1) * 10 + index + 1} 的详细描述`,
        categoryId: Math.floor(Math.random() * 3) + 1,
        categoryName: ['手机数码', '服装鞋包', '家居生活'][Math.floor(Math.random() * 3)],
        sales: Math.floor(Math.random() * 10000),
        stock: Math.floor(Math.random() * 100) + 10,
        rating: Math.floor(Math.random() * 50) / 10 + 4,
        commentCount: Math.floor(Math.random() * 1000),
        tags: ['热销', '新品', '推荐'].slice(0, Math.floor(Math.random() * 3) + 1),
        isHot: Math.random() > 0.7,
        isNew: Math.random() > 0.8,
        isRecommend: Math.random() > 0.6
      }))
      
      if (isLoadMore) {
        productList.value.push(...mockProducts)
      } else {
        productList.value = mockProducts
      }
      
      // 更新分页信息
      pagination.value.total = 100 // 模拟总数
      pagination.value.hasMore = pagination.value.page * pagination.value.pageSize < pagination.value.total
      
      if (isLoadMore) {
        pagination.value.page++
      }
    } catch (error) {
      console.error('加载商品列表失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载更多商品
   */
  const loadMoreProducts = async () => {
    if (!pagination.value.hasMore || loading.value) return
    
    pagination.value.page++
    await loadProducts(searchFilters.value, true)
  }

  /**
   * 搜索商品
   * @param keyword 搜索关键词
   */
  const searchProducts = async (keyword: string) => {
    searchKeyword.value = keyword
    searchFilters.value = { ...searchFilters.value, keyword }
    await loadProducts(searchFilters.value)
  }

  /**
   * 设置筛选条件
   * @param filters 筛选条件
   */
  const setFilters = async (filters: SearchFilters) => {
    searchFilters.value = { ...searchFilters.value, ...filters }
    await loadProducts(searchFilters.value)
  }

  /**
   * 清空筛选条件
   */
  const clearFilters = async () => {
    searchFilters.value = {}
    searchKeyword.value = ''
    await loadProducts()
  }

  /**
   * 根据ID获取商品详情
   * @param productId 商品ID
   */
  const getProductById = async (productId: number): Promise<Product | null> => {
    try {
      // 先从本地列表查找
      let product = productList.value.find(p => p.id === productId)
      
      if (!product) {
        // TODO: 调用获取商品详情API
        console.log('获取商品详情:', productId)
        
        // 模拟数据
        product = {
          id: productId,
          name: `商品名称 ${productId}`,
          price: Math.floor(Math.random() * 1000) + 100,
          originalPrice: Math.floor(Math.random() * 1500) + 200,
          image: 'https://via.placeholder.com/300x300',
          images: [
            'https://via.placeholder.com/300x300',
            'https://via.placeholder.com/300x300',
            'https://via.placeholder.com/300x300'
          ],
          description: `这是商品 ${productId} 的详细描述，包含了商品的各种特性和优势。`,
          categoryId: Math.floor(Math.random() * 3) + 1,
          categoryName: ['手机数码', '服装鞋包', '家居生活'][Math.floor(Math.random() * 3)],
          sales: Math.floor(Math.random() * 10000),
          stock: Math.floor(Math.random() * 100) + 10,
          rating: Math.floor(Math.random() * 50) / 10 + 4,
          commentCount: Math.floor(Math.random() * 1000),
          tags: ['热销', '新品', '推荐'],
          specs: [
            {
              name: '颜色',
              values: ['红色', '蓝色', '黑色']
            },
            {
              name: '尺寸',
              values: ['S', 'M', 'L', 'XL']
            }
          ],
          isHot: true,
          isNew: false,
          isRecommend: true
        }
      }
      
      return product
    } catch (error) {
      console.error('获取商品详情失败:', error)
      return null
    }
  }

  /**
   * 加载热门商品
   */
  const loadHotProducts = async () => {
    try {
      // TODO: 调用获取热门商品API
      console.log('加载热门商品')
      
      // 模拟数据
      const mockHotProducts: Product[] = Array.from({ length: 6 }, (_, index) => ({
        id: 1000 + index,
        name: `热门商品 ${index + 1}`,
        price: Math.floor(Math.random() * 500) + 50,
        image: 'https://via.placeholder.com/200x200',
        categoryId: Math.floor(Math.random() * 3) + 1,
        categoryName: ['手机数码', '服装鞋包', '家居生活'][Math.floor(Math.random() * 3)],
        sales: Math.floor(Math.random() * 5000) + 1000,
        stock: Math.floor(Math.random() * 50) + 10,
        rating: Math.floor(Math.random() * 20) / 10 + 4,
        commentCount: Math.floor(Math.random() * 500) + 100,
        isHot: true
      }))
      
      hotProducts.value = mockHotProducts
    } catch (error) {
      console.error('加载热门商品失败:', error)
    }
  }

  /**
   * 加载推荐商品
   */
  const loadRecommendProducts = async () => {
    try {
      // TODO: 调用获取推荐商品API
      console.log('加载推荐商品')
      
      // 模拟数据
      const mockRecommendProducts: Product[] = Array.from({ length: 8 }, (_, index) => ({
        id: 2000 + index,
        name: `推荐商品 ${index + 1}`,
        price: Math.floor(Math.random() * 800) + 100,
        originalPrice: Math.floor(Math.random() * 1200) + 200,
        image: 'https://via.placeholder.com/200x200',
        categoryId: Math.floor(Math.random() * 3) + 1,
        categoryName: ['手机数码', '服装鞋包', '家居生活'][Math.floor(Math.random() * 3)],
        sales: Math.floor(Math.random() * 3000),
        stock: Math.floor(Math.random() * 80) + 20,
        rating: Math.floor(Math.random() * 30) / 10 + 4,
        commentCount: Math.floor(Math.random() * 800),
        tags: ['推荐', '优质'],
        isRecommend: true
      }))
      
      recommendProducts.value = mockRecommendProducts
    } catch (error) {
      console.error('加载推荐商品失败:', error)
    }
  }

  return {
    // 状态
    productList,
    categoryList,
    hotProducts,
    recommendProducts,
    searchKeyword,
    searchFilters,
    pagination,
    loading,
    
    // 计算属性
    primaryCategories,
    getSubCategories,
    filteredProducts,
    
    // 方法
    loadCategories,
    loadProducts,
    loadMoreProducts,
    searchProducts,
    setFilters,
    clearFilters,
    getProductById,
    loadHotProducts,
    loadRecommendProducts
  }
})
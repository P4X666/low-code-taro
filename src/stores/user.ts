/**
 * 用户状态管理Store
 * 功能：管理用户信息、登录状态、收货地址等
 * 遵循Pinia状态管理规范
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'

/**
 * 用户信息数据类型定义
 */
export interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone?: string
  email?: string
  gender?: 0 | 1 | 2 // 0: 未知, 1: 男, 2: 女
  birthday?: string
  memberLevel?: string
  points?: number
}

/**
 * 收货地址数据类型定义
 */
export interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  tag?: string // 地址标签：家、公司等
}

/**
 * 订单统计数据类型定义
 */
export interface OrderStats {
  waitingPayment: number // 待付款
  waitingShipment: number // 待发货
  waitingReceive: number // 待收货
  waitingComment: number // 待评价
}

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref<UserInfo | null>(null)
  
  // 登录状态
  const isLoggedIn = ref<boolean>(false)
  
  // 收货地址列表
  const addressList = ref<Address[]>([])
  
  // 订单统计
  const orderStats = ref<OrderStats>({
    waitingPayment: 0,
    waitingShipment: 0,
    waitingReceive: 0,
    waitingComment: 0
  })

  /**
   * 计算属性：是否已完善基本信息
   */
  const isProfileComplete = computed(() => {
    if (!userInfo.value) return false
    return !!(userInfo.value.nickname && userInfo.value.phone)
  })

  /**
   * 计算属性：默认收货地址
   */
  const defaultAddress = computed(() => {
    return addressList.value.find(address => address.isDefault) || null
  })

  /**
   * 计算属性：订单总数
   */
  const totalOrders = computed(() => {
    const stats = orderStats.value
    return stats.waitingPayment + stats.waitingShipment + stats.waitingReceive + stats.waitingComment
  })

  /**
   * 用户登录
   * @param loginData 登录数据
   */
  const login = async (loginData: { code?: string; userInfo?: any }) => {
    try {
      // TODO: 调用登录API
      console.log('用户登录:', loginData)
      
      // 模拟登录成功
      const mockUserInfo: UserInfo = {
        id: 1,
        nickname: loginData.userInfo?.nickName || '用户',
        avatar: loginData.userInfo?.avatarUrl || 'https://via.placeholder.com/100x100',
        memberLevel: '普通会员',
        points: 100
      }
      
      userInfo.value = mockUserInfo
      isLoggedIn.value = true
      
      // 保存登录状态到本地存储
      await Taro.setStorage({
        key: 'userInfo',
        data: mockUserInfo
      })
      
      await Taro.setStorage({
        key: 'isLoggedIn',
        data: true
      })
      
      // 登录成功后加载用户相关数据
      await Promise.all([
        loadAddressList(),
        loadOrderStats()
      ])
      
      return mockUserInfo
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 用户登出
   */
  const logout = async () => {
    try {
      // TODO: 调用登出API
      
      // 清空状态
      userInfo.value = null
      isLoggedIn.value = false
      addressList.value = []
      orderStats.value = {
        waitingPayment: 0,
        waitingShipment: 0,
        waitingReceive: 0,
        waitingComment: 0
      }
      
      // 清除本地存储
      await Taro.removeStorage({ key: 'userInfo' })
      await Taro.removeStorage({ key: 'isLoggedIn' })
      
      Taro.showToast({
        title: '已退出登录',
        icon: 'success'
      })
    } catch (error) {
      console.error('登出失败:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   * @param newUserInfo 新的用户信息
   */
  const updateUserInfo = async (newUserInfo: Partial<UserInfo>) => {
    try {
      // TODO: 调用更新用户信息API
      console.log('更新用户信息:', newUserInfo)
      
      if (userInfo.value) {
        userInfo.value = { ...userInfo.value, ...newUserInfo }
        
        // 更新本地存储
        await Taro.setStorage({
          key: 'userInfo',
          data: userInfo.value
        })
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }

  /**
   * 加载收货地址列表
   */
  const loadAddressList = async () => {
    try {
      // TODO: 调用获取地址列表API
      console.log('加载收货地址列表')
      
      // 模拟数据
      const mockAddresses: Address[] = [
        {
          id: 1,
          name: '张三',
          phone: '13800138000',
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          detail: '科技园南区深南大道10000号',
          isDefault: true,
          tag: '家'
        }
      ]
      
      addressList.value = mockAddresses
    } catch (error) {
      console.error('加载地址列表失败:', error)
    }
  }

  /**
   * 添加收货地址
   * @param address 地址信息
   */
  const addAddress = async (address: Omit<Address, 'id'>) => {
    try {
      // TODO: 调用添加地址API
      console.log('添加收货地址:', address)
      
      const newAddress: Address = {
        id: Date.now(),
        ...address
      }
      
      // 如果设置为默认地址，取消其他地址的默认状态
      if (newAddress.isDefault) {
        addressList.value.forEach(addr => {
          addr.isDefault = false
        })
      }
      
      addressList.value.push(newAddress)
      
      Taro.showToast({
        title: '地址添加成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('添加地址失败:', error)
      throw error
    }
  }

  /**
   * 更新收货地址
   * @param addressId 地址ID
   * @param updates 更新的字段
   */
  const updateAddress = async (addressId: number, updates: Partial<Address>) => {
    try {
      // TODO: 调用更新地址API
      console.log('更新收货地址:', addressId, updates)
      
      const addressIndex = addressList.value.findIndex(addr => addr.id === addressId)
      if (addressIndex > -1) {
        // 如果设置为默认地址，取消其他地址的默认状态
        if (updates.isDefault) {
          addressList.value.forEach(addr => {
            addr.isDefault = false
          })
        }
        
        addressList.value[addressIndex] = { ...addressList.value[addressIndex], ...updates }
        
        Taro.showToast({
          title: '地址更新成功',
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('更新地址失败:', error)
      throw error
    }
  }

  /**
   * 删除收货地址
   * @param addressId 地址ID
   */
  const deleteAddress = async (addressId: number) => {
    try {
      // TODO: 调用删除地址API
      console.log('删除收货地址:', addressId)
      
      const addressIndex = addressList.value.findIndex(addr => addr.id === addressId)
      if (addressIndex > -1) {
        addressList.value.splice(addressIndex, 1)
        
        Taro.showToast({
          title: '地址删除成功',
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('删除地址失败:', error)
      throw error
    }
  }

  /**
   * 加载订单统计数据
   */
  const loadOrderStats = async () => {
    try {
      // TODO: 调用获取订单统计API
      console.log('加载订单统计数据')
      
      // 模拟数据
      orderStats.value = {
        waitingPayment: 2,
        waitingShipment: 1,
        waitingReceive: 3,
        waitingComment: 1
      }
    } catch (error) {
      console.error('加载订单统计失败:', error)
    }
  }

  /**
   * 检查登录状态
   * 从本地存储恢复登录状态
   */
  const checkLoginStatus = async () => {
    try {
      const [storedUserInfo, storedLoginStatus] = await Promise.all([
        Taro.getStorage({ key: 'userInfo' }).catch(() => ({ data: null })),
        Taro.getStorage({ key: 'isLoggedIn' }).catch(() => ({ data: false }))
      ])
      
      if (storedLoginStatus.data && storedUserInfo.data) {
        userInfo.value = storedUserInfo.data
        isLoggedIn.value = true
        
        // 恢复登录状态后加载相关数据
        await Promise.all([
          loadAddressList(),
          loadOrderStats()
        ])
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
  }

  /**
   * 微信授权登录
   */
  const wxLogin = async () => {
    try {
      // 获取微信登录code
      const loginRes = await Taro.login()
      
      // 获取用户信息授权
      const userInfoRes = await Taro.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      // 调用登录接口
      return await login({
        code: loginRes.code,
        userInfo: userInfoRes.userInfo
      })
    } catch (error) {
      console.error('微信登录失败:', error)
      if (error.errMsg?.includes('getUserProfile:fail auth deny')) {
        Taro.showToast({
          title: '需要授权才能登录',
          icon: 'none'
        })
      }
      throw error
    }
  }

  return {
    // 状态
    userInfo,
    isLoggedIn,
    addressList,
    orderStats,
    
    // 计算属性
    isProfileComplete,
    defaultAddress,
    totalOrders,
    
    // 方法
    login,
    logout,
    updateUserInfo,
    loadAddressList,
    addAddress,
    updateAddress,
    deleteAddress,
    loadOrderStats,
    checkLoginStatus,
    wxLogin
  }
})
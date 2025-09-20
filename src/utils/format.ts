/**
 * 格式化工具函数
 * 功能：提供价格、数字、时间、文本等格式化功能
 * 遵循TypeScript类型定义规范
 */

/**
 * 格式化价格
 * @param price 价格数值
 * @param options 格式化选项
 * @returns 格式化后的价格字符串
 */
export interface PriceFormatOptions {
  /** 是否显示货币符号 */
  showSymbol?: boolean
  /** 货币符号 */
  symbol?: string
  /** 小数位数 */
  decimals?: number
  /** 千分位分隔符 */
  separator?: string
}

export const formatPrice = (
  price: number | string,
  options: PriceFormatOptions = {}
): string => {
  const {
    showSymbol = true,
    symbol = '¥',
    decimals = 2,
    separator = ','
  } = options

  // 转换为数字
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice)) {
    return showSymbol ? `${symbol}0.00` : '0.00'
  }

  // 格式化数字
  const formatted = numPrice.toFixed(decimals)
  
  // 添加千分位分隔符
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  
  const result = parts.join('.')
  
  return showSymbol ? `${symbol}${result}` : result
}

/**
 * 格式化数字（销量、评论数等）
 * @param num 数字
 * @param options 格式化选项
 * @returns 格式化后的数字字符串
 */
export interface NumberFormatOptions {
  /** 是否使用简化格式（如1.2k, 1.5万） */
  simplified?: boolean
  /** 小数位数 */
  decimals?: number
}

export const formatNumber = (
  num: number | string,
  options: NumberFormatOptions = {}
): string => {
  const { simplified = true, decimals = 1 } = options
  
  // 转换为数字
  const numValue = typeof num === 'string' ? parseFloat(num) : num
  
  if (isNaN(numValue)) {
    return '0'
  }

  if (!simplified) {
    return numValue.toLocaleString()
  }

  // 简化格式
  if (numValue >= 100000000) {
    return `${(numValue / 100000000).toFixed(decimals)}亿`
  } else if (numValue >= 10000) {
    return `${(numValue / 10000).toFixed(decimals)}万`
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(decimals)}k`
  }
  
  return numValue.toString()
}

/**
 * 格式化时间
 * @param time 时间（时间戳、Date对象或时间字符串）
 * @param format 格式化模板
 * @returns 格式化后的时间字符串
 */
export const formatTime = (
  time: number | Date | string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  let date: Date

  if (typeof time === 'number') {
    // 时间戳（支持秒和毫秒）
    date = new Date(time < 10000000000 ? time * 1000 : time)
  } else if (typeof time === 'string') {
    date = new Date(time)
  } else {
    date = time
  }

  if (isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const formatMap: Record<string, string> = {
    'YYYY': year.toString(),
    'YY': year.toString().slice(-2),
    'MM': month.toString().padStart(2, '0'),
    'M': month.toString(),
    'DD': day.toString().padStart(2, '0'),
    'D': day.toString(),
    'HH': hour.toString().padStart(2, '0'),
    'H': hour.toString(),
    'mm': minute.toString().padStart(2, '0'),
    'm': minute.toString(),
    'ss': second.toString().padStart(2, '0'),
    's': second.toString()
  }

  let result = format
  Object.keys(formatMap).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), formatMap[key])
  })

  return result
}

/**
 * 格式化相对时间（如：刚刚、5分钟前、1小时前）
 * @param time 时间
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (time: number | Date | string): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (isNaN(date.getTime())) {
    return ''
  }

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @param decimals 小数位数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (size: number, decimals: number = 2): string => {
  if (size === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(size) / Math.log(k))

  return `${parseFloat((size / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * 格式化手机号（隐藏中间4位）
 * @param phone 手机号
 * @returns 格式化后的手机号
 */
export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) {
    return phone
  }
  
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

/**
 * 格式化身份证号（隐藏中间部分）
 * @param idCard 身份证号
 * @returns 格式化后的身份证号
 */
export const formatIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 8) {
    return idCard
  }
  
  return `${idCard.slice(0, 4)}${'*'.repeat(idCard.length - 8)}${idCard.slice(-4)}`
}

/**
 * 格式化银行卡号（每4位一组）
 * @param cardNumber 银行卡号
 * @returns 格式化后的银行卡号
 */
export const formatBankCard = (cardNumber: string): string => {
  if (!cardNumber) return ''
  
  // 移除所有非数字字符
  const cleaned = cardNumber.replace(/\D/g, '')
  
  // 每4位添加一个空格
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/**
 * 截断文本并添加省略号
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀（默认为...）
 * @returns 截断后的文本
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (!text || text.length <= maxLength) {
    return text
  }
  
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 格式化地址（省市区+详细地址）
 * @param address 地址对象
 * @returns 格式化后的地址字符串
 */
export interface AddressInfo {
  province?: string
  city?: string
  district?: string
  detail?: string
}

export const formatAddress = (address: AddressInfo): string => {
  const { province = '', city = '', district = '', detail = '' } = address
  
  let result = ''
  
  // 拼接省市区
  if (province) result += province
  if (city && city !== province) result += city
  if (district && district !== city) result += district
  
  // 添加详细地址
  if (detail) result += detail
  
  return result
}

/**
 * 格式化评分（保留一位小数）
 * @param rating 评分
 * @returns 格式化后的评分字符串
 */
export const formatRating = (rating: number): string => {
  if (isNaN(rating)) return '0.0'
  return rating.toFixed(1)
}

/**
 * 格式化百分比
 * @param value 数值（0-1之间或0-100之间）
 * @param isDecimal 是否为小数形式（0-1之间）
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export const formatPercentage = (
  value: number,
  isDecimal: boolean = true,
  decimals: number = 1
): string => {
  if (isNaN(value)) return '0%'
  
  const percentage = isDecimal ? value * 100 : value
  return `${percentage.toFixed(decimals)}%`
}

/**
 * 格式化距离
 * @param distance 距离（米）
 * @returns 格式化后的距离字符串
 */
export const formatDistance = (distance: number): string => {
  if (isNaN(distance) || distance < 0) return ''
  
  if (distance < 1000) {
    return `${Math.round(distance)}m`
  } else {
    return `${(distance / 1000).toFixed(1)}km`
  }
}
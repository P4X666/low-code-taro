/**
 * 通用工具函数
 * 功能：提供防抖、节流、深拷贝、类型判断等常用功能
 * 遵循TypeScript类型定义规范
 */

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let isInvoked = false

  return function (this: any, ...args: Parameters<T>) {
    const callNow = immediate && !isInvoked

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = null
      isInvoked = false
      if (!immediate) {
        func.apply(this, args)
      }
    }, delay)

    if (callNow) {
      isInvoked = true
      func.apply(this, args)
    }
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @param options 选项
 * @returns 节流后的函数
 */
export interface ThrottleOptions {
  /** 是否在开始时执行 */
  leading?: boolean
  /** 是否在结束时执行 */
  trailing?: boolean
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastExecTime = 0
  let lastArgs: Parameters<T> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const currentTime = Date.now()
    
    if (!lastExecTime && !leading) {
      lastExecTime = currentTime
    }

    const remainingTime = delay - (currentTime - lastExecTime)
    lastArgs = args

    if (remainingTime <= 0 || remainingTime > delay) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastExecTime = currentTime
      func.apply(this, args)
      lastArgs = null
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        lastExecTime = leading ? Date.now() : 0
        timeoutId = null
        if (lastArgs) {
          func.apply(this, lastArgs)
          lastArgs = null
        }
      }, remainingTime)
    }
  }
}

/**
 * 深拷贝函数
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID字符串
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成UUID
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 类型判断函数
 */
export const is = {
  /** 判断是否为字符串 */
  string: (value: any): value is string => typeof value === 'string',
  
  /** 判断是否为数字 */
  number: (value: any): value is number => typeof value === 'number' && !isNaN(value),
  
  /** 判断是否为布尔值 */
  boolean: (value: any): value is boolean => typeof value === 'boolean',
  
  /** 判断是否为函数 */
  function: (value: any): value is Function => typeof value === 'function',
  
  /** 判断是否为对象 */
  object: (value: any): value is object => value !== null && typeof value === 'object',
  
  /** 判断是否为数组 */
  array: (value: any): value is any[] => Array.isArray(value),
  
  /** 判断是否为日期 */
  date: (value: any): value is Date => value instanceof Date,
  
  /** 判断是否为正则表达式 */
  regexp: (value: any): value is RegExp => value instanceof RegExp,
  
  /** 判断是否为null */
  null: (value: any): value is null => value === null,
  
  /** 判断是否为undefined */
  undefined: (value: any): value is undefined => value === undefined,
  
  /** 判断是否为null或undefined */
  nullOrUndefined: (value: any): value is null | undefined => value == null,
  
  /** 判断是否为空值（null、undefined、空字符串、空数组、空对象） */
  empty: (value: any): boolean => {
    if (value == null) return true
    if (is.string(value) || is.array(value)) return value.length === 0
    if (is.object(value)) return Object.keys(value).length === 0
    return false
  }
}

/**
 * 数组去重
 * @param array 原数组
 * @param key 对象数组的去重键名
 * @returns 去重后的数组
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!is.array(array)) return []
  
  if (key) {
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }
  
  return [...new Set(array)]
}

/**
 * 数组分组
 * @param array 原数组
 * @param key 分组键名或分组函数
 * @returns 分组后的对象
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K | ((item: T) => string | number)
): Record<string, T[]> {
  if (!is.array(array)) return {}
  
  return array.reduce((groups, item) => {
    const groupKey = is.function(key) ? key(item) : item[key]
    const groupName = String(groupKey)
    
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    
    groups[groupName].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 数组排序
 * @param array 原数组
 * @param key 排序键名或排序函数
 * @param order 排序方向
 * @returns 排序后的数组
 */
export function sortBy<T, K extends keyof T>(
  array: T[],
  key: K | ((item: T) => any),
  order: 'asc' | 'desc' = 'asc'
): T[] {
  if (!is.array(array)) return []
  
  return [...array].sort((a, b) => {
    const valueA = is.function(key) ? key(a) : a[key]
    const valueB = is.function(key) ? key(b) : b[key]
    
    if (valueA < valueB) {
      return order === 'asc' ? -1 : 1
    }
    if (valueA > valueB) {
      return order === 'asc' ? 1 : -1
    }
    return 0
  })
}

/**
 * 对象合并（深度合并）
 * @param target 目标对象
 * @param sources 源对象
 * @returns 合并后的对象
 */
export function merge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target
  
  const source = sources.shift()
  
  if (is.object(target) && is.object(source)) {
    for (const key in source) {
      if (is.object(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        merge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  
  return merge(target, ...sources)
}

/**
 * 获取对象属性值（支持嵌套路径）
 * @param obj 对象
 * @param path 属性路径（如：'user.profile.name'）
 * @param defaultValue 默认值
 * @returns 属性值
 */
export function get<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T {
  if (!is.object(obj) || !is.string(path)) {
    return defaultValue as T
  }
  
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || !Object.prototype.hasOwnProperty.call(result, key)) {
      return defaultValue as T
    }
    result = result[key]
  }
  
  return result as T
}

/**
 * 设置对象属性值（支持嵌套路径）
 * @param obj 对象
 * @param path 属性路径
 * @param value 属性值
 */
export function set(obj: any, path: string, value: any): void {
  if (!is.object(obj) || !is.string(path)) {
    return
  }
  
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!is.object(current[key])) {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
}

/**
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 * @param fn 要重试的函数
 * @param maxRetries 最大重试次数
 * @param delay 重试间隔（毫秒）
 * @returns Promise
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries) {
        await sleep(delay)
      }
    }
  }
  
  throw lastError
}

/**
 * 函数缓存
 * @param fn 要缓存的函数
 * @param keyGenerator 缓存键生成函数
 * @returns 缓存后的函数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * 随机数生成
 * @param min 最小值
 * @param max 最大值
 * @param integer 是否为整数
 * @returns 随机数
 */
export function random(min: number = 0, max: number = 1, integer: boolean = false): number {
  const result = Math.random() * (max - min) + min
  return integer ? Math.floor(result) : result
}

/**
 * 数组随机选择
 * @param array 数组
 * @param count 选择数量
 * @returns 随机选择的元素
 */
export function sample<T>(array: T[], count: number = 1): T | T[] {
  if (!is.array(array) || array.length === 0) {
    return count === 1 ? undefined as any : []
  }
  
  if (count === 1) {
    return array[random(0, array.length, true)]
  }
  
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, array.length))
}
/**
 * 网络请求工具函数
 * 功能：封装Taro的request方法，提供统一的请求处理、错误处理、拦截器等功能
 * 遵循TypeScript类型定义规范
 */
import Taro from '@tarojs/taro'

/**
 * 请求配置接口
 */
export interface RequestConfig {
  /** 请求地址 */
  url: string
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** 请求数据 */
  data?: any
  /** 请求头 */
  header?: Record<string, string>
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否显示加载提示 */
  showLoading?: boolean
  /** 加载提示文本 */
  loadingText?: string
  /** 是否显示错误提示 */
  showError?: boolean
  /** 是否需要token */
  needToken?: boolean
}

/**
 * 响应数据接口
 */
export interface ResponseData<T = any> {
  /** 状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
  /** 是否成功 */
  success: boolean
}

/**
 * 请求拦截器类型
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>

/**
 * 响应拦截器类型
 */
export type ResponseInterceptor = (response: any) => any | Promise<any>

/**
 * 错误拦截器类型
 */
export type ErrorInterceptor = (error: any) => any | Promise<any>

/**
 * HTTP请求类
 */
class HttpRequest {
  /** 基础URL */
  private baseURL: string = ''
  
  /** 默认配置 */
  private defaultConfig: Partial<RequestConfig> = {
    method: 'GET',
    timeout: 10000,
    showLoading: false,
    showError: true,
    needToken: true
  }
  
  /** 请求拦截器列表 */
  private requestInterceptors: RequestInterceptor[] = []
  
  /** 响应拦截器列表 */
  private responseInterceptors: ResponseInterceptor[] = []
  
  /** 错误拦截器列表 */
  private errorInterceptors: ErrorInterceptor[] = []

  /**
   * 构造函数
   * @param baseURL 基础URL
   */
  constructor(baseURL: string = '') {
    this.baseURL = baseURL
    this.setupDefaultInterceptors()
  }

  /**
   * 设置基础URL
   * @param url 基础URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url
  }

  /**
   * 设置默认配置
   * @param config 配置对象
   */
  setDefaultConfig(config: Partial<RequestConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  /**
   * 添加请求拦截器
   * @param interceptor 拦截器函数
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * 添加响应拦截器
   * @param interceptor 拦截器函数
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * 添加错误拦截器
   * @param interceptor 拦截器函数
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  /**
   * 设置默认拦截器
   */
  private setupDefaultInterceptors(): void {
    // 默认请求拦截器
    this.addRequestInterceptor(async (config) => {
      // 添加token
      if (config.needToken) {
        try {
          const tokenRes = await Taro.getStorage({ key: 'token' })
          if (tokenRes.data) {
            config.header = {
              ...config.header,
              'Authorization': `Bearer ${tokenRes.data}`
            }
          }
        } catch (error) {
          console.warn('获取token失败:', error)
        }
      }

      // 添加公共请求头
      config.header = {
        'Content-Type': 'application/json',
        ...config.header
      }

      return config
    })

    // 默认响应拦截器
    this.addResponseInterceptor((response) => {
      const { statusCode, data } = response

      // HTTP状态码检查
      if (statusCode >= 200 && statusCode < 300) {
        return data
      } else {
        throw new Error(`HTTP Error: ${statusCode}`)
      }
    })

    // 默认错误拦截器
    this.addErrorInterceptor((error) => {
      console.error('请求错误:', error)
      
      // 根据错误类型显示不同提示
      let message = '网络请求失败'
      
      if (error.errMsg) {
        if (error.errMsg.includes('timeout')) {
          message = '请求超时，请检查网络连接'
        } else if (error.errMsg.includes('fail')) {
          message = '网络连接失败，请检查网络设置'
        }
      } else if (error.message) {
        message = error.message
      }

      return Promise.reject({ message, error })
    })
  }

  /**
   * 执行请求拦截器
   * @param config 请求配置
   * @returns 处理后的配置
   */
  private async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config

    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig)
    }

    return processedConfig
  }

  /**
   * 执行响应拦截器
   * @param response 响应数据
   * @returns 处理后的响应
   */
  private async executeResponseInterceptors(response: any): Promise<any> {
    let processedResponse = response

    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse)
    }

    return processedResponse
  }

  /**
   * 执行错误拦截器
   * @param error 错误对象
   * @returns 处理后的错误
   */
  private async executeErrorInterceptors(error: any): Promise<any> {
    let processedError = error

    for (const interceptor of this.errorInterceptors) {
      try {
        processedError = await interceptor(processedError)
      } catch (err) {
        processedError = err
      }
    }

    return processedError
  }

  /**
   * 发送请求
   * @param config 请求配置
   * @returns Promise响应
   */
  async request<T = any>(config: RequestConfig): Promise<T> {
    // 合并配置
    const mergedConfig: RequestConfig = {
      ...this.defaultConfig,
      ...config,
      url: this.baseURL + config.url
    }

    try {
      // 执行请求拦截器
      const processedConfig = await this.executeRequestInterceptors(mergedConfig)

      // 显示加载提示
      if (processedConfig.showLoading) {
        Taro.showLoading({
          title: processedConfig.loadingText || '加载中...',
          mask: true
        })
      }

      // 发送请求
      const response = await Taro.request({
        url: processedConfig.url,
        method: processedConfig.method,
        data: processedConfig.data,
        header: processedConfig.header,
        timeout: processedConfig.timeout
      })

      // 隐藏加载提示
      if (processedConfig.showLoading) {
        Taro.hideLoading()
      }

      // 执行响应拦截器
      const processedResponse = await this.executeResponseInterceptors(response)

      return processedResponse
    } catch (error) {
      // 隐藏加载提示
      if (mergedConfig.showLoading) {
        Taro.hideLoading()
      }

      // 执行错误拦截器
      const processedError = await this.executeErrorInterceptors(error)

      // 显示错误提示
      if (mergedConfig.showError && processedError.message) {
        Taro.showToast({
          title: processedError.message,
          icon: 'error',
          duration: 2000
        })
      }

      throw processedError
    }
  }

  /**
   * GET请求
   * @param url 请求地址
   * @param params 查询参数
   * @param config 请求配置
   * @returns Promise响应
   */
  get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    // 处理查询参数
    if (params) {
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString
      }
    }

    return this.request<T>({
      url,
      method: 'GET',
      ...config
    })
  }

  /**
   * POST请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise响应
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  /**
   * PUT请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise响应
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  /**
   * DELETE请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise响应
   */
  delete<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...config
    })
  }

  /**
   * 上传文件
   * @param url 上传地址
   * @param filePath 文件路径
   * @param name 文件对应的key
   * @param formData 额外的表单数据
   * @param config 请求配置
   * @returns Promise响应
   */
  async upload<T = any>(
    url: string,
    filePath: string,
    name: string = 'file',
    formData?: Record<string, any>,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    const mergedConfig = { ...this.defaultConfig, ...config }

    try {
      // 显示加载提示
      if (mergedConfig.showLoading) {
        Taro.showLoading({
          title: mergedConfig.loadingText || '上传中...',
          mask: true
        })
      }

      // 获取token
      let header = mergedConfig.header || {}
      if (mergedConfig.needToken) {
        try {
          const tokenRes = await Taro.getStorage({ key: 'token' })
          if (tokenRes.data) {
            header['Authorization'] = `Bearer ${tokenRes.data}`
          }
        } catch (error) {
          console.warn('获取token失败:', error)
        }
      }

      const response = await Taro.uploadFile({
        url: this.baseURL + url,
        filePath,
        name,
        formData,
        header
      })

      // 隐藏加载提示
      if (mergedConfig.showLoading) {
        Taro.hideLoading()
      }

      // 解析响应数据
      let data = response.data as T
      try {
        data = JSON.parse(data as string)
      } catch (error) {
        // 如果不是JSON格式，保持原样
      }

      return data
    } catch (error) {
      // 隐藏加载提示
      if (mergedConfig.showLoading) {
        Taro.hideLoading()
      }

      // 显示错误提示
      if (mergedConfig.showError) {
        Taro.showToast({
          title: '上传失败',
          icon: 'error'
        })
      }

      throw error
    }
  }
}

// 创建默认实例
const http = new HttpRequest()

// 设置基础URL（可以根据环境变量设置）
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'https://api-dev.example.com' 
  : 'https://api.example.com'

http.setBaseURL(BASE_URL)

// 导出实例和类
export { HttpRequest }
export default http
export default {
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/cart/index',
    'pages/profile/index',
    'pages/search/index',
  ],
  "resolveAlias": {
    "@/*": "/*"
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '电商小程序',
    navigationBarTextStyle: 'black',
    navigationStyle: "custom"
  },
  tabBar: {
    custom: true,
    color: '#666666',
    selectedColor: '#ff6b35',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/category/index',
        text: '分类',
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
      {
        pagePath: 'pages/search/index',
        text: '搜索',
      },
    ]
  },
  sitemapLocation: "sitemap.json",
  "__usePrivacyCheck__": true,
  networkTimeout: {
    "request": 3000,
    "downloadFile": 30000
  },
}

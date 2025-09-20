import { defineConfig} from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import Components from 'unplugin-vue-components/webpack';
import NutUIResolver from '@nutui/auto-import-resolver';
import devConfig from './dev'
import prodConfig from './prod'
import path from 'node:path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig = {
    projectName: 'low-code-taro',
    date: '2025-9-20',
    designWidth(input) {
      // 配置 NutUI 375 尺寸
      if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1) {
        return 375
      }
      // 全局使用 Taro 默认的 750 尺寸
      return 750
    },
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sass: {
      // 默认京东 APP 10.0主题 > @import "@nutui/nutui-taro/dist/styles/variables.scss";
      // 京东科技主题 > @import "@nutui/nutui-taro/dist/styles/variables-jdt.scss";
      // 京东B商城主题 > @import "@nutui/nutui-taro/dist/styles/variables-jdb.scss";
      // 京东企业业务主题 > @import "@nutui/nutui-taro/dist/styles/variables-jddkh.scss";
      data: `@import "@nutui/nutui-taro/dist/styles/variables.scss";`
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'vue3',
    compiler: {
      type: 'webpack5',
      prebundle: { enable: false }
    },
    cache: {
      enable: true // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    alias: {
      '@': path.resolve(__dirname, '..', 'src')
    },
    mini: {
      webpackChain(chain) {
        chain.plugin('unplugin-vue-components').use(Components({
          resolvers: [NutUIResolver({ taro: true })]
        }))
        chain.plugin('mini-css-extract-plugin')
          .use(MiniCssExtractPlugin, [{
            ignoreOrder: true,  // 关键配置：忽略 CSS 顺序检查
            filename: 'css/[name].[hash].wxss',
            chunkFilename: 'css/[name].[chunkhash].wxss'
          }]);
        chain.resolve
          .mainFiles
          .clear() // 清空默认值（可选，若想保留默认值可省略此步）
          .add('index') // 添加 index 作为优先查找的文件
          .add('main'); // 再添加 main

        chain.resolve.extensions
          .add('.vue')
          .add('.ts')
          .add('.tsx');
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        url: {
          enable: true,
          config: {
            limit: 1024 // 设定转换尺寸上限
          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
    },
    h5: {
      webpackChain(chain) {
        chain.plugin('unplugin-vue-components').use(Components({
          resolvers: [NutUIResolver({ taro: true })]
        }))
        chain.resolve
          .mainFiles
          .clear() // 清空默认值（可选，若想保留默认值可省略此步）
          .add('index') // 添加 index 作为优先查找的文件
          .add('main'); // 再添加 main

        chain.resolve.extensions
          .add('.vue')
          .add('.ts')
          .add('.tsx');
        
      },
      esnextModules: ['nutui-taro', 'icons-vue-taro'],
      publicPath: '/',
      staticDirectory: 'static',

      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].wxss',
        chunkFilename: 'css/[name].[chunkhash].wxss'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})

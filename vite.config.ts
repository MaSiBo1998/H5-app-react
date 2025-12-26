import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import postCssPxToRem from 'postcss-pxtorem'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
  ],
  css: {
    postcss: {
      plugins: [
        postCssPxToRem({
          rootValue: 37.5, // 1rem = 37.5px (基准设计稿375px)
          propList: ['*'], // 所有属性都转换
          selectorBlackList: ['html'], // 过滤 html 标签
        })
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('antd-mobile') || id.includes('antd-mobile-icons')) {
              return 'antd-mobile';
            }
            if (id.includes('@fingerprintjs') || id.includes('jsencrypt')) {
              return 'utils';
            }
            // 其他 node_modules 模块打包到 vendor
            return 'vendor';
          }
        }
      }
    }
  }
})

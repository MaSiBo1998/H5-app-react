import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import postCssPxToRem from 'postcss-pxtorem'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  
  return {
    plugins: [
      react(),
      basicSsl(),
      // Gzip 压缩
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
    ],
    esbuild: {
      // 生产环境移除 console 和 debugger
      drop: isProd ? ['console', 'debugger'] : [],
    } as any,
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
    port: 3000,
  },
  build: {
    sourcemap: false, // 禁用 SourceMap，防止源码泄露
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 拆分 react-router 相关库
            if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('@remix-run')) {
              return 'react-router';
            }
            // 拆分 react-dom
            if (id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-dom';
            }
            // 拆分 react 核心
            if (id.includes('/react/') || id.includes('/react.js')) {
              return 'react';
            }
            // 拆分 UI 库
            if (id.includes('antd-mobile-icons')) {
              return 'antd-mobile-icons';
            }
            if (id.includes('antd-mobile')) {
              return 'antd-mobile';
            }
            // 拆分 UI 库依赖
            if (id.includes('@use-gesture') || id.includes('@react-spring')) {
              return 'antd-mobile-deps';
            }
            // 拆分工具库
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
  }
})

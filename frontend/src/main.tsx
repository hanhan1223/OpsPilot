import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './styles/global.css'

/**
 * OpsPilot 前端入口
 * 使用 Ant Design 中文主题，主色 #1677ff
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f0f2f5',
          borderRadius: 8,
          colorText: 'rgba(0,0,0,0.88)',
          fontSize: 14,
        },
        components: {
          Card: {
            colorBgContainer: '#ffffff',
            borderRadiusLG: 12,
          },
          Table: {
            headerBg: '#fafafa',
            borderColor: '#f0f0f0',
          },
          Button: {
            primaryShadow: '0 2px 0 rgba(5,145,255,0.1)',
          },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)

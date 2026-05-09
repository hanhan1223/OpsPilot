import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'

/**
 * 路由懒加载 - 按需加载各页面模块
 */
const Login = lazy(() => import('@/views/Login'))
const MainLayout = lazy(() => import('@/layouts/MainLayout'))
const Dashboard = lazy(() => import('@/views/Dashboard'))
const Deploy = lazy(() => import('@/views/Deploy'))
const ProjectList = lazy(() => import('@/views/ProjectList'))
const ProjectDetail = lazy(() => import('@/views/ProjectDetail'))
const AIAnalysis = lazy(() => import('@/views/ai/AIAnalysis'))
const AIConfig = lazy(() => import('@/views/ai/AIConfig'))
const AIHistory = lazy(() => import('@/views/ai/AIHistory'))

/**
 * 路由守卫 - 检查登录状态
 * 若 localStorage 中无 opspilot_token 则跳转至登录页
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('opspilot_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

/**
 * 全局 loading 骨架，用于 Suspense fallback
 */
function PageLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="加载中..." />
    </div>
  )
}

/**
 * 应用根组件 - 定义路由结构
 *
 * 路由说明：
 *   /login          -> 登录页（无需鉴权）
 *   /               -> 主布局（需鉴权）
 *     /dashboard    -> 仪表盘
 *     /deploy       -> 部署管理
 *     /projects     -> 项目列表
 *     /projects/:id -> 项目详情
 *     /ai/analysis  -> AI 分析
 *     /ai/config    -> AI 配置
 *     /ai/history   -> AI 历史
 *   /*              -> 重定向到 /dashboard
 */
export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* 登录页 - 不需要鉴权 */}
        <Route path="/login" element={<Login />} />

        {/* 主布局 - 需要鉴权 */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="deploy" element={<Deploy />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="ai/analysis" element={<AIAnalysis />} />
          <Route path="ai/config" element={<AIConfig />} />
          <Route path="ai/history" element={<AIHistory />} />
        </Route>

        {/* 兜底路由 - 未匹配路径重定向到仪表盘 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

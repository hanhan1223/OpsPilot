import React, { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import ProLayout, { PageContainer } from '@ant-design/pro-layout'
import { Dropdown, Avatar, Space, Typography } from 'antd'
import {
  DashboardOutlined,
  CloudUploadOutlined,
  FolderOutlined,
  RobotOutlined,
  ExperimentOutlined,
  SettingOutlined,
  HistoryOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '@/stores/authStore'

const { Text } = Typography

/**
 * Menu route configuration for the OpsPilot sidebar.
 * Each entry maps a path to its display label and icon.
 */
const menuRoutes = {
  route: {
    path: '/',
    routes: [
      { path: '/dashboard', name: '仪表盘', icon: <DashboardOutlined /> },
      { path: '/deploy', name: '部署', icon: <CloudUploadOutlined /> },
      { path: '/projects', name: '项目管理', icon: <FolderOutlined /> },
      {
        path: '/ai',
        name: 'AI 功能',
        icon: <RobotOutlined />,
        routes: [
          { path: '/ai/analysis', name: 'AI 分析', icon: <ExperimentOutlined /> },
          { path: '/ai/config', name: '模型配置', icon: <SettingOutlined /> },
          { path: '/ai/history', name: '分析历史', icon: <HistoryOutlined /> },
        ],
      },
    ],
  },
}

const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  /** Dropdown menu items shown in the header user area. */
  const userMenuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: () => logout(),
      },
    ],
    [logout],
  )

  /** Header right-side content: user avatar + dropdown. */
  const headerRightContent = (
    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
      <Space style={{ cursor: 'pointer', padding: '0 16px' }}>
        <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
        <Text style={{ color: 'rgba(0,0,0,0.88)', maxWidth: 120 }} ellipsis>
          {user?.username || 'Admin'}
        </Text>
      </Space>
    </Dropdown>
  )

  return (
    <ProLayout
      title="OpsPilot"
      logo={<RobotOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
      layout="mix"
      fixSiderbar
      fixedHeader
      collapsed={collapsed}
      onCollapse={setCollapsed}
      location={{ pathname: location.pathname }}
      route={menuRoutes.route}
      token={{
        header: {
          colorBgHeader: '#ffffff',
          colorHeaderTitle: 'rgba(0,0,0,0.88)',
          colorTextMenu: 'rgba(0,0,0,0.65)',
          colorTextMenuSecondary: 'rgba(0,0,0,0.45)',
          colorTextMenuSelected: '#1677ff',
          colorBgMenuItemSelected: '#e6f4ff',
          colorTextMenuActive: '#1677ff',
          colorTextRightActionsItem: 'rgba(0,0,0,0.65)',
        },
        sider: {
          colorMenuBackground: '#ffffff',
          colorMenuItemDivider: '#f0f0f0',
          colorTextMenu: 'rgba(0,0,0,0.65)',
          colorTextMenuSelected: '#1677ff',
          colorBgMenuItemSelected: '#e6f4ff',
          colorTextMenuActive: '#1677ff',
          colorTextMenuItemHover: '#1677ff',
          colorBgMenuItemHover: '#f5f5f5',
        },
      }}
      menuItemRender={(item, dom) => (
        <div onClick={() => item.path && navigate(item.path)}>{dom}</div>
      )}
      subMenuItemRender={(_item, dom) => dom}
      actionsRender={() => [headerRightContent]}
      itemRender={(route, _params, routes) => {
        const isLast = route.path === routes[routes.length - 1]?.path
        return isLast ? (
          <span>{route.breadcrumbName}</span>
        ) : (
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => route.path && navigate(route.path)}
          >
            {route.breadcrumbName}
          </span>
        )
      }}
      style={{ minHeight: '100vh' }}
    >
      <PageContainer
        header={{
          title: undefined,
          breadcrumb: {},
        }}
        style={{ padding: 0 }}
      >
        <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 56px - 48px)' }}>
          <Outlet />
        </div>
      </PageContainer>
    </ProLayout>
  )
}

export default MainLayout

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Tag, Button, Input, Select, Space, Popconfirm, message } from 'antd'
import {
  SearchOutlined,
  FolderOutlined,
  DeleteOutlined,
  RightOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useProjectStore } from '@/stores/projectStore'

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  running: { color: 'green', label: '运行中' },
  stopped: { color: 'default', label: '已停止' },
  error: { color: 'red', label: '异常' },
  pending: { color: 'orange', label: '等待中' },
  building: { color: 'blue', label: '构建中' },
}

const FRAMEWORK_COLORS: Record<string, string> = {
  react: 'blue', vue: 'green', node: 'cyan', python: 'gold',
  django: 'gold', go: 'geekblue', docker: 'purple', java: 'magenta', rust: 'red',
}

const ProjectList = () => {
  const navigate = useNavigate()
  const { projects, total, loading, fetchProjects, removeProject } = useProjectStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    fetchProjects({ page, page_size: pageSize, status: statusFilter })
  }, [page, statusFilter])

  const handleSearch = () => {
    setPage(1)
    fetchProjects({ page: 1, page_size: pageSize, status: statusFilter })
  }

  const handleDelete = async (id: number) => {
    try {
      await removeProject(id)
      message.success('项目已删除')
    } catch {
      message.error('删除失败')
    }
  }

  const filtered = search
    ? projects.filter((p) => p.name.includes(search) || p.repo_url.includes(search))
    : projects

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <a
          onClick={() => navigate(`/projects/${record.id}`)}
          style={{ color: '#38bdf8', fontWeight: 500 }}
        >
          {name}
        </a>
      ),
    },
    {
      title: '仓库地址',
      dataIndex: 'repo_url',
      key: 'repo_url',
      ellipsis: true,
      render: (url: string) => (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: 'rgba(148,163,184,0.7)',
        }}>
          {url}
        </span>
      ),
    },
    {
      title: '框架',
      dataIndex: 'framework',
      key: 'framework',
      width: 100,
      render: (fw: string) => {
        if (!fw) return <span style={{ color: '#8c8c8c' }}>-</span>
        return <Tag color={FRAMEWORK_COLORS[fw.toLowerCase()] || 'default'}>{fw}</Tag>
      },
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 80,
      render: (port: number) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>
          {port || '-'}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => {
        const conf = STATUS_MAP[s] || { color: 'default', label: s }
        return <Tag color={conf.color}>{conf.label}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (t: string) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>
          {t ? new Date(t).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<RightOutlined />}
            onClick={() => navigate(`/projects/${record.id}`)}
            style={{ padding: 0, color: '#38bdf8' }}
          >
            详情
          </Button>
          <Popconfirm
            title="确定删除此项目？"
            description="删除后不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: 0 }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <style>{`
        .project-list-page .content-card {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(56, 189, 248, 0.08) !important;
          border-radius: 12px !important;
        }

        .project-list-page .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .project-list-page .ant-card-head-title {
          color: #e2e8f0;
        }

        .project-list-page .ant-table {
          background: transparent;
        }

        .project-list-page .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.02) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
          color: rgba(148, 163, 184, 0.7);
          font-size: 12px;
          font-weight: 500;
          font-family: 'JetBrains Mono', monospace;
        }

        .project-list-page .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
          color: #cbd5e1;
        }

        .project-list-page .ant-table-tbody > tr:hover > td {
          background: rgba(56, 189, 248, 0.04) !important;
        }

        .project-list-page .ant-input,
        .project-list-page .ant-select-selector {
          background: rgba(15, 23, 42, 0.8) !important;
          border-color: rgba(56, 189, 248, 0.1) !important;
          color: #e2e8f0;
        }

        .project-list-page .ant-input::placeholder {
          color: rgba(148, 163, 184, 0.4);
        }

        .project-list-page .ant-select-selection-item {
          color: #e2e8f0;
        }

        .project-list-page .ant-pagination .ant-pagination-item {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(56, 189, 248, 0.1);
        }

        .project-list-page .ant-pagination .ant-pagination-item a {
          color: rgba(148, 163, 184, 0.8);
        }

        .project-list-page .ant-pagination .ant-pagination-item-active {
          border-color: #1677ff;
        }

        .project-list-page .ant-pagination .ant-pagination-item-active a {
          color: #1677ff;
        }
      `}</style>

      <div className="project-list-page">
        <Card
          className="content-card"
          title={
            <Space>
              <FolderOutlined style={{ color: '#38bdf8' }} />
              项目管理
            </Space>
          }
          bordered={false}
          extra={
            <Space>
              <Input
                placeholder="搜索项目名称..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 200 }}
                allowClear
              />
              <Select
                placeholder="状态筛选"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: 120 }}
                options={[
                  { value: 'running', label: '运行中' },
                  { value: 'stopped', label: '已停止' },
                  { value: 'error', label: '异常' },
                  { value: 'pending', label: '等待中' },
                  { value: 'building', label: '构建中' },
                ]}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchProjects({ page, page_size: pageSize, status: statusFilter })}
              />
            </Space>
          }
        >
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: setPage,
              showTotal: (t) => `共 ${t} 个项目`,
              showSizeChanger: false,
            }}
            size="middle"
            locale={{ emptyText: '暂无项目' }}
          />
        </Card>
      </div>
    </>
  )
}

export default ProjectList

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Button, Descriptions, Progress, Statistic } from 'antd'
import {
  CloudServerOutlined,
  DatabaseOutlined,
  FolderOutlined,
  RocketOutlined,
  ReloadOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useSystemStore } from '@/stores/systemStore'
import { useProjectStore } from '@/stores/projectStore'

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  running: { color: '#52c41a', label: '运行中' },
  stopped: { color: '#8c8c8c', label: '已停止' },
  error: { color: '#ff4d4f', label: '异常' },
  pending: { color: '#fa8c16', label: '等待中' },
  building: { color: '#1677ff', label: '构建中' },
}

const FRAMEWORK_MAP: Record<string, { color: string }> = {
  react: { color: '#1677ff' },
  vue: { color: '#52c41a' },
  node: { color: '#13c2c2' },
  python: { color: '#faad14' },
  django: { color: '#faad14' },
  go: { color: '#2f54eb' },
  docker: { color: '#722ed1' },
  java: { color: '#eb2f96' },
  rust: { color: '#f5222d' },
  static: { color: '#8c8c8c' },
}

function formatUptime(seconds: number): string {
  if (!seconds) return '-'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}天`)
  if (h > 0) parts.push(`${h}小时`)
  if (m > 0) parts.push(`${m}分钟`)
  return parts.join('') || '刚启动'
}

function getProgressColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f'
  if (percent >= 70) return '#fa8c16'
  return '#1677ff'
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { status, loading: sysLoading, fetchStatus } = useSystemStore()
  const { projects, total, loading: projLoading, fetchProjects } = useProjectStore()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    fetchStatus()
    fetchProjects({ page: 1, page_size: 10 })
    const timer = setInterval(() => {
      fetchStatus()
      setNow(new Date())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const statCards = [
    {
      key: 'cpu',
      title: 'CPU 使用率',
      icon: <CloudServerOutlined />,
      accent: '#1677ff',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Progress
            type="dashboard"
            percent={status?.cpu_percent ?? 0}
            size={80}
            strokeColor={getProgressColor(status?.cpu_percent ?? 0)}
            trailColor="rgba(255,255,255,0.06)"
            strokeWidth={8}
            format={(p) => (
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                fontWeight: 600,
                color: getProgressColor(p ?? 0),
              }}>
                {p}%
              </span>
            )}
          />
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 28,
              fontWeight: 700,
              color: getProgressColor(status?.cpu_percent ?? 0),
              lineHeight: 1,
            }}>
              {status?.cpu_percent ?? 0}%
            </div>
            <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', marginTop: 4 }}>
              处理器负载
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'memory',
      title: '内存使用率',
      icon: <DatabaseOutlined />,
      accent: '#7c3aed',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Progress
            type="dashboard"
            percent={status?.memory_percent ?? 0}
            size={80}
            strokeColor={getProgressColor(status?.memory_percent ?? 0)}
            trailColor="rgba(255,255,255,0.06)"
            strokeWidth={8}
            format={(p) => (
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                fontWeight: 600,
                color: getProgressColor(p ?? 0),
              }}>
                {p}%
              </span>
            )}
          />
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 28,
              fontWeight: 700,
              color: getProgressColor(status?.memory_percent ?? 0),
              lineHeight: 1,
            }}>
              {status?.memory_percent ?? 0}%
            </div>
            <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', marginTop: 4 }}>
              内存占用
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'containers',
      title: '运行容器',
      icon: <RocketOutlined />,
      accent: '#52c41a',
      content: (
        <div>
          <Statistic
            value={status?.docker?.running ?? 0}
            valueStyle={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 36,
              fontWeight: 700,
              color: '#52c41a',
              lineHeight: 1,
            }}
          />
          <div style={{
            fontSize: 12,
            color: 'rgba(148,163,184,0.6)',
            marginTop: 8,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {status?.docker?.stopped ?? 0} 已停止 / {status?.docker?.total ?? 0} 总计
          </div>
        </div>
      ),
    },
    {
      key: 'projects',
      title: '项目总数',
      icon: <FolderOutlined />,
      accent: '#13c2c2',
      content: (
        <div>
          <Statistic
            value={total}
            valueStyle={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 36,
              fontWeight: 700,
              color: '#13c2c2',
              lineHeight: 1,
            }}
          />
          <div style={{
            fontSize: 12,
            color: 'rgba(148,163,184,0.6)',
            marginTop: 8,
          }}>
            已注册项目
          </div>
        </div>
      ),
    },
  ]

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{name}</span>
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
        const conf = FRAMEWORK_MAP[fw.toLowerCase()] || { color: '#8c8c8c' }
        return <Tag color={conf.color} style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{fw}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => {
        const conf = STATUS_MAP[s] || { color: '#8c8c8c', label: s }
        return (
          <Tag
            color={conf.color}
            style={{
              margin: 0,
              borderRadius: 4,
              fontSize: 12,
              border: 'none',
            }}
          >
            {conf.label}
          </Tag>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (t: string) => (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: 'rgba(148,163,184,0.6)',
        }}>
          {t ? new Date(t).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          type="link"
          size="small"
          icon={<RightOutlined />}
          onClick={() => navigate(`/projects/${record.id}`)}
          style={{ padding: 0, color: '#38bdf8' }}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <>
      <style>{`
        .dashboard-page {
          font-family: 'Noto Sans SC', -apple-system, sans-serif;
        }

        .stat-card {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(56, 189, 248, 0.08) !important;
          border-radius: 12px !important;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          border-color: rgba(56, 189, 248, 0.15) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          border-radius: 2px 2px 0 0;
        }

        .stat-card .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .stat-card .ant-card-head-title {
          font-size: 13px;
          font-weight: 500;
          color: rgba(148, 163, 184, 0.8);
          letter-spacing: 0.5px;
        }

        .content-card {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(56, 189, 248, 0.08) !important;
          border-radius: 12px !important;
        }

        .content-card .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .content-card .ant-card-head-title {
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
          letter-spacing: 0.5px;
        }

        /* Table overrides for dark theme */
        .dashboard-table .ant-table {
          background: transparent;
        }

        .dashboard-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.02) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
          color: rgba(148, 163, 184, 0.7);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }

        .dashboard-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
          color: #cbd5e1;
        }

        .dashboard-table .ant-table-tbody > tr:hover > td {
          background: rgba(56, 189, 248, 0.04) !important;
        }

        .dashboard-table .ant-table-cell-row-hover {
          background: rgba(56, 189, 248, 0.04) !important;
        }

        .dashboard-table .ant-empty-description {
          color: rgba(148, 163, 184, 0.5);
        }

        /* Descriptions override */
        .sys-info .ant-descriptions-item-label {
          color: rgba(148, 163, 184, 0.6) !important;
          background: rgba(255, 255, 255, 0.02) !important;
          border-color: rgba(255, 255, 255, 0.06) !important;
          font-size: 13px;
        }

        .sys-info .ant-descriptions-item-content {
          color: #e2e8f0 !important;
          background: transparent !important;
          border-color: rgba(255, 255, 255, 0.06) !important;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .sys-info .ant-descriptions-view {
          border-color: rgba(255, 255, 255, 0.06) !important;
        }

        /* Stat card enter animation */
        .stat-card {
          animation: stat-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(16px);
        }
        .stat-card:nth-child(1) { animation-delay: 0.05s; }
        .stat-card:nth-child(2) { animation-delay: 0.1s; }
        .stat-card:nth-child(3) { animation-delay: 0.15s; }
        .stat-card:nth-child(4) { animation-delay: 0.2s; }

        @keyframes stat-enter {
          to { opacity: 1; transform: translateY(0); }
        }

        .content-card {
          animation: content-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
          opacity: 0;
          transform: translateY(16px);
        }

        @keyframes content-enter {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Ant progress dark overrides */
        .stat-card .ant-progress-text {
          color: inherit;
        }
      `}</style>

      <div className="dashboard-page">
        <Row gutter={[16, 16]}>
          {statCards.map((card) => (
            <Col xs={24} sm={12} lg={6} key={card.key}>
              <Card
                className="stat-card"
                title={
                  <span>
                    <span style={{ color: card.accent, marginRight: 8 }}>{card.icon}</span>
                    {card.title}
                  </span>
                }
                loading={sysLoading}
                bordered={false}
              >
                <div style={{ minHeight: 80, display: 'flex', alignItems: 'center' }}>
                  {card.content}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={16}>
            <Card
              className="content-card"
              title="最近项目"
              bordered={false}
              extra={
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate('/projects')}
                  style={{ color: '#38bdf8' }}
                >
                  查看全部 <RightOutlined />
                </Button>
              }
            >
              <Table
                className="dashboard-table"
                dataSource={projects}
                columns={columns}
                rowKey="id"
                loading={projLoading}
                pagination={false}
                size="small"
                locale={{ emptyText: '暂无项目' }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              className="content-card"
              title="系统信息"
              bordered={false}
              extra={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => fetchStatus()}
                  style={{ color: 'rgba(148,163,184,0.6)' }}
                />
              }
            >
              <Descriptions
                className="sys-info"
                column={1}
                size="small"
                labelStyle={{ width: 100 }}
              >
                <Descriptions.Item label="Docker 状态">
                  <span style={{ color: status?.docker?.running ? '#52c41a' : '#8c8c8c' }}>
                    {status?.docker?.running ? '运行中' : '未知'}
                  </span>
                  <span style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: 'rgba(148,163,184,0.5)',
                  }}>
                    ({status?.docker?.running ?? 0} 容器)
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="磁盘使用">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Progress
                      percent={status?.disk_percent ?? 0}
                      size="small"
                      strokeColor={getProgressColor(status?.disk_percent ?? 0)}
                      trailColor="rgba(255,255,255,0.06)"
                      style={{ flex: 1, marginBottom: 0 }}
                      format={(p) => (
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12,
                          color: getProgressColor(p ?? 0),
                        }}>
                          {p}%
                        </span>
                      )}
                    />
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="运行时间">
                  {formatUptime(status?.uptime_seconds ?? 0)}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  <span style={{ fontSize: 12 }}>
                    {now.toLocaleString('zh-CN')}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default Dashboard

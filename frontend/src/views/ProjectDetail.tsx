import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Space, Spin, Row, Col } from 'antd'
import {
  ArrowLeftOutlined,
  GithubOutlined,
  CloudServerOutlined,
  BranchesOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { useProjectStore } from '@/stores/projectStore'

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  running: { color: 'green', label: '运行中' },
  stopped: { color: 'default', label: '已停止' },
  error: { color: 'red', label: '异常' },
  pending: { color: 'orange', label: '等待中' },
  building: { color: 'blue', label: '构建中' },
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProject, loading, fetchProjectDetail } = useProjectStore()

  useEffect(() => {
    if (id) fetchProjectDetail(Number(id))
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!currentProject) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(148,163,184,0.6)' }}>
          项目不存在
        </div>
      </Card>
    )
  }

  const p = currentProject
  const statusConf = STATUS_MAP[p.status] || { color: 'default', label: p.status }

  return (
    <>
      <style>{`
        .detail-page .content-card {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(56, 189, 248, 0.08) !important;
          border-radius: 12px !important;
        }

        .detail-page .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .detail-page .ant-card-head-title {
          color: #e2e8f0;
        }

        .detail-page .ant-descriptions-item-label {
          color: rgba(148, 163, 184, 0.6) !important;
          background: rgba(255, 255, 255, 0.02) !important;
          border-color: rgba(255, 255, 255, 0.06) !important;
        }

        .detail-page .ant-descriptions-item-content {
          color: #e2e8f0 !important;
          background: transparent !important;
          border-color: rgba(255, 255, 255, 0.06) !important;
        }

        .detail-page .ant-descriptions-view {
          border-color: rgba(255, 255, 255, 0.06) !important;
        }

        .log-block {
          background: #1e1e1e;
          border-radius: 8px;
          padding: 16px;
          font-family: 'JetBrains Mono', Consolas, monospace;
          font-size: 12px;
          line-height: 1.6;
          color: #d4d4d4;
          max-height: 500px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .back-btn {
          border-radius: 8px;
          border-color: rgba(56, 189, 248, 0.2);
          color: rgba(148, 163, 184, 0.8);
        }

        .back-btn:hover {
          border-color: #38bdf8 !important;
          color: #38bdf8 !important;
        }
      `}</style>

      <div className="detail-page">
        <div style={{ marginBottom: 16 }}>
          <Button
            className="back-btn"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/projects')}
          >
            返回列表
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              className="content-card"
              title={
                <Space>
                  <CloudServerOutlined style={{ color: '#38bdf8' }} />
                  {p.name}
                  <Tag color={statusConf.color}>{statusConf.label}</Tag>
                </Space>
              }
              bordered={false}
            >
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="仓库地址">
                  <Space>
                    <GithubOutlined style={{ color: 'rgba(148,163,184,0.6)' }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                      {p.repo_url}
                    </span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="分支">
                  <Space>
                    <BranchesOutlined style={{ color: 'rgba(148,163,184,0.6)' }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                      {p.branch || 'main'}
                    </span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="框架">
                  <Tag color="blue">{p.framework || '未知'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="端口">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.port || '-'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="容器名称">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                    {p.container_name || '-'}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="容器 ID">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                    {p.container_id ? p.container_id.substring(0, 12) : '-'}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="部署路径">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                    {p.deploy_path || '-'}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {p.created_at ? new Date(p.created_at).toLocaleString('zh-CN') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              className="content-card"
              title="快速操作"
              bordered={false}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  block
                  onClick={() => navigate('/deploy')}
                  style={{
                    background: 'linear-gradient(135deg, #1e40af, #4f46e5)',
                    border: 'none',
                    borderRadius: 8,
                    height: 40,
                  }}
                >
                  重新部署
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card
          className="content-card"
          title="部署日志"
          bordered={false}
          style={{ marginTop: 16 }}
        >
          <div className="log-block">
            {'暂无部署日志，请在部署页面触发部署'}
          </div>
        </Card>
      </div>
    </>
  )
}

export default ProjectDetail

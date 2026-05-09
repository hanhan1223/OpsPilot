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
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(0,0,0,0.45)' }}>
          项目不存在
        </div>
      </Card>
    )
  }

  const p = currentProject
  const statusConf = STATUS_MAP[p.status] || { color: 'default', label: p.status }

  return (
    <>

      <div className="detail-page">
        <div style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/projects')}
          >
            返回列表
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
                  title={
                <Space>
                  <CloudServerOutlined style={{ color: '#1677ff' }} />
                  {p.name}
                  <Tag color={statusConf.color}>{statusConf.label}</Tag>
                </Space>
              }
              bordered={false}
            >
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="仓库地址">
                  <Space>
                    <GithubOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                      {p.repo_url}
                    </span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="分支">
                  <Space>
                    <BranchesOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
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
          title="部署日志"
          bordered={false}
          style={{ marginTop: 16 }}
        >
          <div style={{
            background: '#1e1e1e',
            borderRadius: 8,
            padding: 16,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            fontSize: 12,
            lineHeight: 1.6,
            color: '#d4d4d4',
            maxHeight: 500,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {'暂无部署日志，请在部署页面触发部署'}
          </div>
        </Card>
      </div>
    </>
  )
}

export default ProjectDetail

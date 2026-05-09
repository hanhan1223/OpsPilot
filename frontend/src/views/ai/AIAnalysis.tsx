import { useEffect, useState } from 'react'
import { Card, Form, Select, Button, message, Space, Spin, Row, Col } from 'antd'
import {
  RobotOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  BugOutlined,
  ToolOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { getProjectList } from '@/api/project'
import { getAIConfigs, analyzeProject } from '@/api/ai'

const REPORT_TYPES = [
  { value: 'log_analysis', label: '日志分析', icon: <FileTextOutlined />, desc: '分析部署日志，找出问题和优化建议' },
  { value: 'fault_diagnosis', label: '故障诊断', icon: <BugOutlined />, desc: '深入分析故障根因，提供诊断步骤' },
  { value: 'repair_suggestion', label: '修复建议', icon: <ToolOutlined />, desc: '提供具体的修复方案和预防措施' },
]

const AIAnalysis = () => {
  const [form] = Form.useForm()
  const [projects, setProjects] = useState<any[]>([])
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [reportType, setReportType] = useState('log_analysis')

  useEffect(() => {
    getProjectList({ page: 1, page_size: 100 }).then((res) => {
      setProjects(res.items || [])
    })
    getAIConfigs().then((res) => {
      setConfigs(res || [])
    })
  }, [])

  const handleAnalyze = async (values: any) => {
    setLoading(true)
    setResult(null)
    try {
      const report = await analyzeProject({
        project_id: values.project_id,
        report_type: reportType,
        config_id: values.config_id || undefined,
      })
      setResult(report.content)
      message.success('分析完成')
    } catch (err: any) {
      message.error(err?.message || '分析失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>

      <div className="ai-analysis-page">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <ExperimentOutlined style={{ color: '#7c3aed' }} />
                  AI 分析
                </Space>
              }
              bordered={false}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleAnalyze}
              >
                <Form.Item
                  label="选择项目"
                  name="project_id"
                  rules={[{ required: true, message: '请选择项目' }]}
                >
                  <Select
                    placeholder="选择要分析的项目"
                    showSearch
                    optionFilterProp="label"
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                  />
                </Form.Item>

                <Form.Item label="分析类型">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {REPORT_TYPES.map((rt) => (
                      <div
                        key={rt.value}
                        onClick={() => setReportType(rt.value)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ color: reportType === rt.value ? '#1677ff' : 'rgba(0,0,0,0.45)' }}>
                            {rt.icon}
                          </span>
                          <span style={{
                            fontWeight: 500,
                            color: reportType === rt.value ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0.65)',
                          }}>
                            {rt.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', paddingLeft: 24 }}>
                          {rt.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </Form.Item>

                <Form.Item label="模型配置" name="config_id">
                  <Select
                    placeholder="使用默认配置"
                    allowClear
                    options={configs.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.provider}/${c.model_name})`,
                    }))}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    style={{ height: 44, borderRadius: 8, fontWeight: 600 }}
                    htmlType="submit"
                    loading={loading}
                    icon={<SendOutlined />}
                    block
                  >
                    {loading ? '分析中...' : '开始分析'}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <RobotOutlined style={{ color: '#52c41a' }} />
                  分析结果
                </Space>
              }
              bordered={false}
            >
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                  <Spin size="large" tip="AI 正在分析中..." />
                </div>
              ) : result ? (
                <div style={{
                  background: '#1e1e1e',
                  borderRadius: 8,
                  padding: 20,
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: '#d4d4d4',
                  maxHeight: 600,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}>{result}</div>
              ) : (
                <div style={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(0,0,0,0.25)',
                  background: '#fafafa',
                  borderRadius: 8,
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <RobotOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
                    选择项目和分析类型，开始 AI 分析
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default AIAnalysis

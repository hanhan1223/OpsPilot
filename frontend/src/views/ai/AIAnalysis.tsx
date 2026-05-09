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
      <style>{`
        .ai-analysis-page .content-card {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(56, 189, 248, 0.08) !important;
          border-radius: 12px !important;
        }

        .ai-analysis-page .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .ai-analysis-page .ant-card-head-title {
          color: #e2e8f0;
        }

        .ai-analysis-page .ant-select-selector,
        .ai-analysis-page .ant-input {
          background: rgba(15, 23, 42, 0.8) !important;
          border-color: rgba(56, 189, 248, 0.1) !important;
          color: #e2e8f0;
        }

        .ai-analysis-page .ant-select-selection-item {
          color: #e2e8f0;
        }

        .ai-analysis-page .ant-form-item-label > label {
          color: rgba(148, 163, 184, 0.8);
        }

        .report-type-card {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(56, 189, 248, 0.1);
          border-radius: 8px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .report-type-card:hover {
          border-color: rgba(56, 189, 248, 0.25);
          background: rgba(15, 23, 42, 0.7);
        }

        .report-type-card.active {
          border-color: #1677ff;
          background: rgba(22, 119, 255, 0.08);
        }

        .result-block {
          background: #1e1e1e;
          border-radius: 8px;
          padding: 20px;
          font-family: 'Noto Sans SC', sans-serif;
          font-size: 14px;
          line-height: 1.8;
          color: #d4d4d4;
          max-height: 600px;
          overflow-y: auto;
          white-space: pre-wrap;
        }

        .analyze-btn {
          height: 44px;
          border-radius: 8px;
          font-weight: 600;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border: none;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
        }

        .analyze-btn:hover {
          background: linear-gradient(135deg, #8b5cf6, #6366f1) !important;
          box-shadow: 0 6px 24px rgba(124, 58, 237, 0.4);
        }
      `}</style>

      <div className="ai-analysis-page">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card
              className="content-card"
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
                        className={`report-type-card ${reportType === rt.value ? 'active' : ''}`}
                        onClick={() => setReportType(rt.value)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ color: reportType === rt.value ? '#1677ff' : 'rgba(148,163,184,0.6)' }}>
                            {rt.icon}
                          </span>
                          <span style={{
                            fontWeight: 500,
                            color: reportType === rt.value ? '#e2e8f0' : 'rgba(148,163,184,0.8)',
                          }}>
                            {rt.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)', paddingLeft: 24 }}>
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
                    className="analyze-btn"
                    type="primary"
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
              className="content-card"
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
                <div className="result-block">{result}</div>
              ) : (
                <div style={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(148, 163, 184, 0.4)',
                  background: '#1e1e1e',
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

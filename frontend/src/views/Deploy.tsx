import { useState } from 'react'
import { Card, Form, Input, Button, Steps, message, Row, Col, Space } from 'antd'
import {
  CloudUploadOutlined,
  GithubOutlined,
  BranchesOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useDeployStore } from '@/stores/deployStore'
import LogViewer from '@/components/LogViewer'

const Deploy = () => {
  const [form] = Form.useForm()
  const { currentDeployId, loading, deploy, reset } = useDeployStore()
  const [currentStep, setCurrentStep] = useState(0)

  const handleDeploy = async (values: { repo_url: string; branch?: string; project_name?: string }) => {
    try {
      setCurrentStep(1)
      await deploy(values)
      message.success('部署已触发')
      setCurrentStep(2)
    } catch (err: any) {
      message.error(err?.message || '部署失败')
      setCurrentStep(0)
    }
  }

  const handleReset = () => {
    reset()
    setCurrentStep(0)
    form.resetFields()
  }

  const stepItems = [
    { title: '配置', icon: <CloudUploadOutlined /> },
    { title: '部署中', icon: currentStep === 1 ? <LoadingOutlined /> : <CheckCircleOutlined /> },
    { title: '完成', icon: currentStep >= 2 ? <CheckCircleOutlined /> : undefined },
  ]

  return (
    <>
      <style>{`
        .deploy-page {
          font-family: 'Noto Sans SC', -apple-system, sans-serif;
        }

        .deploy-card {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(56, 189, 248, 0.08) !important;
          border-radius: 12px !important;
        }

        .deploy-card .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .deploy-card .ant-card-head-title {
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .deploy-form .ant-input,
        .deploy-form .ant-input-affix-wrapper {
          background: rgba(15, 23, 42, 0.8) !important;
          border: 1px solid rgba(56, 189, 248, 0.1) !important;
          border-radius: 8px !important;
          color: #e2e8f0;
        }

        .deploy-form .ant-input:hover,
        .deploy-form .ant-input-affix-wrapper:hover {
          border-color: rgba(56, 189, 248, 0.25) !important;
        }

        .deploy-form .ant-input:focus,
        .deploy-form .ant-input-affix-wrapper-focused {
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1) !important;
        }

        .deploy-form .ant-input::placeholder {
          color: rgba(148, 163, 184, 0.4);
        }

        .deploy-form .ant-input-prefix {
          color: rgba(148, 163, 184, 0.5);
        }

        .deploy-form .ant-form-item-label > label {
          color: rgba(148, 163, 184, 0.8);
          font-size: 13px;
        }

        .deploy-steps .ant-steps-item-title {
          color: rgba(148, 163, 184, 0.8) !important;
        }

        .deploy-steps .ant-steps-item-process .ant-steps-item-title {
          color: #e2e8f0 !important;
        }

        .deploy-steps .ant-steps-item-finish .ant-steps-item-title {
          color: #52c41a !important;
        }

        .deploy-btn {
          height: 44px;
          border-radius: 8px;
          font-weight: 600;
          letter-spacing: 1px;
          background: linear-gradient(135deg, #1e40af, #4f46e5);
          border: none;
          box-shadow: 0 4px 16px rgba(30, 64, 175, 0.3);
        }

        .deploy-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #6366f1) !important;
          box-shadow: 0 6px 24px rgba(30, 64, 175, 0.4);
        }

        .reset-btn {
          border-radius: 8px;
          border-color: rgba(56, 189, 248, 0.2);
          color: rgba(148, 163, 184, 0.8);
        }

        .reset-btn:hover {
          border-color: #38bdf8 !important;
          color: #38bdf8 !important;
        }
      `}</style>

      <div className="deploy-page">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <Card
              className="deploy-card"
              title={
                <Space>
                  <CloudUploadOutlined style={{ color: '#38bdf8' }} />
                  部署项目
                </Space>
              }
              bordered={false}
            >
              <Steps
                className="deploy-steps"
                current={currentStep}
                items={stepItems}
                size="small"
                style={{ marginBottom: 32 }}
              />

              <Form
                className="deploy-form"
                form={form}
                layout="vertical"
                onFinish={handleDeploy}
                disabled={loading || currentStep > 0}
              >
                <Form.Item
                  label="Git 仓库地址"
                  name="repo_url"
                  rules={[{ required: true, message: '请输入仓库地址' }]}
                >
                  <Input
                    prefix={<GithubOutlined />}
                    placeholder="https://github.com/user/repo.git"
                  />
                </Form.Item>

                <Form.Item
                  label="分支"
                  name="branch"
                  initialValue="main"
                >
                  <Input
                    prefix={<BranchesOutlined />}
                    placeholder="main"
                  />
                </Form.Item>

                <Form.Item
                  label="项目名称"
                  name="project_name"
                >
                  <Input
                    prefix={<ProjectOutlined />}
                    placeholder="自动生成（可选）"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Space style={{ width: '100%' }}>
                    <Button
                      className="deploy-btn"
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<CloudUploadOutlined />}
                      style={{ flex: 1 }}
                    >
                      {loading ? '部署中...' : '开始部署'}
                    </Button>
                    {currentStep > 0 && (
                      <Button
                        className="reset-btn"
                        onClick={handleReset}
                      >
                        重新部署
                      </Button>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card
              className="deploy-card"
              title={
                <Space>
                  <span style={{ color: '#52c41a' }}>▮</span>
                  部署日志
                </Space>
              }
              bordered={false}
              bodyStyle={{ padding: 0 }}
            >
              {currentDeployId ? (
                <LogViewer deployId={currentDeployId} />
              ) : (
                <div style={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(148, 163, 184, 0.4)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  background: '#1e1e1e',
                  borderRadius: '0 0 12px 12px',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <ExclamationCircleOutlined style={{ fontSize: 24, marginBottom: 8, display: 'block' }} />
                    等待部署任务...
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

export default Deploy

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
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <Card
              title={
                <Space>
                  <CloudUploadOutlined style={{ color: '#1677ff' }} />
                  部署项目
                </Space>
              }
            >
              <Steps
                current={currentStep}
                items={stepItems}
                size="small"
                style={{ marginBottom: 32 }}
              />

              <Form
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
              title={
                <Space>
                  <span style={{ color: '#52c41a' }}>▮</span>
                  部署日志
                </Space>
              }
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
                  color: 'rgba(0, 0, 0, 0.25)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  background: '#fafafa',
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

import { useEffect, useState } from 'react'
import {
  Card, Button, Modal, Form, Input, Select, Slider, InputNumber,
  Row, Col, Space, Tag, message, Popconfirm, Tooltip,
} from 'antd'
import {
  SettingOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ApiOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons'
import {
  getAIConfigs, createAIConfig, updateAIConfig, deleteAIConfig,
  setDefaultConfig, testConnection, listModels,
} from '@/api/ai'

const PROVIDER_OPTIONS = [
  { value: 'ollama', label: 'Ollama', color: '#52c41a' },
  { value: 'openai', label: 'OpenAI', color: '#1677ff' },
  { value: 'anthropic', label: 'Anthropic', color: '#7c3aed' },
]

const DEFAULT_URLS: Record<string, string> = {
  ollama: 'http://localhost:11434',
  openai: 'https://api.openai.com/v1',
  anthropic: '',
}

const AIConfig = () => {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [models, setModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [form] = Form.useForm()

  const provider = Form.useWatch('provider', form) || 'ollama'

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const data = await getAIConfigs()
      setConfigs(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConfigs() }, [])

  const handleAdd = () => {
    setEditingId(null)
    setTestResult(null)
    setModels([])
    form.resetFields()
    form.setFieldsValue({ provider: 'ollama', base_url: 'http://localhost:11434', temperature: 0.7, max_tokens: 4096 })
    setModalOpen(true)
  }

  const handleEdit = (config: any) => {
    setEditingId(config.id)
    setTestResult(null)
    setModels([])
    form.setFieldsValue(config)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAIConfig(id)
      message.success('已删除')
      fetchConfigs()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultConfig(id)
      message.success('已设为默认')
      fetchConfigs()
    } catch {
      message.error('设置失败')
    }
  }

  const handleTest = async () => {
    const values = form.getFieldsValue()
    setTesting(true)
    setTestResult(null)
    try {
      const res = await testConnection({
        provider: values.provider,
        base_url: values.base_url,
        model_name: values.model_name || '',
        api_key: values.api_key,
      })
      setTestResult(res)
      if (res.success && res.models?.length) {
        setModels(res.models)
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || '测试失败' })
    } finally {
      setTesting(false)
    }
  }

  const handleFetchModels = async () => {
    const values = form.getFieldsValue()
    setLoadingModels(true)
    try {
      const res = await listModels(values.base_url, values.provider)
      setModels(res.models || [])
    } catch {
      message.error('获取模型列表失败')
    } finally {
      setLoadingModels(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await updateAIConfig(editingId, values)
        message.success('更新成功')
      } else {
        await createAIConfig(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchConfigs()
    } catch (err: any) {
      message.error(err?.message || '操作失败')
    }
  }

  return (
    <>
      <style>{`
        .ai-config-page .content-card {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(56, 189, 248, 0.08) !important;
          border-radius: 12px !important;
        }

        .ai-config-page .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .ai-config-page .ant-card-head-title {
          color: #e2e8f0;
        }

        .config-item {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(56, 189, 248, 0.08);
          border-radius: 10px;
          padding: 16px;
          transition: all 0.2s ease;
          height: 100%;
        }

        .config-item:hover {
          border-color: rgba(56, 189, 248, 0.2);
          background: rgba(15, 23, 42, 0.7);
        }

        .config-item.default {
          border-color: rgba(82, 196, 26, 0.3);
        }

        .config-modal .ant-modal-content {
          background: #0f172a;
          border: 1px solid rgba(56, 189, 248, 0.12);
          border-radius: 12px;
        }

        .config-modal .ant-modal-header {
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .config-modal .ant-modal-title {
          color: #e2e8f0;
        }

        .config-modal .ant-modal-close {
          color: rgba(148, 163, 184, 0.6);
        }

        .config-modal .ant-form-item-label > label {
          color: rgba(148, 163, 184, 0.8);
        }

        .config-modal .ant-input,
        .config-modal .ant-input-number,
        .config-modal .ant-select-selector {
          background: rgba(15, 23, 42, 0.8) !important;
          border-color: rgba(56, 189, 248, 0.1) !important;
          color: #e2e8f0;
        }

        .config-modal .ant-input::placeholder {
          color: rgba(148, 163, 184, 0.4);
        }

        .config-modal .ant-select-selection-item {
          color: #e2e8f0;
        }

        .config-modal .ant-input-number-input {
          color: #e2e8f0;
        }

        .test-btn {
          border-radius: 8px;
          border-color: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
        }

        .test-btn:hover {
          border-color: #38bdf8 !important;
          background: rgba(56, 189, 248, 0.06) !important;
        }

        .save-btn {
          height: 40px;
          border-radius: 8px;
          font-weight: 600;
          background: linear-gradient(135deg, #1e40af, #4f46e5);
          border: none;
        }

        .save-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #6366f1) !important;
        }
      `}</style>

      <div className="ai-config-page">
        <Card
          className="content-card"
          title={
            <Space>
              <SettingOutlined style={{ color: '#38bdf8' }} />
              模型配置
            </Space>
          }
          bordered={false}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{
                background: 'linear-gradient(135deg, #1e40af, #4f46e5)',
                border: 'none',
                borderRadius: 8,
              }}
            >
              添加配置
            </Button>
          }
        >
          <Row gutter={[16, 16]}>
            {configs.map((config) => {
              const prov = PROVIDER_OPTIONS.find((p) => p.value === config.provider)
              return (
                <Col xs={24} sm={12} lg={8} key={config.id}>
                  <div className={`config-item ${config.is_default ? 'default' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 15, marginBottom: 4 }}>
                          {config.name}
                        </div>
                        <Tag color={prov?.color || 'default'} style={{ margin: 0 }}>
                          {prov?.label || config.provider}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Tooltip title={config.is_default ? '默认配置' : '设为默认'}>
                          <Button
                            type="text"
                            size="small"
                            icon={config.is_default ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                            onClick={() => handleSetDefault(config.id)}
                          />
                        </Tooltip>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(config)} />
                        <Popconfirm title="确定删除？" onConfirm={() => handleDelete(config.id)}>
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                      {config.model_name}
                    </div>

                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>
                      <span>温度: {config.temperature}</span>
                      <span>最大token: {config.max_tokens}</span>
                    </div>
                  </div>
                </Col>
              )
            })}

            {configs.length === 0 && !loading && (
              <Col span={24}>
                <div style={{
                  textAlign: 'center',
                  padding: 40,
                  color: 'rgba(148,163,184,0.4)',
                }}>
                  暂无配置，点击"添加配置"开始
                </div>
              </Col>
            )}
          </Row>
        </Card>

        <Modal
          className="config-modal"
          title={editingId ? '编辑配置' : '添加配置'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={520}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginTop: 16 }}
          >
            <Form.Item label="配置名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="如: 本地 Ollama" />
            </Form.Item>

            <Form.Item label="提供商" name="provider" rules={[{ required: true }]}>
              <Select
                options={PROVIDER_OPTIONS.map((p) => ({
                  value: p.value,
                  label: (
                    <Space>
                      <span style={{ color: p.color }}>●</span>
                      {p.label}
                    </Space>
                  ),
                }))}
                onChange={(val) => {
                  form.setFieldsValue({ base_url: DEFAULT_URLS[val] || '' })
                }}
              />
            </Form.Item>

            <Form.Item label="API 地址" name="base_url" rules={[{ required: true, message: '请输入 API 地址' }]}>
              <Input placeholder="http://localhost:11434" />
            </Form.Item>

            <Form.Item label="模型名称" name="model_name" rules={[{ required: true, message: '请输入模型名称' }]}>
              <Select
                showSearch
                placeholder="输入或选择模型"
                options={models.map((m) => ({ value: m, label: m }))}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    {provider !== 'anthropic' && (
                      <div style={{ padding: '4px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <Button
                          type="link"
                          size="small"
                          loading={loadingModels}
                          onClick={handleFetchModels}
                          style={{ color: '#38bdf8', padding: 0 }}
                        >
                          获取模型列表
                        </Button>
                      </div>
                    )}
                  </>
                )}
              />
            </Form.Item>

            {provider !== 'ollama' && (
              <Form.Item label="API Key" name="api_key" rules={[{ required: true, message: '请输入 API Key' }]}>
                <Input.Password placeholder="sk-..." />
              </Form.Item>
            )}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="温度" name="temperature">
                  <Slider min={0} max={2} step={0.1} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="最大 Token" name="max_tokens">
                  <InputNumber min={256} max={128000} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Button
                className="test-btn"
                icon={<ApiOutlined />}
                loading={testing}
                onClick={handleTest}
              >
                测试连接
              </Button>
              {testResult && (
                <Tag
                  icon={testResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  color={testResult.success ? 'success' : 'error'}
                >
                  {testResult.message}
                </Tag>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
              <Button className="save-btn" type="primary" htmlType="submit">
                {editingId ? '更新' : '创建'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </>
  )
}

export default AIConfig

import { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Select, Modal, Space } from 'antd'
import {
  HistoryOutlined,
  FileTextOutlined,
  BugOutlined,
  ToolOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { getAIReports } from '@/api/ai'

const REPORT_TYPE_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  log_analysis: { label: '日志分析', color: 'blue', icon: <FileTextOutlined /> },
  fault_diagnosis: { label: '故障诊断', color: 'red', icon: <BugOutlined /> },
  repair_suggestion: { label: '修复建议', color: 'green', icon: <ToolOutlined /> },
}

const AIHistory = () => {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [currentReport, setCurrentReport] = useState<any>(null)

  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await getAIReports({ report_type: typeFilter })
      setReports(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReports() }, [typeFilter])

  const columns = [
    {
      title: '类型',
      dataIndex: 'report_type',
      key: 'report_type',
      width: 130,
      render: (type: string) => {
        const conf = REPORT_TYPE_MAP[type] || { label: type, color: 'default', icon: null }
        return <Tag color={conf.color} icon={conf.icon}>{conf.label}</Tag>
      },
    },
    {
      title: '项目 ID',
      dataIndex: 'project_id',
      key: 'project_id',
      width: 100,
      render: (id: number) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(0,0,0,0.65)' }}>
          #{id || '-'}
        </span>
      ),
    },
    {
      title: '内容预览',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <span style={{ color: 'rgba(0,0,0,0.65)' }}>
          {content?.substring(0, 100)}...
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (t: string) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
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
          icon={<EyeOutlined />}
          onClick={() => { setCurrentReport(record); setDetailOpen(true) }}
          style={{ padding: 0, color: '#1677ff' }}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <>

      <div className="ai-history-page">
        <Card
          title={
            <Space>
              <HistoryOutlined style={{ color: '#1677ff' }} />
              分析历史
            </Space>
          }
          bordered={false}
          extra={
            <Select
              placeholder="类型筛选"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              style={{ width: 140 }}
              options={[
                { value: 'log_analysis', label: '日志分析' },
                { value: 'fault_diagnosis', label: '故障诊断' },
                { value: 'repair_suggestion', label: '修复建议' },
              ]}
            />
          }
        >
          <Table
            dataSource={reports}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条记录` }}
            size="middle"
            locale={{ emptyText: '暂无分析记录' }}
          />
        </Card>

        <Modal
          title={
            currentReport && (
              <Space>
                {REPORT_TYPE_MAP[currentReport.report_type]?.icon}
                {REPORT_TYPE_MAP[currentReport.report_type]?.label || currentReport.report_type}
                <Tag>#{currentReport.project_id}</Tag>
              </Space>
            )
          }
          open={detailOpen}
          onCancel={() => setDetailOpen(false)}
          footer={null}
          width={700}
          destroyOnClose
        >
          {currentReport && (
            <div>
              <div style={{
                fontSize: 12,
                color: 'rgba(0,0,0,0.35)',
                marginBottom: 12,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {currentReport.created_at ? new Date(currentReport.created_at).toLocaleString('zh-CN') : ''}
              </div>
              <div style={{
                background: '#1e1e1e',
                borderRadius: 8,
                padding: 20,
                fontSize: 14,
                lineHeight: 1.8,
                color: '#d4d4d4',
                maxHeight: '60vh',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}>{currentReport.content}</div>
            </div>
          )}
        </Modal>
      </div>
    </>
  )
}

export default AIHistory

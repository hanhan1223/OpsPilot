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
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.7)' }}>
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
        <span style={{ color: 'rgba(148,163,184,0.7)' }}>
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
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>
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
        .ai-history-page .content-card {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(56, 189, 248, 0.08) !important;
          border-radius: 12px !important;
        }

        .ai-history-page .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .ai-history-page .ant-card-head-title {
          color: #e2e8f0;
        }

        .ai-history-page .ant-table {
          background: transparent;
        }

        .ai-history-page .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.02) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
          color: rgba(148, 163, 184, 0.7);
          font-size: 12px;
          font-weight: 500;
          font-family: 'JetBrains Mono', monospace;
        }

        .ai-history-page .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
          color: #cbd5e1;
        }

        .ai-history-page .ant-table-tbody > tr:hover > td {
          background: rgba(56, 189, 248, 0.04) !important;
        }

        .ai-history-page .ant-select-selector {
          background: rgba(15, 23, 42, 0.8) !important;
          border-color: rgba(56, 189, 248, 0.1) !important;
          color: #e2e8f0;
        }

        .ai-history-page .ant-select-selection-item {
          color: #e2e8f0;
        }

        .detail-modal .ant-modal-content {
          background: #0f172a;
          border: 1px solid rgba(56, 189, 248, 0.12);
          border-radius: 12px;
        }

        .detail-modal .ant-modal-header {
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .detail-modal .ant-modal-title {
          color: #e2e8f0;
        }

        .detail-modal .ant-modal-close {
          color: rgba(148, 163, 184, 0.6);
        }

        .detail-content {
          background: #1e1e1e;
          border-radius: 8px;
          padding: 20px;
          font-size: 14px;
          line-height: 1.8;
          color: #d4d4d4;
          max-height: 60vh;
          overflow-y: auto;
          white-space: pre-wrap;
        }

        .ai-history-page .ant-pagination .ant-pagination-item {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(56, 189, 248, 0.1);
        }

        .ai-history-page .ant-pagination .ant-pagination-item a {
          color: rgba(148, 163, 184, 0.8);
        }

        .ai-history-page .ant-pagination .ant-pagination-item-active {
          border-color: #1677ff;
        }

        .ai-history-page .ant-pagination .ant-pagination-item-active a {
          color: #1677ff;
        }
      `}</style>

      <div className="ai-history-page">
        <Card
          className="content-card"
          title={
            <Space>
              <HistoryOutlined style={{ color: '#38bdf8' }} />
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
          className="detail-modal"
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
                color: 'rgba(148,163,184,0.5)',
                marginBottom: 12,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {currentReport.created_at ? new Date(currentReport.created_at).toLocaleString('zh-CN') : ''}
              </div>
              <div className="detail-content">{currentReport.content}</div>
            </div>
          )}
        </Modal>
      </div>
    </>
  )
}

export default AIHistory

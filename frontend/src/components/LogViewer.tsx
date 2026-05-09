import React, { useRef, useEffect, useCallback } from 'react'
import { Tag, Switch, Button, Space, Tooltip, Empty } from 'antd'
import {
  ClearOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { useLogStore } from '@/stores/logStore'

/** Log level to CSS color mapping, matching the Vue version. */
const LOG_LEVEL_COLORS: Record<string, string> = {
  info: '#d4d4d4',
  warn: '#e6a23c',
  error: '#f56c6c',
  success: '#67c23a',
}

/** Background colors for level badges rendered inline. */
const LOG_LEVEL_BG: Record<string, string> = {
  info: 'transparent',
  warn: 'rgba(230,162,60,0.12)',
  error: 'rgba(245,108,108,0.12)',
  success: 'rgba(103,194,58,0.12)',
}

interface LogEntry {
  message: string
  level?: string
  timestamp?: string
}

interface LogViewerProps {
  /** Deploy ID to connect the WebSocket log stream to. */
  deployId: number
}

/**
 * Formats an ISO timestamp into a human-readable time string.
 * Returns the raw string if parsing fails.
 */
function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return ''
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return timestamp
  }
}

/**
 * Returns a short uppercase label for the log level, defaulting to "INFO".
 */
function formatLevel(level?: string): string {
  return (level || 'info').toUpperCase()
}

const LogViewer: React.FC<LogViewerProps> = ({ deployId }) => {
  const { logs, connected, autoScroll, connect, disconnect, clearLogs, setAutoScroll } =
    useLogStore()
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Connect WebSocket on mount, disconnect on unmount or deployId change.
  useEffect(() => {
    connect(deployId)
    return () => {
      disconnect()
    }
  }, [deployId, connect, disconnect])

  // Auto-scroll to bottom when new logs arrive and autoScroll is enabled.
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      const el = logContainerRef.current
      // Use requestAnimationFrame to wait for DOM paint before scrolling.
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight
      })
    }
  }, [logs.length, autoScroll])

  const handleToggleAutoScroll = useCallback(() => {
    setAutoScroll(!autoScroll)
  }, [autoScroll, setAutoScroll])

  const handleClearLogs = useCallback(() => {
    clearLogs()
  }, [clearLogs])

  const handleForceScrollToBottom = useCallback(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [])

  return (
    <div
      style={{
        border: '1px solid #303030',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#1e1e1e',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: '#252526',
          borderBottom: '1px solid #303030',
        }}
      >
        <Space size={12}>
          <Tag
            color={connected ? 'success' : 'error'}
            style={{ margin: 0, borderRadius: 4, fontSize: 12 }}
          >
            {connected ? '已连接' : '未连接'}
          </Tag>
          <span
            style={{
              fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
              fontSize: 12,
              color: '#858585',
            }}
          >
            {logs.length} 行日志
          </span>
        </Space>

        <Space size={8}>
          <Tooltip title={autoScroll ? '停止自动滚动' : '开启自动滚动'}>
            <Space size={4} style={{ cursor: 'pointer' }}>
              <Switch
                size="small"
                checked={autoScroll}
                onChange={handleToggleAutoScroll}
                style={{
                  backgroundColor: autoScroll ? '#1677ff' : '#434343',
                }}
              />
              <span
                style={{
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  fontSize: 12,
                  color: '#858585',
                  userSelect: 'none',
                }}
              >
                自动滚动
              </span>
            </Space>
          </Tooltip>

          {!autoScroll && (
            <Tooltip title="滚动到底部">
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                onClick={handleForceScrollToBottom}
                style={{ color: '#858585' }}
              />
            </Tooltip>
          )}

          <Tooltip title="清空日志">
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={handleClearLogs}
              style={{ color: '#858585' }}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Log content */}
      <div
        ref={logContainerRef}
        style={{
          padding: '12px 16px',
          minHeight: 300,
          maxHeight: 500,
          overflowY: 'auto',
          fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
          fontSize: 13,
          lineHeight: 1.7,
          color: '#d4d4d4',
          background: '#1e1e1e',
        }}
      >
        {logs.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
            }}
          >
            <Empty
              description={
                <span style={{ color: '#6a9955', fontFamily: 'inherit' }}>
                  等待日志输出...
                </span>
              }
              image={null}
            />
          </div>
        ) : (
          logs.map((log: LogEntry, index: number) => {
            const level = log.level || 'info'
            const color = LOG_LEVEL_COLORS[level] || LOG_LEVEL_COLORS.info
            const bgColor = LOG_LEVEL_BG[level] || LOG_LEVEL_BG.info

            return (
              <div
                key={index}
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color,
                }}
              >
                {/* Timestamp */}
                <span style={{ color: '#6a9955', marginRight: 8, userSelect: 'none' }}>
                  [{formatTimestamp(log.timestamp)}]
                </span>
                {/* Level badge */}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: 52,
                    textAlign: 'center',
                    marginRight: 8,
                    padding: '0 4px',
                    borderRadius: 3,
                    backgroundColor: bgColor,
                    color,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    userSelect: 'none',
                  }}
                >
                  {formatLevel(level)}
                </span>
                {/* Message */}
                <span>{log.message}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default LogViewer

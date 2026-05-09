import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      message.error(err?.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

        .login-root {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0e1a;
          overflow: hidden;
          font-family: 'Noto Sans SC', -apple-system, sans-serif;
        }

        /* Animated grid background — network topology vibe */
        .login-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: grid-drift 20s linear infinite;
        }

        @keyframes grid-drift {
          to { background-position: 48px 48px; }
        }

        /* Glow orbs */
        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          pointer-events: none;
        }
        .login-orb--1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #1e40af 0%, transparent 70%);
          top: -15%; left: -10%;
          animation: orb-float 8s ease-in-out infinite;
        }
        .login-orb--2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
          bottom: -10%; right: -5%;
          animation: orb-float 10s ease-in-out infinite reverse;
        }
        .login-orb--3 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, #0891b2 0%, transparent 70%);
          top: 50%; left: 60%;
          animation: orb-float 12s ease-in-out infinite 2s;
        }

        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -20px); }
        }

        /* Card */
        .login-card {
          position: relative;
          width: 420px;
          max-width: 92vw;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(56, 189, 248, 0.12);
          border-radius: 16px;
          padding: 48px 40px 40px;
          box-shadow:
            0 0 0 1px rgba(56, 189, 248, 0.06),
            0 24px 80px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          z-index: 1;
        }

        /* Scan-line overlay on card */
        .login-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(56, 189, 248, 0.015) 2px,
            rgba(56, 189, 248, 0.015) 4px
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Top accent bar */
        .login-card::after {
          content: '';
          position: absolute;
          top: 0; left: 24px; right: 24px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent);
          border-radius: 2px;
          opacity: 0.7;
        }

        .login-card > * {
          position: relative;
          z-index: 1;
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .login-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1e40af, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(30, 64, 175, 0.4);
        }

        .login-logo-icon svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: #e0f2fe;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .login-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          line-height: 1.2;
        }

        .login-subtitle {
          font-size: 14px;
          color: rgba(148, 163, 184, 0.8);
          letter-spacing: 4px;
          font-weight: 300;
          margin: 0;
        }

        /* Status indicator */
        .login-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 16px;
          font-size: 11px;
          color: rgba(52, 211, 153, 0.7);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .login-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Form styling */
        .login-form .ant-input-affix-wrapper {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(56, 189, 248, 0.1);
          border-radius: 10px;
          height: 48px;
          padding: 0 16px;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .login-form .ant-input-affix-wrapper:hover {
          border-color: rgba(56, 189, 248, 0.25);
          background: rgba(15, 23, 42, 0.8);
        }

        .login-form .ant-input-affix-wrapper-focused,
        .login-form .ant-input-affix-wrapper:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
          background: rgba(15, 23, 42, 0.9);
        }

        .login-form .ant-input {
          background: transparent;
          color: #e2e8f0;
          font-size: 14px;
        }

        .login-form .ant-input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }

        .login-form .ant-input-prefix {
          color: rgba(148, 163, 184, 0.6);
          margin-right: 10px;
          font-size: 16px;
        }

        .login-form .ant-form-item {
          margin-bottom: 20px;
        }

        .login-btn {
          width: 100%;
          height: 48px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 2px;
          border: none;
          background: linear-gradient(135deg, #1e40af, #4f46e5);
          color: #e0f2fe;
          box-shadow: 0 4px 20px rgba(30, 64, 175, 0.3);
          transition: all 0.3s ease;
          font-family: 'Noto Sans SC', sans-serif;
        }

        .login-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #6366f1) !important;
          box-shadow: 0 6px 30px rgba(30, 64, 175, 0.5);
          transform: translateY(-1px);
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .login-btn.ant-btn-loading {
          opacity: 0.8;
        }

        /* Footer */
        .login-footer {
          text-align: center;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(56, 189, 248, 0.08);
        }

        .login-footer-text {
          font-size: 11px;
          color: rgba(148, 163, 184, 0.4);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 1px;
        }

        /* Entry animation */
        .login-card {
          animation: card-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes card-enter {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-card {
            padding: 36px 24px 32px;
          }
          .login-title {
            font-size: 24px;
          }
        }

        /* Selection color */
        ::selection {
          background: rgba(56, 189, 248, 0.3);
          color: #e0f2fe;
        }
      `}</style>

      <div className="login-root">
        <div className="login-grid" />
        <div className="login-orb login-orb--1" />
        <div className="login-orb login-orb--2" />
        <div className="login-orb login-orb--3" />

        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="login-title">OpsPilot</h1>
            </div>
            <p className="login-subtitle">智 能 运 维 平 台</p>
            <div className="login-status">
              <span className="login-status-dot" />
              system ready
            </div>
          </div>

          <Form
            className="login-form"
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                className="login-btn"
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                {loading ? '正在登录...' : '登 录'}
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <p className="login-footer-text">OPSPILOT v0.1.0 &middot; SECURE CONNECTION</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login

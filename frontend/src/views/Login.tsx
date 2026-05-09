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
        .login-root {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f5;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
            'Noto Sans SC', sans-serif;
        }

        .login-card {
          width: 420px;
          max-width: 92vw;
          background: #ffffff;
          border-radius: 8px;
          padding: 48px 40px 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          animation: card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(16px);
        }

        @keyframes card-enter {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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
          border-radius: 50%;
          background: #e6f4ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-logo-icon svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: #1677ff;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.88);
          margin: 0;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .login-subtitle {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          font-weight: 400;
          margin: 0;
          letter-spacing: 2px;
        }

        .login-form .ant-form-item {
          margin-bottom: 20px;
        }

        .login-form .ant-input-affix-wrapper {
          border-radius: 6px;
          height: 40px;
        }

        .login-btn {
          width: 100%;
          height: 40px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 500;
        }

        .login-footer {
          text-align: center;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .login-footer-text {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 36px 24px 32px;
          }
          .login-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="login-root">
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
            <p className="login-footer-text">OPSPILOT v0.1.0</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login

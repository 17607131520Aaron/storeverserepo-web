import React from "react";

import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";

import { LockOutlined, UserOutlined, MailOutlined, PhoneOutlined, UserAddOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography, message } from "antd";

import { register as registerApi, login as loginApi, getUserInfoByUsername } from "@/api/user";
import useAuth from "@/hooks/useAuth";

import "./index.scss";

const { Title, Text } = Typography;

interface IRegisterFormValues {
  username: string;
  realName: string;
  password: string;
  confirmPassword: string;
  email?: string;
  phone?: string;
}

const RegisterPage: React.FC = () => {
  const [registerForm] = Form.useForm<IRegisterFormValues>();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as Location & {
    state?: { from?: { pathname?: string } };
  };

  const { login } = useAuth();

  const handleRegisterSubmit = async (values: IRegisterFormValues): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      // 调用注册接口
      await registerApi({
        username: values.username,
        password: values.password,
        realName: values.realName,
        email: values.email,
        phone: values.phone,
      });

      message.success("注册成功！正在自动登录...");

      // 注册成功后自动登录
      const loginResponse = await loginApi({
        username: values.username,
        password: values.password,
      });

      // 通过用户名获取完整的用户信息
      const userInfo = await getUserInfoByUsername(values.username);

      // 计算过期时间（expiresIn 是秒数，转换为毫秒时间戳）
      const expiresAtMs: number = Date.now() + loginResponse.expiresIn * 1000;

      // 保存用户信息和 token 到 useAuth（会自动保存到 IndexedDB）
      const userPayload = {
        id: userInfo.id,
        username: userInfo.username,
        realName: userInfo.realName,
        email: userInfo.email,
        phone: userInfo.phone,
      };
      await login(loginResponse.token, userPayload, expiresAtMs);

      message.success("登录成功！");

      // 跳转到目标页面
      const redirectPath: string = location.state?.from?.pathname ?? "/";
      navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      // 处理错误信息
      const errorMessage = error instanceof Error ? error.message : "注册失败，请稍后重试";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToLogin = (): void => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="register-page">
      <div className="register-page__glow register-page__glow--left" />
      <div className="register-page__glow register-page__glow--right" />

      <div className="register-page__content">
        <div className="register-page__left">
          <div className="register-page__badge">
            <span className="register-page__badge-dot" />
            <span>实时洞察 · 性能可视 · 安全稳定</span>
          </div>

          <div className="register-page__title">不知道叫啥的某系统</div>
          <div className="register-page__subtitle">
            一套为中大型团队设计的统一管理中台，提供条码管理、文档协同、团队权限、系统监控等能力，
            让你的业务像游戏一样顺滑、高效。
          </div>

          <div className="register-page__highlights">
            <span className="register-page__chip">⚡ 实时性能监控</span>
            <span className="register-page__chip">🛡️ 多维安全策略</span>
            <span className="register-page__chip">📊 可视化数据面板</span>
            <span className="register-page__chip">☁️ 云端同步 & 历史留存</span>
          </div>
        </div>

        <div className="register-page__right">
          <div className="register-page__card">
            <div className="register-page__card-header">
              <div>
                <Title className="register-page__card-title" level={4} style={{ color: "#fff" }}>
                  创建新账号
                </Title>
                <Text className="register-page__card-desc">填写信息以注册新账号</Text>
              </div>
              <span className="register-page__card-pill">Beta · 内部环境</span>
            </div>

            {error ? <Alert showIcon style={{ marginBottom: 16 }} title={error} type="error" /> : null}

            <Form<IRegisterFormValues> form={registerForm} layout="vertical" onFinish={handleRegisterSubmit}>
              <Form.Item
                label={<span style={{ color: "#fff" }}>账号</span>}
                name="username"
                rules={[
                  { required: true, message: "请输入账号" },
                  {
                    pattern: /^[a-zA-Z0-9_]{3,20}$/,
                    message: "账号格式不正确：3-20个字符，只能包含字母、数字、下划线",
                  },
                ]}
              >
                <Input
                  autoComplete="username"
                  placeholder="请输入账号（3-20个字符）"
                  prefix={<UserOutlined style={{ color: "#90a4ae" }} />}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#fff" }}>用户名</span>}
                name="realName"
                rules={[
                  { required: true, message: "请输入用户名" },
                  { max: 50, message: "用户名长度不能超过50个字符" },
                ]}
              >
                <Input
                  autoComplete="name"
                  placeholder="请输入真实姓名"
                  prefix={<UserOutlined style={{ color: "#90a4ae" }} />}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#fff" }}>密码</span>}
                name="password"
                rules={[
                  { required: true, message: "请输入密码" },
                  { min: 6, message: "密码长度至少6个字符" },
                ]}
              >
                <Input.Password
                  autoComplete="new-password"
                  placeholder="请输入密码（至少6个字符）"
                  prefix={<LockOutlined style={{ color: "#90a4ae" }} />}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                dependencies={["password"]}
                label={<span style={{ color: "#fff" }}>确认密码</span>}
                name="confirmPassword"
                rules={[
                  { required: true, message: "请确认密码" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  autoComplete="new-password"
                  placeholder="请再次输入密码"
                  prefix={<LockOutlined style={{ color: "#90a4ae" }} />}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#fff" }}>邮箱（可选）</span>}
                name="email"
                rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
              >
                <Input
                  autoComplete="email"
                  placeholder="请输入邮箱地址"
                  prefix={<MailOutlined style={{ color: "#90a4ae" }} />}
                  size="large"
                />
              </Form.Item>

              <Form.Item label={<span style={{ color: "#fff" }}>手机号（可选）</span>} name="phone">
                <Input
                  autoComplete="tel"
                  placeholder="请输入手机号"
                  prefix={<PhoneOutlined style={{ color: "#90a4ae" }} />}
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 8 }}>
                <Button
                  block
                  htmlType="submit"
                  icon={<UserAddOutlined />}
                  loading={submitting}
                  size="large"
                  type="primary"
                >
                  注册账号
                </Button>
              </Form.Item>

              <div className="register-page__footer">
                <span>
                  已有账号？{" "}
                  <a style={{ color: "#90caf9", cursor: "pointer" }} onClick={handleGoToLogin}>
                    立即登录
                  </a>
                </span>
              </div>
            </Form>

            <div className="register-page__footer-bottom">
              <span>© {new Date().getFullYear()} 某不知名系统</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

import React from "react";

import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";

import {
  LockOutlined,
  LoginOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography, Tabs, message } from "antd";

import { login as loginApi, register as registerApi, getUserInfo } from "@/api/user";
import useAuth from "@/hooks/useAuth";

import "./index.scss";

const { Title, Text } = Typography;

interface ILoginFormValues {
  username: string;
  password: string;
}

interface IRegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  phone?: string;
}

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<string>("login");
  const [loginForm] = Form.useForm<ILoginFormValues>();
  const [registerForm] = Form.useForm<IRegisterFormValues>();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as Location & {
    state?: { from?: { pathname?: string } };
  };

  const { login } = useAuth();

  const handleLoginSubmit = async (values: ILoginFormValues): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      // 调用真实的后端登录接口
      const response = await loginApi({
        username: values.username,
        password: values.password,
      });

      // 获取完整的用户信息
      const userInfo = await getUserInfo();

      // 计算过期时间（expiresIn 是秒数，转换为毫秒时间戳）
      const expiresAtMs: number = Date.now() + response.expiresIn * 1000;

      // 保存用户信息和 token 到 useAuth（会自动保存到 IndexedDB）
      const userPayload = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        phone: userInfo.phone,
      };
      await login(response.token, userPayload, expiresAtMs);

      const redirectPath: string = location.state?.from?.pathname ?? "/";
      navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      // 处理错误信息
      const errorMessage = error instanceof Error ? error.message : "登录失败，请稍后重试";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (values: IRegisterFormValues): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      // 调用注册接口
      await registerApi({
        username: values.username,
        password: values.password,
        email: values.email,
        phone: values.phone,
      });

      message.success("注册成功！正在自动登录...");

      // 注册成功后自动登录
      const loginResponse = await loginApi({
        username: values.username,
        password: values.password,
      });

      // 获取完整的用户信息
      const userInfo = await getUserInfo();

      // 计算过期时间（expiresIn 是秒数，转换为毫秒时间戳）
      const expiresAtMs: number = Date.now() + loginResponse.expiresIn * 1000;

      // 保存用户信息和 token 到 useAuth（会自动保存到 IndexedDB）
      const userPayload = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        phone: userInfo.phone,
      };
      await login(loginResponse.token, userPayload, expiresAtMs);

      message.success("登录成功！");

      // 跳转到目标页面
      const redirectPath: string = location.state?.from?.pathname ?? "/";
      navigate(redirectPath, { replace: true });

      // TODO没有服务端的时候使用
      // await new Promise((resolve) => setTimeout(resolve, 600));
      //
      // const mockToken = `mock-token-${Date.now()}`;
      // const userPayload = { username: values.username };
      // const expiresAtMs: number = Date.now() + 2 * 60 * 60 * 1000; // 2 小时过期
      // await login(mockToken, userPayload, expiresAtMs);
      //
      // const redirectPath: string = location.state?.from?.pathname ?? "/";
      // navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      // 处理错误信息
      const errorMessage = error instanceof Error ? error.message : "注册失败，请稍后重试";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__glow login-page__glow--left" />
      <div className="login-page__glow login-page__glow--right" />

      <div className="login-page__content">
        <div className="login-page__left">
          <div className="login-page__badge">
            <span className="login-page__badge-dot" />
            <span>实时洞察 · 性能可视 · 安全稳定</span>
          </div>

          <div className="login-page__title">不知道叫啥的某系统</div>
          <div className="login-page__subtitle">
            一套为中大型团队设计的统一管理中台，提供条码管理、文档协同、团队权限、系统监控等能力，
            让你的业务像游戏一样顺滑、高效。
          </div>

          <div className="login-page__highlights">
            <span className="login-page__chip">⚡ 实时性能监控</span>
            <span className="login-page__chip">🛡️ 多维安全策略</span>
            <span className="login-page__chip">📊 可视化数据面板</span>
            <span className="login-page__chip">☁️ 云端同步 & 历史留存</span>
          </div>
        </div>

        <div className="login-page__right">
          <div className="login-page__card">
            <div className="login-page__card-header">
              <div>
                <Title className="login-page__card-title" level={4} style={{ color: "#fff" }}>
                  欢迎回来，管理员
                </Title>
                <Text className="login-page__card-desc">使用账号登录以进入管理控制台</Text>
              </div>
              <span className="login-page__card-pill">Beta · 内部环境</span>
            </div>

            {error ? <Alert showIcon style={{ marginBottom: 16 }} title={error} type="error" /> : null}

            <Tabs
              activeKey={activeTab}
              items={[
                {
                  key: "login",
                  label: "登录",
                  children: (
                    <Form<ILoginFormValues>
                      form={loginForm}
                      initialValues={{ username: "admin" }}
                      layout="vertical"
                      onFinish={handleLoginSubmit}
                    >
                      <Form.Item
                        label={<span style={{ color: "#fff" }}>账号</span>}
                        name="username"
                        rules={[{ required: true, message: "请输入账号" }]}
                      >
                        <Input
                          autoComplete="username"
                          placeholder="请输入账号"
                          prefix={<UserOutlined style={{ color: "#90a4ae" }} />}
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: "#fff" }}>密码</span>}
                        name="password"
                        rules={[{ required: true, message: "请输入密码" }]}
                      >
                        <Input.Password
                          autoComplete="current-password"
                          placeholder="请输入密码"
                          prefix={<LockOutlined style={{ color: "#90a4ae" }} />}
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item style={{ marginBottom: 8 }}>
                        <Button
                          block
                          htmlType="submit"
                          icon={<LoginOutlined />}
                          loading={submitting}
                          size="large"
                          type="primary"
                        >
                          登录系统
                        </Button>
                      </Form.Item>
                    </Form>
                  ),
                },
                {
                  key: "register",
                  label: "注册",
                  children: (
                    <Form<IRegisterFormValues> form={registerForm} layout="vertical" onFinish={handleRegisterSubmit}>
                      <Form.Item
                        label={<span style={{ color: "#fff" }}>用户名</span>}
                        name="username"
                        rules={[
                          { required: true, message: "请输入用户名" },
                          {
                            pattern: /^[a-zA-Z0-9_]{3,20}$/,
                            message: "用户名格式不正确：3-20个字符，只能包含字母、数字、下划线",
                          },
                        ]}
                      >
                        <Input
                          autoComplete="username"
                          placeholder="请输入用户名（3-20个字符）"
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
                    </Form>
                  ),
                },
              ]}
              style={{ color: "#fff" }}
              onChange={setActiveTab}
            />

            <div className="login-page__footer">
              {activeTab === "login" && <span>默认演示账号：admin / 任意密码</span>}
              <span>© {new Date().getFullYear()} 某不知名系统</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

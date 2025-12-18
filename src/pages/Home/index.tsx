import React from 'react';

import { Typography } from 'antd';

const { Title } = Typography;

const Home: React.FC = () => {
  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2} style={{ marginBottom: 24, color: '#1f2937', fontWeight: 600 }}>
        首页
      </Title>
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '12px',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Title level={3} style={{ color: '#4b5563', fontWeight: 500 }}>
          欢迎使用管理系统
        </Title>
        <p style={{ color: '#6b7280', fontSize: '16px', marginTop: '16px' }}>
          请从左侧菜单选择功能模块
        </p>
      </div>
    </div>
  );
};

export default Home;

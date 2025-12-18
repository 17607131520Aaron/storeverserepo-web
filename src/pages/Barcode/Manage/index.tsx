import React, { useMemo, useState } from 'react';

import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';

import { CODE_TYPES, type CodeType, type GeneratedCode } from './constants';
import { generateCodeId, generateRandomValueByType, validateValueByType } from './utils';
import './index.scss';

const { Title, Text } = Typography;

const BarcodeManage: React.FC = () => {
  const [form] = Form.useForm();
  const [codes, setCodes] = useState<GeneratedCode[]>([]);

  const lastType = Form.useWatch<CodeType>('type', form) || 'QRCODE';

  const hasData = useMemo(() => codes.length > 0, [codes]);

  const handleGenerate = () => {
    form
      .validateFields(['type', 'count'])
      .then((values) => {
        const { type } = values;
        const { count } = values;

        if (count <= 0) {
          message.warning('生成数量必须大于 0');
          return;
        }

        if (count > 100) {
          message.warning('一次最多生成 100 个条码，请适当减少数量');
          return;
        }

        const list: GeneratedCode[] = Array.from({ length: count }).map(() => ({
          id: generateCodeId(),
          type,
          value: generateRandomValueByType(type),
        }));

        setCodes(list);
        message.success(`已生成 ${count} 个条码`);
      })
      .catch(() => {
        // ignore
      });
  };

  const handleGenerateFromValue = () => {
    form
      .validateFields(['type', 'customValue'])
      .then((values) => {
        const { type, customValue } = values as {
          type: CodeType;
          customValue: string;
        };

        const lines: string[] = (customValue || '')
          .split(/\r?\n/)
          .map((v) => v.trim())
          .filter((v): v is string => !!v);

        if (lines.length === 0) {
          message.warning('请输入需要生成条码的内容');
          return;
        }

        if (lines.length > 100) {
          message.warning('一次最多根据 100 行内容生成条码，请适当减少行数');
          return;
        }

        // 每行一个内容，完全按照输入生成，不再使用“生成数量”
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i] as string;
          const err = validateValueByType(type, line);
          if (err) {
            message.error(`第 ${i + 1} 行：${err}`);
            return;
          }
        }

        const list: GeneratedCode[] = lines.map((v) => ({
          id: generateCodeId(),
          type,
          value: v,
        }));

        setCodes(list);
        message.success(`已根据内容生成 ${lines.length} 个条码`);
      })
      .catch(() => {
        // ignore
      });
  };

  const handleClear = () => {
    setCodes([]);
  };

  const handleCopyAll = async () => {
    if (!hasData) {
      message.info('当前没有需要导出的条码数据');
      return;
    }

    const text = codes.map((item) => `${item.type}: ${item.value}`).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      message.success('已将条码内容复制到剪贴板');
    } catch {
      message.error('复制失败，请手动选择并复制内容');
    }
  };

  return (
    <div className="barcode-manage-page">
      <Title level={3}>条码管理</Title>
      <Text type="secondary">
        通过选择条码类型与数量，一键随机生成多个条码，可用于测试或打印前预览。
      </Text>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 16,
          flex: 1,
          minHeight: 0,
          alignItems: 'stretch',
        }}
      >
        <div style={{ width: 420, flexShrink: 0 }}>
          <Card
            size="small"
            style={{ height: '100%', borderRadius: 8 }}
            styles={{ body: { paddingBottom: 12, paddingTop: 16 } }}
            title="条码生成"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                type: 'QRCODE' as CodeType,
                count: 10,
                customValue: '',
              }}
            >
              <Form.Item
                label="条码类型"
                name="type"
                rules={[{ required: true, message: '请选择条码类型' }]}
              >
                <Select
                  style={{ width: '100%' }}
                  options={CODE_TYPES}
                  placeholder="请选择条码类型"
                />
              </Form.Item>

              <Form.Item
                label="生成数量"
                name="count"
                rules={[{ required: true, message: '请输入生成数量' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="数量" />
              </Form.Item>

              <Form.Item>
                <Space wrap>
                  <Button type="primary" onClick={handleGenerate}>
                    随机生成
                  </Button>
                  <Button onClick={handleClear} disabled={!hasData}>
                    清空结果
                  </Button>
                  <Button onClick={handleCopyAll} disabled={!hasData}>
                    导出文本（复制全部）
                  </Button>
                </Space>
              </Form.Item>

              <Form.Item
                label="指定内容"
                name="customValue"
                rules={[{ required: true, message: '请输入需要生成条码的内容' }]}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <Input.TextArea
                    allowClear
                    placeholder="在此输入字符串；支持多行输入，每行一个内容，换行可批量生成条码"
                    autoSize={{ minRows: 3, maxRows: 6 }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      单行+数量：可按同一内容生成多个；多行：每行一个内容，忽略数量。
                    </Text>
                    <Button type="primary" onClick={handleGenerateFromValue}>
                      根据内容生成
                    </Button>
                  </div>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>

        <Card
          size="small"
          className="barcode-manage-result-card-container"
          title={
            <Space size={12}>
              <span>生成结果</span>
              <Text type="secondary">
                当前类型：{CODE_TYPES.find((i) => i.value === lastType)?.label ?? lastType}
              </Text>
            </Space>
          }
          styles={{
            body: {
              paddingTop: 16,
              display: 'flex',
              flexDirection: 'column',
              // 关键：让内容区本身参与 flex 布局并启用内部滚动
              flex: 1,
              overflowY: 'auto',
            },
          }}
          style={{
            borderRadius: 8,
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {hasData ? (
            <>
              <Row gutter={[16, 16]}>
                {codes.map((item) => (
                  <Col key={item.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Card
                      size="small"
                      variant="outlined"
                      styles={{ body: { padding: '12px 8px 8px' } }}
                      style={{ borderRadius: 8 }}
                    >
                      {item.type === 'QRCODE' ? (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingTop: 4,
                            paddingBottom: 4,
                          }}
                        >
                          <QRCodeCanvas value={item.value} size={96} />
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Barcode
                            value={item.value}
                            format={item.type}
                            height={60}
                            width={1.8}
                            displayValue
                            fontSize={12}
                            margin={6}
                          />
                        </div>
                      )}
                      <div
                        style={{
                          marginTop: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          类型：{item.type}
                        </Text>
                        <Text style={{ fontSize: 12 }} ellipsis>
                          内容：{item.value}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Text type="secondary" style={{ marginTop: 16, display: 'block', fontSize: 12 }}>
                提示：条码内容为随机生成，仅供测试或演示使用，如需正式使用请根据业务规则生成。
              </Text>
            </>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 0',
                color: '#9ca3af',
              }}
            >
              <Text>暂无条码，请先在左侧配置并点击「随机生成」或「根据内容生成」。</Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BarcodeManage;

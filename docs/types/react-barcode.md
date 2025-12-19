# react-barcode 条码组件类型定义

**路径**: `src/types/react-barcode.d.ts`

定义 `react-barcode` 组件的 TypeScript 类型声明。

## 概述

`react-barcode.d.ts` 提供了 `react-barcode` 库的 TypeScript 类型声明，使开发者可以在 TypeScript 项目中使用该库并获得类型支持。

---

## 使用示例

### 基本用法

```tsx
import Barcode from "react-barcode";

function BarcodeComponent() {
  return <Barcode value="123456789012" format="EAN13" />;
}
```

### 常用属性

```tsx
<Barcode
  value="123456789012" // 条码值
  format="EAN13" // 条码格式
  width={2} // 条码宽度
  height={100} // 条码高度
  displayValue={true} // 是否显示值
  fontSize={20} // 字体大小
  textAlign="center" // 文本对齐
  textPosition="bottom" // 文本位置
  textMargin={2} // 文本边距
  margin={10} // 边距
  background="#ffffff" // 背景色
  lineColor="#000000" // 线条颜色
/>
```

---

## 相关文档

- [react-barcode](https://www.npmjs.com/package/react-barcode) - react-barcode 官方文档

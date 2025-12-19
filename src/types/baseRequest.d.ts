import type React from "react";

export interface IMenuItem {
  id: string;
  key: string;
  title: string;
  label: string;
  code: string;
  path: string;
  icon?: React.ReactNode | null;
  sortOrder: number;
  children?: Array<IMenuItem> | undefined;
}

// 请求配置接口
export interface IRequestConfig<T> {
  url: string;
  data: T;
  handleRaw: boolean;
  timeout?: number;
  cancelToken?: AbortController;
  retry?: number;
}

// 响应数据接口
export interface IResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 错误消息接口
export interface IErrorMessage {
  message: string;
  description: string;
  action?: () => void;
}

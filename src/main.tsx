import { Suspense } from 'react';

import { RouterProvider } from "react-router-dom";

import { ConfigProvider } from "antd";
import ZhCN from "antd/locale/zh_CN";
import { createRoot } from "react-dom/client";

import "./main.scss";
import routers from "./router";

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <ConfigProvider locale={ZhCN}>
    <Suspense fallback={<div>...加载中</div>}>
      <RouterProvider router={routers} />
    </Suspense>
  </ConfigProvider>,
);

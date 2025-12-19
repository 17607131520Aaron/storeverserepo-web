import { Suspense } from "react";

import { RouterProvider } from "react-router-dom";

import { ConfigProvider } from "antd";
import ZhCN from "antd/locale/zh_CN";
import { createRoot } from "react-dom/client";

import ErrorBoundary from "@/components/ErrorBoundary";
import ErrorReportingProvider from "@/components/ErrorReportingProvider";
import LoadingFallback from "@/components/LoadingFallback";
import PerformanceMonitorWrapper from "@/components/PerformanceMonitorWrapper";

import routers from "./router";
import "./main.scss";
import "antd/dist/reset.css";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <ErrorReportingProvider>
    <ErrorBoundary scope="AppRoot">
      <ConfigProvider locale={ZhCN}>
        <PerformanceMonitorWrapper>
          <Suspense fallback={<LoadingFallback />}>
            <RouterProvider router={routers} />
          </Suspense>
        </PerformanceMonitorWrapper>
      </ConfigProvider>
    </ErrorBoundary>
  </ErrorReportingProvider>,
);

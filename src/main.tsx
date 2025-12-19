import { Suspense } from "react";

import { RouterProvider } from "react-router-dom";

import { createRoot } from "react-dom/client";

import ErrorBoundary from "@/components/ErrorBoundary";
import ErrorReportingProvider from "@/components/ErrorReportingProvider";
import LoadingFallback from "@/components/LoadingFallback";
import PerformanceMonitorWrapper from "@/components/PerformanceMonitorWrapper";
import ThemeProvider from "@/components/ThemeProvider";
import { initTheme } from "@/utils/theme";

import routers from "./router";
import "antd/dist/reset.css";
import "./main.scss";

// 初始化主题系统（必须在渲染前调用）
initTheme();

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <ErrorReportingProvider>
    <ErrorBoundary scope="AppRoot">
      <ThemeProvider>
        <PerformanceMonitorWrapper>
          <Suspense fallback={<LoadingFallback />}>
            <RouterProvider router={routers} />
          </Suspense>
        </PerformanceMonitorWrapper>
      </ThemeProvider>
    </ErrorBoundary>
  </ErrorReportingProvider>,
);

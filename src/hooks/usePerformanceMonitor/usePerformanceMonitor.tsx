import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from "react";

interface IPerformanceMetrics {
  id: string;
  phase: "mount" | "update" | "nested-update";
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<unknown>;
}

interface IPerformanceMonitorProps {
  id: string;
  children: ReactNode;
  onRender?: ProfilerOnRenderCallback;
  enableConsoleLog?: boolean;
}

interface IPerformanceData {
  dnsTime: number;
  tcpTime: number;
  requestTime: number;
  domParseTime: number;
  domContentLoadedTime: number;
  loadTime: number;
  totalTime: number;
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
}

/**
 * 性能监控组件
 * 使用React.Profiler API监控组件渲染性能
 */
export const PerformanceMonitor: React.FC<IPerformanceMonitorProps> = ({
  id,
  children,
  onRender,
  enableConsoleLog = true,
}) => {
  // ProfilerOnRenderCallback需要6个参数，这是React API的要求
  /* eslint-disable max-params */
  const handleRender: ProfilerOnRenderCallback = (
    profilerId: string,
    phase: "mount" | "update" | "nested-update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
  ) => {
    // React 18的Profiler回调可能没有interactions参数
    const metrics: IPerformanceMetrics = {
      id: profilerId,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions: new Set(),
    };

    // 调用自定义回调
    if (onRender) {
      onRender(profilerId, phase, actualDuration, baseDuration, startTime, commitTime);
    }

    // 控制台输出性能指标
    if (enableConsoleLog) {
      const style =
        "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold; font-size: 12px;";
      const resetStyle = "background: transparent; color: inherit;";
      const phaseText = phase === "mount" ? "挂载" : phase === "update" ? "更新" : "嵌套更新";

      console.log(`%c⚡ 性能监控 - ${id}`, style);
      console.log(`%c阶段:`, resetStyle, phaseText);
      console.log(
        `%c实际渲染时间:`,
        resetStyle,
        `${actualDuration.toFixed(2)}ms`,
        actualDuration > 16 ? "⚠️" : "✅",
      );
      console.log(`%c基准渲染时间:`, resetStyle, `${baseDuration.toFixed(2)}ms`);
      console.log(`%c开始时间:`, resetStyle, `${startTime.toFixed(2)}ms`);
      console.log(`%c提交时间:`, resetStyle, `${commitTime.toFixed(2)}ms`);
      console.log(
        `%c性能评分:`,
        resetStyle,
        actualDuration < 16 ? "优秀 ✅" : actualDuration < 50 ? "良好 ⚠️" : "需要优化 ❌",
      );
      if (metrics.interactions.size > 0) {
        console.log(`%c交互数量:`, resetStyle, metrics.interactions.size);
      }

      // 如果渲染时间过长，输出警告
      if (actualDuration > 50) {
        console.warn(
          `⚠️ 性能警告: 组件 "${id}" 渲染时间过长 (${actualDuration.toFixed(2)}ms)，建议优化`,
        );
      }
    }
  };
  /* eslint-enable max-params */

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};

/**
 * Hook: 获取页面性能指标
 * 使用Performance API获取页面加载性能数据
 */
export const usePerformanceMonitor = (): {
  getPerformanceMetrics: () => IPerformanceData | null;
  logPagePerformance: () => void;
} => {
  const getPerformanceMetrics = (): IPerformanceData | null => {
    if (typeof window === "undefined" || !window.performance) {
      return null;
    }

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

    if (!navigation) {
      return null;
    }

    const metrics: IPerformanceData = {
      // DNS查询时间
      dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
      // TCP连接时间
      tcpTime: navigation.connectEnd - navigation.connectStart,
      // 请求响应时间
      requestTime: navigation.responseEnd - navigation.requestStart,
      // DOM解析时间
      domParseTime: navigation.domInteractive - navigation.responseEnd,
      // DOMContentLoaded时间
      domContentLoadedTime:
        navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      // 页面加载时间
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      // 总时间
      totalTime: navigation.loadEventEnd - navigation.fetchStart,
      // 首次内容绘制 (FCP)
      fcp: 0,
      // 最大内容绘制 (LCP)
      lcp: 0,
      // 首次输入延迟 (FID)
      fid: 0,
      // 累积布局偏移 (CLS)
      cls: 0,
    };

    // 获取Web Vitals指标
    const paintEntries = performance.getEntriesByType("paint");
    paintEntries.forEach((entry) => {
      if (entry.name === "first-contentful-paint") {
        metrics.fcp = entry.startTime;
      }
    });

    // 获取LCP
    const lcpEntries = performance.getEntriesByName("largest-contentful-paint");
    if (lcpEntries.length > 0) {
      const lcpEntry = lcpEntries[lcpEntries.length - 1] as PerformanceEntry;
      metrics.lcp = lcpEntry.startTime;
    }

    return metrics;
  };

  const logPagePerformance = (): void => {
    const metrics = getPerformanceMetrics();
    if (!metrics) {
      console.warn("无法获取性能指标");
      return;
    }

    const style =
      "background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 10px 15px; border-radius: 6px; font-weight: bold; font-size: 14px;";
    const resetStyle = "background: transparent; color: inherit;";

    console.log(`%c📊 页面性能指标`, style);
    console.log(`%cDNS查询时间:`, resetStyle, `${metrics.dnsTime.toFixed(2)}ms`);
    console.log(`%cTCP连接时间:`, resetStyle, `${metrics.tcpTime.toFixed(2)}ms`);
    console.log(`%c请求响应时间:`, resetStyle, `${metrics.requestTime.toFixed(2)}ms`);
    console.log(`%cDOM解析时间:`, resetStyle, `${metrics.domParseTime.toFixed(2)}ms`);
    console.log(
      `%cDOMContentLoaded时间:`,
      resetStyle,
      `${metrics.domContentLoadedTime.toFixed(2)}ms`,
    );
    console.log(`%c页面加载时间:`, resetStyle, `${metrics.loadTime.toFixed(2)}ms`);
    console.log(`%c总加载时间:`, resetStyle, `${metrics.totalTime.toFixed(2)}ms`);
    if (metrics.fcp > 0) {
      console.log(
        `%c首次内容绘制 (FCP):`,
        resetStyle,
        `${metrics.fcp.toFixed(2)}ms`,
        metrics.fcp < 1800 ? "✅" : "⚠️",
      );
    }
    if (metrics.lcp > 0) {
      console.log(
        `%c最大内容绘制 (LCP):`,
        resetStyle,
        `${metrics.lcp.toFixed(2)}ms`,
        metrics.lcp < 2500 ? "✅" : "⚠️",
      );
    }
  };

  return {
    getPerformanceMetrics,
    logPagePerformance,
  };
};

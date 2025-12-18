/**
 * Electron API Hook
 * 提供类型安全的 Electron API 访问
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  NotificationOptions,
  OpenDialogOptions,
  SaveDialogOptions,
  SystemInfo,
} from '@/types/electron';

/**
 * 检查是否在 Electron 环境中运行
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}

/**
 * 获取 Electron API
 */
export function getElectronAPI() {
  if (!isElectron()) {
    console.warn('Not running in Electron environment');
    return null;
  }
  return window.electronAPI;
}

/**
 * 系统信息 Hook
 */
export function useSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const api = getElectronAPI();

    if (!api) {
      // 使用 setTimeout 避免在 effect 中同步调用 setState
      setTimeout(() => {
        if (isMounted.current) {
          setLoading(false);
        }
      }, 0);
      return;
    }

    api
      .getSystemInfo()
      .then((info) => {
        if (isMounted.current) {
          setSystemInfo(info);
        }
      })
      .catch((err) => {
        if (isMounted.current) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted.current) {
          setLoading(false);
        }
      });

    return () => {
      isMounted.current = false;
    };
  }, []);

  return { systemInfo, loading, error };
}

/**
 * 窗口状态 Hook
 */
export function useWindowState() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const api = getElectronAPI();
    if (!api) {
      return;
    }

    // 获取初始状态
    api.isMaximized().then(setIsMaximized);

    // 监听窗口状态变化
    const unsubMax = api.onWindowMaximized(() => setIsMaximized(true));
    const unsubUnmax = api.onWindowUnmaximized(() => setIsMaximized(false));

    return () => {
      unsubMax();
      unsubUnmax();
    };
  }, []);

  const minimize = useCallback(() => {
    getElectronAPI()?.windowControl('minimize');
  }, []);

  const maximize = useCallback(() => {
    getElectronAPI()?.windowControl('maximize');
  }, []);

  const close = useCallback(() => {
    getElectronAPI()?.windowControl('close');
  }, []);

  return { isMaximized, minimize, maximize, close };
}

/**
 * 文件操作 Hook
 */
export function useFileOperations() {
  const openFile = useCallback((options?: OpenDialogOptions) => {
    return getElectronAPI()?.openFile(options) ?? Promise.resolve(null);
  }, []);

  const saveFile = useCallback((options?: SaveDialogOptions) => {
    return getElectronAPI()?.saveFile(options) ?? Promise.resolve(null);
  }, []);

  const readFile = useCallback((filePath: string) => {
    return (
      getElectronAPI()?.readFile(filePath) ??
      Promise.resolve({ success: false, error: 'Not in Electron' })
    );
  }, []);

  const writeFile = useCallback((filePath: string, content: string) => {
    return (
      getElectronAPI()?.writeFile(filePath, content) ??
      Promise.resolve({ success: false, error: 'Not in Electron' })
    );
  }, []);

  return { openFile, saveFile, readFile, writeFile };
}

/**
 * 剪贴板 Hook
 */
export function useClipboard() {
  const copy = useCallback((text: string) => {
    const api = getElectronAPI();
    if (api) {
      api.copyToClipboard(text);
    } else {
      // 降级到浏览器 API
      navigator.clipboard.writeText(text);
    }
  }, []);

  const paste = useCallback(() => {
    const api = getElectronAPI();
    if (api) {
      return api.readFromClipboard();
    }
    // 降级到浏览器 API
    return navigator.clipboard.readText();
  }, []);

  return { copy, paste };
}

/**
 * 通知 Hook
 */
export function useNotification() {
  const show = useCallback((options: NotificationOptions) => {
    const api = getElectronAPI();
    if (api) {
      api.showNotification(options);
    } else {
      // 降级到浏览器通知
      new Notification(options.title, { body: options.body });
    }
  }, []);

  return { show };
}

/**
 * 外部链接 Hook
 */
export function useExternalLink() {
  const open = useCallback((url: string) => {
    const api = getElectronAPI();
    if (api) {
      return api.openExternal(url);
    }
    window.open(url, '_blank');
    return Promise.resolve();
  }, []);

  return { open };
}

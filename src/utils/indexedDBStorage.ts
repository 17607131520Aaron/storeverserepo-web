/**
 * 简易 IndexedDB 工具，用于存储项目相关信息
 */

const DB_NAME = "storeverse-app";
const DB_VERSION = 1;
const STORE_NAME = "project_info";

export interface IProjectInfoRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

const isIndexedDBAvailable = (): boolean =>
  typeof window !== "undefined" && typeof window.indexedDB !== "undefined";

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error("IndexedDB 不可用"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB 打开失败"));
  });

const wrapRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB 操作失败"));
  });

const runStore = async <T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);
  const request = handler(store);
  return await wrapRequest(request);
};

export const saveProjectInfo = async (key: string, value: unknown): Promise<void> => {
  try {
    const record: IProjectInfoRecord = {
      key,
      value,
      updatedAt: Date.now(),
    };
    await runStore("readwrite", (store) => store.put(record));
  } catch (error) {
    console.warn("保存项目信息到 IndexedDB 失败（已忽略）：", error);
  }
};

export const getProjectInfo = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    const result = await runStore<IProjectInfoRecord | undefined>("readonly", (store) =>
      store.get(key),
    );
    return (result?.value as T) ?? null;
  } catch (error) {
    console.warn("读取 IndexedDB 项目信息失败（已忽略）：", error);
    return null;
  }
};

export const getAllProjectInfo = async (): Promise<IProjectInfoRecord[]> => {
  try {
    const result = await runStore<IProjectInfoRecord[]>("readonly", (store) => store.getAll());
    return result ?? [];
  } catch (error) {
    console.warn("读取全部 IndexedDB 项目信息失败（已忽略）：", error);
    return [];
  }
};

export const deleteProjectInfo = async (key: string): Promise<void> => {
  try {
    await runStore("readwrite", (store) => store.delete(key));
  } catch (error) {
    console.warn("删除 IndexedDB 项目信息失败（已忽略）：", error);
  }
};

export const clearProjectInfo = async (): Promise<void> => {
  try {
    await runStore("readwrite", (store) => store.clear());
  } catch (error) {
    console.warn("清空 IndexedDB 项目信息失败（已忽略）：", error);
  }
};

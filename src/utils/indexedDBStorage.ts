/**
 * 基于 Dexie 的 IndexedDB 工具，用于存储项目相关信息
 */
import Dexie, { type Table } from "dexie";

const DB_NAME = "storeverse-app";
const STORE_NAME = "project_info";

export interface IProjectInfoRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

class ProjectInfoDB extends Dexie {
  public projectInfo!: Table<IProjectInfoRecord, string>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      [STORE_NAME]: "&key", // key 为主键
    });
    this.projectInfo = this.table(STORE_NAME);
  }
}

const db = new ProjectInfoDB();

export const saveProjectInfo = async (key: string, value: unknown): Promise<void> => {
  try {
    const record: IProjectInfoRecord = { key, value, updatedAt: Date.now() };
    await db.projectInfo.put(record);
  } catch (error) {
    console.warn("保存项目信息到 IndexedDB 失败（已忽略）：", error);
  }
};

export const getProjectInfo = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    const result = await db.projectInfo.get(key);
    return (result?.value as T) ?? null;
  } catch (error) {
    console.warn("读取 IndexedDB 项目信息失败（已忽略）：", error);
    return null;
  }
};

export const getAllProjectInfo = async (): Promise<IProjectInfoRecord[]> => {
  try {
    return await db.projectInfo.toArray();
  } catch (error) {
    console.warn("读取全部 IndexedDB 项目信息失败（已忽略）：", error);
    return [];
  }
};

export const deleteProjectInfo = async (key: string): Promise<void> => {
  try {
    await db.projectInfo.delete(key);
  } catch (error) {
    console.warn("删除 IndexedDB 项目信息失败（已忽略）：", error);
  }
};

export const clearProjectInfo = async (): Promise<void> => {
  try {
    await db.projectInfo.clear();
  } catch (error) {
    console.warn("清空 IndexedDB 项目信息失败（已忽略）：", error);
  }
};

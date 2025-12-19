/**
 * Zustand Store 统一导出
 */

export { createPersistStore } from "./createPersistStore";
export { PERSIST_NAMESPACES, getStorageKey, shouldPersist } from "./config";

// 在这里导出各个具体的 store
export { useUserInfoStore } from "./user/info";
export type { IUserInfo, IUserInfoState, IUserInfoStore } from "./user/types";
// export { useSettingsStore } from './settings';

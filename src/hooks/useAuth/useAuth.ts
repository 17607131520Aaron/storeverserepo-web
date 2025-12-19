import { useCallback, useEffect, useMemo, useState } from "react";

import { deleteProjectInfo, getProjectInfo, saveProjectInfo } from "@/utils/indexedDBStorage";

const AUTH_STORAGE_KEY = "auth_info";

export interface IAuthUser {
  // 根据实际业务扩展字段，这里先用通用结构占位
  [key: string]: unknown;
}

export interface IAuthState {
  token: string | null;
  user: IAuthUser | null;
  /** token 过期时间（时间戳，毫秒），null 表示不过期或由后端控制 */
  expiresAt: number | null;
}

interface IUseAuthResult extends IAuthState {
  loading: boolean;
  isAuthenticated: boolean;
  tokenExpired: boolean;
  /**
   * 登录成功后保存 token / 用户信息
   * @param token 访问令牌
   * @param user  用户信息
   * @param expiresAt 过期时间（时间戳，毫秒），可选
   */
  login: (token: string, user: IAuthUser, expiresAt?: number | null) => Promise<void>;
  logout: () => Promise<void>;
}

const useAuth = (): IUseAuthResult => {
  const [state, setState] = useState<IAuthState>({
    token: null,
    user: null,
    expiresAt: null,
  });
  const [loading, setLoading] = useState(true);

  // 初始化时从 IndexedDB 中恢复登录态
  useEffect(() => {
    let isMounted = true;

    const restoreAuth = async (): Promise<void> => {
      try {
        const stored = await getProjectInfo<IAuthState>(AUTH_STORAGE_KEY);
        if (!isMounted || !stored || !stored.token) {
          return;
        }

        const now = Date.now();
        const expiresAt = stored.expiresAt ?? null;

        // token 过期：清理本地状态
        if (expiresAt !== null && expiresAt <= now) {
          await deleteProjectInfo(AUTH_STORAGE_KEY);
          return;
        }

        if (isMounted) {
          setState({
            token: stored.token ?? null,
            user: stored.user ?? null,
            expiresAt,
          });
        }
      } catch (error) {
        console.warn("恢复登录状态失败（已忽略）：", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void restoreAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (token: string, user: IAuthUser, expiresAt?: number | null): Promise<void> => {
      const normalizedExpiresAt =
        typeof expiresAt === "number" && Number.isFinite(expiresAt) ? expiresAt : null;

      const nextState: IAuthState = { token, user, expiresAt: normalizedExpiresAt };
      setState(nextState);
      try {
        await saveProjectInfo(AUTH_STORAGE_KEY, nextState);
      } catch (error) {
        console.warn("保存登录信息失败（已忽略）：", error);
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    setState({ token: null, user: null, expiresAt: null });
    try {
      await deleteProjectInfo(AUTH_STORAGE_KEY);
    } catch (error) {
      console.warn("清理登录信息失败（已忽略）：", error);
    }
  }, []);

  const tokenExpired = useMemo(() => {
    if (!state.token) {
      return false;
    }
    if (state.expiresAt === null) {
      return false;
    }
    return state.expiresAt <= Date.now();
  }, [state.token, state.expiresAt]);

  const isAuthenticated = useMemo(() => {
    if (!state.token) {
      return false;
    }
    if (tokenExpired) {
      return false;
    }
    return true;
  }, [state.token, tokenExpired]);

  return {
    ...state,
    loading,
    isAuthenticated,
    tokenExpired,
    login,
    logout,
  };
};

export default useAuth;

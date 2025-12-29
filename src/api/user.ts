import { get, post } from "@/utils/request";

/**
 * 登录请求参数
 */
export interface ILoginParams {
  username: string;
  password: string;
}

/**
 * 登录响应数据
 */
export interface ILoginResponse {
  token: string;
  expiresIn: number; // 过期时间（秒）
}

/**
 * 注册请求参数
 */
export interface IRegisterParams {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

/**
 * 用户信息响应
 */
export interface IUserInfoResponse {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
}

/**
 * 用户登录
 * @param params 登录参数
 * @returns 登录响应，包含 token 和过期时间
 */
export const login = (params: ILoginParams): Promise<ILoginResponse> => {
  return post<ILoginParams, ILoginResponse>({
    url: "/userinfo/userLogin",
    data: params,
  });
};

/**
 * 用户注册
 * @param params 注册参数
 * @returns 注册结果消息
 */
export const register = (params: IRegisterParams): Promise<string> => {
  return post<IRegisterParams, string>({
    url: "/userinfo/registerUser",
    data: params,
  });
};

/**
 * 获取用户信息
 * @returns 用户信息
 */
export const getUserInfo = (): Promise<IUserInfoResponse> => {
  return get<never, IUserInfoResponse>({
    url: "/userinfo/getUserInfo",
  });
};

/**
 * 用户登出
 * @returns 登出结果消息
 */
export const logout = (): Promise<string> => {
  return post<never, string>({
    url: "/userinfo/logout",
  });
};

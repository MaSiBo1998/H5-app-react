/**
 * 本地存储工具函数
 * 封装 localStorage，支持 Key 加密存储
 */

// 存储 Key 定义及用途说明
export const StorageKeys = {
  /** 设备唯一标识 (UUID) */
  UUID: 'uuid',
  /** 地理位置信息 {longitude, latitude} */
  LOCATION: 'location',
  /** 完整设备信息对象 */
  DEVICE_INFO: 'deviceInfo',
  /** Adjust SDK 信息 */
  ADJUST_INFO: 'adjustInfo',
  /** 登录 Token */
  TOKEN: 'token',
  /** 登录返回的用户信息 */
  LOGIN_INFO: 'loginInfo',
  /** 当前/上次登录的手机号 */
  USER_PHONE: 'userPhone',
  /** 申请流程已完成步骤列表 */
  COMPLETED_STEPS: 'local_completed_steps',
  /** 申请流程步骤配置信息 (缓存) */
  APPLY_STEP_CONFIG: 'applyStepConfig',
  /** 通用配置信息 (App初始化获取) */
  COMMON_CONFIG: 'commonConfig',
  /** 历史手机号 (Legacy) */
  LAST_PHONE: 'lastPhone',
  /** 手机号 (Legacy) */
  MOBILE: 'mobile',
} as const;

export type StorageKeys = typeof StorageKeys[keyof typeof StorageKeys];

// 密钥混淆盐值
const SALT = 'CP_H5_SECURE_';

/**
 * 加密存储 Key
 * @param key 原始 Key
 * @returns 加密后的 Key
 */
function encryptKey(key: string): string {
  // 使用 Base64 编码 (SALT + key) 进行简单混淆
  // 实际项目中可替换为更复杂的加密算法 (如 AES, MD5)
  try {
    return btoa(SALT + key);
  } catch (e) {
    return `_enc_${key}`;
  }
}

/**
 * 存储数据
 * @param key 原始 Key (建议使用 StorageKeys 枚举)
 * @param value 数据值 (自动 JSON 序列化)
 */
export function setStorage(key: string, value: any): void {
  const encKey = encryptKey(key);
  const data = JSON.stringify(value);
  localStorage.setItem(encKey, data);
}

/**
 * 获取数据
 * @param key 原始 Key
 * @returns 数据值 (自动 JSON 反序列化) 或 null
 */
export function getStorage<T = any>(key: string): T | null {
  const encKey = encryptKey(key);
  let data = localStorage.getItem(encKey);
  
  // 兼容旧数据：如果加密 Key 取不到，尝试使用原始 Key
  if (data === null) {
    data = localStorage.getItem(key);
  }

  if (!data) return null;
  
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    // 兼容非 JSON 字符串数据
    return data as unknown as T;
  }
}

/**
 * 移除数据
 * @param key 原始 Key
 */
export function removeStorage(key: string): void {
  const encKey = encryptKey(key);
  localStorage.removeItem(encKey);
}

/**
 * 清空所有相关数据
 * 注意：只会清空通过此工具存储的数据（如果能识别），或者清空所有 localStorage
 * 这里选择清空所有，因为无法仅通过前缀遍历 (Base64 无统一前缀)
 */
export function clearStorage(): void {
  localStorage.clear();
}

// 空间级别枚举
export const SPACE_LEVEL_ENUM = {
  FREE: 0,
  PRO: 1,
  MAX: 2,
} as const;

// 空间级别文本映射
export const SPACE_LEVEL_MAP: Record<number, string> = {
  0: "免费版",
  1: "专业版",
  2: "旗舰版",
};

// // 空间级别最大数量映射
// export const SPACE_LEVEL_MAX_COUNT: Record<number, number> = {
//   0: 100,
//   1: 1000,
//   2: 10000,
// };

// // 空间级别最大大小映射（字节）
// export const SPACE_LEVEL_MAX_SIZE: Record<number, number> = {
//   0: 100 * 1024 * 1024, // 100MB
//   1: 1000 * 1024 * 1024, // 1000MB
//   2: 10000 * 1024 * 1024, // 10000MB
// };

// 空间级别选项映射
export const SPACE_LEVEL_OPTIONS = Object.keys(SPACE_LEVEL_MAP).map((key) => {
  const value = Number(key); // Convert string key to number
  return {
    label: SPACE_LEVEL_MAP[value],
    value,
  };
});

// 空间类型枚举
export const SPACE_TYPE_ENUM = {
  PRIVATE: 0,
  TEAM: 1,
};

// 空间类型文本映射
export const SPACE_TYPE_MAP: Record<number, string> = {
  0: "私有空间",
  1: "团队空间",
};

// 空间类型选项映射
export const SPACE_TYPE_OPTIONS = Object.keys(SPACE_TYPE_MAP).map((key) => {
  const value = Number(key); // 将字符串 key 转换为数字
  return {
    label: SPACE_TYPE_MAP[value],
    value,
  };
});

// 空间角色枚举
export const SPACE_ROLE_ENUM = {
  VIEWER: "viewer",
  EDITOR: "editor",
  ADMIN: "admin",
} as const;

// 空间角色文本映射
export const SPACE_ROLE_MAP: Record<string, string> = {
  viewer: "浏览者",
  editor: "编辑者",
  admin: "管理员",
};

// 空间角色选项映射
export const SPACE_ROLE_OPTIONS = Object.keys(SPACE_ROLE_MAP).map((key) => {
  return {
    label: SPACE_ROLE_MAP[key],
    value: key,
  };
});

/**
 * 空间权限常量
 */
export const SPACE_PERMISSION_ENUM = {
  SPACE_USER_MANAGE: "spaceUser:manage",
  PICTURE_VIEW: "picture:view",
  PICTURE_UPLOAD: "picture:upload",
  PICTURE_EDIT: "picture:edit",
  PICTURE_DELETE: "picture:delete",
} as const;

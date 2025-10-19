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

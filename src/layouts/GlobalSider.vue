<template>
  <a-layout-sider v-if="loginUserStore.loginUser.id" breakpoint="lg" collapsed-width="0"
    ><a-menu
      mode="inline"
      v-model:selectedKeys="current"
      :items="computedMenuItems"
      @click="doMenuClick"
  /></a-layout-sider>
</template>

<script lang="ts" setup>
import { h, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { PictureOutlined, UserOutlined } from "@ant-design/icons-vue";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import ACCESS_ENUM from "@/access/accessEnum";

const router = useRouter();
const loginUserStore = useLoginUserStore();

// 组件挂载时获取用户信息
onMounted(() => {
  // 确保用户状态是最新的
  loginUserStore.fetchLoginUser();
});

// 基础菜单配置
const baseMenuItems = [
  {
    key: "/lib",
    label: "公共图库",
    icon: () => h(PictureOutlined),
  },
  {
    key: "/my_space",
    label: "我的空间",
    icon: () => h(UserOutlined),
    access: ACCESS_ENUM.USER, // 需要登录才能访问
  },
];

// 根据用户权限计算显示的菜单项
const computedMenuItems = computed(() => {
  return baseMenuItems.filter((item) => {
    // 获取用户角色，默认为未登录
    const userRole =
      loginUserStore.loginUser?.userRole || ACCESS_ENUM.NOT_LOGIN;

    // 检查用户是否有权限访问该菜单项
    return hasAccess(userRole, item.access);
  });
});

// 权限检查函数
const hasAccess = (userRole: string, requiredAccess: string): boolean => {
  // 如果没有指定权限要求，则默认允许访问
  if (!requiredAccess) return true;

  // 管理员可以访问所有页面
  if (userRole === ACCESS_ENUM.ADMIN) return true;

  // 检查权限匹配
  return userRole === requiredAccess;
};

// 当前选中菜单
const current = ref<string[]>([]);

// 监听路由变化，更新当前选中菜单
router.afterEach((to) => {
  current.value = [to.path];
});

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  try {
    // 直接使用路径进行跳转
    router.push({
      path: key,
    });
  } catch (error) {
    console.error("路由跳转失败:", error);
  }
};
</script>

<style scoped>
/* 侧边栏菜单样式 */
:deep(.ant-menu) {
  border-right: none;
  height: 100%;
}

:deep(.ant-menu-item) {
  margin: 0;
  height: 45px;
  line-height: 45px;
}

:deep(.ant-menu-item-selected) {
  background-color: #e6f7ff;
}

:deep(.ant-menu-item:hover) {
  background-color: #f5f5f5;
}
</style>

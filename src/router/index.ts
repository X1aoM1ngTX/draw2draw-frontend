import ACCESS_ENUM from "@/access/accessEnum";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "",
      name: "欢迎",
      component: () => import("@/pages/WelcomePage.vue"),
    },
    {
      path: "/lib",
      name: "主页",
      component: () => import("@/pages/picture/PictureLibPage.vue"),
    },
    {
      path: "/user/login",
      name: "登录",
      component: () => import("@/pages/user/UserLoginPage.vue"),
    },
    {
      path: "/user/register",
      name: "注册",
      component: () => import("@/pages/user/UserRegisterPage.vue"),
    },
    {
      path: "/user/profile",
      name: "个人主页",
      component: () => import("@/pages/user/UserProfilePage.vue"),
    },
    {
      path: '/user/vip/exchange',
      name: '用户兑换会员',
      component: () => import("@/pages/user/UserExchangeVipPage.vue"),
    },
    {
      path: "/noAuth",
      name: "无权限",
      component: () => import("@/pages/error/NoAuth.vue"),
    },
    {
      path: "/admin/userManage",
      name: "用户管理",
      component: () => import("@/pages/admin/UserManagePage.vue"),
      meta: { access: ACCESS_ENUM.ADMIN },
    },
    {
      path: "/admin/pictureManage",
      name: "图片管理",
      component: () => import("@/pages/admin/PictureManagePage.vue"),
      meta: { access: ACCESS_ENUM.ADMIN },
    },
    {
      path: "/admin/spaceManage",
      name: "空间管理",
      component: () => import("@/pages/admin/SpaceManagePage.vue"),
      meta: { access: ACCESS_ENUM.ADMIN },
    },
    {
      path: "/add_picture",
      name: "创建图片",
      component: () => import("@/pages/picture/AddPicturePage.vue"),
    },
    {
      path: "/add_picture/batch",
      name: "批量创建图片",
      component: () => import("@/pages/picture/AddPictureBatchPage.vue"),
    },
    {
      path: "/picture/:id",
      name: "图片详情",
      component: () => import("@/pages/picture/PictureDetailPage.vue"),
      props: true,
    },
    {
      path: "/add_space",
      name: "创建空间",
      component: () => import("@/pages/space/AddSpacePage.vue"),
    },
    {
      path: "/my_space",
      name: "我的空间",
      component: () => import("@/pages/space/MySpacePage.vue"),
      meta: { access: ACCESS_ENUM.USER },
    },
    {
      path: "/space/:id",
      name: "空间详情",
      component: () => import("@/pages/space/SpaceDetailPage.vue"),
      props: true,
    },
    {
      path: "/space/:id/memberManage",
      name: "空间成员管理",
      component: () => import("@/pages/space/SpaceMemberManage.vue"),
      props: true,
    },
    {
      path: "/search_picture",
      name: "以图搜图",
      component: () => import("@/pages/picture/SearchPicturePage.vue"),
    },
    {
      path: "/space_analyze",
      name: "空间分析",
      component: () => import("@/pages/analyze/SpaceAnalyzePage.vue"),
    },
  ],
});

export default router;

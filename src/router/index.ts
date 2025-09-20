import ACCESS_ENUM from '@/access/accessEnum'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '主页',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/user/login',
      name: '登录',
      component: () => import('@/pages/user/UserLoginPage.vue'),
    },
    {
      path: '/user/register',
      name: '注册',
      component: () => import('@/pages/user/UserRegisterPage.vue'),
    },
    {
      path: '/user/reset-password',
      name: '重置密码',
      component: () => import('@/pages/user/ResetPasswordPage.vue'),
    },
    {
      path: '/noAuth',
      name: '无权限',
      component: () => import('@/pages/error/NoAuth.vue'),
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: () => import('@/pages/admin/UserManagePage.vue'),
      meta: { access: ACCESS_ENUM.ADMIN },
    },
  ],
})

export default router

<template>
  <div class="header-container">
    <a-row :wrap="false" align="middle" class="header-row">
      <!-- Logo和标题 -->
      <a-col flex="200px" class="logo-col">
        <router-link to="/" class="logo-link">
          <div class="title-bar">
            <img class="logo" src="../assets/Game9/game9-blue.png" alt="logo" />
            <div class="title">Draw2Draw</div>
          </div>
        </router-link>
      </a-col>

      <!-- 导航菜单 -->
      <a-col flex="auto" class="menu-col">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
          class="nav-menu"
        />
      </a-col>

      <!-- 用户区域 -->
      <a-col flex="220px" class="user-col">
        <div v-if="loginUserStore.loginUser.userName !== '未登录'" class="user-info">
          <a-dropdown>
            <a class="ant-dropdown-link" @click.prevent>
              <a-avatar :size="32" class="user-avatar" :src="loginUserStore.loginUser.userAvatar">
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
              <span class="username">{{ loginUserStore.loginUser.userName }}</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleProfile">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-item
                  v-if="checkAccess(loginUserStore.loginUser, 'admin')"
                  key="2"
                  @click="toUserManage"
                >
                  <TeamOutlined />
                  用户管理
                </a-menu-item>
                <a-menu-item
                  v-if="checkAccess(loginUserStore.loginUser, 'admin')"
                  key="4"
                  @click="toPictureManage"
                >
                  <PictureOutlined />
                  图片管理
                </a-menu-item>
                <a-menu-item key="3" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div v-else class="auth-buttons">
          <a-button type="text" @click="router.push('/user/login')" class="login-btn">
            登录
          </a-button>
          <a-button type="primary" @click="router.push('/user/register')" class="register-btn">
            注册
          </a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, computed } from 'vue'
import {
  GithubOutlined,
  HeartOutlined,
  HomeOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  TeamOutlined,
  PictureOutlined,
  AntDesignOutlined,
} from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import router from '@/router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import { userLogoutUsingPost } from '@/api/userController'
import checkAccess from '@/access/checkAccess'

const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()

// 原始菜单项
const menus = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HeartOutlined),
    label: '欢迎',
    title: '欢迎',
  },
  {
    key: '/home',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/add_picture',
    icon: () => h(PictureOutlined),
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/author',
    icon: () => h(GithubOutlined),
    label: h('a', { href: 'https://github.com/X1aoM1ngTX', target: '_blank' }, 'X1aoM1ngTX'),
    title: '作者',
  },
  {
    key: 'antdesign',
    icon: () => h(AntDesignOutlined),
    label: h(
      'a',
      { href: 'https://www.antdv.com/components/overview-cn/', target: '_blank' },
      'Ant Design',
    ),
    title: 'Ant Design Vue',
  },
])

// 根据权限过滤菜单项
const items = computed(() => {
  if (!menus.value) return []
  return menus.value.filter((menu): menu is Exclude<typeof menu, null> => {
    if (!menu || !menu.key) return false
    // 获取菜单项对应的路由
    const route = router.resolve(menu.key as string)
    // 检查用户是否有权限访问该路由
    return checkAccess(loginUserStore.loginUser, route.meta?.access as string)
  })
})

// 当前选中的菜单
const current = ref<string[]>([])

// 菜单点击事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 监听路由变化，更新当前选中的菜单
router.afterEach((to) => {
  current.value = [to.path]
})

// 个人中心
const handleProfile = () => {
  message.info('个人中心功能开发中')
}

// 管理中心
const toUserManage = () => {
  router.push('/admin/userManage')
}

const toPictureManage = () => {
  router.push('/admin/pictureManage')
}

// 退出登录
const handleLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    await router.replace('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
.header-container {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 64px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000; /* 确保header在所有内容之上 */
}

.header-row {
  height: 100%;
  padding: 0 24px;
}

.logo-col {
  display: flex;
  align-items: center;
}

.logo-link {
  text-decoration: none;
}

.title-bar {
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.title-bar:hover {
  transform: scale(1.05);
}

.logo {
  width: 36px;
  height: 36px;
  margin-right: 8px;
  transition: all 0.3s;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  white-space: nowrap;
}

.menu-col {
  display: flex;
  justify-content: center;
}

.nav-menu {
  border-bottom: none;
  background: transparent;
}

.user-col {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  margin-right: 8px;
  background-color: #1890ff;
}

.username {
  margin-right: 4px;
  font-weight: 500;
}

.auth-buttons {
  display: flex;
  gap: 8px;
}

.login-btn {
  font-weight: 500;
}

.register-btn {
  font-weight: 500;
}

.ant-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.ant-dropdown-link:hover {
  background-color: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-row {
    padding: 0 12px;
  }

  .logo-col {
    flex: 160px !important;
  }

  .title {
    font-size: 16px;
  }

  .user-col {
    flex: 180px !important;
  }

  .username {
    display: none;
  }
}
</style>

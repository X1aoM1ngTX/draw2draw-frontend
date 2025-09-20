import { useLoginUserStore } from './src/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import router from './src/router'

// 是否为首次获取登录用户
let firstFetchLoginUser = true;

/**
 * 全局权限校验
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser

  // 从 localStorage 恢复登录状态
  if (firstFetchLoginUser) {
    const storedUser = localStorage.getItem('login-user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        loginUserStore.setLoginUser(parsedUser)
        loginUser = parsedUser
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('login-user')
      }
    }
  }

  // 确保页面刷新，首次加载时，能够等后端返回用户信息后再校验权限
  if (firstFetchLoginUser) {
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
    firstFetchLoginUser = false;
  }

  const toUrl = to.fullPath
  // 自定义登录权限校验
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole !== 'admin') {
      message.error('没有权限')
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
  }
  next()
})

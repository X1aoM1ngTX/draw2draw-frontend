<template>
  <div id="GolbalHeader">
    <a-row :wrap="false">
      <a-col flex="160px"
        ><router-link to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/Game9/game9-black.png" alt="logo" />
            <div class="title">Draw 2 Draw</div>
          </div>
        </router-link></a-col
      >
      <a-col flex="auto"
        ><a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
      /></a-col>
      <a-col flex="100px">
        <div v-if="loginUserStore.loginUser.id">
          {{ loginUserStore.loginUser.username ?? '无名' }}
        </div>
        <div v-else>
          <a-button>登录</a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue'
import { GithubOutlined, HomeOutlined, LinkOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import router from '@/router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()
// 菜单项
const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/about',
    icon: () => h(LinkOutlined),
    label: '关于',
    title: '关于',
  },
  {
    key: '/author',
    icon: () => h(GithubOutlined),
    label: h('a', { href: 'https://github.com/X1aoM1ngTX', target: '_blank' }, 'GitHub'),
    title: '作者',
  },
])

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
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
}

.logo {
  width: 32px;
  height: 32px;
}
</style>

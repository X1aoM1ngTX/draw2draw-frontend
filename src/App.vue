<template>
  <div class="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from './layouts/BasicLayout.vue'
// import { healthUsingGet } from './api/mainController'
// import { useLoginUserStore } from './stores/useLoginUserStore'
// 已经在 access.ts 中获取登录用户
// const loginUserStore = useLoginUserStore()
// loginUserStore.fetchLoginUser()

// healthUsingGet().then((res) => {
//   console.log('health check', res)
// })
</script>

<style scoped></style>

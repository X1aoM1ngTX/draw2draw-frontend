<template>
  <div class="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from "./layouts/BasicLayout.vue";
</script>

<style>
/* 隐藏整个应用的滚动条 */
::-webkit-scrollbar {
  display: none;
}

/* Firefox */
html {
  scrollbar-width: none;
}

/* IE 和 Edge */
body {
  -ms-overflow-style: none;
}
</style>

<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header"><GlobalHeader /></a-layout-header>
      <a-layout-content class="content-full-width"
        ><RouterView
      /></a-layout-content>
      <a-layout-footer class="footer"><GlobalFooter /></a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import GlobalHeader from "./GlobalHeader.vue";
import GlobalFooter from "./GlobalFooter.vue";
</script>

<style scoped>
#basicLayout {
  min-height: 100vh;
}

.header {
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-full-width {
  padding: 20px;
  background: #ffffff;
  margin-left: 0;
  margin-top: 64px;
  min-height: calc(100vh - 64px);
  overflow-y: auto;
}

/* 响应式布局 - 当屏幕宽度小于768px时 */
@media (max-width: 768px) {
  .content-full-width {
    padding: 16px;
  }
}

.footer {
  padding: 0px;
  text-align: center;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
}
</style>

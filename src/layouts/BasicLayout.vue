<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header"><GlobalHeader /></a-layout-header>
      <a-layout-content class="content"><RouterView /></a-layout-content>
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
* {
  background-color: #fff;
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

.content {
  padding: 20px;
  background: #ffffff;
  margin-top: 64px;
  margin-bottom: 36px;
  min-height: calc(100vh - 100px);
  overflow-y: auto;
}

.footer {
  padding: 0px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
</style>

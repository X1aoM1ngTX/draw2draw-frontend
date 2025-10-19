<template>
  <div class="space-analyze">
    <h2>
      空间图库分析 -
      <span v-if="queryAll"> 全部空间 </span>
      <span v-else-if="queryPublic"> 公共图库 </span>
      <span v-else>
        <a :href="`/space/${spaceId}`" target="_blank">空间ID：{{ spaceId }}</a>
      </span>
    </h2>
    <a-row :gutter="[16, 16]">
      <!-- 空间使用分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUsageAnalyze
          :spaceId="spaceId"
          :queryAll="queryAll"
          :queryPublic="queryPublic"
        />
      </a-col>
      <!-- 空间分类分析 -->
      <a-col :xs="24" :md="12">
        <SpaceCategoryAnalyze
          :spaceId="spaceId"
          :queryAll="queryAll"
          :queryPublic="queryPublic"
        />
      </a-col>
      <!-- 标签分析 -->
      <a-col :xs="24" :md="12">
        <SpaceTagAnalyze
          :spaceId="spaceId"
          :queryAll="queryAll"
          :queryPublic="queryPublic"
        />
      </a-col>
      <!-- 图片大小分段分析 -->
      <a-col :xs="24" :md="12">
        <SpaceSizeAnalyze
          :spaceId="spaceId"
          :queryAll="queryAll"
          :queryPublic="queryPublic"
        />
      </a-col>
      <!-- 用户上传行为分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUserAnalyze
          :spaceId="spaceId"
          :queryAll="queryAll"
          :queryPublic="queryPublic"
        />
      </a-col>
      <!-- 空间使用排行分析 -->
      <a-col :xs="24" :md="12">
        <SpaceRankAnalyze
          :spaceId="spaceId"
          :queryAll="queryAll"
          :queryPublic="queryPublic"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import SpaceUsageAnalyze from "@/components/analyze/SpaceUsageAnalyze.vue";
import SpaceCategoryAnalyze from "@/components/analyze/SpaceCategoryAnalyze.vue";
import SpaceTagAnalyze from "@/components/analyze/SpaceTagAnalyze.vue";
import SpaceSizeAnalyze from "@/components/analyze/SpaceSizeAnalyze.vue";
import SpaceUserAnalyze from "@/components/analyze/SpaceUserAnalyze.vue";
import SpaceRankAnalyze from "@/components/analyze/SpaceRankAnalyze.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const router = useRoute();

// 空间ID路由参数
const spaceId = computed(() => {
  return router.query?.spaceId as string;
});

// 查询所有路由参数
const queryAll = computed(() => {
  return !!router.query?.queryAll;
});

// 查询公开路由参数
const queryPublic = computed(() => {
  return !!router.query?.queryPublic;
});
</script>

<style scoped>
.space--analyze {
}
</style>

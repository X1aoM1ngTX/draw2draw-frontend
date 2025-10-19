<template>
  <div class="space-usage-analyze">
    <a-flex gap="middle">
      <a-card title="空间图片存储分析">
        <div style="height: 320px">
          <h3>
            {{ formatSize(data.usedSize) }} /
            {{ data.maxSize ? formatSize(data.maxSize) : "∞" }}
          </h3>
          <a-progress type="dashboard" :percent="data.sizeUsageRatio ?? 0" />
        </div>
      </a-card>
      <a-card title="空间图片数量">
        <div style="height: 320px">
          <h3>
            {{ data.usedCount }} / {{ data.maxCount ? data.maxCount : "∞" }}
          </h3>
          <a-progress type="dashboard" :percent="data.countUsageRatio ?? 0" />
        </div>
      </a-card>
    </a-flex>
  </div>
</template>

<script lang="ts" setup>
import { withDefaults, defineProps, ref, watchEffect } from "vue";
import { getSpaceUsageAnalyzeUsingPost } from "@/api/spaceAnalyzeController";
import { message } from "ant-design-vue";
import { formatSize } from "@/utils/index";

interface Props {
  queryAll?: boolean;
  queryPublic?: boolean;
  spaceId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
});

// 图表数据
const data = ref<API.SpaceUsageAnalyzeResponse>({});
// 加载状态
const loading = ref(true);
// 加载数据
const fetchData = async () => {
  loading.value = true;
  const res = await getSpaceUsageAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  });
  if (res.data.code === 0 && res.data.data) {
    data.value = res.data.data;
  } else {
    message.error("获取空间使用分析失败：" + res.data.message || "未知错误");
  }
  loading.value = false;
};

// 监听 props 变化
watchEffect(() => {
  fetchData();
});
</script>

<style scoped>
.space-usage-analyze {
}
</style>

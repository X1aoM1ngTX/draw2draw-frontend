<template>
  <div class="home-page">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        placeholder="从海量图片中搜索"
        v-model:value="searchParams.searchText"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类&标签 -->
    <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
      <a-tab-pane tab="全部" key="all" />
      <a-tab-pane
        v-for="category in categoryList"
        :tab="category"
        :key="category"
      />
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 瀑布流图片列表 -->
    <PictureList
      :dataList="dataList"
      :loading="loading"
      @scroll-bottom="handleScrollBottom"
      @reload="fetchData"
    />
  </div>
  <a-back-top />
</template>
<script lang="ts" setup>
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from "@/api/pictureController";
import { message } from "ant-design-vue";
import { onMounted, reactive, ref } from "vue";
import PictureList from "@/components/PictureList.vue";

// 数据
const dataList = ref<API.PictureVO[]>([]);
const total = ref(0);
const loading = ref(true);

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
  sortField: "createTime",
  sortOrder: "descend",
});

// 无限滚动处理
const handleScrollBottom = () => {
  if (!loading.value && dataList.value.length < total.value) {
    searchParams.current = (searchParams.current ?? 1) + 1;
    fetchData(true);
  }
};

// 获取数据
const fetchData = async (isAppend = false) => {
  loading.value = true;
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [] as string[],
  };
  if (selectedCategory.value !== "all") {
    params.category = selectedCategory.value;
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index]);
    }
  });
  const res = await listPictureVoByPageUsingPost(params);
  if (res.data.data) {
    if (isAppend) {
      // 追加数据（无限滚动）
      dataList.value.push(...(res.data.data.records ?? []));
    } else {
      // 重置数据（搜索、筛选）
      dataList.value = res.data.data.records ?? [];
    }
    total.value = res.data.data.total ?? 0;
  } else {
    message.error("获取数据失败，" + res.data.message);
  }
  loading.value = false;
};

// 搜索
const doSearch = () => {
  // 重置页码
  searchParams.current = 1;
  dataList.value = []; // 清空现有数据
  fetchData(false);
};

// 图片分类和标签
const categoryList = ref<string[]>([]);
const selectedCategory = ref<string>("all");
const tagList = ref<string[]>([]);
const selectedTagList = ref<string[]>([]);

/**
 * 获取图片分类和标签
 * @param value
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet();
  if (res.data.data && res.data.code === 0) {
    tagList.value = res.data.data.tagList ?? [];
    categoryList.value = res.data.data.categoryList ?? [];
  } else {
    message.success("获取标签分类失败：" + res.data.message);
  }
};

// 页面加载时请求一次
onMounted(() => {
  fetchData(false);
  getTagCategoryOptions();
});
</script>
<style scoped>
.search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

.tag-bar {
  margin: 16px 0;
}
</style>

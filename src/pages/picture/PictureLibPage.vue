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
    <!-- 图片列表 -->
    <PictureList :dataList="dataList" :loading="loading" />
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
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

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page;
  searchParams.pageSize = pageSize;
  fetchData();
};

// 获取数据
const fetchData = async () => {
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
    dataList.value = res.data.data.records ?? [];
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
  fetchData();
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
  fetchData();
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

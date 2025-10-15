<template>
  <div class="search-picture-page">
    <a-page-header :title="pageTitle" @back="handleBack" />

    <div class="search-container">
      <!-- 原始图片展示 -->
      <div class="original-image-container" v-if="originalPicture">
        <a-card title="原始图片" class="original-image-card">
          <img
            :src="originalPicture.url || originalPicture.thumbnailUrl"
            :alt="originalPicture.name"
            class="original-image"
          />
          <template #extra>
            <a-tag color="blue">{{ originalPicture.category || "默认" }}</a-tag>
          </template>
        </a-card>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results">
        <a-spin :spinning="loading">
          <div v-if="searchResults.length > 0">
            <a-typography-title :level="4"
              >搜索结果 ({{ searchResults.length }})</a-typography-title
            >
            <a-list
              :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
              :data-source="searchResults"
            >
              <template #renderItem="{ item }">
                <a-list-item style="padding: 0">
                  <a-card hoverable @click="openImage(item.fromUrl)">
                    <template #cover>
                      <img
                        style="height: 180px; object-fit: cover"
                        :alt="item.fromUrl"
                        :src="item.thumbUrl"
                        loading="lazy"
                      />
                    </template>
                    <a-card-meta>
                      <template #description>
                        <div class="image-info">
                          <div class="image-source">
                            来源: {{ getSourceName(item.fromUrl) }}
                          </div>
                        </div>
                      </template>
                    </a-card-meta>
                  </a-card>
                </a-list-item>
              </template>
            </a-list>
          </div>
          <a-empty
            v-else-if="!loading && hasSearched"
            description="未找到相似图片"
          />
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { getPictureVoByIdUsingGet } from "@/api/pictureController";
import { searchPictureByPictureUsingPost } from "@/api/pictureController";


const route = useRoute();
const router = useRouter();

// 页面状态
const loading = ref(false);
const hasSearched = ref(false);
const originalPicture = ref<API.PictureVO | null>(null);
const searchResults = ref<API.ImageSearchResult[]>([]);

// 计算页面标题
const pageTitle = computed(() => {
  return originalPicture.value
    ? `以图搜图 - ${originalPicture.value.name}`
    : "以图搜图";
});

// 获取图片ID
const pictureId = computed(() => {
  return route.query.pictureId as string;
});

// 返回上一页
const handleBack = () => {
  router.back();
};

// 打开图片
const openImage = (url: string) => {
  window.open(url, "_blank");
};

// 获取来源网站名称
const getSourceName = (url: string) => {
  if (!url) return "未知";

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // 提取主域名
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }
    return hostname;
  } catch (error) {
    console.error("解析URL失败:", error);
    return "未知";
  }
};

// 加载原始图片信息
const loadOriginalPicture = async () => {
  if (!pictureId.value) {
    message.error("缺少图片ID参数");
    return;
  }

  try {
    loading.value = true;
    const res = await getPictureVoByIdUsingGet({ id: pictureId.value });
    if (res.data.code === 0 && res.data.data) {
      originalPicture.value = res.data.data;
      // 加载完原始图片后自动开始搜索
      await performSearch();
    } else {
      message.error("获取图片信息失败");
    }
  } catch (error) {
    console.error("获取图片信息失败:", error);
    message.error("获取图片信息失败");
  } finally {
    loading.value = false;
  }
};

// 执行以图搜图
const performSearch = async () => {
  if (!originalPicture.value) return;

  try {
    loading.value = true;
    const res = await searchPictureByPictureUsingPost({
      pictureId: originalPicture.value.id,
    });

    if (res.data.code === 0 && res.data.data) {
      searchResults.value = res.data.data;
      hasSearched.value = true;
      message.success(`找到 ${searchResults.value.length} 张相似图片`);
    } else {
      message.error("搜索失败");
      hasSearched.value = true;
    }
  } catch (error) {
    console.error("搜索失败:", error);
    message.error("搜索失败");
    hasSearched.value = true;
  } finally {
    loading.value = false;
  }
};

// 页面加载时执行
onMounted(() => {
  if (pictureId.value) {
    loadOriginalPicture();
  } else {
    message.error("缺少图片ID参数");
  }
});
</script>

<style scoped>
.search-picture-page {
  padding: 20px;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.original-image-container {
  max-width: 400px;
}

.original-image-card {
  width: 100%;
}

.original-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.search-results {
  flex: 1;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.image-size {
  font-weight: 500;
}

.image-source {
  color: #999;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .search-picture-page {
    padding: 16px;
  }

  .original-image-container {
    max-width: 100%;
  }
}
</style>

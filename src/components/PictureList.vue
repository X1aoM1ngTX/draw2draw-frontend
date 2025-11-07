<template>
  <div class="picture-list">
    <!-- 瀑布流图片列表 - 使用 vue-waterfall-plugin-next -->
    <Waterfall
      v-if="dataList.length > 0"
      ref="waterfall"
      :list="dataList"
      :width="280"
      :breakpoints="breakpoints"
      :gutter="16"
      :row-key="'id'"
      :img-selector="'url'"
    >
      <template #default="{ item, url, index }">
        <a-card
          hoverable
          :data-picture-id="item.id"
          @click="doClickPicture(item)"
        >
          <template #cover>
            <LazyImg :url="item.thumbnailUrl ?? item.url" />
          </template>
          <a-card-meta :title="item.name">
            <template #description>
              <a-flex wrap="wrap">
                <a-tag color="green">
                  {{ item.category ?? "默认" }}
                </a-tag>
                <a-tag v-for="tag in item.tags" :key="tag">
                  {{ tag }}
                </a-tag>
              </a-flex>
            </template>
            <template #avatar v-if="showAuthor && item.user">
              <a-avatar :src="item.user.userAvatar">
                {{
                  (item.user.userName || item.user.userAccount || "U")?.charAt(
                    0
                  )
                }}
              </a-avatar>
            </template>
          </a-card-meta>
          <template #actions v-if="showOperation">
            <a-space v-if="canEdit" @click="(e: Event) => doEdit(item, e)">
              <EditOutlined />
              编辑
            </a-space>
            <a-space v-if="canDelete" @click="(e: Event) => doDelete(item, e)">
              <DeleteOutlined />
              删除
            </a-space>
          </template>
        </a-card>
      </template>
    </Waterfall>

    <!-- 加载中提示 -->
    <div v-if="loading && dataList.length > 0" class="loading-tip">
      <a-spin size="large" />
    </div>

    <!-- 初始加载时的骨架屏 -->
    <div v-if="loading && dataList.length === 0" class="skeleton-container">
      <div v-for="i in 12" :key="i" class="skeleton-item">
        <a-skeleton :loading="true" active :paragraph="{ rows: 4 }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { deletePictureUsingPost } from "@/api/pictureController";
import { message } from "ant-design-vue";
import { onMounted, onUnmounted, ref } from "vue";
import { LazyImg, Waterfall } from "vue-waterfall-plugin-next";
import "vue-waterfall-plugin-next/dist/style.css";

interface Props {
  dataList?: API.PictureVO[];
  loading?: boolean;
  showOperation?: boolean;
  onReload?: () => void;
  showAuthor?: boolean; // 是否显示作者信息
  canEdit?: boolean; // 是否可以编辑
  canDelete?: boolean; // 是否可以删除
  enableInfiniteScroll?: boolean; // 是否启用无限滚动
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOperation: false,
  showAuthor: true, // 默认显示作者信息
  canEdit: false,
  canDelete: false,
  enableInfiniteScroll: true, // 默认启用无限滚动
});

// 事件发射
const emit = defineEmits<{
  (e: "scroll-bottom"): void;
  (e: "reload"): void;
}>();

// 暴露方法给父组件
const waterfall = ref();
defineExpose({ waterfall });

// 瀑布流响应式断点配置
const breakpoints = ref({
  1600: {
    // 屏幕≤1600px
    rowPerView: 5, // 5列
  },
  1200: {
    rowPerView: 4, // 4列
  },
  900: {
    rowPerView: 3, // 3列
  },
  700: {
    rowPerView: 2, // 2列
  },
  500: {
    rowPerView: 1, // 1列
  },
});

// 跳转至图片详情
const router = useRouter();
let scrollTimer: number | null = null; // 防抖定时器

// 点击图片
const doClickPicture = (picture: API.PictureVO) => {
  window.open(`/picture/${picture.id}`, '_blank');
};

// 编辑
const doEdit = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation();
  router.push({
    path: "/add_picture",
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  });
};

// 删除
const doDelete = async (picture: API.PictureVO, e: Event) => {
  e.stopPropagation();
  const id = picture.id;
  if (!id) {
    return;
  }
  const res = await deletePictureUsingPost({ id });
  if (res.data.code === 0) {
    message.success("删除成功");
    // 让外层刷新
    emit("reload");
    props?.onReload?.();
  } else {
    message.error("删除失败");
  }
};

// 简单的滚动事件监听
const handleScroll = () => {
  if (!props.enableInfiniteScroll || props.loading) {
    return;
  }

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollPercent = (scrollTop + windowHeight) / documentHeight;

  // 当滚动到90%时触发
  if (scrollPercent > 0.9) {
    // 防抖处理
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }
    scrollTimer = window.setTimeout(() => {
      emit("scroll-bottom");
    }, 200);
  }
};

// 组件挂载时设置监听
onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
});
</script>

<style scoped>
/* 瀑布流布局样式 */
.picture-list {
  width: 100%;
}

/* 加载中提示 */
.loading-tip {
  text-align: center;
  padding: 20px 0;
  color: #999;
}

/* 骨架屏容器 - 使用网格布局 */
.skeleton-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  width: 100%;
  padding: 16px;
  background-color: #f5f5f5;
}

.skeleton-item {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* 🔧 响应式调整 - 调整骨架屏列数 */
@media (max-width: 500px) {
  .skeleton-container {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (min-width: 500px) and (max-width: 700px) {
  .skeleton-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 700px) and (max-width: 900px) {
  .skeleton-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 900px) and (max-width: 1200px) {
  .skeleton-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1200px) and (max-width: 1600px) {
  .skeleton-container {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1600px) {
  .skeleton-container {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>

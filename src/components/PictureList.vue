<template>
  <div class="picture-list">
    <!-- 瀑布流图片列表 - 使用 CSS Columns 布局 -->
    <div class="columns-container">
      <div
        v-for="picture in dataList"
        :key="picture.id"
        class="column-item"
        @click="doClickPicture(picture)"
      >
        <a-card
          hoverable
          :data-picture-id="picture.id"
        >
          <template #cover>
            <img
              :alt="picture.name"
              :src="picture.thumbnailUrl ?? picture.url"
              loading="lazy"
            />
          </template>
          <a-card-meta :title="picture.name">
            <template #description>
              <a-flex wrap="wrap">
                <a-tag color="green">
                  {{ picture.category ?? "默认" }}
                </a-tag>
                <a-tag v-for="tag in picture.tags" :key="tag">
                  {{ tag }}
                </a-tag>
              </a-flex>
            </template>
            <template #avatar v-if="showAuthor && picture.user">
              <a-avatar :src="picture.user.userAvatar">
                {{
                  (
                    picture.user.userName ||
                    picture.user.userAccount ||
                    "U"
                  )?.charAt(0)
                }}
              </a-avatar>
            </template>
          </a-card-meta>
          <template #actions v-if="showOperation">
            <a-space
              v-if="canEdit"
              @click="(e: Event) => doEdit(picture, e)"
            >
              <EditOutlined />
              编辑
            </a-space>
            <a-space
              v-if="canDelete"
              @click="(e: Event) => doDelete(picture, e)"
            >
              <DeleteOutlined />
              删除
            </a-space>
          </template>
        </a-card>
      </div>
    </div>

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
import { onMounted, onUnmounted } from "vue";

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
defineExpose({});

// 跳转至图片详情
const router = useRouter();
let scrollTimer: number | null = null; // 防抖定时器

// 点击图片
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  });
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
  window.addEventListener('scroll', handleScroll, { passive: true });
});

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
});
</script>

<style scoped>
/* CSS Columns 瀑布流布局 */

/* 瀑布流容器 */
.columns-container {
  width: 100%;
  padding: 16px;
  background-color: #f5f5f5;

  /* 5列布局 */
  column-count: 5;
  column-gap: 16px;
  column-width: 200px; /* 每列最小宽度 */
}

/* 瀑布流项目 */
.column-item {
  break-inside: avoid; /* 防止卡片内部元素被分页 */
  page-break-inside: avoid;
  margin-bottom: 16px;
}

/* 卡片覆盖图片 */
.column-item :deep(.ant-card-cover) {
  margin: 0;
}

.column-item :deep(.ant-card-cover) img {
  width: 100%;
  height: auto;
  object-fit: cover; /* 可调整：cover(裁剪填满), contain(完整显示) */
  display: block;
}

/* 标签换行 */
.column-item :deep(.ant-flex) {
  margin-top: 8px;
}

/* 加载中提示 */
.loading-tip {
  text-align: center;
  padding: 20px 0;
  color: #999;
}

/* 骨架屏容器 - 使用相同的 Columns 布局 */
.skeleton-container {
  column-count: 5;
  column-gap: 16px;
  column-width: 200px;
  width: 100%;
  padding: 16px;
  background-color: #f5f5f5;
}

.skeleton-item {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 16px;
}

/* 🔧 响应式调整 - 调整列数 */
@media (max-width: 576px) {
  .columns-container,
  .skeleton-container {
    column-count: 2; /* 移动端2列 */
    column-gap: 8px;
    padding: 8px;
  }
  .skeleton-item {
    margin-bottom: 8px;
  }
}

@media (min-width: 576px) and (max-width: 768px) {
  .columns-container,
  .skeleton-container {
    column-count: 3; /* 平板3列 */
    column-gap: 12px;
  }
}

@media (min-width: 768px) and (max-width: 1200px) {
  .columns-container,
  .skeleton-container {
    column-count: 4; /* 小桌面4列 */
    column-gap: 16px;
  }
}

@media (min-width: 1200px) {
  .columns-container,
  .skeleton-container {
    column-count: 5; /* 大桌面5列 */
    column-gap: 16px;
  }
}
</style>

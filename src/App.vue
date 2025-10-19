<template>
  <div class="app" @contextmenu.prevent="handleContextMenu">
    <BasicLayout />

    <!-- 通用右键菜单 -->
    <div
      v-show="showContextMenu && menuType === 'default'"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      class="custom-context-menu"
    >
      <ul class="context-menu-list">
        <li @click="handleRefresh">
          <reload-outlined />
          刷新
        </li>
        <li @click="handleGoBack">
          <left-outlined />
          返回
        </li>
        <li @click="handleGoForward">
          <right-outlined />
          前进
        </li>
      </ul>
    </div>

    <!-- 图片右键菜单 -->
    <div
      v-show="showContextMenu && menuType === 'image'"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      class="custom-context-menu"
    >
      <ul class="context-menu-list">
        <li @click="handleSearchByImage">
          <search-outlined />
          以图搜图
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import BasicLayout from "./layouts/BasicLayout.vue";
import {
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const menuType = ref<"default" | "image">("default");
const selectedImageId = ref<string | null>(null);

// 处理右键点击事件
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  const target = e.target as HTMLElement;

  // 获取点击位置
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;

  // 检查是否是图片元素
  if (target.tagName === "IMG") {
    menuType.value = "image";
    // 尝试从图片元素或其父元素获取图片ID
    const imgElement = target as HTMLImageElement;
    // 从图片URL中提取ID，或者从data属性中获取
    const imgSrc = imgElement.src;
    const idMatch = imgSrc.match(/\/picture\/(\d+)/);
    if (idMatch) {
      selectedImageId.value = idMatch[1];
    } else {
      // 尝试从父元素的data属性获取
      const parentCard = target.closest(".ant-card");
      if (parentCard) {
        const cardElement = parentCard as HTMLElement;
        const pictureId = cardElement.getAttribute("data-picture-id");
        selectedImageId.value = pictureId;
      }
    }
  } else {
    menuType.value = "default";
    selectedImageId.value = null;
  }

  showContextMenu.value = true;
};

// 处理点击其他区域关闭菜单
const handleClickOutside = () => {
  showContextMenu.value = false;
};

// 页面刷新事件
const handleRefresh = () => {
  window.location.reload();
  showContextMenu.value = false;
};

// 页面后退事件
const handleGoBack = () => {
  router.back();
  showContextMenu.value = false;
};

// 页面前进事件
const handleGoForward = () => {
  router.forward();
  showContextMenu.value = false;
};

// 以图搜图功能
const handleSearchByImage = () => {
  if (selectedImageId.value) {
    // 在新标签页中打开以图搜图页面，传递图片ID作为参数
    const url = `${window.location.origin}/search_picture?pictureId=${selectedImageId.value}`;
    window.open(url, "_blank");
  }
  showContextMenu.value = false;
};

// 禁用右键菜单
const disableContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  return false;
};

onMounted(() => {
  // 添加全局右键菜单禁用
  document.addEventListener("contextmenu", disableContextMenu);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  // 移除事件监听器，防止内存泄漏
  document.removeEventListener("contextmenu", disableContextMenu);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.app {
  position: relative;
}

.custom-context-menu {
  position: fixed;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  z-index: 1000;
  min-width: 160px;
}

.context-menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu-list li {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #000000;
  transition: all 0.3s;
}

.context-menu-list li:hover {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

/* 图标样式 */
.context-menu-list .anticon {
  font-size: 16px;
}
</style>

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

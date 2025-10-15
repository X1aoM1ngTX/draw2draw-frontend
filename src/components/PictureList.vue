<template>
  <div class="picture-list">
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card
            hoverable
            @click="doClickPicture(picture)"
            :data-picture-id="picture.id"
          >
            <template #cover>
              <img
                style="height: 180px; object-fit: cover"
                :alt="picture.name"
                :src="picture.thumbnailUrl ?? picture.url"
                loading="lazy"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? "默认" }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template #actions v-if="showOperation">
              <a-space @click="(e: Event) => doEdit(picture, e)">
                <EditOutlined />
                编辑
              </a-space>
              <a-space @click="(e: Event) => doDelete(picture, e)">
                <DeleteOutlined />
                删除
              </a-space>
            </template>
            <!-- 作者信息放在右下角 -->
            <div class="author-info-bottom" v-if="picture.user">
              <span class="author-name">{{
                picture.user.userName || picture.user.userAccount
              }}</span>
              <a-avatar :src="picture.user.userAvatar" :size="24">
                {{
                  (
                    picture.user.userName ||
                    picture.user.userAccount ||
                    "U"
                  )?.charAt(0)
                }}
              </a-avatar>
            </div>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { deletePictureUsingPost } from "@/api/pictureController";
import { message } from "ant-design-vue";

interface Props {
  dataList?: API.PictureVO[];
  loading?: boolean;
  showOperation?: boolean;
  onReload?: () => void;
  showAuthor?: boolean; // 是否显示作者信息
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOperation: false,
  showAuthor: true, // 默认显示作者信息
});

// 跳转至图片详情
const router = useRouter();

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
    props?.onReload?.();
  } else {
    message.error("删除失败");
  }
};
</script>

<style scoped>
.author-info-bottom {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 16px;
  z-index: 1;
}

.author-name {
  margin-right: 8px;
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

/* 确保卡片有相对定位，以便绝对定位的作者信息可以正确定位 */
.ant-card {
  position: relative !important;
}
</style>

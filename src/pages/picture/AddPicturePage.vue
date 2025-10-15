<template>
  <div class="add-picture-page">
    <h1 style="margin-bottom: 16px">
      {{ route.query?.id ? "修改图片" : "创建图片" }}
    </h1>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：
      <a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>

    <!-- 选择上传方式 -->
    <a-tabs v-model:activeKey="uploadType"
      >>
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload
          :picture="picture"
          :spaceId="spaceId"
          :onSuccess="onSuccess"
        />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL 上传" force-render>
        <UrlPictureUpload
          :picture="picture"
          :spaceId="spaceId"
          :onSuccess="onSuccess"
        />
      </a-tab-pane>
    </a-tabs>
    <!-- 图片编辑 -->
    <div v-if="picture" class="edit-bar">
      <a-space>
        <a-button @click="doEditPicture"><EditOutlined />编辑图片</a-button>
        <a-button @click="doImagePainting"><FullscreenOutlined />AI扩图</a-button>
      </a-space>
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onCropSuccess"
      />
      <ImageOutPainting
        ref="imageOutPaintingRef"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onImageOutPaintingSuccess"
      />
    </div>
    <!-- 创建图片表单 -->
    <a-form
      v-if="picture"
      layout="vertical"
      name="pictureForm"
      :model="pictureForm"
      @finish="handleSubmit"
    >
      <a-form-item label="名称" name="name">
        <a-input
          v-model:value="pictureForm.name"
          placeholder="请输入图片名称"
        />
      </a-form-item>
      <a-form-item label="简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          :auto-size="{ minRows: 1, maxRows: 5 }"
          placeholder="请输入图片简介"
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请选择图片分类"
          :options="categoryOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="pictureForm.tags"
          placeholder="请输入图片标签"
          mode="tags"
          :options="tagOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">
          {{ route.query?.id ? "修改" : "创建" }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from "@/api/pictureController";
import { EditOutlined, FullscreenOutlined } from "@ant-design/icons-vue";
import ImageCropper from "@/components/ImageCropper.vue";
import ImageOutPainting from "@/components/ImageOutPainting.vue";
import PictureUpload from "@/components/PictureUpload.vue";
import UrlPictureUpload from "@/components/UrlPictureUpload.vue";
import router from "@/router";
import { message } from "ant-design-vue";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

const picture = ref<API.PictureVO>();
const pictureForm = reactive<API.PictureEditRequest>({});
const route = useRoute();
const uploadType = ref<"file" | "url">("file");
const spaceId = computed(() => {
  return route.query?.spaceId;
});

/**
 * 提交表单
 * @param value 提交表单的值
 */
const handleSubmit = async (value: any) => {
  const pictureId = picture.value?.id;
  if (!pictureId) {
    return;
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...value,
  });
  if (res.data.data && res.data.code === 0) {
    message.success("创建成功");
    router.push(`/picture/${pictureId}`);
  } else {
    message.success("创建失败：" + res.data.message);
  }
};

/**
 * 图片上传成功
 * @param newPicture 新创建的图片
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture;
  pictureForm.name = newPicture.name;
};

const categoryOptions = ref<string[]>([]);
const tagOptions = ref<string[]>([]);

/**
 * 获取图片分类和标签
 * @param value
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet();
  if (res.data.data && res.data.code === 0) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      };
    });
    categoryOptions.value = (res.data.data.categoryList ?? []).map(
      (data: string) => {
        return {
          value: data,
          label: data,
        };
      }
    );
  } else {
    message.success("获取标签分类失败：" + res.data.message);
  }
};

/**
 * 获取旧图片信息
 */
const getOldPicture = async () => {
  const id = route.query?.id;
  if (id) {
    const res = await getPictureVoByIdUsingGet({ id });
    if (res.data.data && res.data.code === 0) {
      const data = res.data.data;
      picture.value = data;
      pictureForm.name = data.name;
      pictureForm.introduction = data.introduction;
      pictureForm.category = data.category;
      pictureForm.tags = data.tags;
    }
  }
};

// ------ 图片编辑 ------
const imageCropperRef = ref();

// 编辑图片弹窗
const doEditPicture = async () => {
  imageCropperRef.value?.openModal();
};

// 编辑图片成功事件
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture;
};

// ------ AI 扩图 -------
const imageOutPaintingRef = ref();

// AI 扩图弹窗
const doImagePainting = async () => {
  imageOutPaintingRef.value?.openModal();
};

// AI 扩图保存事件
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture;
};

onMounted(() => {
  getTagCategoryOptions();
  getOldPicture();
});
</script>

<style scoped>
.add-picture-page {
  max-width: 720px;
  margin: 0 auto;
}

.edit-bar {
  text-align: center;
}
</style>

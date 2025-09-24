<template>
  <div class="picture-uploader">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :customRequest="handleUpload"
      :before-upload="beforeUpload"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="picture" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传图片</div>
      </div>
    </a-upload>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import type { UploadProps } from "ant-design-vue";
import { uploadPictureUsingPost } from "@/api/pictureController";

interface Props {
  picture?: API.PictureVO;
  onSuccess?: (nesPicture: API.PictureVO) => void;
}

const props = defineProps<Props>();

/**
 * 上传图片
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true;
  try {
    const params = props.picture ? { id: props.picture.id } : {};
    const res = await uploadPictureUsingPost(params, {}, file);
    if (res.data.code === 0 && res.data.data) {
      message.success("图片上传成功");
      props.onSuccess?.(res.data.data);
    } else {
      message.error("图片上传失败," + res.data.message);
    }
  } catch (error) {
    console.error("图片上传失败" + error);
    message.error("图片上传失败," + res.data.message);
  }

  loading.value = false;
};

const loading = ref<boolean>(false);

/**
 * 上传图片之前的校验
 * @param file
 */
const beforeUpload = (file: UploadProps["fileList"][number]) => {
  // 判断图片格式
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("不支持的图片格式!请上传 JPG/PNG 格式的图片");
  }
  // 判断图片大小
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过 2MB!");
  }
  return isJpgOrPng && isLt2M;
};
</script>

<style scoped>
.picture-uploader :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-width: 152px;
  min-height: 152px;
}

.picture-uploader img {
  max-width: 100%;
  max-height: 480px;
}

.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>

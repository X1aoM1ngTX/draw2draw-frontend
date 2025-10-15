<template>
  <div class="share-modal">
    <a-modal
      v-model:visible="visible"
      title="分享图片"
      :footer="false"
      @cancel="closeModal"
    >
      <h4><LinkOutlined /> 复制链接</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
      <div style="margin-bottom: 16px" />
      <h4>手机扫码查看</h4>
      <a-qrcode :value="link" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { LinkOutlined } from "@ant-design/icons-vue";
import { defineProps, ref, withDefaults } from "vue";

/**
 * 定义组件属性类型
 */
interface Props {
  title: string;
  link: string;
}

/**
 * 给组件指定初始值
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  title: () => "分享",
  // link: () => "https://picture.game9hq.xyz/share/X1aoM1ngTX",
  link: () => "http://localhost:5173/", // TODO: 这里需要动态生成链接
});

const visible = ref<boolean>(false);

// 打开弹窗
const openModal = () => {
  visible.value = true;
};

// 关闭弹窗
const closeModal = () => {
  visible.value = false;
};

// 暴露方法给父组件调用
defineExpose({
  openModal,
  closeModal,
});
</script>

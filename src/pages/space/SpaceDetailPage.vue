<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <a-flex justify="space-between">
      <a-space size="middle">
        <h2>{{ space.spaceName }}（私有空间）</h2>
        <a-tooltip
          :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
        >
          <a-progress
            type="circle"
            :size="42"
            :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
          />
        </a-tooltip>
      </a-space>
      <a-button type="primary" @click="showUploadModal = true">
        + 创建图片
      </a-button>
    </a-flex>
    <div style="margin-bottom: 16px" />
    <!-- 图片列表 -->
    <PictureList
      :showOperation="true"
      :dataList="dataList"
      :loading="loading"
      :showOp="true"
      :onReload="fetchData"
    />
    <!-- 分页 -->
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    />

    <!-- 图片上传弹窗 -->
    <a-modal
      v-model:open="showUploadModal"
      title="上传图片"
      width="800px"
      :footer="null"
      @cancel="handleModalCancel"
    >
      <div class="upload-modal-content">
        <!-- 选择上传方式 -->
        <a-tabs v-model:activeKey="uploadType">
          <a-tab-pane key="file" tab="文件上传">
            <PictureUpload
              :picture="picture"
              :spaceId="id"
              :onSuccess="onUploadSuccess"
            />
          </a-tab-pane>
          <a-tab-pane key="url" tab="URL 上传" force-render>
            <UrlPictureUpload
              :picture="picture"
              :spaceId="id"
              :onSuccess="onUploadSuccess"
            />
          </a-tab-pane>
        </a-tabs>

        <!-- 创建图片表单 -->
        <a-form
          v-if="picture"
          layout="vertical"
          name="pictureForm"
          :model="pictureForm"
          @finish="handleSubmit"
          style="margin-top: 16px"
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
            <a-space>
              <a-button type="primary" html-type="submit"> 创建 </a-button>
              <a-button @click="handleModalCancel">取消</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getSpaceVoByIdUsingGet } from "@/api/spaceController.ts";
import { message } from "ant-design-vue";
import {
  listPictureVoByPageUsingPost,
  listPictureTagCategoryUsingGet,
  editPictureUsingPost,
} from "@/api/pictureController.ts";
import { formatSize } from "@/utils";
import PictureList from "@/components/PictureList.vue";
import PictureUpload from "@/components/PictureUpload.vue";
import UrlPictureUpload from "@/components/UrlPictureUpload.vue";

interface Props {
  id: string | number;
}

const props = defineProps<Props>();
const space = ref<API.SpaceVO>({});

// 弹窗相关状态
const showUploadModal = ref(false);
const uploadType = ref<"file" | "url">("file");
const picture = ref<API.PictureVO>();
const pictureForm = reactive<API.PictureEditRequest>({});
const categoryOptions = ref<string[]>([]);
const tagOptions = ref<string[]>([]);

// -------- 获取空间详情 --------
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    });
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data;
    } else {
      message.error("获取空间详情失败，" + res.data.message);
    }
  } catch (e: any) {
    message.error("获取空间详情失败：" + e.message);
  }
};

// --------- 获取图片列表 --------

// 定义数据
const dataList = ref<API.PictureVO[]>([]);
const total = ref(0);
const loading = ref(true);

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: "createTime",
  sortOrder: "descend",
});

// 获取数据
const fetchData = async () => {
  loading.value = true;
  // 转换搜索参数
  const params = {
    spaceId: props.id,
    ...searchParams,
  };
  const res = await listPictureVoByPageUsingPost(params);
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? [];
    total.value = res.data.data.total ?? 0;
  } else {
    message.error("获取数据失败，" + res.data.message);
  }
  loading.value = false;
};

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page;
  searchParams.pageSize = pageSize;
  fetchData();
};

// 弹窗相关方法
/**
 * 图片上传成功
 * @param newPicture 新创建的图片
 */
const onUploadSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture;
  pictureForm.name = newPicture.name;
};

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
    spaceId: props.id,
    ...value,
  });
  if (res.data.data && res.data.code === 0) {
    message.success("创建成功");
    handleModalCancel();
    fetchData(); // 刷新图片列表
  } else {
    message.error("创建失败：" + res.data.message);
  }
};

/**
 * 获取图片分类和标签
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
    message.error("获取标签分类失败：" + res.data.message);
  }
};

/**
 * 关闭弹窗并重置状态
 */
const handleModalCancel = () => {
  showUploadModal.value = false;
  picture.value = undefined;
  Object.keys(pictureForm).forEach((key) => {
    delete pictureForm[key];
  });
};

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchSpaceDetail();
  fetchData();
  getTagCategoryOptions();
});
</script>

<style scoped>
#spaceDetailPage {
  margin-bottom: 16px;
}

.upload-modal-content {
  max-height: 70vh;
  overflow-y: auto;
}
</style>

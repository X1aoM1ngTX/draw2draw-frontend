<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <a-flex justify="space-between">
      <a-space size="middle">
        <h2>{{ space.spaceName }}（{{ SPACE_TYPE_MAP[space.spaceType] }}）</h2>
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
      <a-space>
        <a-button v-if="canEditPicture" @click="doBatchEdit">
          <EditOutlined />批量编辑
        </a-button>
        <a-button
          v-if="canUploadPicture"
          type="primary"
          ghost
          @click="showUploadModal = true"
        >
          <PlusOutlined />创建图片
        </a-button>
        <a-button
          v-if="canManageSpaceUser && SPACE_TYPE_ENUM.TEAM === Number(space.spaceType)"
          type="primary"
          ghost
          :href="`/space/${id}/memberManage`"
        >
          <TeamOutlined />
          成员管理
        </a-button>
        <a-button
          v-if="canManageSpaceUser"
          type="primary"
          @click="toSpaceAnalysis"
        >
          <BarChartOutlined />空间分析
        </a-button>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />
    <!-- 搜索表单 -->
    <PictureSearchForm :onSearch="onSearch" />
    <!-- 图片列表 -->
    <PictureList
      :showOperation="true"
      :dataList="dataList"
      :loading="loading"
      :showOp="true"
      :onReload="fetchData"
      :showAuthor="false"
      :canEdit="canEditPicture"
      :canDelete="canDeletePicture"
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

    <!-- 批量编辑图片弹窗 -->
    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :pictureList="dataList"
      :spaceId="id"
      :onSuccess="onBatchEditPictureSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getSpaceVoByIdUsingGet } from "@/api/spaceController.ts";
import { message } from "ant-design-vue";
import {
  PlusOutlined,
  EditOutlined,
  BarChartOutlined,
  TeamOutlined,
} from "@ant-design/icons-vue";
import {
  listPictureVoByPageUsingPost,
  listPictureTagCategoryUsingGet,
  editPictureUsingPost,
  searchPictureByColorUsingPost,
} from "@/api/pictureController.ts";
import { formatSize } from "@/utils";
import {
  SPACE_TYPE_MAP,
  SPACE_TYPE_ENUM,
  SPACE_PERMISSION_ENUM,
} from "@/constants/space";
import PictureList from "@/components/PictureList.vue";
import PictureUpload from "@/components/PictureUpload.vue";
import UrlPictureUpload from "@/components/UrlPictureUpload.vue";
import PictureSearchForm from "@/components/PictureSearchForm.vue";
import BatchEditPictureModal from "@/components/BatchEditPictureModal.vue";

interface Props {
  id: string | number;
}

const props = defineProps<Props>();
const router = useRouter();
const space = ref<API.SpaceVO>({});

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission);
  });
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(
  SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE
);
const canUploadPicture = createPermissionChecker(
  SPACE_PERMISSION_ENUM.PICTURE_UPLOAD
);
const canEditPicture = createPermissionChecker(
  SPACE_PERMISSION_ENUM.PICTURE_EDIT
);
const canDeletePicture = createPermissionChecker(
  SPACE_PERMISSION_ENUM.PICTURE_DELETE
);

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
    // 验证 id 参数
    if (!props.id || isNaN(Number(props.id)) || Number(props.id) <= 0) {
      message.error("无效的空间ID");
      router.push("/my_space");
      return;
    }

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
const searchParams = ref<API.PictureQueryRequest & { picColor?: string }>({
  current: 1,
  pageSize: 10,
  sortField: "createTime",
  sortOrder: "descend",
});

// 获取数据
const fetchData = async () => {
  loading.value = true;

  try {
    // 检查是否有颜色搜索参数
    if (searchParams.value.picColor) {
      // 使用颜色搜索API
      const res = await searchPictureByColorUsingPost({
        picColor: searchParams.value.picColor,
        spaceId: props.id,
      });

      if (res.data.code === 0 && res.data.data) {
        let records = res.data.data ?? [];

        // 如果有尺寸预设，进行前端过滤
        if ((searchParams.value as Record<string, unknown>).sizePreset) {
          records = filterPicturesBySizePreset(
            records,
            (searchParams.value as Record<string, unknown>).sizePreset as string
          );
        }

        dataList.value = records;
        total.value = records.length;
      } else {
        message.error("获取数据失败，" + res.data.message);
      }
    } else {
      // 使用常规分页搜索API
      const params = {
        spaceId: props.id,
        ...searchParams.value,
      };
      const res = await listPictureVoByPageUsingPost(params);
      if (res.data.code === 0 && res.data.data) {
        let records = res.data.data.records ?? [];

        // 如果有尺寸预设，进行前端过滤
        if ((searchParams.value as Record<string, unknown>).sizePreset) {
          records = filterPicturesBySizePreset(
            records,
            (searchParams.value as Record<string, unknown>).sizePreset as string
          );
        }

        dataList.value = records;
        total.value = records.length;
      } else {
        message.error("获取数据失败，" + res.data.message);
      }
    }
  } catch (error: any) {
    message.error("获取数据失败：" + error.message);
  }

  loading.value = false;
};

// 根据尺寸预设过滤图片
const filterPicturesBySizePreset = (
  pictures: API.PictureVO[],
  preset: string
) => {
  return pictures.filter((picture) => {
    const width = picture.picWidth || 0;
    const height = picture.picHeight || 0;

    switch (preset) {
      case "small":
        // 小：0-400 (宽或高任一满足即可)
        return (
          (width <= 400 && height <= 400) ||
          (width <= 400 && height > 0) ||
          (height <= 400 && width > 0)
        );
      case "medium":
        // 中：401-800 (宽或高任一满足即可)
        return (width > 400 && width <= 800) || (height > 400 && height <= 800);
      case "large":
        // 大：801-1200 (宽或高任一满足即可)
        return (
          (width > 800 && width <= 1200) || (height > 800 && height <= 1200)
        );
      case "xlarge":
        // 特大：1201以上 (宽或高任一满足即可)
        return width > 1200 || height > 1200;
      default:
        return true;
    }
  });
};

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page;
  searchParams.value.pageSize = pageSize;
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

const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  };
  fetchData();
};

// 分享弹窗引用
const batchEditPictureModalRef = ref();

// 批量编辑成功后，刷新数据
const onBatchEditPictureSuccess = () => {
  fetchData();
};

// 打开批量编辑弹窗
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal();
  }
};

// 跳转到空间分析页面
const toSpaceAnalysis = () => {
  router.push({
    path: "/space_analyze",
    query: {
      spaceId: props.id,
    },
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

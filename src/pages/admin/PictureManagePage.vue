<template>
  <!-- 标题和操作按钮 -->
  <div class="header-container">
    <a-flex justify="space-between">
      <h2>图片管理</h2>
      <a-space>
        <a-tooltip title="刷新">
          <a-button
            type="primary"
            shape="circle"
            :icon="h(SyncOutlined)"
            @click="fetchData()"
          />
        </a-tooltip>
        <a-button type="primary" href="/add_picture" target="_blank"
          >+ 创建图片</a-button
        >
        <a-button type="primary" href="/add_picture/batch" target="_blank" ghost
          >+ 批量创建图片</a-button
        >
      </a-space>
    </a-flex>
  </div>

  <!-- 搜索表单 -->
  <div class="search-form-container">
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称、简介中搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="类型" name="category">
        <a-input
          v-model:value="searchParams.category"
          placeholder="输入类型"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          mode="tags"
          style="min-width: 180px"
          placeholder="输入标签"
          allow-clear
          v-model:value="searchParams.tags"
        />
      </a-form-item>
      <a-form-item label="审核状态" name="reviewStatus">
        <a-select
          style="width: 180px"
          v-model:value="searchParams.reviewStatus"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          placeholder="请输入审核状态"
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
  </div>
  <div style="margin-bottom: 16px" />

  <!-- 表格 -->
  <a-table
    layout="inline"
    :columns="columns"
    :data-source="dataList"
    :pagination="pagination"
    @change="doTableChange"
  >
    <!-- 表格内容 -->
    <template #bodyCell="{ column, record }">
      <!-- ID -->
      <template v-if="column.dataIndex === 'id'">
        <span @click="copyId(record.id)" style="cursor: pointer" title="点击复制ID">
          {{ record.id }}
        </span>
      </template>
      <!-- 图片 -->
      <template v-else-if="column.dataIndex === 'url'">
        <a-image :src="record.url" width="80px" />
      </template>
      <!-- 分类 -->
      <template v-else-if="column.dataIndex === 'tags'">
        <a-space wrap>
          <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{
            tag
          }}</a-tag>
        </a-space>
      </template>
      <!-- 图片信息 -->
      <template v-else-if="column.dataIndex === 'picInfo'">
        <div>格式：{{ record.picFormat }}</div>
        <div>宽度：{{ record.picWidth }}</div>
        <div>高度：{{ record.picHeight }}</div>
        <div>宽高比：{{ record.picScale }}</div>
        <div>大小： {{ (record.picSize / 1024).toFixed(2) }}KB</div>
      </template>
      <!-- 用户ID -->
       <template v-else-if="column.dataIndex === 'userId'">
        <span @click="copyId(record.userId)" style="cursor: pointer" title="点击复制ID">
          {{ record.userId }}
        </span>
       </template>
      <!-- 审核信息 -->
      <template v-if="column.dataIndex === 'reviewInfo'">
        <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
        <div>审核信息：{{ record.reviewMessage }}</div>
        <div>审核人：{{ record.reviewerId }}</div>
        <div v-if="record.reviewTime">
          审核时间：{{ dayjs(record.reviewTime).format("YYYY-MM-DD HH:mm:ss") }}
        </div>
      </template>
      <!-- 创建时间 -->
      <template v-else-if="column.dataIndex === 'createTime'">
        {{ dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
      <!-- 编辑时间 -->
      <template v-else-if="column.dataIndex === 'editTime'">
        {{ dayjs(record.editTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
      <!-- 操作 -->
      <template v-else-if="column.key === 'action'">
        <a-button
          type="link"
          :disabled="record.reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS"
          @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
          >通过</a-button
        >
        <a-button
          type="link"
          danger
          :disabled="record.reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT"
          @click="
            showReviewConfirm(record, PIC_REVIEW_STATUS_ENUM.REJECT, '拒绝')
          "
          >拒绝</a-button
        >
        <a-button type="link" danger @click="doDelete(record.id)"
          >删除</a-button
        >
        <a-button
          type="link"
          :href="`/add_picture?id=${record.id}`"
          target="_blank"
          >编辑</a-button
        >
      </template>
    </template>
  </a-table>
  <a-back-top />
</template>

<script lang="ts" setup>
import { message, Modal } from "ant-design-vue";
import { SyncOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, reactive, ref, h } from "vue";
import dayjs from "dayjs";
import {
  listPictureByPageUsingPost,
  deletePictureUsingPost,
  doPictureReviewUsingPost,
} from "@/api/pictureController";
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from "@/constants/picture";

const columns = [
  {
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "图片",
    dataIndex: "url",
  },
  {
    title: "名称",
    dataIndex: "name",
  },
  {
    title: "简介",
    dataIndex: "introduction",
    ellipsis: true,
  },
  {
    title: "类型",
    dataIndex: "category",
    align: "center",
  },
  {
    title: "标签",
    dataIndex: "tags",
    align: "center",
  },
  {
    title: "图片信息",
    dataIndex: "picInfo",
  },
  {
    title: "用户ID",
    dataIndex: "userId",
    align: "center",
  },
  {
    title: "审核信息",
    dataIndex: "reviewInfo",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    align: "center",
  },
  {
    title: "编辑时间",
    dataIndex: "editTime",
    align: "center",
  },
  {
    title: "操作",
    key: "action",
    align: "center",
  },
];

// 数据
const dataList = ref<API.Picture[]>([]);
const total = ref(0);

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: "createTime",
  sortOrder: "descend",
});

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  };
});

// 获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  });
  if (res.data.data && res.data.code === 0) {
    dataList.value = res.data.data.records ?? [];
    total.value = res.data.data.total ?? 0;
  } else {
    message.error("获取数据失败，" + res.data.message);
  }
};

// 表格变化之后，重新获取数据
const doTableChange = (page: { current: number; pageSize: number }) => {
  searchParams.current = page.current;
  searchParams.pageSize = page.pageSize;
  fetchData();
};

// 搜索数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1;
  fetchData();
};

// 复制ID
const copyId = (id: number) => {
  navigator.clipboard
    .writeText(id.toString())
    .then(() => {
      message.success("ID已复制到剪贴板");
    })
    .catch(() => {
      message.error("复制失败，请手动复制");
    });
};

// 删除数据
const doDelete = async (id: number) => {
  if (!id) {
    return;
  }

  Modal.confirm({
    title: "确认删除",
    content: "确定要删除该图片吗？此操作不可恢复。",
    okText: "确认",
    cancelText: "取消",
    onOk: async () => {
      const res = await deletePictureUsingPost({ id: id });
      if (res.data.code === 0) {
        message.success("删除成功");
        // 刷新数据
        fetchData();
      } else {
        message.error("删除失败");
      }
    },
    onCancel: () => {
      message.info("已取消删除");
    },
  });
};

// 显示审核确认框
const showReviewConfirm = (
  record: API.Picture,
  reviewStatus: number,
  actionText: string
) => {
  Modal.confirm({
    title: `确认${actionText}`,
    content: `确定要${actionText}该图片吗？`,
    okText: "确认",
    cancelText: "取消",
    onOk: async () => {
      await handleReview(record, reviewStatus);
    },
  });
};

// 审核图片
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS
      ? "管理员操作通过"
      : "管理员操作拒绝";
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  });
  if (res.data.code === 0) {
    message.success("审核操作成功");
    // 重新获取列表
    fetchData();
  } else {
    message.error("审核操作失败，" + res.data.message);
  }
};

// 页面加载时请求一次
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.header-container {
  margin-bottom: 16px;
}

.search-form-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  position: relative;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: opacity 0.3s ease;
}
</style>

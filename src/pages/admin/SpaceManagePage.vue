<template>
  <!-- 标题和操作按钮 -->
  <a-flex justify="space-between" style="margin-bottom: 8px">
    <h2>空间管理</h2>
    <a-space>
      <a-tooltip title="刷新">
        <a-button
          type="primary"
          shape="circle"
          :icon="h(SyncOutlined)"
          @click="fetchData()"
        />
      </a-tooltip>
      <a-button type="primary" href="/add_space" target="_blank"
        >+ 创建空间</a-button
      >
    </a-space>
  </a-flex>

  <!-- 搜索表单 -->
  <div class="search-form-container">
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="空间名称" name="spaceName">
        <a-input
          v-model:value="searchParams.spaceName"
          placeholder="请输入空间名称"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="searchParams.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请输入空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="用户 id" name="userId">
        <a-input
          v-model:value="searchParams.userId"
          placeholder="请输入用户 id"
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
        <span @click="copyId(record.id)" style="cursor: pointer">
          {{ record.id }}
        </span>
      </template>

      <template v-else-if="column.dataIndex === 'spaceName'">
        {{ record.spaceName || "-" }}
      </template>

      <!-- 空间级别 -->
      <template v-if="column.dataIndex === 'spaceLevel'">
        <a-tag>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
      </template>
      <!-- 使用情况 -->
      <template v-if="column.dataIndex === 'spaceUseInfo'">
        <div>
          大小：{{ formatSize(Number(record.totalSize)) }} /
          {{ formatSize(Number(record.maxSize)) }}
        </div>
        <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
      </template>
      <template v-else-if="column.dataIndex === 'createTime'">
        {{ dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
      <template v-else-if="column.dataIndex === 'editTime'">
        {{ dayjs(record.editTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
      <template v-else-if="column.key === 'action'">
        <a-space wrap>
          <a-button
            type="link"
            :href="`/add_space?id=${record.id}`"
            target="_blank"
          >
            编辑
          </a-button>
          <a-button type="link" danger @click="doDelete(record.id)"
            >删除</a-button
          >
        </a-space>
      </template>
    </template>
  </a-table>
  <a-back-top />
</template>

<script lang="ts" setup>
import {
  deleteSpaceUsingPost,
  listSpaceByPageUsingPost,
} from "@/api/spaceController";
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from "@/constants/space";
import { message, Modal } from "ant-design-vue";
import { SyncOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, reactive, ref, h } from "vue";
import dayjs from "dayjs";

// 表格列定义
const columns = [
  {
    title: "空间ID",
    dataIndex: "id",
    width: 180,
  },
  {
    title: "空间名称",
    dataIndex: "spaceName",
  },
  {
    title: "空间级别",
    dataIndex: "spaceLevel",
    width: 120,
  },
  {
    title: "使用情况",
    dataIndex: "spaceUseInfo",
    width: 200,
  },
  {
    title: "用户ID",
    dataIndex: "userId",
    width: 180,
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    width: 180,
  },
  {
    title: "编辑时间",
    dataIndex: "editTime",
    width: 180,
  },
  {
    title: "操作",
    key: "action",

    align: "center",
    width: 170,
  },
];

// 数据
const dataList = ref<API.Space[]>([]);
const total = ref(0);

// 搜索条件
const searchParams = reactive<API.SpaceQueryRequest>({
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
  const res = await listSpaceByPageUsingPost({
    ...searchParams,
  });
  if (res.data.data) {
    dataList.value = res.data.data.records ?? [];
    // 将字符串类型的total转换为数字类型
    total.value = Number(res.data.data.total) ?? 0;
    console.log("获取到的数据:", res.data.data);
    console.log("数据列表:", dataList.value);
  } else {
    message.error("获取数据失败，" + res.data.message);
  }
};

// 页面加载时请求一次
onMounted(() => {
  fetchData();
});

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

// 删除数据
const doDelete = async (id: number) => {
  if (!id) {
    return;
  }

  Modal.confirm({
    title: "确认删除",
    content: "确定要删除该空间吗？此操作不可恢复。",
    okText: "确认",
    cancelText: "取消",
    onOk: async () => {
      const res = await deleteSpaceUsingPost({ id });
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

// 格式化大小
const formatSize = (size: number) => {
  if (!size || isNaN(size)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let formattedSize = size;

  while (formattedSize >= 1024 && index < units.length - 1) {
    formattedSize /= 1024;
    index++;
  }

  return `${formattedSize.toFixed(2)} ${units[index]}`;
};
</script>

<style scoped>
.search-form-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
</style>

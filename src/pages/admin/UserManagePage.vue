<template>
  <!-- 搜索表单 -->
  <div class="search-form-container">
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input
          v-model:value="searchParams.userAccount"
          placeholder="输入账号"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input
          v-model:value="searchParams.userName"
          placeholder="输入用户名"
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

      <template v-else-if="column.dataIndex === 'userAccount'">
        {{ record.userAccount }}
      </template>

      <template v-else-if="column.dataIndex === 'userName'">
        {{ record.userName || "-" }}
      </template>

      <template v-else-if="column.dataIndex === 'userAvatar'">
        <div class="avatar-container">
          <img
            v-if="record.userAvatar"
            :src="record.userAvatar"
            :alt="record.userName || '用户头像'"
            class="user-avatar"
            @error="onImageError"
            loading="lazy"
          />
          <a-avatar v-else :size="40" :style="{ backgroundColor: '#1890ff' }">
            <template #icon>
              <user-outlined />
            </template>
          </a-avatar>
        </div>
      </template>

      <template v-else-if="column.dataIndex === 'userProfile'">
        {{ record.userProfile || "-" }}
      </template>

      <template v-else-if="column.dataIndex === 'userRole'">
        <div v-if="record.userRole === 'admin'">
          <a-tag color="green">管理员</a-tag>
        </div>
        <div v-else>
          <a-tag color="blue">普通用户</a-tag>
        </div>
      </template>

      <template v-if="column.dataIndex === 'createTime'">
        {{ dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>

      <template v-else-if="column.dataIndex === 'updateTime'">
        {{ record.updateTime }}
      </template>

      <template v-else-if="column.key === 'action'">
        <a-button danger @click="doDelete(record.id)">删除</a-button>
      </template>
    </template>
  </a-table>
  <a-back-top />
</template>

<script lang="ts" setup>
import {
  listUserVoByPageUsingPost,
  deleteUserUsingPost,
} from "@/api/userController";
import { UserOutlined } from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import { computed, onMounted, reactive, ref } from "vue";
import dayjs from "dayjs";

// 图片加载失败处理
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
};
const columns = [
  {
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "账号",
    dataIndex: "userAccount",
  },
  {
    title: "用户名",
    dataIndex: "userName",
  },
  {
    title: "头像",
    dataIndex: "userAvatar",
  },
  {
    title: "简介",
    dataIndex: "userProfile",
  },
  {
    title: "用户角色",
    dataIndex: "userRole",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
  },
  {
    title: "操作",
    key: "action",
  },
];

// 数据
const dataList = ref<API.UserVO[]>([]);
const total = ref(0);

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: "createTime",
  sortOrder: "ascend",
});

// 获取数据
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams,
  });
  if (res.data.data && res.data.code === 0) {
    dataList.value = res.data.data.records ?? [];
    total.value = res.data.data.total ?? 0;
  } else {
    message.error("获取数据失败，" + res.data.message);
  }
};

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  };
});

// 表格变化之后，重新获取数据
const doTableChange = (page: any) => {
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
    content: "确定要删除该用户吗？此操作不可恢复。",
    okText: "确认",
    cancelText: "取消",
    onOk: async () => {
      const res = await deleteUserUsingPost({ userId: id.toString() });
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

// 页面加载时请求一次
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
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

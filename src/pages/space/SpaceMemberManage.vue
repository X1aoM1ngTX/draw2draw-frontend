<template>
  <div id="spaceManagePage">
    <a-flex justify="space-between">
      <h2>空间成员管理</h2>
      <a-space>
        <a-button type="primary" @click="showAddMemberModal = true">
          <UserAddOutlined />添加成员
        </a-button>
        <a-button
          type="primary"
          ghost
          href="/space_analyze?queryPublic=1"
          target="_blank"
          >分析公共图库
        </a-button>
        <a-button
          type="primary"
          ghost
          href="/space_analyze?queryAll=1"
          target="_blank"
          >分析全部空间
        </a-button>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />

    <!-- 添加成员模态框 -->
    <a-modal
      v-model:open="showAddMemberModal"
      title="添加空间成员"
      width="500px"
      @ok="handleSubmit"
      @cancel="handleModalCancel"
    >
      <a-form layout="vertical" :model="memberForm">
        <a-form-item
          label="用户ID"
          name="userId"
          :rules="[{ required: true, message: '请输入用户ID' }]"
        >
          <a-input
            v-model:value="memberForm.userId"
            placeholder="请输入用户ID"
            allow-clear
          />
        </a-form-item>
        <a-form-item
          label="角色"
          name="spaceRole"
          :rules="[{ required: true, message: '请选择角色' }]"
        >
          <a-select
            v-model:value="memberForm.spaceRole"
            placeholder="请选择角色"
            :options="SPACE_ROLE_OPTIONS"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <div style="margin-bottom: 16px" />
    <!-- 表格 -->
    <a-table :columns="columns" :data-source="filteredDataList">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userInfo'">
          <a-space>
            <a-avatar :src="record.user?.userAvatar" />
            {{ record.user?.userName || record.user?.userAccount }}
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'spaceRole'">
          <a-select
            v-model:value="record.spaceRole"
            :options="SPACE_ROLE_OPTIONS"
            @change="(value: string) => editSpaceRole(value, record)"
          />
          <span style="margin-left: 12px">
            <EyeOutlined v-if="record.spaceRole === 'viewer'" />
            <EditOutlined v-if="record.spaceRole === 'editor'" />
            <CrownOutlined v-if="record.spaceRole === 'admin'" />
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button type="link" danger @click="doDelete(record.id)"
              >删除</a-button
            >
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, reactive, computed } from "vue";
import { message } from "ant-design-vue";
import {
  UserAddOutlined,
  EyeOutlined,
  EditOutlined,
  CrownOutlined,
} from "@ant-design/icons-vue";
import { SPACE_ROLE_OPTIONS } from "../../constants/space.ts";
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost,
} from "@/api/spaceUserController.ts";
import dayjs from "dayjs";
import { useLoginUserStore } from "@/stores/useLoginUserStore.ts";

interface Props {
  id: string;
}

const props = defineProps<Props>();
const loginUserStore = useLoginUserStore();

const columns = [
  {
    title: "用户",
    dataIndex: "userInfo",
  },
  {
    title: "角色",
    dataIndex: "spaceRole",
  },
  {
    title: "加入时间",
    dataIndex: "createTime",
  },
  {
    title: "操作",
    key: "action",
  },
];

// 定义数据
const dataList = ref<API.SpaceUserVO[]>([]);

// 过滤后的数据列表（排除空间拥有者）
const filteredDataList = computed(() => {
  return dataList.value.filter(member => member.userId !== loginUserStore.loginUser?.id);
});

// 模态框状态
const showAddMemberModal = ref(false);

// 添加成员表单
const memberForm = reactive({
  userId: "",
  spaceRole: "viewer",
});

// 获取数据
const fetchData = async () => {
  const spaceId = props.id;
  if (!spaceId) {
    return;
  }
  console.log("fetchData: props.id =", props.id, "typeof:", typeof props.id);

  const res = await listSpaceUserUsingPost({
    spaceId: spaceId as unknown as number,
  });
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? [];
  } else {
    message.error("获取数据失败，" + res.data.message);
  }
};

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData();
});

// 创建成员
const handleSubmit = async () => {
  console.log("handleSubmit called, userId:", memberForm.userId);

  if (!memberForm.userId) {
    message.error("请输入用户ID");
    return;
  }

  try {
    const spaceId = props.id;
    console.log("props.id:", props.id, "typeof:", typeof props.id);

    if (!spaceId) {
      message.error("空间ID无效");
      return;
    }

    console.log(
      "Adding user with spaceId:",
      spaceId,
      "userId:",
      memberForm.userId
    );

    const res = await addSpaceUserUsingPost({
      spaceId: spaceId as unknown as number,
      userId: memberForm.userId as unknown as number,
      spaceRole: memberForm.spaceRole,
    });

    console.log("API response:", res);

    if (res.data.code === 0) {
      message.success("添加成功");
      // 关闭模态框
      showAddMemberModal.value = false;
      // 重置表单
      memberForm.userId = "";
      memberForm.spaceRole = "viewer";
      // 刷新数据
      fetchData();
    } else {
      message.error("添加失败，" + res.data.message);
    }
  } catch (error) {
    console.error("添加成员出错:", error);
    message.error("添加成员失败，请稍后重试");
  }
};

// 关闭模态框
const handleModalCancel = () => {
  showAddMemberModal.value = false;
  // 重置表单
  memberForm.userId = "";
  memberForm.spaceRole = "viewer";
};

// 编辑成员角色
const editSpaceRole = async (value: string, record: API.SpaceUserVO) => {
  try {
    const res = await editSpaceUserUsingPost({
      id: record.id,
      spaceRole: value,
    });
    if (res.data.code === 0) {
      message.success("修改成功");
    } else {
      message.error("修改失败，" + res.data.message);
    }
  } catch (error) {
    console.error("编辑角色出错:", error);
    message.error("编辑角色失败，请稍后重试");
  }
};

// 删除数据
const doDelete = async (id: number) => {
  if (!id) {
    return;
  }
  try {
    const res = await deleteSpaceUserUsingPost({ id });
    if (res.data.code === 0) {
      message.success("删除成功");
      // 刷新数据
      fetchData();
    } else {
      message.error("删除失败，" + res.data.message);
    }
  } catch (error) {
    console.error("删除成员出错:", error);
    message.error("删除成员失败，请稍后重试");
  }
};
</script>

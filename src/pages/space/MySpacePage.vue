<template>
  <div class="my-space-container">
    <a-card title="我的空间" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="goToAddSpace">
          <template #icon>
            <PlusOutlined />
          </template>
          创建空间
        </a-button>
      </template>

      <a-empty
        v-if="spaceList.length === 0"
        description="暂无空间，快去创建吧！"
      />

      <a-row v-else :gutter="[16, 16]">
        <a-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          v-for="space in spaceList"
          :key="space.id"
        >
          <a-card
            hoverable
            class="space-card"
            @click="goToSpaceDetail(space.id || 0)"
          >
            <template #cover>
              <div class="space-cover" :style="{ background: getSpaceColor(space.id || 0) }">
                <PictureOutlined />
              </div>
            </template>

            <a-card-meta
              :title="space.spaceName"
              :description="getSpaceLevelText(space.spaceLevel || 0)"
            >
              <template #avatar>
                <a-avatar :src="space.user?.userAvatar" />
              </template>
            </a-card-meta>

            <div class="space-stats">
              <div class="stat-item">
                <span class="stat-label">图片数量:</span>
                <span class="stat-value">{{ space.totalCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">创建时间:</span>
                <span class="stat-value">{{ formatDate(space.createTime || '') }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { PlusOutlined, PictureOutlined } from '@ant-design/icons-vue';
import { listSpaceVoByPageUsingPost } from '@/api/spaceController';
import { SPACE_LEVEL_MAP } from '@/constants/space';
import { useLoginUserStore } from '@/stores/useLoginUserStore';

const router = useRouter();
const loginUserStore = useLoginUserStore();

// 空间列表
const spaceList = ref<API.SpaceVO[]>([]);

// 生成基于空间ID的固定背景颜色
const getSpaceColor = (spaceId: number): string => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)'
  ];
  // 使用空间ID来生成固定的索引，确保每个空间有固定的颜色
  const index = spaceId % colors.length;
  return colors[index];
};

// 获取空间级别文本
const getSpaceLevelText = (level: number): string => {
  return SPACE_LEVEL_MAP[level] || '未知级别';
};

// 格式化日期
const formatDate = (dateTime: string): string => {
  if (!dateTime) return '未知';
  return new Date(dateTime).toLocaleDateString();
};

// 跳转到创建空间页面
const goToAddSpace = () => {
  router.push('/add_space');
};

// 跳转到空间详情页面
const goToSpaceDetail = (spaceId: number) => {
  router.push(`/space/${spaceId}`);
};

// 获取用户空间列表
const fetchUserSpaces = async () => {
  try {
    // 检查用户是否登录
    if (!loginUserStore.loginUser || loginUserStore.loginUser.userRole === 'notLogin') {
      message.warning('请先登录');
      router.push('/user/login');
      return;
    }

    // 使用分页查询获取用户空间
    const res = await listSpaceVoByPageUsingPost({
      userId: loginUserStore.loginUser.id,
      current: 1,
      pageSize: 10, // 获取前10个空间
    });

    if (res.data.code === 0 && res.data.data?.records) {
      spaceList.value = res.data.data.records;
    } else {
      message.error('获取空间列表失败: ' + res.data.message);
    }
  } catch (error) {
    console.error('获取空间列表出错:', error);
    message.error('获取空间列表失败，请稍后重试');
  }
};

// 组件挂载时获取空间列表
onMounted(() => {
  fetchUserSpaces();
});
</script>

<style scoped>
.my-space-container {
  padding: 20px;
}

.space-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.space-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.space-cover {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 32px;
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;
}

.space-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 12px;
}

.stat-value {
  font-weight: 500;
  font-size: 12px;
}
</style>

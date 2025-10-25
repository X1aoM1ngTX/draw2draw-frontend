<template>
  <div class="user-profile-page">
    <!-- 用户信息区域 -->
    <a-row :gutter="[16, 16]">
      <!-- 左侧用户信息卡片 (2/3) -->
      <a-col :xs="24" :lg="16">
        <a-card class="user-info-card" :bordered="false">
          <a-row :gutter="[16, 16]" align="middle">
            <a-col :xs="24" :sm="8" :md="6" :lg="8">
              <div class="avatar-container">
                <a-upload
                  v-if="isOwnProfile"
                  name="avatar"
                  list-type="picture-card"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  :customRequest="handleAvatarUpload"
                >
                  <img
                    v-if="loginUser.userAvatar"
                    :src="loginUser.userAvatar"
                    alt="avatar"
                  />
                  <div v-else>
                    <loading-outlined v-if="avatarLoading"></loading-outlined>
                    <user-outlined v-else></user-outlined>
                    <div class="ant-upload-text">上传头像</div>
                  </div>
                </a-upload>
                <a-avatar
                  v-else
                  :size="120"
                  :src="loginUser.userAvatar"
                  class="user-avatar"
                >
                  <template #icon>
                    <UserOutlined />
                  </template>
                </a-avatar>
              </div>
            </a-col>
            <a-col :xs="24" :sm="16" :md="18" :lg="16">
              <div class="user-details">
                <h1 class="username">{{ loginUser.userName || "未设置用户名" }}</h1>
                <p class="user-account">账号：{{ loginUser.userAccount }}</p>
                <p class="user-profile">
                  {{ loginUser.userProfile || "这个人很懒，什么都没留下~" }}
                </p>
                <div class="user-stats">
                  <a-statistic title="上传图片" :value="userStats.pictureCount" />
                  <a-divider type="vertical" />
                  <a-statistic
                    title="创建时间"
                    :value="formatDate(loginUser.createTime)"
                  />
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- 右侧VIP信息卡片 (1/3) -->
      <a-col :xs="24" :lg="8" v-if="isOwnProfile">
        <a-card class="user-vip-info-card" :bordered="false">
          <div class="vip-content">
            <h3 class="vip-title">
              <CrownOutlined /> VIP会员服务
            </h3>

            <div class="vip-status">
              <div v-if="loginUser.isVip === 1" class="vip-info">
                <a-tag color="gold" class="vip-badge">
                  <CrownOutlined /> VIP会员
                </a-tag>
                <div class="vip-details">
                  <div class="vip-number">
                    你好{{ loginUser.vipCode || `VIP${loginUser.id && loginUser.id.toString().slice(-5).padStart(5, '0')}` }}
                  </div>
                  <div class="vip-expire" v-if="loginUser.vipExpireTime">
                    到期时间：{{ formatDate(loginUser.vipExpireTime) }}
                  </div>
                </div>
              </div>
              <span v-else class="no-vip-tip"> 兑换VIP享受更多特权 </span>
            </div>

            <a-button
              type="primary"
              size="large"
              @click="goToVipExchange"
              class="vip-exchange-btn"
              :icon="h(CrownOutlined)"
              block
            >
              {{ loginUser.isVip === 1 ? '续费VIP' : 'VIP兑换' }}
            </a-button>

            <div class="vip-features">
              <h4>VIP特权</h4>
              <ul>
                <li>无限制图片上传</li>
                <li>高清图片下载</li>
                <li>专属客服支持</li>
                <li>优先功能体验</li>
              </ul>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>


    <!-- 标签页 -->
    <a-tabs v-model:activeKey="activeTab" class="content-tabs">
      <a-tab-pane key="pictures" tab="我的图片">
        <div class="search-bar">
          <a-input-search
            placeholder="搜索我的图片"
            v-model:value="searchParams.searchText"
            enter-button="搜索"
            @search="doSearch"
          />
        </div>
        <!-- 图片列表 -->
        <a-list
          :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
          :data-source="dataList"
          :pagination="pagination"
          :loading="loading"
        >
          <template #renderItem="{ item: picture }">
            <a-list-item style="padding: 0">
              <!-- 单张图片 -->
              <a-card hoverable @click="doClickPicture(picture)">
                <template #cover>
                  <img
                    style="height: 180px; object-fit: cover"
                    :alt="picture.name"
                    :src="picture.url"
                  />
                </template>
                <a-card-meta :title="picture.name">
                  <template #description>
                    <a-flex>
                      <a-tag color="green">
                        {{ picture.category ?? "默认" }}
                      </a-tag>
                      <a-tag v-for="tag in picture.tags" :key="tag">
                        {{ tag }}
                      </a-tag>
                    </a-flex>
                  </template>
                </a-card-meta>
              </a-card>
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="settings" tab="个人设置" v-if="isOwnProfile">
        <a-card title="编辑个人信息" :bordered="false">
          <a-form
            :model="editForm"
            layout="vertical"
            @finish="handleUpdateUser"
          >
            <a-form-item label="用户名" name="userName">
              <a-input
                v-model:value="editForm.userName"
                placeholder="请输入用户名"
              />
            </a-form-item>
            <a-form-item label="个人简介" name="userProfile">
              <a-textarea
                v-model:value="editForm.userProfile"
                placeholder="请输入个人简介"
                :rows="4"
              />
            </a-form-item>
            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                :loading="updateLoading"
              >
                保存修改
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  UserOutlined,
  LoadingOutlined,
  CrownOutlined,
} from "@ant-design/icons-vue";
import { listPictureVoByPageUsingPost } from "@/api/pictureController";
import {
  updateMyInfoUsingPost,
  getUserVoByIdUsingGet,
  uploadUserAvatarUsingPost,
} from "@/api/userController";
import { useLoginUserStore } from "@/stores/useLoginUserStore";

const route = useRoute();
const router = useRouter();
const loginUserStore = useLoginUserStore();

// 当前登录用户
const loginUser = computed(() => loginUserStore.loginUser);

// 是否是自己的主页
const isOwnProfile = computed(() => {
  // 如果没有用户ID参数，默认是查看自己的主页
  if (!route.query.userId) {
    return true;
  }
  // 有用户ID参数，判断是否是当前登录用户
  return loginUser.value.id?.toString() === route.query.userId;
});

// 用户统计数据
const userStats = ref({
  pictureCount: 0,
});

// 编辑表单
const editForm = reactive<API.UserMyInfoUpdateRequest>({
  userName: loginUser.value.userName,
  userProfile: loginUser.value.userProfile,
});

// 头像上传相关
const avatarLoading = ref(false);
const updateLoading = ref(false);

// 头像上传前的校验
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("只能上传 JPG 或 PNG 格式的图片！");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过 2MB！");
    return false;
  }
  return true;
};

// 头像上传处理
const handleAvatarUpload = async ({ file }: { file: File }) => {
  avatarLoading.value = true;
  try {
    // 使用uploadUserAvatarUsingPost上传头像
    const res = await uploadUserAvatarUsingPost({}, file);
    if (res.data.code === 0 && res.data.data) {
      // 上传成功，获取头像URL
      const avatarUrl = res.data.data;
      if (avatarUrl) {
        // 更新本地存储的用户信息
        loginUserStore.setLoginUser({
          ...loginUser.value,
          userAvatar: avatarUrl,
        });
        message.success("头像上传成功");
      }
    } else {
      message.error("头像上传失败," + res.data.message);
    }
  } catch (error) {
    console.error("头像上传失败", error);
    message.error("头像上传失败");
  } finally {
    avatarLoading.value = false;
  }
};

// 更新用户信息
const handleUpdateUser = async () => {
  updateLoading.value = true;
  try {
    const res = await updateMyInfoUsingPost({
      userName: editForm.userName,
      userProfile: editForm.userProfile,
    });
    if (res.data.code === 0) {
      message.success("个人信息更新成功");
      // 更新本地存储的用户信息
      loginUserStore.setLoginUser({
        ...loginUser.value,
        userName: editForm.userName,
        userProfile: editForm.userProfile,
      });
    } else {
      message.error("更新失败：" + (res.data.message || "未知错误"));
    }
  } catch (e) {
    message.error("更新失败：" + (e instanceof Error ? e.message : "未知错误"));
  } finally {
    updateLoading.value = false;
  }
};

// VIP兑换页面跳转
const goToVipExchange = () => {
  router.push("/user/vip/exchange");
};

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// 标签页相关
const activeTab = ref("pictures");

// 图片列表相关
const dataList = ref<API.PictureVO[]>([]);
const total = ref(0);
const loading = ref(true);

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: "createTime",
  sortOrder: "descend",
});

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 12,
    total: total.value,
    onChange: (page: number, pageSize: number) => {
      searchParams.current = page;
      searchParams.pageSize = pageSize;
      fetchData();
    },
  };
});

// 获取用户图片数据
const fetchData = async () => {
  loading.value = true;
  try {
    // 设置用户ID过滤条件
    const params = {
      ...searchParams,
      userId: isOwnProfile.value
        ? loginUser.value.id
        : Number(route.query.userId),
    };

    const res = await listPictureVoByPageUsingPost(params);
    if (res.data.data) {
      dataList.value = res.data.data.records ?? [];
      total.value = res.data.data.total ?? 0;
      userStats.value.pictureCount = res.data.data.total ?? 0;
    } else {
      message.error("获取图片数据失败，" + res.data.message);
    }
  } catch (e) {
    message.error(
      "获取图片数据失败：" + (e instanceof Error ? e.message : "未知错误")
    );
  } finally {
    loading.value = false;
  }
};

// 搜索
const doSearch = () => {
  searchParams.current = 1;
  fetchData();
};

// 点击图片
const doClickPicture = (picture: API.PictureVO) => {
  // 跳转到图片详情页
  window.open(`/picture/${picture.id}`, "_blank");
};

// 获取其他用户信息
const fetchOtherUserInfo = async () => {
  if (!route.query.userId || isOwnProfile.value) return;

  try {
    const res = await getUserVoByIdUsingGet({
      userId: Number(route.query.userId),
    });
    if (res.data.code === 0 && res.data.data) {
      // 这里可以设置其他用户的信息，如果需要显示其他用户的信息
      console.log("其他用户信息：", res.data.data);
    }
  } catch (e) {
    message.error(
      "获取用户信息失败：" + (e instanceof Error ? e.message : "未知错误")
    );
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchData();
  fetchOtherUserInfo();
});
</script>

<style scoped>
.user-profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.user-info-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.avatar-container {
  text-align: center;
}

.user-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.avatar-uploader > .ant-upload {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar-uploader > .ant-upload:hover {
  border-style: solid !important;
}

.avatar-uploader img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.user-details {
  padding: 16px;
}

.username {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.user-account {
  color: #666;
  margin-bottom: 8px;
}

.user-profile {
  color: #333;
  line-height: 1.6;
  margin-bottom: 16px;
}

.user-stats {
  display: flex;
  align-items: center;
}

.content-tabs {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
}

.search-bar {
  max-width: 400px;
  margin-bottom: 16px;
}

.vip-actions {
  text-align: center;
  padding: 16px;
}

.vip-exchange-btn {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border: none;
  color: #333;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.vip-exchange-btn:hover {
  background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  color: #333;
}

.vip-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.vip-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.vip-badge {
  font-weight: bold;
  font-size: 14px;
}

.vip-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.vip-number {
  font-size: 16px;
  font-weight: bold;
  color: #d4af37;
  background: linear-gradient(135deg, #fff8dc 0%, #ffd700 100%);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #d4af37;
  box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
  width: 100%;
  text-align: center;
}

.vip-expire {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid #ddd;
}

.no-vip-tip {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

/* VIP信息卡片样式 */
.user-vip-info-card {
  background: linear-gradient(135deg, #fff8dc 0%, #fff 100%);
  border: 1px solid #d4af37;
  height: 100%;
}

.vip-content {
  text-align: center;
  padding: 8px;
}

.vip-title {
  color: #d4af37;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.vip-exchange-btn {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border: none;
  color: #333;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  margin: 16px 0;
  transition: all 0.3s ease;
}

.vip-exchange-btn:hover {
  background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  color: #333;
}

.vip-features {
  margin-top: 20px;
  text-align: left;
}

.vip-features h4 {
  color: #d4af37;
  font-size: 14px;
  margin-bottom: 8px;
  text-align: center;
}

.vip-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.vip-features li {
  padding: 4px 0;
  font-size: 12px;
  color: #666;
  position: relative;
  padding-left: 16px;
}

.vip-features li:before {
  content: "✓";
  color: #d4af37;
  position: absolute;
  left: 0;
  font-weight: bold;
}

@media (max-width: 768px) {
  .user-details {
    text-align: center;
    padding-top: 16px;
  }

  .user-stats {
    justify-content: center;
  }

  .vip-content {
    padding: 16px;
  }

  .vip-title {
    font-size: 16px;
  }
}
</style>

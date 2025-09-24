<template>
  <div class="welcome-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <a-row type="flex" justify="center" align="middle" class="welcome-row">
        <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="welcome-content">
            <h1 class="welcome-title">Draw2Draw</h1>
            <p class="welcome-subtitle">企业级智能协同云图库</p>
            <p class="welcome-desc">
              一个强大的在线绘图平台，支持多人实时协作，丰富的绘图工具，让您的创意无限延伸
            </p>
            <div class="welcome-actions">
              <a-button
                type="primary"
                size="large"
                @click="router.push('/user/login')"
                v-if="!loginUser"
              >
                立即开始
              </a-button>
              <a-button
                size="large"
                @click="router.push('/about')"
                style="margin-left: 16px"
              >
                了解更多
              </a-button>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="welcome-image">
            <img src="../assets/d2d.png" alt="Draw2Draw" />
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 功能特色区域 -->
    <div class="features-section">
      <h2 class="section-title">核心功能</h2>
      <a-row :gutter="[24, 24]" justify="center">
        <a-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <a-card hoverable class="feature-card">
            <template #cover>
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path
                    fill="#1890ff"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  />
                </svg>
              </div>
            </template>
            <a-card-meta title="实时协作">
              <template #description>
                支持多人同时在线编辑，实时同步绘图内容，提高团队协作效率
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <a-card hoverable class="feature-card">
            <template #cover>
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path
                    fill="#1890ff"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
            </template>
            <a-card-meta title="丰富工具">
              <template #description>
                提供多种绘图工具，包括画笔、形状、文本等，满足各种绘图需求
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <a-card hoverable class="feature-card">
            <template #cover>
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path
                    fill="#1890ff"
                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                  />
                </svg>
              </div>
            </template>
            <a-card-meta title="云端存储">
              <template #description>
                所有绘图内容自动保存到云端，随时随地访问您的作品
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <a-card hoverable class="feature-card">
            <template #cover>
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path
                    fill="#1890ff"
                    d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
                  />
                </svg>
              </div>
            </template>
            <a-card-meta title="安全可靠">
              <template #description>
                采用多层安全措施，保护您的数据和隐私安全
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 使用流程区域 -->
    <div class="process-section">
      <h2 class="section-title">使用流程</h2>
      <a-row :gutter="[24, 24]" justify="center">
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="process-step">
            <div class="step-number">1</div>
            <h3>注册/登录账号</h3>
            <p>创建您的个人账号，开始使用Draw2Draw</p>
          </div>
        </a-col>
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="process-step">
            <div class="step-number">2</div>
            <h3>创建/加入项目</h3>
            <p>创建新的绘图项目或加入现有项目</p>
          </div>
        </a-col>
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="process-step">
            <div class="step-number">3</div>
            <h3>开始绘图</h3>
            <p>使用丰富的工具开始您的创作之旅</p>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- CTA区域 -->
    <div class="cta-section">
      <h2 class="cta-title">准备好开始您的创作之旅了吗？</h2>
      <p class="cta-desc">加入Draw2Draw，释放您的创造力</p>
      <div class="cta-actions">
        <a-button
          type="primary"
          size="large"
          @click="router.push('/user/login')"
          v-if="!loginUser"
        >
          立即开始
        </a-button>
        <a-button
          size="large"
          @click="router.push('/user/register')"
          v-if="!loginUser"
          style="margin-left: 16px"
        >
          免费注册
        </a-button>
        <a-button
          type="primary"
          size="large"
          @click="goToDrawing"
          v-if="loginUser"
        >
          开始绘图
        </a-button>
      </div>
    </div>
  </div>
  <a-back-top />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import router from "@/router";

const loginUserStore = useLoginUserStore();
const loginUser = computed(() => loginUserStore.loginUser);

const goToDrawing = () => {
  router.push("/add_picture");
};
</script>

<style scoped>
.welcome-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 80px; /* 为固定定位的header留出空间 */
  position: relative;
  z-index: 1; /* 确保在header下方 */
  background-color: #fff; /* 添加背景色避免内容透过 */
}

.welcome-section {
  padding: 60px 0;
  text-align: center;
}

.welcome-row {
  min-height: 400px;
}

.welcome-content {
  text-align: left;
  padding: 20px;
}

.welcome-title {
  font-size: 48px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 16px;
}

.welcome-subtitle {
  font-size: 24px;
  color: #333;
  margin-bottom: 24px;
}

.welcome-desc {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
}

.welcome-actions {
  margin-top: 32px;
}

.welcome-image {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.welcome-image img {
  max-width: 100%;
  max-height: 300px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.features-section {
  padding: 60px 0;
  border-radius: 8px;
  margin: 40px 0;
}

.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 40px;
}

.feature-card {
  height: 100%;
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.process-section {
  padding: 60px 0;
}

.process-step {
  text-align: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  transition: transform 0.3s;
}

.process-step:hover {
  transform: translateY(-5px);
}

.step-number {
  width: 50px;
  height: 50px;
  background-color: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 20px;
}

.process-step h3 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #333;
}

.process-step p {
  color: #666;
  line-height: 1.6;
}

.cta-section {
  padding: 60px 0;
  text-align: center;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border-radius: 8px;
  color: white;
}

.cta-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 16px;
}

.cta-desc {
  font-size: 18px;
  margin-bottom: 32px;
}

.cta-actions {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 36px;
  }

  .welcome-subtitle {
    font-size: 20px;
  }

  .welcome-content {
    text-align: center;
  }

  .welcome-image {
    margin-top: 40px;
  }
}
</style>

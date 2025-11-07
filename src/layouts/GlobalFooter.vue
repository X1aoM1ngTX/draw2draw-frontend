<template>
  <a-layout-footer class="global-footer">
    <div class="footer-content">
      <div class="footer-text">
        <span class="copyright">© 2025 Draw2Draw. All rights reserved.</span>
        <span class="divider">|</span>
        <span
          >Powered by
          <a
            href="https://www.antdv.com/components/overview-cn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ant Design Vue
          </a>
        </span>
        <span class="divider">|</span>
        <span class="icp-number">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            粤ICP备2025471762号-1
          </a>
        </span>
      </div>
      <div class="footer-links">
        <a-tooltip title="访问 GitHub">
          <a
            href="https://github.com/X1aoM1ngTX"
            target="_blank"
            rel="noopener noreferrer"
            class="github-link"
          >
            <GithubOutlined />
          </a>
        </a-tooltip>
      </div>
    </div>
  </a-layout-footer>
</template>

<script lang="ts" setup>
import { GithubOutlined } from "@ant-design/icons-vue";
</script>

<style scoped>
.global-footer {
  background-color: #fff;
  padding: 10px 50px;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footer-text {
  font-size: 14px;
  color: #666;
}

.copyright {
  font-weight: 500;
}

.divider {
  margin: 0 12px;
}

.footer-text a {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-text a:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.icp-number {
  font-size: 12px;
}

.icp-number a {
  color: #666;
  text-decoration: none;
}

.icp-number a:hover {
  color: #1890ff;
  text-decoration: underline;
}

.footer-links {
  display: flex;
  align-items: center;
}

.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #fff;
  color: #1890ff;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.github-link:hover {
  background-color: #1890ff;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

@media (max-width: 768px) {
  .global-footer {
    padding: 16px 20px;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .divider {
    display: none;
  }

  .footer-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
</style>

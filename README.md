# Draw2Draw 前端项目

## 项目简介

Draw2Draw 是一个基于 Vue 3 + TypeScript 的现代化绘图应用前端界面，提供用户友好的图片编辑、团队协作、实时协同编辑等功能。

## 技术栈

### 核心框架
- **Vue 3** 3.5.13 - 渐进式JavaScript框架
- **TypeScript** 5.6.3 - 类型安全的JavaScript超集
- **Vite** 6.0.1 - 现代化前端构建工具

### UI组件库
- **Ant Design Vue** 4.2.6 - 企业级UI设计语言
- **Vue Router** 4.4.5 - 官方路由管理器
- **Pinia** 2.2.6 - 状态管理库
- **VueUse** - Vue组合式API工具集

### HTTP客户端
- **Axios** 1.12.2 - HTTP请求库

### 图片处理
- **vue-cropper** - Vue图片裁剪组件
- **vue3-colorpicker** - 颜色选择器

### 数据可视化
- **ECharts** 5.x - 数据可视化图表库
- **echarts-wordcloud** - 词云图

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Vue DevTools** - Vue开发者工具

## 项目结构

```
draw2draw-frontend/
├── public/                 # 静态资源
├── src/
│   ├── access/            # 权限
│   ├── api/               # API接口定义
│   ├── assets/            # 静态资源文件
│   ├── components/        # 公共组件
│   ├── constants/         # 常量定义
│   ├── layouts/           # 布局组件
│   ├── pages/             # 页面组件
│   ├── request/           # HTTP请求配置
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   ├── utils/             # 工具函数
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── package.json           # 项目依赖配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite构建配置
└── ESLint配置文件
```

## 环境要求

- **Node.js** 16.0+
- **npm** 8.0+ 或 **yarn** 1.22+
- **现代浏览器** (Chrome 88+, Firefox 85+, Safari 14+)

## 快速开始

### 1. 项目安装

```bash
npm install
```

### 2. 开发环境配置

检查API配置是否正确（`src/request/request.ts`）：

```typescript
const myAxios = axios.create({
  baseURL: "http://localhost:8090",  // 后端API地址
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

打开浏览器访问：http://localhost:5173

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 核心功能

### 用户功能
- 用户注册、登录、个人资料管理
- 基于Cookie的自动登录
- 用户权限和角色管理

### 图片管理
- 图片上传、预览、下载
- 图片编辑（裁剪、旋转、缩放）
- 批量操作和分类管理
- 多格式支持

### 团队空间
- 多用户协作空间
- 成员权限管理
- 空间配额监控
- 文件共享和协作

### 实时协同编辑
- 基于WebSocket的实时通信
- 多用户同时编辑支持
- 编辑状态实时同步
- 冲突检测和解决

### AI功能
- 智能图片分析
- 自动标签生成
- 智能分类推荐

## WebSocket实时协同编辑

### 功能特性
- **实时同步**: 多用户编辑操作实时同步
- **状态管理**: 编辑状态（进入/退出）实时更新
- **权限控制**: 同一时间只有一个用户可以编辑
- **操作广播**: 编辑操作广播给所有协作者

### WebSocket连接配置
```typescript
// utils/pictureEditWebSocket.ts
const getBackendBaseUrl = () => {
  // 开发环境下默认使用localhost:8090
  return 'localhost:8090';
};

// 连接配置
const websocket = new PictureEditWebSocket(pictureId);
websocket.connect();

// 监听编辑操作
websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
  // 处理编辑操作同步
});

// 发送编辑操作
websocket.sendMessage({
  type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
  editAction: PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT
});
```

### 支持的编辑操作
- `ROTATE_LEFT` - 左旋转
- `ROTATE_RIGHT` - 右旋转
- `ZOOM_IN` - 放大
- `ZOOM_OUT` - 缩小
- `ENTER_EDIT` - 进入编辑
- `EXIT_EDIT` - 退出编辑

### 消息类型
```typescript
export enum PICTURE_EDIT_MESSAGE_TYPE_ENUM {
  INFO = "info",           // 通知消息
  ERROR = "error",         // 错误消息
  ENTER_EDIT = "enterEdit", // 进入编辑
  EXIT_EDIT = "exitEdit",   // 退出编辑
  EDIT_ACTION = "editAction" // 编辑操作
}
```

## 部署说明

### 构建生产版本
```bash
npm run build
```

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend-server:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 常见问题

### Q: WebSocket连接失败？
A: 检查以下几点：
1. 后端服务是否正常运行在8090端口
2. WebSocket地址配置是否正确（`utils/pictureEditWebSocket.ts`）
3. 用户是否已登录且有编辑权限
4. 浏览器是否支持WebSocket
5. 防火墙是否阻止WebSocket连接

### Q: 图片上传失败？
A: 检查：
1. 后端API服务是否正常
2. 文件大小是否超过限制（10MB）
3. 网络连接是否稳定
4. CORS配置是否正确

### Q: 页面白屏？
A: 检查：
1. 浏览器控制台是否有错误信息
2. 路由配置是否正确
3. API接口是否返回正确数据
4. 静态资源是否加载成功

### Q: 类型检查失败？
A: 运行 `npm run type-check` 查看具体的TypeScript错误，并根据提示修复类型问题。

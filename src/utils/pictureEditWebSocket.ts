const DEV_WS_URL = "ws://localhost:8090/api/ws";
const PROD_WS_URL = window.location.protocol === 'https:'
  ? 'wss://picture.game9hq.xyz/api/ws'
  : 'ws://picture.game9hq.xyz/api/ws';

export default class PictureEditWebSocket {
  private pictureId: number;
  private socket: WebSocket | null;
  private eventHandlers: any;

  constructor(pictureId: number) {
    this.pictureId = pictureId; // 当前编辑的图片 ID
    this.socket = null; // WebSocket 实例
    this.eventHandlers = {}; // 自定义事件处理器
  }

  /**
   * 初始化 WebSocket 连接
   */
  connect() {
    const url = `${PROD_WS_URL}/api/ws/picture/edit?pictureId=${this.pictureId}`;
    this.socket = new WebSocket(url);

    // 设置携带 cookie
    this.socket.binaryType = "blob";

    // 监听连接成功事件
    this.socket.onopen = () => {
      console.log("WebSocket 连接已建立，URL:", url);
      this.triggerEvent("open");
    };

    // 监听消息事件
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("收到WebSocket消息:", message);

        // 根据消息类型触发对应事件
        const type = message.type;
        this.triggerEvent(type, message);
      } catch (error) {
        console.error("解析WebSocket消息失败:", error, "原始数据:", event.data);
      }
    };

    // 监听连接关闭事件
    this.socket.onclose = (event) => {
      console.log("WebSocket 连接已关闭:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        url: url,
      });
      this.triggerEvent("close", event);
    };

    // 监听错误事件
    this.socket.onerror = (error) => {
      console.error("WebSocket 连接发生错误:", {
        error: error,
        url: url,
        readyState: this.socket?.readyState,
      });
      this.triggerEvent("error", error);
    };
  }

  /**
   * 关闭 WebSocket 连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      console.log("WebSocket 连接已手动关闭");
    }
  }

  /**
   * 发送消息到后端
   * @param {Object} message 消息对象
   */
  sendMessage(message: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message));
        console.log("WebSocket消息已发送:", message);
      } catch (error) {
        console.error("WebSocket发送消息失败:", error, "消息:", message);
      }
    } else {
      console.error("WebSocket未连接，无法发送消息:", {
        message: message,
        readyState: this.socket?.readyState,
        state: this.socket
          ? this.getReadyStateText(this.socket.readyState)
          : "null",
      });
    }
  }

  /**
   * 获取WebSocket连接状态的文本描述
   * @param readyState WebSocket readyState值
   * @returns 状态文本
   */
  private getReadyStateText(readyState: number): string {
    switch (readyState) {
      case WebSocket.CONNECTING:
        return "正在连接";
      case WebSocket.OPEN:
        return "已连接";
      case WebSocket.CLOSING:
        return "正在关闭";
      case WebSocket.CLOSED:
        return "已关闭";
      default:
        return "未知状态";
    }
  }

  /**
   * 添加自定义事件监听
   * @param {string} type 消息类型
   * @param {Function} handler 消息处理函数
   */
  on(type: string, handler: (data?: any) => void) {
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = [];
    }
    this.eventHandlers[type].push(handler);
  }

  /**
   * 触发事件
   * @param {string} type 消息类型
   * @param {Object} data 消息数据
   */
  triggerEvent(type: string, data?: any) {
    const handlers = this.eventHandlers[type];
    if (handlers) {
      handlers.forEach((handler: any) => handler(data));
    }
  }
}

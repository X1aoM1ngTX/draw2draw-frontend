/* eslint-disable */
import request from "@/request";

/** 创建AI图片生成任务 POST /api/ai/image/generate */
export async function generateImageUsingPost(
  body: API.AiImageGenerateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>("/api/ai/image/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询任务详情 GET /api/ai/image/task/{taskId} */
export async function getTaskUsingGet(
  taskId: string,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAiGenerateTaskVO_>(
    `/api/ai/image/task/${taskId}`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** 分页查询任务列表 POST /api/ai/image/tasks */
export async function listTasksUsingPost(
  body: API.AiTaskQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAiGenerateTaskVO_>(
    "/api/ai/image/tasks",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

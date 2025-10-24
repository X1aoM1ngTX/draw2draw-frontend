<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? "修改" : "创建" }}{{ SPACE_TYPE_MAP[spaceType] }}
    </h2>

    <!-- 空间信息表单 -->
    <a-form
      name="spaceForm"
      layout="vertical"
      :model="spaceForm"
      @finish="handleSubmit"
    >
      <a-form-item name="spaceName" label="空间名称">
        <a-input
          v-model:value="spaceForm.spaceName"
          placeholder="请输入空间"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          style="min-width: 180px"
          placeholder="请选择空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
          style="width: 100%"
        >
          {{ route.query?.id ? "修改" : "创建" }}
        </a-button>
      </a-form-item>
    </a-form>
    <!-- 空间级别介绍 -->
    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a href="https://codefather.cn" target="_blank">程序员鱼皮</a>
      </a-typography-paragraph>
      <a-row :gutter="16">
        <a-col
          :span="8"
          v-for="spaceLevel in spaceLevelList"
          :key="spaceLevel.value"
        >
          <a-card hoverable>
            <template #title>
              {{ spaceLevel.text }}
            </template>
            <template #extra>
              <a-tag
                :color="
                  spaceLevel.value === 0
                    ? 'green'
                    : spaceLevel.value === 1
                      ? 'blue'
                      : 'purple'
                "
              >
                {{
                  spaceLevel.value === 0
                    ? "免费"
                    : spaceLevel.value === 1
                      ? "专业"
                      : "旗舰"
                }}
              </a-tag>
            </template>
            <p>
              <a-space>
                <span>存储空间:</span>
                <strong>{{ formatSize(spaceLevel.maxSize) }}</strong>
              </a-space>
            </p>
            <p>
              <a-space>
                <span>图片数量:</span>
                <strong>{{ spaceLevel.maxCount }}</strong>
              </a-space>
            </p>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { message } from "ant-design-vue";
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost,
} from "@/api/spaceController";
import { useRoute, useRouter } from "vue-router";
import {
  SPACE_LEVEL_OPTIONS,
  SPACE_TYPE_ENUM,
  SPACE_TYPE_MAP,
} from "@/constants/space.ts";
import { formatSize } from "@/utils";

const space = ref<API.SpaceVO>();
const spaceForm = reactive<API.SpaceAddRequest & API.SpaceEditRequest>({
  spaceName: "",
  spaceLevel: 0,
});
const loading = ref(false);

const spaceLevelList = ref<API.SpaceLevel[]>([]);

// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet();
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data;
  } else {
    message.error("获取空间级别失败：" + (res.data.message || "未知错误"));
  }
};

const router = useRouter();
const route = useRoute();

// 空间类别，默认为私有空间
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type);
  }
  return SPACE_TYPE_ENUM.PRIVATE;
});

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (
  values: API.SpaceAddRequest | API.SpaceEditRequest
) => {
  const spaceId = space.value?.id;
  loading.value = true;
  try {
    let res;
    if (spaceId) {
      // 更新
      res = await updateSpaceUsingPost({
        id: spaceId,
        ...values,
      });
    } else {
      // 创建
      res = await addSpaceUsingPost({
        ...values,
        spaceType: spaceType.value,
      });
    }
    // 操作成功
    if (res.data.code === 0 && res.data.data) {
      message.success(spaceId ? "修改成功" : "创建成功");
      // 跳转到空间详情页
      // 如果是更新操作，使用原有的 spaceId；如果是创建操作，使用返回的新 ID
      const targetId = spaceId || res.data.data;
      router.push({
        path: `/space/${targetId}`,
      });
    } else {
      message.error("操作失败：" + (res.data.message || "未知错误"));
    }
  } catch (error: unknown) {
    // 处理网络错误或其他异常
    let errorMessage = "网络错误，请稍后重试";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    message.error("操作失败：" + errorMessage);
  } finally {
    loading.value = false;
  }
};

// 获取老数据
const getOldSpace = async () => {
  // 获取到 id
  const id = route.query?.id;
  if (id) {
    try {
      const res = await getSpaceVoByIdUsingGet({
        id,
      });
      if (res.data.code === 0 && res.data.data) {
        const data = res.data.data;
        space.value = data;
        // 填充表单
        spaceForm.spaceName = data.spaceName || "";
        spaceForm.spaceLevel = data.spaceLevel || 0;
        spaceForm.id = data.id;
      } else {
        // 空间不存在或其他错误，显示错误信息并重定向
        message.error("获取空间信息失败：" + (res.data.message || "未知错误"));
        // 如果是空间不存在的错误，重定向到空间列表页或首页
        if (res.data.code === 50001 && res.data.message?.includes("不存在")) {
          setTimeout(() => {
            router.push("/space");
          }, 1500);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      message.error("获取空间信息失败：" + errorMessage);
      // 网络错误或其他异常，也重定向到空间列表页
      setTimeout(() => {
        router.push("/space");
      }, 1500);
    }
  }
};

onMounted(() => {
  fetchSpaceLevelList();
  getOldSpace();
});
</script>

<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>

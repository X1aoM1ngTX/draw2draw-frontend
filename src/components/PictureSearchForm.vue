<template>
  <div class="picture-search-form">
    <div class="search-form-container">
      <!-- 常用搜索条件 -->
      <div class="search-section">
        <h3 class="section-title">
          <span class="title-icon">
            <SearchOutlined />
          </span>
          基础搜索
        </h3>
        <a-form
          name="basicSearchForm"
          layout="inline"
          :model="searchParams"
          @finish="doSearch"
          class="basic-search-form"
        >
          <a-form-item label="关键词" name="searchText">
            <a-input
              v-model:value="searchParams.searchText"
              placeholder="从名称和简介搜索"
              allow-clear
              class="search-input"
            />
          </a-form-item>
          <a-form-item label="分类" name="category">
            <a-auto-complete
              v-model:value="searchParams.category"
              placeholder="请输入分类"
              :options="categoryOptions"
              allow-clear
              class="search-input"
            />
          </a-form-item>
          <a-form-item label="标签" name="tags">
            <a-select
              v-model:value="searchParams.tags"
              mode="tags"
              placeholder="请输入标签"
              :options="tagOptions"
              allow-clear
              class="search-input tag-select"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit" class="search-btn">
                <template #icon>
                  <SearchOutlined />
                </template>
                搜索
              </a-button>
              <a-button html-type="reset" @click="doClear" class="reset-btn">
                <template #icon>
                  <ReloadOutlined />
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
      <!-- 按颜色搜索 -->
      <a-form-item label="按颜色搜索">
        <a-space>
          <color-picker
            format="hex"
            @pureColorChange="onColorChange"
            ref="colorPickerRef"
          />
        </a-space>
      </a-form-item>
      <!-- 高级搜索条件 -->
      <div class="search-section">
        <h3 class="section-title">
          <span class="title-icon">
            <SettingOutlined />
          </span>
          高级筛选
          <a-button
            type="link"
            @click="toggleAdvancedSearch"
            class="toggle-btn"
          >
            {{ showAdvancedSearch ? "收起" : "展开" }}
            <DownOutlined v-if="!showAdvancedSearch" />
            <UpOutlined v-else />
          </a-button>
        </h3>
        <a-form
          name="advancedSearchForm"
          layout="inline"
          :model="searchParams"
          @finish="doSearch"
          class="advanced-search-form"
          v-show="showAdvancedSearch"
        >
          <a-form-item label="日期范围" name="dateRange">
            <a-range-picker
              show-time
              v-model:value="dateRange"
              :placeholder="['编辑开始时间', '编辑结束时间']"
              format="YYYY/MM/DD HH:mm:ss"
              :presets="rangePresets"
              @change="onRangeChange"
              class="date-range-picker"
            />
          </a-form-item>
          <a-form-item label="名称" name="name">
            <a-input
              v-model:value="searchParams.name"
              placeholder="请输入名称"
              allow-clear
              class="search-input"
            />
          </a-form-item>
          <a-form-item label="简介" name="introduction">
            <a-input
              v-model:value="searchParams.introduction"
              placeholder="请输入简介"
              allow-clear
              class="search-input"
            />
          </a-form-item>
        </a-form>

        <a-form
          layout="inline"
          :model="searchParams"
          @finish="doSearch"
          class="advanced-search-form"
          v-show="showAdvancedSearch"
        >
          <a-form-item label="尺寸" name="sizePreset">
            <a-radio-group
              v-model:value="selectedSizePreset"
              button-style="solid"
              @change="onSizePresetChange"
              class="size-preset-group"
            >
              <a-radio-button value="small">小</a-radio-button>
              <a-radio-button value="medium">中</a-radio-button>
              <a-radio-button value="large">大</a-radio-button>
              <a-radio-button value="xlarge">特大</a-radio-button>
              <a-radio-button value="custom">至少...</a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item
            v-show="selectedSizePreset === 'custom'"
            label="自定义尺寸"
          >
            <a-space compact class="dimension-inputs">
              <a-input-number
                v-model:value="searchParams.picWidth"
                placeholder="最小宽度"
                class="dimension-input"
                :min="0"
              />
              <span class="dimension-separator">×</span>
              <a-input-number
                v-model:value="searchParams.picHeight"
                placeholder="最小高度"
                class="dimension-input"
                :min="0"
              />
            </a-space>
          </a-form-item>
          <a-form-item label="格式" name="picFormat">
            <a-select
              v-model:value="searchParams.picFormat"
              placeholder="请选择格式"
              allow-clear
              class="search-input format-select"
            >
              <a-select-option value="jpg">JPG</a-select-option>
              <a-select-option value="png">PNG</a-select-option>
              <a-select-option value="gif">GIF</a-select-option>
              <a-select-option value="webp">WebP</a-select-option>
              <a-select-option value="svg">SVG</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import dayjs, { Dayjs } from "dayjs";
import {
  DownOutlined,
  UpOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { listPictureTagCategoryUsingGet } from "@/api/pictureController.ts";
import { message } from "ant-design-vue";
import { ColorPicker } from "vue3-colorpicker";

import "vue3-colorpicker/style.css";
interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void;
}

const props = defineProps<Props>();

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({});

// 高级搜索展开状态
const showAdvancedSearch = ref(false);

// 切换高级搜索显示状态
const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value;
};

// 尺寸预设选项
const selectedSizePreset = ref<string>("");

// 尺寸预设定义
const sizePresets = {
  small: { maxWidth: 400, maxHeight: 400, label: "小 (≤400×400)" },
  medium: { maxWidth: 800, maxHeight: 800, label: "中 (401-800×401-800)" },
  large: { maxWidth: 1200, maxHeight: 1200, label: "大 (801-1200×801-1200)" },
  xlarge: { maxWidth: 999999, maxHeight: 999999, label: "特大 (1201以上)" },
};

// 尺寸预设更改处理
const onSizePresetChange = (e: { target: { value: string } }) => {
  const value = e.target.value;

  if (value === "custom") {
    // 自定义尺寸，不清空现有值
    return;
  }

  const preset = sizePresets[value as keyof typeof sizePresets];
  if (preset) {
    // 不设置精确尺寸，而是设置一个标记字段
    // 父组件可以根据这个标记进行前端过滤
    (searchParams as Record<string, unknown>).sizePreset = value;
    // 清空精确尺寸字段，避免干扰
    (searchParams as Record<string, unknown>).picWidth = undefined;
    (searchParams as Record<string, unknown>).picHeight = undefined;
  }
};

// 搜索数据
const doSearch = () => {
  props.onSearch?.(searchParams);
};

// 标签和分类选项
const categoryOptions = ref<{ value: string; label: string }[]>([]);
const tagOptions = ref<{ value: string; label: string }[]>([]);

/**
 * 获取标签和分类选项
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet();
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      };
    });
    categoryOptions.value = (res.data.data.categoryList ?? []).map(
      (data: string) => {
        return {
          value: data,
          label: data,
        };
      }
    );
  } else {
    message.error("获取标签分类列表失败，" + res.data.message);
  }
};

onMounted(() => {
  getTagCategoryOptions();
});

const dateRange = ref<[Dayjs, Dayjs] | []>([]);

/**
 * 日期范围更改时触发
 * @param dates 日期对象数组
 */
const onRangeChange = (dates: [Dayjs, Dayjs] | null) => {
  if (dates && dates.length >= 2) {
    (searchParams as Record<string, unknown>).startEditTime = dates[0].toDate();
    (searchParams as Record<string, unknown>).endEditTime = dates[1].toDate();
  } else {
    (searchParams as Record<string, unknown>).startEditTime = undefined;
    (searchParams as Record<string, unknown>).endEditTime = undefined;
  }
};

// 时间范围预设
const rangePresets = ref([
  { label: "过去 1 天", value: [dayjs().add(-1, "d"), dayjs()] },
  { label: "过去 1 周", value: [dayjs().add(-7, "d"), dayjs()] },
  { label: "过去 1 月", value: [dayjs().add(-30, "d"), dayjs()] },
]);

// 清理
const doClear = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    (searchParams as Record<string, unknown>)[key] = undefined;
  });
  // 日期筛选项单独清空，必须定义为空数组
  dateRange.value = [];
  // 重置尺寸预设
  selectedSizePreset.value = "";
  // 清空后重新搜索
  props.onSearch?.(searchParams);
};

// 颜色选择器引用
const colorPickerRef = ref();

// 按颜色搜索
const onColorChange = async (color: string) => {
  // 创建颜色搜索参数
  const colorSearchParams = {
    ...searchParams,
    picColor: color,
  };

  // 通过回调函数通知父组件进行搜索
  props.onSearch?.(colorSearchParams);
};
</script>

<style scoped>
/* 整体容器样式 */
.picture-search-form {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.picture-search-form:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.search-form-container {
  width: 100%;
}

/* 搜索区块样式 */
.search-section {
  margin-bottom: 0px;
}

.search-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.title-icon {
  margin-right: 8px;
  font-size: 18px;
}

.toggle-btn {
  margin-left: auto;
  font-size: 14px;
  padding: 0;
  height: auto;
  color: #1890ff;
}

/* 表单样式 */
.basic-search-form,
.advanced-search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.basic-search-form .ant-form-item,
.advanced-search-form .ant-form-item {
  margin-bottom: 16px;
  flex: 0 0 auto;
}

/* 输入框样式 */
.search-input {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.search-input:hover,
.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.tag-select {
  min-width: 180px;
}

.format-select {
  min-width: 120px;
}

/* 按钮样式 */
.search-btn,
.reset-btn {
  border-radius: 6px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search-btn {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border: none;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
}

.search-btn:hover {
  background: linear-gradient(135deg, #40a9ff, #1890ff);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.4);
  transform: translateY(-1px);
}

.reset-btn {
  border-color: #d9d9d9;
  color: #595959;
}

.reset-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

/* 日期选择器样式 */
.date-range-picker {
  width: 400px;
  border-radius: 6px;
}

/* 尺寸输入框样式 */
.dimension-inputs {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.dimension-input {
  width: 100px;
  border-radius: 6px;
}

.dimension-separator {
  margin: 0 8px;
  color: #8c8c8c;
  font-weight: 500;
}

/* 尺寸预设按钮组样式 */
.size-preset-group {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-preset-group .ant-radio-button-wrapper {
  flex: 1;
  text-align: center;
  border-radius: 6px !important;
  border: 1px solid #d9d9d9 !important;
  background: #fafafa;
  color: #595959;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 70px;
}

.size-preset-group .ant-radio-button-wrapper:hover {
  border-color: #1890ff !important;
  color: #1890ff;
  background: #f0f8ff;
}

.size-preset-group .ant-radio-button-wrapper-checked {
  background: linear-gradient(135deg, #1890ff, #096dd9) !important;
  border-color: #1890ff !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
}

.size-preset-group .ant-radio-button-wrapper:not(:first-child)::before {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .picture-search-form {
    padding: 16px;
  }

  .basic-search-form,
  .advanced-search-form {
    flex-direction: column;
  }

  .basic-search-form .ant-form-item,
  .advanced-search-form .ant-form-item {
    width: 100%;
  }

  .date-range-picker {
    width: 100%;
  }

  .dimension-inputs {
    flex-direction: column;
    align-items: flex-start;
  }

  .dimension-separator {
    margin: 8px 0;
  }

  .size-preset-group {
    flex-direction: column;
  }

  .size-preset-group .ant-radio-button-wrapper {
    width: 100%;
    margin-bottom: 8px;
  }

  .size-preset-group .ant-radio-button-wrapper:last-child {
    margin-bottom: 0;
  }
}

/* 动画效果 */
.advanced-search-form {
  transition: all 0.3s ease;
  overflow: hidden;
}

/* 表单项标签样式 */
.ant-form-item-label > label {
  font-weight: 500;
  color: #595959;
}

/* 清除按钮样式 */
.ant-input-clear-icon {
  color: #bfbfbf;
  transition: color 0.3s;
}

.ant-input-clear-icon:hover {
  color: #595959;
}
</style>

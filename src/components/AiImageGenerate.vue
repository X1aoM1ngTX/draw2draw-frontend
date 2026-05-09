<template>
  <div class="ai-image-generate">
    <a-form layout="vertical">
      <a-form-item label="提示词（描述你想要的图片）" required>
        <a-textarea
          v-model:value="form.userPrompt"
          placeholder="例如：一只坐着的橘黄色的猫，表情愉悦，活泼可爱"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          :max-length="800"
          show-count
        />
      </a-form-item>

      <a-form-item label="负向提示词（不希望出现的内容）">
        <a-textarea
          v-model:value="form.negativePrompt"
          placeholder="例如：模糊、低质量、变形"
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>

      <a-form-item label="图片尺寸">
        <a-radio-group v-model:value="form.size">
          <a-radio-button value="1024*1536">竖图</a-radio-button>
          <a-radio-button value="1536*1024">横图</a-radio-button>
          <a-radio-button value="1024*1024">方形</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="智能提示词改写">
        <a-tooltip title="开启后会使用大模型优化提示词，但会增加响应时间和费用">
          <a-switch
            v-model:checked="form.promptExtend"
            checked-children="开启"
            un-checked-children="关闭"
          />
        </a-tooltip>
      </a-form-item>

      <a-form-item label="随机种子（可选）">
        <a-input-number
          v-model:value="form.seed"
          placeholder="留空则随机生成"
          :min="0"
          :max="2147483647"
          style="width: 100%"
        />
      </a-form-item>

      <a-alert
        message="生成提示"
        :description="`今日剩余生成次数：${remainingQuota} 次`"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />

      <a-button
        type="primary"
        block
        :loading="generating"
        :disabled="remainingQuota <= 0"
        @click="handleGenerate"
      >
        <template #icon><FileImageOutlined /></template>
        开始生成
      </a-button>
    </a-form>

    <div v-if="taskId" class="task-progress">
      <a-progress
        :percent="progress"
        :status="taskStatus === 'SUCCESS' ? 'success' : taskStatus === 'FAILED' ? 'exception' : 'active'"
      />
      <p style="text-align: center; margin-top: 8px">{{ progressText }}</p>
    </div>

    <div v-if="generatedPicture" class="result-preview">
      <img :src="generatedPicture.url" alt="Generated Image" />
      <a-button type="primary" block @click="handleSave">
        保存图片
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { FileImageOutlined } from '@ant-design/icons-vue';
import { generateImageUsingPost, getTaskUsingGet } from '@/api/aiImageController';

interface Props {
  picture?: API.PictureVO;
  spaceId?: number;
  onSuccess?: (newPicture: API.PictureVO) => void;
}

const props = defineProps<Props>();

const form = reactive<API.AiImageGenerateRequest>({
  userPrompt: '',
  negativePrompt: '',
  size: '1024*1536',
  promptExtend: false,
  seed: undefined,
  spaceId: props.spaceId,
});

const generating = ref(false);
const taskId = ref<string>('');
const progress = ref(0);
const taskStatus = ref('');
const progressText = ref('');
const remainingQuota = ref(10);
const generatedPicture = ref<API.PictureVO>();

const handleGenerate = async () => {
  if (!form.userPrompt || form.userPrompt.trim().length === 0) {
    message.error('请输入提示词');
    return;
  }

  generating.value = true;
  progress.value = 10;
  progressText.value = '正在创建任务...';

  try {
    const res = await generateImageUsingPost(form);
    if (res.data.code === 0 && res.data.data) {
      taskId.value = res.data.data;
      remainingQuota.value -= 1;
      pollTaskStatus();
    } else {
      message.error('创建任务失败：' + res.data.message);
      generating.value = false;
    }
  } catch (error) {
    message.error('创建任务失败');
    generating.value = false;
  }
};

const pollTaskStatus = async () => {
  const timer = setInterval(async () => {
    try {
      const res = await getTaskUsingGet(taskId.value);
      if (res.data.code === 0 && res.data.data) {
        const task = res.data.data;
        taskStatus.value = task.status || '';
        progress.value = getProgress(task.status || '');
        progressText.value = getProgressText(task.status || '');

        if (task.status === 'SUCCESS' && task.pictures && task.pictures.length > 0) {
          clearInterval(timer);
          generatedPicture.value = task.pictures[0];
          progress.value = 100;
          progressText.value = '生成成功！';
          generating.value = false;
          message.success('图片生成成功');
        } else if (task.status === 'FAILED') {
          clearInterval(timer);
          generating.value = false;
          message.error('生成失败：' + (task.errorMessage || '未知错误'));
        }
      }
    } catch (error) {
      console.error('查询任务状态失败', error);
    }
  }, 2000);

  setTimeout(() => {
    clearInterval(timer);
    if (generating.value) {
      generating.value = false;
      message.error('生成超时，请稍后重试');
    }
  }, 5 * 60 * 1000);
};

const getProgress = (status: string): number => {
  switch (status) {
    case 'PENDING': return 20;
    case 'RUNNING': return 50;
    case 'SUCCESS': return 100;
    case 'FAILED': return 0;
    default: return 10;
  }
};

const getProgressText = (status: string): string => {
  switch (status) {
    case 'PENDING': return '任务等待中...';
    case 'RUNNING': return '正在生成图片...';
    case 'SUCCESS': return '生成完成';
    case 'FAILED': return '生成失败';
    default: return '处理中...';
  }
};

const handleSave = () => {
  if (generatedPicture.value) {
    props.onSuccess?.(generatedPicture.value);
  }
};
</script>

<style scoped>
.ai-image-generate {
  padding: 16px;
}

.task-progress {
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.result-preview {
  margin-top: 24px;
  text-align: center;
}

.result-preview img {
  max-width: 100%;
  max-height: 400px;
  margin-bottom: 16px;
  border-radius: 4px;
  object-fit: contain;
}
</style>

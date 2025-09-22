<template>
  <!-- 搜索表单 -->
  <div class="search-form-container">
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称、简介中搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="类型" name="category">
        <a-input v-model:value="searchParams.category" placeholder="输入类型" allow-clear />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          mode="tags"
          style="min-width: 180px"
          placeholder="输入标签"
          allow-clear
          v-model:value="searchParams.tags"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
  </div>
  <div style="margin-bottom: 16px" />

  <!-- 表格 -->
  <a-table
    layout="inline"
    :columns="columns"
    :data-source="dataList"
    :pagination="pagination"
    @change="doTableChange"
  >
    <!-- 表格内容 -->
    <template #bodyCell="{ column, record }">
      <!-- ID -->
      <template v-if="column.dataIndex === 'id'">
        <span @click="copyId(record.id)" style="cursor: pointer">
          {{ record.id }}
        </span>
      </template>
      <!-- 图片 -->
      <template v-else-if="column.dataIndex === 'url'">
        <a-image :src="record.url" width="80px" />
      </template>
      <!-- 分类 -->
      <template v-else-if="column.dataIndex === 'tags'">
        <a-space wrap>
          <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
        </a-space>
      </template>
      <!-- 图片信息 -->
      <template v-else-if="column.dataIndex === 'picInfo'">
        <div>格式：{{ record.picFormat }}</div>
        <div>宽度：{{ record.picWidth }}</div>
        <div>高度：{{ record.picHeight }}</div>
        <div>宽高比：{{ record.picScale }}</div>
        <div>大小： {{ (record.picSize / 1024).toFixed(2) }}KB</div>
      </template>
      <!-- 创建时间 -->
      <template v-else-if="column.dataIndex === 'createTime'">
        {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <!-- 编辑时间 -->
      <template v-else-if="column.dataIndex === 'editTime'">
        {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <!-- 操作 -->
      <template v-else-if="column.key === 'action'">
        <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
        <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank">编辑</a-button>
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { listPictureByPageUsingPost, deletePictureUsingPost } from '@/api/pictureController'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
    align: 'center',
  },
  {
    title: '标签',
    dataIndex: 'tags',
    align: 'center',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
  },
]

// 数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data && res.data.code === 0) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 表格变化之后，重新获取数据
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 搜索数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 复制ID
const copyId = (id: number) => {
  navigator.clipboard
    .writeText(id.toString())
    .then(() => {
      message.success('ID已复制到剪贴板')
    })
    .catch(() => {
      message.error('复制失败，请手动复制')
    })
}

// 删除数据
const doDelete = async (id: number) => {
  if (!id) {
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该图片吗？此操作不可恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      const res = await deletePictureUsingPost({ id: id })
      if (res.data.code === 0) {
        message.success('删除成功')
        // 刷新数据
        fetchData()
      } else {
        message.error('删除失败')
      }
    },
    onCancel: () => {
      message.info('已取消删除')
    },
  })
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.search-form-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  position: relative;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: opacity 0.3s ease;
}
</style>

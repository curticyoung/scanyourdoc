<template>
  <div class="docx-preview">
    <n-spin :show="loading">
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div ref="containerRef" class="docx-container"></div>
    </n-spin>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { renderAsync } from 'docx-preview'
import { NSpin } from 'naive-ui'

const props = defineProps<{
  file?: File
}>()

const loading = ref(false)
const error = ref('')
const containerRef = ref<HTMLDivElement>()

async function loadContent() {
  console.log('[DocxPreview] loadContent called')
  console.log('[DocxPreview] File:', props.file?.name)
  
  if (!props.file || !containerRef.value) {
    console.log('[DocxPreview] No file or container')
    error.value = ''
    return
  }

  if (!props.file.name.toLowerCase().endsWith('.docx')) {
    console.log('[DocxPreview] Not a DOCX file')
    error.value = '不是有效的 DOCX 文件'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    console.log('[DocxPreview] Starting render')
    const arrayBuffer = await props.file.arrayBuffer()
    
    // 清空容器
    const container = containerRef.value
    container.innerHTML = ''
    
    // 直接渲染到容器
    await renderAsync(arrayBuffer, container, undefined, {
      className: 'docx-viewer',
      inWrapper: true
    })

    console.log('[DocxPreview] Render completed')
  } catch (e) {
    console.error('[DocxPreview] Error in loadContent:', e)
    error.value = e instanceof Error ? e.message : '加载 DOCX 文件失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('[DocxPreview] Component mounted')
  loadContent()
})

watch(() => props.file, (newFile) => {
  console.log('[DocxPreview] File changed:', newFile?.name)
  loadContent()
})
</script>

<style>
.docx-viewer {
  background-color: #ffffff;
}

.docx-wrapper {
  background-color: #ffffff;
}

.docx-wrapper page {
  background-color: #ffffff;
  margin-bottom: 20px;
}
</style>

<style scoped>
.docx-preview {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.docx-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow: auto;
  background: #ffffff;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  padding: 20px;
}

:deep(.docx-viewer) {
  padding: 20px;
  margin: 0 auto;
  max-width: 800px;
}

:deep(.docx-wrapper) {
  padding: 0;
  margin: 0;
}

:deep(.docx-wrapper page) {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* 保持表格边框可见 */
:deep(table) {
  border-collapse: collapse;
  width: 100%;
}

:deep(td), :deep(th) {
  border: 1px solid #ddd;
  padding: 8px;
}
</style> 
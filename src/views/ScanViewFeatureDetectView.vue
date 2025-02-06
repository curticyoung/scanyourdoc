<template>
  <div class="document-view">
    <div v-if="isDocx">
      <DocxPreview :file="file" />
    </div>
    <div v-else>
      <CanvasScanView v-if="supportCanvasScan" :pdf="file" />
      <MagicaScanView v-else :pdf="file" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { featureDetect } from '@/utils/scan-renderer/canvas-scan'
import CanvasScanView from './CanvasScanView.vue'
import MagicaScanView from './MagicaScanView.vue'
import DocxPreview from '@/components/docx-preview/DocxPreview.vue'

const supportCanvasScan = featureDetect()
const file = ref<File>()

const isDocx = computed(() => {
  const result = file.value?.name.toLowerCase().endsWith('.docx') ?? false
  console.log('[ScanView] isDocx computed:', result, 'filename:', file.value?.name)
  return result
})

// 监听文件变化
watch(file, (newFile, oldFile) => {
  console.log('[ScanView] file watcher triggered')
  console.log('[ScanView] Old file:', oldFile?.name)
  console.log('[ScanView] New file:', newFile?.name)
}, { immediate: true })
</script>

<style scoped>
.document-view {
  width: 100%;
  height: 100%;
  padding: 20px;
}
</style>

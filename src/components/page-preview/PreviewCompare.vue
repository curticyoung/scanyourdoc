<template>
  <n-space vertical>
    <SideBySidePreview>
      <template #pdf>
        <ImagePreview :image="image?.blob" />
      </template>
      <template #scan>
        <ImagePreview
          :image="scanning ? undefined : scanImage?.blob"
          :height="image?.height"
          :width="image?.width"
        />
      </template>
    </SideBySidePreview>
    <PreviewPagination v-model:page="page" :numPages="numPages" v-if="numPages >= 2" />
  </n-space>
</template>

<script lang="ts" setup>
import SideBySidePreview from './SideBySidePreview.vue'
import ImagePreview from './ImagePreview.vue'
import { ref } from 'vue'
import { computedAsync } from '@vueuse/core'
import PreviewPagination from './PreviewPagination.vue'
import { NSpace } from 'naive-ui'
import type { DocumentRenderer, ScanRenderer } from '@/utils/document-renderer/types'

const page = ref(1)
const scanning = ref(false)

const props = defineProps<{
  documentRenderer?: DocumentRenderer
  scanRenderer?: ScanRenderer
  scale: number
}>()

const image = computedAsync(async () => {
  if (!props.documentRenderer)
    return {
      blob: undefined,
      height: undefined,
      width: undefined
    }

  const { blob, width, height } = await props.documentRenderer.renderPage(page.value, props.scale)
  return {
    blob,
    width,
    height
  }
})

let controller = new AbortController()

const scanImage = computedAsync(
  async () => {
    controller.abort()
    controller = new AbortController()
    if (!props.scanRenderer || !image.value.blob) return

    const { blob } = await props.scanRenderer.renderPage(image.value.blob, {
      signal: controller.signal
    })
    return {
      blob
    }
  },
  undefined,
  scanning
)

const numPages = computedAsync(async () => {
  page.value = 1
  if (!props.documentRenderer) return 1
  return await props.documentRenderer.getNumPages()
}, 1)
</script>

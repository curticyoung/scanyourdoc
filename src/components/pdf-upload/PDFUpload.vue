<template>
  <n-card>
    <n-space vertical>
      <n-button text @click="onClick">
        <template #icon>
          <n-icon>
            <FolderOpen16Regular />
          </n-icon>
        </template>
        <n-text>
          {{ t('settings.fileSelectLabel') }}
        </n-text>
      </n-button>
    </n-space>
  </n-card>
</template>

<script lang="ts" setup>
import { NButton, NIcon, NText, NCard, NSpace } from 'naive-ui'
import { FolderOpen16Regular } from '@vicons/fluent'
import { fileOpen } from 'browser-fs-access'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'update:pdf', file: File | undefined): void
}>()

async function onClick() {
  try {
    const file = await fileOpen({
      description: 'PDF and Word Documents',
      mimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      extensions: ['.pdf', '.docx']
    })
    
    console.log('Selected file:', file.name, file.type)
    emit('update:pdf', file)
  } catch (e) {
    console.error('Error selecting file:', e)
  }
}
</script>

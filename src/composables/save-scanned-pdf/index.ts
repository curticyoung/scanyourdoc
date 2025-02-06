import type { Ref } from 'vue'
import { get } from '@vueuse/core'
import { ref, computed, watch } from 'vue'
import { buildPDF } from '@/utils/pdf-builder/pdf-lib'
import type { DocumentRenderer, ScanRenderer as IScanRenderer } from '@/utils/document-renderer/types'

export function useSaveScannedPDF(
  file: Ref<File | undefined>,
  documentRenderer: Ref<DocumentRenderer | undefined>,
  scanRenderer: Ref<IScanRenderer | undefined>,
  scale: Ref<number>
) {
  const finishedPages = ref(0)
  const totalPages = ref(0)
  const progress = computed(() => {
    if (totalPages.value === 0) {
      return 0
    }
    return finishedPages.value / totalPages.value
  })

  const saving = ref(false)
  const scannedPDF = ref<File | undefined>(undefined)
  const outputFilename = computed(() => {
    const originalFilename = file.value?.name ?? 'doc.pdf'
    const filename = `${originalFilename.replace(/\.[^/.]+$/, '')}-scan.pdf`
    return filename
  })

  const reset = () => {
    finishedPages.value = 0
    totalPages.value = 0
    saving.value = false
    scannedPDF.value = undefined
  }

  watch(file, reset)

  const save = async () => {
    if (!file.value || !documentRenderer.value || !scanRenderer.value) {
      throw new Error('Missing required dependencies')
    }

    saving.value = true
    reset()

    try {
      totalPages.value = await documentRenderer.value.getNumPages()
      const pages: Array<{ width: number; height: number; ppi: number; blob: Blob }> = []

      for (let i = 1; i <= totalPages.value; i++) {
        const { blob, width, height, ppi } = await documentRenderer.value.renderPage(i, get(scale))
        const { blob: scannedBlob } = await scanRenderer.value.renderPage(blob)
        pages.push({ width, height, ppi, blob: scannedBlob })
        finishedPages.value++
      }

      const pdfBlob = await buildPDF(pages)
      scannedPDF.value = new File([pdfBlob], outputFilename.value, {
        type: 'application/pdf'
      })
    } finally {
      saving.value = false
    }
  }

  return {
    save,
    progress,
    saving,
    scannedPDF
  }
}

import { renderAsync } from 'docx-preview'
import type { DocumentRenderer, DocumentPageInfo } from '../document-renderer/types'
import html2canvas from 'html2canvas'

export class DocxRenderer implements DocumentRenderer {
  private file: File
  private container: HTMLDivElement | null = null

  constructor(file: File) {
    console.log('[DocxRenderer] Initializing with file:', file.name)
    this.file = file
    this.container = document.createElement('div')
    this.container.style.position = 'absolute'
    this.container.style.left = '-9999px'
    this.container.style.top = '0'
    this.container.style.backgroundColor = '#ffffff'
    document.body.appendChild(this.container)
  }

  async renderPage(page: number, scale: number): Promise<DocumentPageInfo> {
    console.log('[DocxRenderer] renderPage called:', { page, scale })
    
    if (!this.container) {
      throw new Error('Container not initialized')
    }

    // 清空容器
    this.container.innerHTML = ''

    // 创建一个白色背景的容器
    const whiteBackground = document.createElement('div')
    whiteBackground.style.cssText = `
      background-color: #ffffff !important;
      padding: 20px;
      box-sizing: border-box;
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    `
    this.container.appendChild(whiteBackground)

    // 设置容器宽度
    const width = 800 * scale
    whiteBackground.style.width = `${width}px`

    // 渲染 DOCX 到容器
    const arrayBuffer = await this.file.arrayBuffer()
    await renderAsync(arrayBuffer, whiteBackground, undefined, {
      className: 'docx-viewer',
      inWrapper: true
    })

    // 添加样式到 head
    const style = document.createElement('style')
    style.textContent = `
      .docx-wrapper {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .docx-wrapper page {
        background: #ffffff !important;
        margin: 0 0 20px 0 !important;
        padding: 20px !important;
        box-shadow: none !important;
      }
      .docx-viewer {
        background: #ffffff !important;
        padding: 0 !important;
      }
    `
    document.head.appendChild(style)

    // 确保所有内容元素都有白色背景
    const contentElements = whiteBackground.querySelectorAll('*')
    contentElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.backgroundColor = '#ffffff'
        // 移除任何可能的背景图片或渐变
        el.style.backgroundImage = 'none'
        // 移除阴影
        el.style.boxShadow = 'none'
      }
    })

    // 使用 html2canvas 将内容转换为图片
    const canvas = await html2canvas(whiteBackground, {
      scale: 1,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: width,
      height: whiteBackground.scrollHeight,
      windowWidth: width,
      onclone: (clonedDoc, element) => {
        // 设置克隆文档的背景
        clonedDoc.documentElement.style.backgroundColor = '#ffffff'
        clonedDoc.body.style.backgroundColor = '#ffffff'
        
        // 确保所有元素都有白色背景
        const allElements = element.querySelectorAll('*')
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.backgroundColor = '#ffffff'
            el.style.backgroundImage = 'none'
            el.style.boxShadow = 'none'
          }
        })
      }
    })

    // 清理添加的样式
    document.head.removeChild(style)

    // 转换为 blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/png', 1.0)
    })

    return {
      blob,
      page,
      width: canvas.width,
      height: canvas.height,
      scale,
      ppi: 96 * scale
    }
  }

  async getNumPages(): Promise<number> {
    return 1 // DOCX 暂时只支持单页预览
  }

  destroy() {
    if (this.container) {
      document.body.removeChild(this.container)
      this.container = null
    }
  }
} 
import mammoth from 'mammoth'

export class DOCXRenderer {
  private file: File
  private htmlResult: string | null = null

  constructor(file: File) {
    this.file = file
  }

  async render(): Promise<string> {
    if (this.htmlResult) {
      return this.htmlResult
    }

    const arrayBuffer = await this.file.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })
    this.htmlResult = result.value
    return this.htmlResult
  }

  async getPageCount(): Promise<number> {
    const html = await this.render()
    // 简单估算页数：假设每1000个字符约为一页
    return Math.max(1, Math.ceil(html.length / 1000))
  }

  isDocx(): boolean {
    return this.file.name.toLowerCase().endsWith('.docx')
  }
} 
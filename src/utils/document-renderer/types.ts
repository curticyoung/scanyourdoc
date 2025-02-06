export interface DocumentPageInfo {
  blob: Blob
  page: number
  height: number
  width: number
  scale: number
  ppi: number
}

export interface DocumentRenderer {
  renderPage(
    page: number,
    scale: number
  ): Promise<DocumentPageInfo>
  getNumPages(): Promise<number>
}

export interface ScanRenderer {
  renderPage(
    image: Blob,
    options?: {
      signal?: AbortSignal
    }
  ): Promise<{
    blob: Blob
  }>
} 
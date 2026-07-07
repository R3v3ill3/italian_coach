export interface OcrResult {
  text: string
  lines: string[]
}

export async function ocrImage(file: File | Blob, onProgress?: (pct: number) => void): Promise<OcrResult> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('ita', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') onProgress?.(Math.round(m.progress * 100))
    },
  })
  try {
    const { data } = await worker.recognize(file)
    const lines = data.text
      .split('\n')
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter((l) => l.length > 1 && /[a-zà-ù]/i.test(l))
    return { text: data.text.trim(), lines }
  } finally {
    await worker.terminate()
  }
}

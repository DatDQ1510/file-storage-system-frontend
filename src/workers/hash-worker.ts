// src/workers/hash-worker.ts
self.onmessage = async (e: MessageEvent) => {
  const { chunk, index } = e.data

  try {
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await chunk.arrayBuffer()
    
    // Compute SHA-256 hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
    
    // Convert ArrayBuffer to Hex String
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    
    // Send result back to main thread
    self.postMessage({ hash: hashHex, index })
  } catch (error) {
    self.postMessage({ 
      error: error instanceof Error ? error.message : "Hashing failed", 
      index 
    })
  }
}

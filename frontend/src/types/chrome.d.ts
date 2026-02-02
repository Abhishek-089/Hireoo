// Chrome Extension API type declarations
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage?: (extensionId: string, message: any, responseCallback?: (response: any) => void) => void
        lastError?: {
          message?: string
        }
      }
    }
  }
  
  // Chrome extension API (available in browser extension context)
  var chrome: {
    runtime?: {
      sendMessage?: (extensionId: string, message: any, responseCallback?: (response: any) => void) => void
      lastError?: {
        message?: string
      }
    }
  } | undefined
}

export {}

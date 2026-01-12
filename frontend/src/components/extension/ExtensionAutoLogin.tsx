"use client"

import { useEffect } from "react"

export function ExtensionAutoLogin() {
  useEffect(() => {
    const sendTokenToExtension = async () => {
      try {
        const res = await fetch("/api/extension/token", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          // 401/403 just mean not eligible; silently ignore
          return
        }

        const data = await res.json()
        if (!data?.token) return

        // Send token to the extension content script
        window.postMessage(
          {
            type: "HIREOO_EXTENSION_LOGIN",
            token: data.token,
          },
          "*"
        )
      } catch (error) {
        // Failing to notify the extension should not break the dashboard
        console.error("Failed to send extension token:", error)
      }
    }

    // Only run in browser
    if (typeof window !== "undefined") {
      sendTokenToExtension()
    }
  }, [])

  return null
}











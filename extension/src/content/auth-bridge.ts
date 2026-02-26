// Content script that runs on the Hireoo web app domain.
// It listens for messages from the page and forwards a JWT to the
// background script so the extension can log in without a separate UI flow.

function forwardTokenToBackground(token: string) {
  // chrome.runtime can be undefined if the extension was reloaded/updated
  // while this tab was already open. Guard before calling it.
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    console.warn(
      "[Hireoo] Extension context is unavailable — please reload this page to reconnect the extension."
    )
    return
  }

  try {
    chrome.runtime.sendMessage({ type: "AUTH_LOGIN", jwt: token }, () => {
      // Suppress "Could not establish connection" if background isn't ready yet
      void chrome.runtime.lastError
    })
  } catch (error) {
    console.error("[Hireoo] Failed to forward login token to background:", error)
  }
}

window.addEventListener("message", (event: MessageEvent) => {
  // Only accept messages from the same window
  if (event.source !== window) return

  const data = event.data
  if (!data || typeof data !== "object") return

  if (data.type === "HIREOO_EXTENSION_LOGIN" && typeof data.token === "string") {
    forwardTokenToBackground(data.token)
  }
})













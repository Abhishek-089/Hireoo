// Content script that runs on the Hireoo web app domain.
// It listens for messages from the page and forwards a JWT to the
// background script so the extension can log in without a separate UI flow.

window.addEventListener("message", (event: MessageEvent) => {
  // Only accept messages from the same window
  if (event.source !== window) return

  const data = event.data
  if (!data || typeof data !== "object") return

  if (data.type === "HIREOO_EXTENSION_LOGIN" && typeof data.token === "string") {
    try {
      chrome.runtime.sendMessage({
        type: "AUTH_LOGIN",
        jwt: data.token,
      })
    } catch (error) {
      // Ignore errors in content script; popup/background will surface issues
      console.error("Failed to forward login token to background:", error)
    }
  }
})











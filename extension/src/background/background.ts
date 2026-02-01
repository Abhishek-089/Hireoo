// Chrome extension background service worker
import { ExtensionAuth } from '../utils/auth'
import { HiddenRunner } from './hidden-runner'

console.log('Hireoo extension background service worker loaded')

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Hireoo extension installed')

    // Set default settings
    chrome.storage.local.set({
      hireoo_settings: {
        autoScrape: false,
        notifications: true,
        lastScraped: null,
      },
    })
  }
})

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(
  (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log('Background received message:', request)

    handleMessage(request, sender)
      .then(sendResponse)
      .catch((error) => {
        console.error('Background message error:', error)
        sendResponse({ error: error.message })
      })

    // Return true to indicate async response
    return true
  }
)

// Handle alarms for periodic tasks
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm.name)

  if (alarm.name === 'checkAuth') {
    checkAuthenticationStatus()
  }
})

// Handle tab updates for LinkedIn detection
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com')) {
    // Wait a bit for content script to load
    await new Promise(resolve => setTimeout(resolve, 100))

    // Notify content script that we're on LinkedIn
    // Use try-catch to prevent console errors
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'LINKEDIN_PAGE_LOADED',
        url: tab.url,
      })
    } catch (error) {
      // Content script might not be ready yet, silently ignore
      // This is expected behavior and not an error
    }
  }
})

async function handleMessage(
  request: any,
  sender: chrome.runtime.MessageSender
): Promise<any> {
  switch (request.type) {
    case 'AUTH_CHECK':
      return await ExtensionAuth.isAuthenticated()

    case 'AUTH_LOGIN':
      const user = await ExtensionAuth.loginWithJWT(request.jwt)

      // Notify any open popups that auth status changed
      // Use promise catch to prevent console errors
      chrome.runtime.sendMessage({
        type: 'AUTH_STATUS_CHANGED',
        authenticated: true,
        user,
      }).catch(() => {
        // If no listeners, silently ignore
        // This is expected when popup is closed
      })

      return user

    case 'AUTH_LOGOUT':
      await ExtensionAuth.clearAuthData()
      return { success: true }

    case 'GET_AUTH_DATA':
      return await ExtensionAuth.getAuthData()

    case 'API_REQUEST':
      return await handleApiRequest(request)

    case 'SCRAPE_LINKEDIN':
      return await handleLinkedInScraping(request, sender)

    case 'CREATE_OFFSCREEN':
      return await createOffscreenDocument()

    // Hidden Runner Messages
    case 'START_HIDDEN_RUNNER':
      const runner = HiddenRunner.getInstance()
      return await runner.start()

    case 'STOP_HIDDEN_RUNNER':
      const runner2 = HiddenRunner.getInstance()
      return await runner2.stop()

    case 'GET_RUNNER_STATUS':
      const runner3 = HiddenRunner.getInstance()
      return runner3.getStatus()

    // Scraped Posts Handler
    case 'SCRAPED_POSTS':
      const runner4 = HiddenRunner.getInstance()
      if (request.posts && Array.isArray(request.posts)) {
        await runner4.handleScrapedPosts(request.posts)
      }
      return { success: true }

    // Scraper Debug Messages (forward content script logs to background console)
    case 'SCRAPER_DEBUG':
      console.log(`[Scraper] ${request.message}`, request.data || '')
      return { success: true }

    default:
      throw new Error(`Unknown message type: ${request.type}`)
  }
}

async function handleApiRequest(request: any): Promise<any> {
  try {
    const response = await ExtensionAuth.authenticatedRequest(
      request.url,
      {
        method: request.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...request.headers,
        },
        body: request.body,
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'API request failed' }))
      return {
        success: false,
        error: errorData.error || `API request failed with status ${response.status}`,
      }
    }

    const data = await response.json().catch(() => ({}))
    return {
      success: true,
      ...data,
    }
  } catch (error) {
    console.error('API request failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'API request failed',
    }
  }
}

async function handleLinkedInScraping(request: any, sender: chrome.runtime.MessageSender): Promise<any> {
  console.log('LinkedIn scraping requested:', request)

  // Manual scrape should operate on the active LinkedIn tab in the current window,
  // not the popup tab (sender.tab is the popup, not the page).
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!activeTab?.id || !activeTab.url?.includes('linkedin.com')) {
    throw new Error('Please open a LinkedIn page before scraping')
  }

  let response: any
  let error: any = null

  // Wait a bit for content script to be ready
  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    // Ask the content script on the LinkedIn tab to scrape visible posts
    response = await chrome.tabs.sendMessage(activeTab.id, {
      type: 'SCRAPE_VISIBLE_POSTS',
    })
  } catch (err) {
    error = err
    console.warn('No scraping content script found, injecting manually...', err)

    try {
      // As a fallback, inject the scraping content script and try again
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['src/content/scraping.js'],
      })

      // Wait for script to initialize
      await new Promise(resolve => setTimeout(resolve, 1000))

      response = await chrome.tabs.sendMessage(activeTab.id, {
        type: 'SCRAPE_VISIBLE_POSTS',
      })
    } catch (injectError) {
      console.error('Failed to inject scraping script:', injectError)
      throw new Error(`Could not establish connection with content script: ${injectError instanceof Error ? injectError.message : 'Unknown error'}`)
    }
  }

  if (!response) {
    throw new Error('No response from content script')
  }

  const posts = response?.posts || []
  console.log(`[Background] LinkedIn scraping returned ${posts.length} posts`)

  // Log all scraped posts
  if (posts.length > 0) {
    console.log(`[Background] Scraped posts data:`, posts.map(p => ({
      id: p.id,
      author: p.author?.name,
      textPreview: p.text?.substring(0, 100),
      postUrl: p.postUrl,
      hasHiringKeywords: p.hasHiringKeywords
    })))
  }

  // If zero posts, ask content script to refresh config and retry once
  if (posts.length === 0) {
    try {
      await chrome.tabs.sendMessage(activeTab.id, { type: 'REFRESH_SCRAPER_CONFIG' })
      await new Promise(resolve => setTimeout(resolve, 500))
      const retry = await chrome.tabs.sendMessage(activeTab.id, { type: 'SCRAPE_VISIBLE_POSTS' })
      const retryPosts = retry?.posts || []
      console.log(`LinkedIn scraping retry returned ${retryPosts.length} posts`)
      if (retryPosts.length > 0) {
        await forwardPostsToBackend(retryPosts)
        return {
          success: true,
          message: 'Scraping completed after retry',
          data: { jobsFound: retryPosts.length, timestamp: Date.now() },
        }
      }
    } catch (e) {
      console.warn('Retry after config refresh failed:', e)
    }
  }

  if (posts.length > 0) {
    await forwardPostsToBackend(posts)
  }

  // Forward posts to the HiddenRunner to send them to the backend
  // (Handled above via forwardPostsToBackend)

  return {
    success: true,
    message: 'Scraping completed',
    data: {
      jobsFound: posts.length,
      timestamp: Date.now(),
    },
  }
}

async function forwardPostsToBackend(posts: any[]): Promise<void> {
  if (!posts || posts.length === 0) return
  const runner = HiddenRunner.getInstance()
  await runner.handleScrapedPosts(posts)
}

async function createOffscreenDocument(): Promise<any> {
  try {
    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    })

    if (existingContexts.length > 0) {
      return { success: true, message: 'Offscreen document already exists' }
    }

    // Create offscreen document
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: 'Parse LinkedIn HTML content for job scraping',
    })

    return { success: true, message: 'Offscreen document created' }
  } catch (error) {
    console.error('Failed to create offscreen document:', error)
    throw error
  }
}

async function checkAuthenticationStatus(): Promise<void> {
  const isAuthenticated = await ExtensionAuth.isAuthenticated()

  if (!isAuthenticated) {
    // Notify popup that user needs to login
    // Only send if popup is open to avoid console errors
    try {
      await chrome.runtime.sendMessage({
        type: 'AUTH_STATUS_CHANGED',
        authenticated: false,
      })
    } catch {
      // Popup is not open, silently ignore
      // This is expected behavior
    }
  }
}

// Set up periodic auth check (every 30 minutes)
chrome.alarms.create('checkAuth', { periodInMinutes: 30 })

// Listen for messages from the website (external)
// This allows the website to detect if the extension is installed
chrome.runtime.onMessageExternal.addListener(
  (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log('External message received from website:', request, sender)

    if (request.type === 'PING') {
      // Respond with extension info
      sendResponse({
        installed: true,
        version: chrome.runtime.getManifest().version,
        name: chrome.runtime.getManifest().name
      })
      return true
    }

    if (request.type === 'START_HIDDEN_RUNNER') {
      console.log('External request to start hidden runner:', request)
      const runner = HiddenRunner.getInstance()
      runner.start()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, message: error.message }))
      return true
    }

    // Unknown message type
    sendResponse({ error: 'Unknown message type' })
    return true
  }
)

console.log('Hireoo background service worker initialized')

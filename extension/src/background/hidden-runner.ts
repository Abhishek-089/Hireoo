// Hidden Runner - Manages background LinkedIn scraping
// Opens and controls a hidden tab that scrolls through LinkedIn feed
import { ExtensionAuth } from '../utils/auth'

export class HiddenRunner {
  private static instance: HiddenRunner | null = null
  private hiddenTabId: number | null = null
  private isRunning = false
  private scrollInterval: number | null = null
  private lastActivity = 0
  private startTime = 0
  private postsScraped = 0
  private readonly SCROLL_INTERVAL_MIN = 5000 // 5 seconds
  private readonly SCROLL_INTERVAL_MAX = 10000 // 10 seconds

  // Helper to broadcast status changes
  private async broadcastStatus() {
    try {
      const status = await this.getStatus()
      chrome.runtime.sendMessage({
        type: 'RUNNER_STATUS_CHANGED',
        status
      }).catch(() => {
        // Ignore errors if no receivers (popup closed)
      })
    } catch (e) {
      console.error('[HiddenRunner] Failed to broadcast status:', e)
    }
  }
  private readonly SCRAPE_INTERVAL = 15000 // 15 seconds - scrape even without scrolling
  private readonly MAX_RUN_TIME = 30 * 60 * 1000 // 30 minutes
  private readonly ACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes
  private readonly PAGE_LOAD_WAIT = 8000 // 8 seconds - wait for LinkedIn to fully load
  // Hard cap on how many posts can be scraped in a single run
  // to avoid excessive background activity. You can tune this value.
  private readonly MAX_POSTS_PER_RUN = 100
  private scrapeInterval: number | null = null
  private keepAliveInterval: number | null = null // Keep tab active
  // Hardcoded keywords for now - will be made dynamic later
  private searchKeywords = 'freelance developer project'

  private constructor() { }

  /**
   * Build LinkedIn search results URL with keywords
   */
  private buildSearchUrl(keywords: string): string {
    const encodedKeywords = encodeURIComponent(keywords)
    return `https://www.linkedin.com/search/results/content/?keywords=${encodedKeywords}&origin=SWITCH_SEARCH_VERTICAL`
  }

  /**
   * Fetch scraping keywords from backend API
   */
  private async fetchSearchKeywords(): Promise<string> {
    try {
      console.log('[HiddenRunner] 📥 Fetching dynamic search keywords...')
      const response = await ExtensionAuth.authenticatedRequest('/api/extension/preferences')

      if (!response.ok) {
        console.warn('[HiddenRunner] ⚠️ Failed to fetch preferences, using default keywords')
        return this.searchKeywords
      }

      const data = await response.json()
      if (data.keywords && typeof data.keywords === 'string') {
        console.log(`[HiddenRunner] ✅ Fetched keywords: "${data.keywords}"`)
        return data.keywords
      }

      return this.searchKeywords
    } catch (error) {
      console.error('[HiddenRunner] ❌ Error fetching keywords:', error)
      return this.searchKeywords
    }
  }

  static getInstance(): HiddenRunner {
    if (!HiddenRunner.instance) {
      HiddenRunner.instance = new HiddenRunner()
    }
    return HiddenRunner.instance
  }

  async start(): Promise<{ success: boolean; message: string }> {
    if (this.isRunning) {
      console.log('[HiddenRunner] ⚠️ Runner is already running')
      return { success: false, message: 'Hidden runner is already running' }
    }

    try {
      console.log('[HiddenRunner] 🚀 Starting hidden LinkedIn runner...')

      // Fetch dynamic keywords
      this.searchKeywords = await this.fetchSearchKeywords()

      console.log('[HiddenRunner] 📋 Configuration:', {
        keywords: this.searchKeywords,
        scrollInterval: `${this.SCROLL_INTERVAL_MIN / 1000}s - ${this.SCROLL_INTERVAL_MAX / 1000}s`,
        scrapeInterval: `${this.SCRAPE_INTERVAL / 1000}s`,
        maxRunTime: `${this.MAX_RUN_TIME / 1000 / 60} minutes`,
        maxPosts: this.MAX_POSTS_PER_RUN
      })

      // Check if user is authenticated (directly use ExtensionAuth instead of message)
      console.log('[HiddenRunner] 🔐 Checking authentication...')
      const authData = await ExtensionAuth.getAuthData()
      if (!authData) {
        console.error('[HiddenRunner] ❌ User not authenticated')
        console.error('[HiddenRunner] 💡 Please sign in through the extension popup first')
        return { success: false, message: 'User not authenticated. Please sign in through the extension popup.' }
      }
      console.log('[HiddenRunner] ✅ User authenticated')
      console.log('[HiddenRunner] 👤 Authenticated as:', {
        email: authData.email,
        id: authData.id,
        name: authData.name || 'N/A'
      })

      // Build search URL with keywords
      const searchUrl = this.buildSearchUrl(this.searchKeywords)
      console.log(`[HiddenRunner] Opening search results page: ${searchUrl}`)

      // Create tab - must be active to avoid throttling
      // We'll create it in a way that doesn't interrupt the user
      const tab = await chrome.tabs.create({
        url: searchUrl,
        active: true, // Must be active to avoid throttling
        pinned: false
      })

      // Immediately switch back to the previous tab to minimize disruption
      // Get all tabs and find the one that was active before
      const allTabs = await chrome.tabs.query({ currentWindow: true })
      const previousTab = allTabs.find(t => t.id !== tab.id && !t.pinned)
      if (previousTab?.id) {
        // Switch back to previous tab after a brief moment
        setTimeout(() => {
          chrome.tabs.update(previousTab.id!, { active: true }).catch(() => { })
        }, 500)
      }

      this.hiddenTabId = tab.id!
      this.isRunning = true
      this.startTime = Date.now()
      this.lastActivity = Date.now()
      this.postsScraped = 0

      // Broadcast status change immediately
      this.broadcastStatus()

      console.log(`[HiddenRunner] Hidden tab created with ID: ${this.hiddenTabId}`)
      console.log(`[HiddenRunner] Scraping keywords: "${this.searchKeywords}"`)

      // Wait for page to load, then initialize
      // Increased wait time for hidden tabs which throttle cpu
      const adjustedWait = this.PAGE_LOAD_WAIT + 4000;
      console.log(`[HiddenRunner] ⏳ Waiting ${adjustedWait / 1000}s for page to load...`)

      // Also wait for tab to be fully loaded
      const tabId = tab.id!
      const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener)
          console.log('[HiddenRunner] 📄 Tab loaded completely, initializing runner...')
          setTimeout(async () => {
            await this.initializeRunner()
            this.scheduleStop()
          }, 4000) // Increased: Additional 4s wait for content to render in background
        }
      }
      chrome.tabs.onUpdated.addListener(listener)

      // Fallback: if tab doesn't fire 'complete' event, use timeout
      setTimeout(async () => {
        if (this.isRunning && this.hiddenTabId === tabId) {
          chrome.tabs.onUpdated.removeListener(listener)
          console.log('[HiddenRunner] 📄 Page load timeout reached, initializing runner...')
          await this.initializeRunner()
          this.scheduleStop()
        }
      }, adjustedWait + 5000) // Extra 5s buffer

      // Set up activity monitoring
      this.monitorActivity()
      console.log('[HiddenRunner] ✅ Runner started successfully!')
      console.log('[HiddenRunner] 📊 Status: RUNNING')

      return { success: true, message: 'Hidden runner started successfully' }
    } catch (error) {
      console.error('Failed to start hidden runner:', error)
      this.isRunning = false
      return { success: false, message: 'Failed to start hidden runner' }
    }
  }

  async stop(): Promise<{ success: boolean; message: string }> {
    if (!this.isRunning) {
      return { success: false, message: 'Hidden runner is not running' }
    }

    try {
      console.log('Stopping hidden LinkedIn runner...')

      // Stop scrolling
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval)
        this.scrollInterval = null
      }

      // Stop periodic scraping
      if (this.scrapeInterval) {
        clearInterval(this.scrapeInterval)
        this.scrapeInterval = null
      }

      // Stop keep-alive
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval)
        this.keepAliveInterval = null
      }

      // Close hidden tab
      if (this.hiddenTabId) {
        chrome.tabs.remove(this.hiddenTabId).catch(() => { })
        this.hiddenTabId = null
      }

      this.isRunning = false
      this.scrollInterval = null
      this.scrapeInterval = null
      this.keepAliveInterval = null
      this.postsScraped = 0
      this.startTime = 0

      // Broadcast stopped status
      this.broadcastStatus()

      console.log('Hidden runner stopped successfully')
      return { success: true, message: 'Hidden runner stopped successfully' }
    } catch (error) {
      console.error('Failed to stop hidden runner:', error)
      return { success: false, message: 'Failed to stop hidden runner' }
    }
  }

  /**
   * Initialize the runner: perform initial scrape and start scrolling/scraping loops
   */
  private async initializeRunner(): Promise<void> {
    if (!this.hiddenTabId || !this.isRunning) {
      console.warn('[HiddenRunner] ⚠️ Cannot initialize: tab or runner not ready')
      return
    }

    console.log('[HiddenRunner] 🔧 Initializing runner...')
    console.log('[HiddenRunner] 📍 Tab ID:', this.hiddenTabId)

    // Wait a bit more and check if tab is ready
    console.log('[HiddenRunner] ⏳ Waiting 5s for tab to be fully ready and content to load...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Check if page is loaded by checking for main content
    try {
      const pageStatus = await chrome.tabs.sendMessage(this.hiddenTabId, {
        type: 'CHECK_PAGE_READY'
      })
      console.log('[HiddenRunner] Page status:', pageStatus)
    } catch (error) {
      console.warn('[HiddenRunner] Could not check page status:', error)
    }

    try {
      // Perform initial scrape of visible posts
      console.log('[HiddenRunner] 🔍 Starting initial scrape...')
      await this.performScrape()

      // Start scrolling loop
      console.log('[HiddenRunner] 📜 Starting auto-scroll loop...')
      this.startScrolling()

      // Start periodic scraping (even without scrolling)
      console.log('[HiddenRunner] 🔄 Starting periodic scraping loop...')
      this.startPeriodicScraping()

      // Start keep-alive mechanism to prevent tab throttling
      console.log('[HiddenRunner] 💓 Starting keep-alive mechanism...')
      this.startKeepAlive()

      console.log('[HiddenRunner] ✅ Runner initialized successfully!')
      console.log('[HiddenRunner] 📊 All systems active:')
      console.log('  - Auto-scrolling: ACTIVE')
      console.log('  - Periodic scraping: ACTIVE')
      console.log('  - Keep-alive: ACTIVE')
      console.log('  - Post tracking: ACTIVE')
    } catch (error) {
      console.error('[HiddenRunner] ❌ Failed to initialize:', error)
    }
  }

  /**
   * Perform a scrape of visible posts (same approach as manual scraping)
   */
  private async performScrape(): Promise<void> {
    if (!this.hiddenTabId || !this.isRunning) {
      console.warn('[HiddenRunner] ⚠️ Cannot scrape: tab or runner not ready')
      return
    }

    try {
      const scrapeStartTime = Date.now()
      console.log('[HiddenRunner] 🔍 Starting scrape...')

      // Wait a bit for content script to be ready (same as manual scraping)
      await new Promise(resolve => setTimeout(resolve, 500))

      let response: any
      let error: any = null

      try {
        console.log('[HiddenRunner] 📡 Sending SCRAPE_VISIBLE_POSTS message to content script...')

        // Also request detailed logging from content script
        response = await chrome.tabs.sendMessage(this.hiddenTabId, {
          type: 'SCRAPE_VISIBLE_POSTS',
          debug: true // Request debug info
        })

        // Log response details
        if (response) {
          console.log('[HiddenRunner] 📥 Content script response:', {
            postsCount: response.posts?.length || 0,
            count: response.count || 0,
            hasPosts: !!(response.posts && response.posts.length > 0)
          })
          console.log('[HiddenRunner] 🔍 Full response object:', response)
          console.log('[HiddenRunner] 🔍 Response.posts type:', typeof response.posts)
          console.log('[HiddenRunner] 🔍 Response.posts is Array:', Array.isArray(response.posts))
          if (response.posts && response.posts.length > 0) {
            console.log('[HiddenRunner] 🔍 First post sample:', response.posts[0])
          }
        }
      } catch (err) {
        error = err
        console.warn('[HiddenRunner] ⚠️ Content script not ready, injecting manually...', err)

        if (!this.hiddenTabId) {
          console.error('[HiddenRunner] ❌ Cannot inject script: tab ID is missing');
          return;
        }

        try {
          // --- DIRECT DEBUG INJECTION ---
          console.log('[HiddenRunner] 🕵️ Injecting direct DOM analyzer...');
          const results = await chrome.scripting.executeScript({
            target: { tabId: this.hiddenTabId },
            func: () => {
              const main = document.querySelector('main');
              return {
                url: window.location.href,
                bodyText: document.body.innerText.substring(0, 200),
                mainTag: main ? main.tagName : 'N/A',
                mainClasses: main ? main.className : 'N/A',
                mainChildren: main ? Array.from(main.children).map(c => ({ tag: c.tagName, class: c.className })) : []
              };
            }
          });
          if (results && results[0]) {
            console.log('[HiddenRunner] 🕵️ DOM Analysis Result:', JSON.stringify(results[0].result, null, 2));
          }
          // ------------------------------

          // As a fallback, inject the scraping content script and try again (same as manual scraping)
          console.log('[HiddenRunner] 💉 Injecting scraping content script...')
          await chrome.scripting.executeScript({
            target: { tabId: this.hiddenTabId },
            files: ['src/content/scraping.js'],
          })

          // Wait for script to initialize (same as manual scraping)
          console.log('[HiddenRunner] ⏳ Waiting 1s for script to initialize...')
          await new Promise(resolve => setTimeout(resolve, 1000))

          console.log('[HiddenRunner] 📡 Retrying SCRAPE_VISIBLE_POSTS message...')
          response = await chrome.tabs.sendMessage(this.hiddenTabId, {
            type: 'SCRAPE_VISIBLE_POSTS',
          })
        } catch (injectError) {
          console.error('[HiddenRunner] ❌ Failed to inject scraping script:', injectError)
          throw new Error(`Could not establish connection with content script: ${injectError instanceof Error ? injectError.message : 'Unknown error'}`)
        }
      }

      if (!response) {
        console.error('[HiddenRunner] ❌ No response from content script', error)
        return
      }

      const posts = response?.posts || []
      const scrapeDuration = Date.now() - scrapeStartTime

      if (posts.length > 0) {
        console.log(`[HiddenRunner] ✅ Scrape completed in ${scrapeDuration}ms`)
        console.log(`[HiddenRunner] 📦 Found ${posts.length} posts with hiring keywords`)
        console.log('[HiddenRunner] 📤 Sending posts to backend...')
        await this.handleScrapedPosts(posts)
      } else {
        console.log(`[HiddenRunner] ⚠️ Scrape completed in ${scrapeDuration}ms - No posts found`)
        console.log('[HiddenRunner] 💡 This could mean:')
        console.log('  - No posts with hiring keywords on current page')
        console.log('  - Page is still loading')
        console.log('  - Need to scroll to load more content')

        // Try refreshing config and retry once (same as manual scraping)
        try {
          console.log('[HiddenRunner] 🔄 Refreshing scraper config and retrying...')
          await chrome.tabs.sendMessage(this.hiddenTabId, { type: 'REFRESH_SCRAPER_CONFIG' })
          await new Promise(resolve => setTimeout(resolve, 500))
          const retryResponse = await chrome.tabs.sendMessage(this.hiddenTabId, { type: 'SCRAPE_VISIBLE_POSTS' })
          const retryPosts = retryResponse?.posts || []
          console.log(`[HiddenRunner] 🔄 Retry returned ${retryPosts.length} posts`)
          if (retryPosts.length > 0) {
            console.log(`[HiddenRunner] ✅ Found ${retryPosts.length} posts after retry!`)
            await this.handleScrapedPosts(retryPosts)
          }
        } catch (retryError) {
          console.warn('[HiddenRunner] ⚠️ Retry after config refresh failed:', retryError)
        }
      }

      this.lastActivity = Date.now()
    } catch (error) {
      console.error('[HiddenRunner] ❌ Failed to perform scrape:', error)
      console.error('[HiddenRunner] 💡 Error details:', {
        error: error instanceof Error ? error.message : String(error),
        tabId: this.hiddenTabId,
        isRunning: this.isRunning
      })
      // Don't throw - allow retry on next interval
    }
  }

  /**
   * Start periodic scraping (scrapes even without scrolling)
   */
  private startPeriodicScraping(): void {
    if (!this.hiddenTabId || !this.isRunning) {
      console.warn('[HiddenRunner] ⚠️ Cannot start periodic scraping: not ready')
      return
    }

    console.log(`[HiddenRunner] 🔄 Starting periodic scraping (every ${this.SCRAPE_INTERVAL / 1000}s)...`)

    // Perform scrape every SCRAPE_INTERVAL
    this.scrapeInterval = setInterval(async () => {
      if (!this.isRunning || !this.hiddenTabId) {
        console.log('[HiddenRunner] 🛑 Stopping periodic scraping (runner stopped)')
        if (this.scrapeInterval) {
          clearInterval(this.scrapeInterval)
          this.scrapeInterval = null
        }
        return
      }

      console.log('[HiddenRunner] ⏰ Periodic scrape triggered')
      await this.performScrape()
    }, this.SCRAPE_INTERVAL)

    console.log('[HiddenRunner] ✅ Periodic scraping started')
  }

  /**
   * Keep-alive mechanism to prevent Chrome from throttling the tab
   * Periodically sends a message to the tab to keep it active
   */
  private startKeepAlive(): void {
    if (!this.hiddenTabId || !this.isRunning) {
      console.warn('[HiddenRunner] ⚠️ Cannot start keep-alive: not ready')
      return
    }

    console.log('[HiddenRunner] 💓 Starting keep-alive (every 30s)...')

    // Send a ping every 30 seconds to keep the tab active
    this.keepAliveInterval = setInterval(async () => {
      if (!this.isRunning || !this.hiddenTabId) {
        if (this.keepAliveInterval) {
          clearInterval(this.keepAliveInterval)
          this.keepAliveInterval = null
        }
        return
      }

      try {
        // Send a simple message to keep the tab alive
        await chrome.tabs.sendMessage(this.hiddenTabId, {
          type: 'KEEP_ALIVE'
        }).catch(() => { }) // Ignore errors if content script isn't ready
      } catch (error) {
        // Silently ignore - tab might not be ready yet
      }
    }, 30000) // Every 30 seconds

    console.log('[HiddenRunner] ✅ Keep-alive started')
  }

  private startScrolling(): void {
    if (!this.hiddenTabId || !this.isRunning) {
      console.warn('[HiddenRunner] ⚠️ Cannot start scrolling: not ready')
      return
    }

    console.log('[HiddenRunner] 📜 Starting auto-scroll on hidden tab')
    console.log(`[HiddenRunner] ⏱️ Scroll interval: ${this.SCROLL_INTERVAL_MIN / 1000}s - ${this.SCROLL_INTERVAL_MAX / 1000}s (randomized)`)

    const performScroll = async () => {
      if (!this.isRunning || !this.hiddenTabId) {
        console.warn('[HiddenRunner] ⚠️ Skipping scroll: runner stopped')
        return
      }

      try {
        console.log('[HiddenRunner] 📜 Performing scroll action...')
        // Send scroll command to content script
        await chrome.tabs.sendMessage(this.hiddenTabId, {
          type: 'PERFORM_SCROLL'
        })

        this.lastActivity = Date.now()
        console.log('[HiddenRunner] ✅ Scroll action completed')

        // Wait for content to load (moved from content script to prevent throttling)
        const waitTime = 3000 + Math.random() * 2000
        console.log(`[HiddenRunner] ⏳ Waiting ${(waitTime / 1000).toFixed(1)}s for content load...`)

        await new Promise(resolve => setTimeout(resolve, waitTime))

        // Trigger scrape after scroll
        console.log('[HiddenRunner] 🔍 Triggering post-scroll scrape...')
        await this.performScrape()

      } catch (error) {
        console.error('[HiddenRunner] ❌ Failed to scroll:', error)
        console.error('[HiddenRunner] 💡 Content script might not be ready yet')
      }
    }

    // Initial scroll after a short delay
    console.log('[HiddenRunner] ⏳ Scheduling initial scroll in 3s...')
    setTimeout(() => {
      console.log('[HiddenRunner] 🚀 Executing initial scroll...')
      performScroll()
    }, 3000)

    // Set up interval with random timing
    this.scrollInterval = setInterval(() => {
      performScroll()
    }, this.getRandomInterval() + 5000) // Add 5s buffer for the scrape wait time

    console.log('[HiddenRunner] ✅ Auto-scroll loop started')
  }

  private getRandomInterval(): number {
    return Math.random() * (this.SCROLL_INTERVAL_MAX - this.SCROLL_INTERVAL_MIN) + this.SCROLL_INTERVAL_MIN
  }

  private scheduleStop(): void {
    setTimeout(async () => {
      if (this.isRunning) {
        console.log('Auto-stopping hidden runner after timeout')
        await this.stop()
      }
    }, this.MAX_RUN_TIME)
  }

  private monitorActivity(): void {
    // Check for inactivity every minute
    const checkInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(checkInterval)
        return
      }

      const timeSinceActivity = Date.now() - this.lastActivity
      if (timeSinceActivity > this.ACTIVITY_TIMEOUT) {
        console.log('Hidden runner inactive for too long, stopping...')
        this.stop()
        clearInterval(checkInterval)
      }
    }, 60000) // Check every minute
  }

  // Handle scraped posts from content script
  async handleScrapedPosts(posts: any[]): Promise<void> {
    if (!posts || posts.length === 0) {
      console.log('[HiddenRunner] ⚠️ No posts to process')
      return
    }

    try {
      console.log(`[HiddenRunner] 📦 Processing ${posts.length} scraped posts...`)

      // Log all posts being sent
      posts.forEach((post, index) => {
        console.log(`[Background] Post ${index + 1}/${posts.length}:`, {
          id: post.id,
          author: post.author?.name || 'Unknown',
          textPreview: post.text?.substring(0, 150) || 'No text',
          postUrl: post.postUrl || 'No URL',
          hasHiringKeywords: post.hasHiringKeywords,
          engagement: post.engagement
        })
      })

      // Send posts to backend API directly (we're in the background script context)
      const response = await ExtensionAuth.authenticatedRequest('/api/scraping/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ posts }),
      }).catch(err => {
        console.error('[Background] API request failed:', err)
        return null
      })

      if (!response) {
        console.error('[Background] Failed to send posts to backend: no response')
        return
      }

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        const successfulPosts = data.processed || 0
        const duplicatePosts = posts.length - successfulPosts

        this.postsScraped += successfulPosts
        console.log(`[HiddenRunner] ✅ Successfully sent ${posts.length} posts to backend`)
        console.log(`[HiddenRunner] 📊 Backend response:`)
        console.log(`  - New posts saved: ${successfulPosts}`)
        console.log(`  - Duplicate posts: ${duplicatePosts}`)
        console.log(`  - Total posts scraped this run: ${this.postsScraped}`)
        console.log(`[HiddenRunner] 📋 Full API response:`, data)

        // Reset scraper session after successful send to allow new posts in next scrape
        this.clearScrapedUrls()

        // If we've hit our per-run cap, stop the runner
        if (this.postsScraped >= this.MAX_POSTS_PER_RUN && this.isRunning) {
          console.log(`[Background] Reached MAX_POSTS_PER_RUN (${this.MAX_POSTS_PER_RUN}), stopping runner`)
          await this.stop()
        }
      } else {
        const errorText = await response.text().catch(() => '')
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` }
        }
        console.error('[Background] ❌ Failed to send posts to backend:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || errorData,
          responseBody: errorText.substring(0, 500)
        })
      }
    } catch (error) {
      console.error('[Background] Error handling scraped posts:', error)
    }
  }

  // Get runner status
  getStatus() {
    return {
      isRunning: this.isRunning,
      hiddenTabId: this.hiddenTabId,
      postsScraped: this.postsScraped,
      lastActivity: this.lastActivity,
      uptime: this.isRunning && this.startTime > 0 ? Date.now() - this.startTime : 0,
      runTime: this.isRunning && this.startTime > 0 ? Date.now() - this.startTime : 0
    }
  }

  // Check if runner is active
  isActive(): boolean {
    return this.isRunning && !!this.hiddenTabId
  }

  // Reset scraper state (called after successful send)
  reset(): void {
    // Note: We don't reset postsScraped here as we want to track total for the run
    // The session-level duplicate detection in scraping.ts handles per-session duplicates
    this.lastActivity = Date.now()
  }

  // Clear the set of scraped URLs (for session-level duplicate tracking)
  clearScrapedUrls(): void {
    // This is handled by the content script's sessionScrapedUrls
    // We just need to ensure the content script resets when needed
    if (this.hiddenTabId) {
      try {
        chrome.tabs.sendMessage(this.hiddenTabId, {
          type: 'RESET_SCRAPER_SESSION'
        }).catch(() => {
          // Content script might not be ready, ignore
        })
      } catch (error) {
        // Ignore errors
      }
    }
  }
}



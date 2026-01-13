// LinkedIn hybrid scraper: network interception (primary) + DOM fallback.
// Goal: capture raw hiring-intent text with minimal DOM reliance.

type PostPayload = {
  post_id: string | null
  post_url: string
  raw_text: string
  author_name: string | null
  detected_emails: string[]
  scraped_at: string
  source: 'network' | 'dom'
}

type ScrapeCommand = {
  type: 'SCRAPE_VISIBLE_POSTS' | 'START_SCRAPING' | 'STOP_SCRAPING' | 'GET_SCRAPING_STATS'
  cap?: number
}

const DEFAULT_CAP = 25
const HIRING_KEYWORDS = [
  'hiring', 'looking for', 'we are hiring', 'we\'re hiring',
  'join our team', 'open position', 'open role', 'job opening',
  'vacancy', 'seeking', 'recruiting'
]

// Buffer for posts detected from network responses
const networkBuffer: PostPayload[] = []
let interceptionInitialized = false

// ---------------- Utilities ----------------
function detectEmails(text: string): string[] {
  const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  const matches = text.match(regex)
  return matches ? Array.from(new Set(matches)) : []
}

// Normalize LinkedIn text and strip UI artifacts like "... more" / "see more"
function cleanTruncatedText(text: string): string {
  if (!text) return ''
  let t = text.trim()

  // Common LinkedIn patterns at the end of truncated posts
  // examples: "…see more", "...see more", "... more", "… more"
  t = t.replace(/\s*(?:\.\.\.|…)\s*(?:see more|more)$/i, '')
  t = t.replace(/\s*see more$/i, '')

  return t.trim()
}

function hasHiringIntent(text: string): boolean {
  const lower = text.toLowerCase()
  return HIRING_KEYWORDS.some(k => lower.includes(k))
}

function buildPostPayload(opts: {
  post_id: string | null
  raw_text: string
  author_name?: string | null
  source: 'network' | 'dom'
}): PostPayload {
  const raw = (opts.raw_text || '').trim()
  return {
    post_id: opts.post_id,
    post_url: opts.post_id ? `https://www.linkedin.com/feed/update/${opts.post_id}` : '',
    raw_text: raw,
    author_name: opts.author_name || null,
    detected_emails: detectEmails(raw),
    scraped_at: new Date().toISOString(),
    source: opts.source,
  }
}

// ---------------- Network interception (fetch / XHR, read-only) ----------------
function initInterceptionOnce() {
  if (interceptionInitialized) return
  interceptionInitialized = true

  const origFetch = window.fetch
  window.fetch = async (...args: any[]) => {
    const resp = await origFetch(...args)
    try {
      const clone = resp.clone()
      clone.text().then(t => collectFromNetworkResponse(t)).catch(() => { })
    } catch { /* ignore */ }
    return resp
  }

  const origOpen = XMLHttpRequest.prototype.open
  const origSend = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.open = function (...args) {
    ; (this as any)._hireooUrl = args[1]
    return origOpen.apply(this, args as any)
  }
  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener('load', function () {
      try {
        const txt = this.responseText
        collectFromNetworkResponse(txt)
      } catch { /* ignore */ }
    })
    return origSend.apply(this, args as any)
  }
}

function collectFromNetworkResponse(body: string) {
  if (!body || !body.includes('urn:li:activity')) return
  let json: any = null
  try {
    json = JSON.parse(body)
  } catch {
    return
  }

  const posts: PostPayload[] = []
  const seen = new Set<string>()

  traverse(json, (node: any) => {
    if (!node || typeof node !== 'object') return
    const urn: string | undefined = node.entityUrn || node.urn || node.id
    if (typeof urn === 'string' && urn.includes('urn:li:activity:')) {
      const id = urn
      const raw_text = extractTextish(node)
      if (!raw_text || !hasHiringIntent(raw_text)) return
      if (seen.has(id)) return
      seen.add(id)
      posts.push(buildPostPayload({
        post_id: id,
        raw_text,
        author_name: node.authorName || node.name || null,
        source: 'network',
      }))
    }
  })

  if (posts.length) {
    for (const p of posts) {
      if (networkBuffer.length > 200) break
      networkBuffer.push(p)
    }
  }
}

function traverse(obj: any, fn: (node: any) => void) {
  if (!obj) return
  fn(obj)
  if (Array.isArray(obj)) {
    obj.forEach(v => traverse(v, fn))
  } else if (typeof obj === 'object') {
    Object.values(obj).forEach(v => traverse(v, fn))
  }
}

function extractTextish(node: any): string {
  if (!node || typeof node !== 'object') return ''
  if (typeof node.text === 'string') return node.text
  if (node.commentary?.text && typeof node.commentary.text === 'string') return node.commentary.text
  if (node.commentary?.text?.text && typeof node.commentary.text.text === 'string') return node.commentary.text.text
  if (node.message && typeof node.message.text === 'string') return node.message.text
  const parts: string[] = []
  for (const v of Object.values(node)) {
    if (typeof v === 'string') parts.push(v)
  }
  return parts.join(' ').trim()
}

// ---------------- DOM fallback (minimal, text-first) ----------------
function scrapeDomFallback(cap: number): PostPayload[] {
  const containers = document.querySelectorAll('article[data-urn^="urn:li:activity"], div[data-urn^="urn:li:activity"]')
  const results: PostPayload[] = []
  for (const el of containers) {
    if (results.length >= cap) break
    const urn = el.getAttribute('data-urn')
    const raw_text = collectVisibleText(el)
    if (!raw_text || !hasHiringIntent(raw_text)) continue
    results.push(buildPostPayload({
      post_id: urn || null,
      raw_text,
      author_name: null,
      source: 'dom',
    }))
  }
  return results
}

function collectVisibleText(root: Element): string {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_SKIP
      const style = window.getComputedStyle(parent)
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') === 0) return NodeFilter.FILTER_SKIP
      const trimmed = node.textContent?.trim()
      if (!trimmed) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    }
  })
  const parts: string[] = []
  while (walker.nextNode()) {
    const t = walker.currentNode.textContent?.trim()
    if (t) parts.push(t)
  }
  return cleanTruncatedText(parts.join(' '))
}

// Initialize network interception on load
initInterceptionOnce()

console.log('Hireoo hybrid scraper (network + dom fallback) initialized')
// LinkedIn Feed Scraping Content Script
// Resilient, layered scraping with remote-config, selector fallbacks,
// and visible-text capture. Goal: gather raw hiring intent text, not perfect DOM parsing.

type ScraperConfig = {
  post_container_selector: string
  text_selectors: string[]
  author_selectors: string[]
  timestamp_selectors: string[]
  post_link_selectors: string[]
  engagement_selectors: string[]
  keywords: string[]
}

interface LinkedInPost {
  id: string
  text: string
  html: string
  author: {
    name: string
    profileUrl: string
    headline?: string
  }
  timestamp: string
  postUrl: string
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  scrapedAt: number
  hasHiringKeywords: boolean
}

export class LinkedInScraper {
  private static readonly DEFAULT_CONFIG: ScraperConfig = {
    // Broaden container selectors to catch common LinkedIn feed wrappers
    post_container_selector: [
      'article[data-urn^="urn:li:activity:"]',
      'div[data-urn^="urn:li:activity:"]',
      'div.feed-shared-update-v2',
      'div.feed-shared-update-v2__container',
      '.update-components-card',
      // Search results page selectors
      '.reusable-search__result-container',
      '.search-result__wrapper',
      '.search-results__list-item',
      'div[data-chameleon-result-urn]'
    ].join(','),
    text_selectors: [
      '[data-test-id="feed-item-content"]',
      '.feed-shared-update-v2__commentary',
      '.update-components-text',
      '.break-words',
      '.feed-shared-update-v2__description',
      '.update-components-text-view',
      // Search results page text selectors
      '.search-result__snippet',
      '.search-result__summary',
      '.search-result__content',
      '.search-result__description'
    ],
    author_selectors: [
      '[data-test-id="profile-name"] a',
      '.feed-shared-actor__name a',
      '.update-components-actor__meta a',
      '.feed-shared-actor__title a',
      // Search results page author selectors
      '.search-result__info a',
      '.search-result__title a',
      '.search-result__actor-name a'
    ],
    timestamp_selectors: [
      'time',
      '.feed-shared-actor__sub-description span',
      '.update-components-actor__sub-description span',
    ],
    post_link_selectors: [
      'a[href*="/feed/update/urn:li:activity"]',
      'a[href*="/posts/"]',
      'a[href*="/activity/"]',
      // Search results page link selectors
      'a.search-result__result-link',
      'a[href*="/feed/update/"]',
      '.search-result__info a'
    ],
    engagement_selectors: [
      '[data-test-id="social-counts"]',
      '.social-details-social-counts',
      '.social-details-social-activity',
    ],
    keywords: [
      'hiring', 'hiring now', 'we\'re hiring', 'we are hiring',
      'looking for', 'looking to hire', 'seeking', 'recruiting',
      'join our team', 'join us', 'open position', 'open role',
      'career opportunity', 'job opening', 'vacancy', 'positions available',
      'talent acquisition', 'headcount', 'growing team', 'expand',
      'remote work', 'remote position', 'work from home'
    ],
  }

  // Cached remote config (fallback to defaults)
  private config: ScraperConfig = LinkedInScraper.DEFAULT_CONFIG
  private configLoaded = false
  private readonly CONFIG_URL = 'https://hireoo-taupe.vercel.app/api/scraper/config'

  // Track scraped post URLs (more stable than IDs) to avoid duplicates within session
  private scrapedPostUrls = new Set<string>()
  private lastScrollPosition = 0
  private scrollCount = 0

  private async ensureConfigLoaded() {
    if (this.configLoaded) return
    this.configLoaded = true // Mark as loaded immediately to prevent multiple attempts

    // Skip remote config fetch to avoid 404 errors in console
    // Default config is sufficient and can be updated via extension updates
    // If you need remote config, create the endpoint at /api/scraper/config
    return

    // Uncomment below if you create the /api/scraper/config endpoint:
    /*
    try {
      const res = await fetch(this.CONFIG_URL, { 
        method: 'GET', 
        mode: 'no-cors',
        cache: 'no-cache'
      })
      if (res.ok && res.type !== 'opaque') {
        const data = await res.json()
        if (data?.post_container_selector && Array.isArray(data?.text_selectors)) {
          this.config = {
            post_container_selector: data.post_container_selector,
            text_selectors: data.text_selectors,
            author_selectors: data.author_selectors || LinkedInScraper.DEFAULT_CONFIG.author_selectors,
            timestamp_selectors: data.timestamp_selectors || LinkedInScraper.DEFAULT_CONFIG.timestamp_selectors,
            post_link_selectors: data.post_link_selectors || LinkedInScraper.DEFAULT_CONFIG.post_link_selectors,
            engagement_selectors: data.engagement_selectors || LinkedInScraper.DEFAULT_CONFIG.engagement_selectors,
            keywords: data.keywords || LinkedInScraper.DEFAULT_CONFIG.keywords,
          }
        }
      }
    } catch {
      // Ignore and keep defaults
    }
    */
  }

  private getTextFromSelectors(root: Element, selectors: string[]): { text: string; html: string } {
    for (const sel of selectors) {
      const el = root.querySelector(sel)
      if (el && this.isVisible(el as HTMLElement)) {
        const text = (el.textContent || '').trim()
        const html = (el as HTMLElement).innerHTML || ''
        if (text) return { text, html }
      }
    }
    return { text: '', html: '' }
  }

  private getAllVisibleText(root: Element): string {
    // Remove obvious UI noise nodes (buttons, menus) before collecting text
    const noiseSelectors = ['button', '[role="button"]', 'nav', 'menu', '.feed-shared-control-menu']
    noiseSelectors.forEach(sel => {
      root.querySelectorAll(sel).forEach(node => node.remove())
    })

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_SKIP
        if (!this.isVisible(parent)) return NodeFilter.FILTER_SKIP
        const trimmed = node.textContent?.trim()
        if (!trimmed) return NodeFilter.FILTER_SKIP
        return NodeFilter.FILTER_ACCEPT
      }
    })
    const parts: string[] = []
    while (walker.nextNode()) {
      const txt = walker.currentNode.textContent?.trim()
      if (txt) parts.push(txt)
    }
    return cleanTruncatedText(parts.join(' '))
  }

  private isVisible(el: HTMLElement): boolean {
    const style = window.getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') === 0) return false
    if (el.getAttribute('aria-hidden') === 'true') return false
    return true
  }

  private detectEmails(text: string): string[] {
    const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    const matches = text.match(regex)
    return matches ? Array.from(new Set(matches)) : []
  }

  private detectKeywords(text: string): string[] {
    const lower = text.toLowerCase()
    return this.config.keywords.filter(k => lower.includes(k.toLowerCase()))
  }

  // Main scraping function
  async scrapeVisiblePosts(): Promise<LinkedInPost[]> {
    await this.ensureConfigLoaded()

    // Check if we're on a search results page - if so, scrape ALL posts (no keyword filter)
    const isSearchResultsPage = window.location.href.includes('/search/results/content/')
    console.log(`[Scraper] Page type: ${isSearchResultsPage ? 'Search Results' : 'Feed'}`)
    if (isSearchResultsPage) {
      console.log(`[Scraper] 🔍 Search results page detected - will scrape ALL posts (no keyword filter)`)
    }

    const posts: LinkedInPost[] = []
    let totalFound = 0
    let skippedNoKeywords = 0
    let skippedDuplicate = 0
    // Track duplicates only within this single scrape session
    const sessionScrapedIds = new Set<string>()

    try {
      // Find all visible post containers
      let postElements = document.querySelectorAll(this.config.post_container_selector)
      console.log(`[Scraper] 🔍 Step 1: Using standard selector "${this.config.post_container_selector}"`)
      console.log(`[Scraper] Found ${postElements.length} post containers on page`)
      console.log(`[Scraper] Current URL: ${window.location.href}`)
      console.log(`[Scraper] Is search results page: ${isSearchResultsPage}`)

      // Send debug info to background
      const sendDebug = (msg: string, data?: any) => {
        chrome.runtime.sendMessage({
          type: 'SCRAPER_DEBUG',
          message: msg,
          data: data
        }).catch(() => { })
      }

      sendDebug('Standard selector result', { count: postElements.length, selector: this.config.post_container_selector })

      // If no containers found, try alternative selectors for search results
      if (postElements.length === 0 && isSearchResultsPage) {
        console.log(`[Scraper] ⚠️ No posts found with standard selectors, trying search-specific selectors...`)
        sendDebug('Trying search-specific selectors')

        const searchSelectors = [
          'div[data-chameleon-result-urn]',
          '.reusable-search__result-container',
          '.search-result__wrapper',
          'li.reusable-search__result-container',
          'div.search-result',
          'article.search-result',
          '.search-results__list-item',
          'ul.search-results__list > li',
          'div[data-urn^="urn:li:activity:"]',
          'article[data-urn^="urn:li:activity:"]'
        ]

        for (const selector of searchSelectors) {
          const elements = document.querySelectorAll(selector)
          console.log(`[Scraper] Selector "${selector}": found ${elements.length} elements`)
          sendDebug(`Selector test: ${selector}`, { count: elements.length })
          if (elements.length > 0) {
            console.log(`[Scraper] ✅ Using selector "${selector}" - found ${elements.length} elements`)
            sendDebug(`Using selector: ${selector}`, { count: elements.length })
            postElements = elements
            break
          }
        }
      }

      // Log page structure for debugging
      if (postElements.length === 0) {
        console.log(`[Scraper] 🔍 Debugging: Checking page structure...`)
        const pageInfo = {
          bodyChildren: document.body.children.length,
          main: document.querySelector('main')?.children.length || 0,
          feed: document.querySelector('[data-test-id="feed"]')?.children.length || 0,
          searchResults: document.querySelector('.search-results')?.children.length || 0,
          resultsList: document.querySelector('.search-results__list')?.children.length || 0,
          allArticles: document.querySelectorAll('article').length,
          allDivsWithUrn: document.querySelectorAll('div[data-urn]').length,
          allDivsWithChameleon: document.querySelectorAll('div[data-chameleon-result-urn]').length
        }
        console.log(`[Scraper] Page structure:`, pageInfo)
        sendDebug('Page structure check', pageInfo)
      }

      console.log(`[Scraper] 🔍 Step 2: Processing ${postElements.length} post elements...`)
      sendDebug('Starting post extraction', { totalElements: postElements.length })

      for (let i = 0; i < postElements.length; i++) {
        const postElement = postElements[i]
        try {
          console.log(`[Scraper] Processing element ${i + 1}/${postElements.length}...`)
          const post = this.extractPostData(postElement as HTMLElement, isSearchResultsPage)
          totalFound++

          if (!post) {
            console.log(`[Scraper] ⚠️ Element ${i + 1}: extractPostData returned null`)
            continue
          }

          console.log(`[Scraper] ✅ Element ${i + 1}: Successfully extracted post`, {
            id: post.id,
            hasText: !!post.text,
            textLength: post.text.length,
            hasHiringKeywords: post.hasHiringKeywords
          })

          // Log all extracted posts for debugging
          console.log(`[Scraper] Extracted post ${totalFound}:`, {
            id: post.id,
            hasHiringKeywords: post.hasHiringKeywords,
            textPreview: post.text.substring(0, 100) + '...',
            author: post.author.name,
            postUrl: post.postUrl
          })

          // On search results page, skip keyword filtering - scrape ALL posts
          if (!isSearchResultsPage && !post.hasHiringKeywords) {
            skippedNoKeywords++
            continue
          }

          // Only check for duplicates within this scrape session (same post appearing twice on page)
          // Use postUrl as it's more stable than post.id
          // Don't use persistent scrapedPostUrls - let the backend check against database
          const postIdentifier = post.postUrl || post.id
          if (sessionScrapedIds.has(postIdentifier)) {
            skippedDuplicate++
            continue
          }

          posts.push(post)
          sessionScrapedIds.add(postIdentifier)
          // Also add to persistent set for logging purposes, but don't use it for filtering
          this.scrapedPostUrls.add(postIdentifier)

          // Log successful scrape
          console.log(`[Scraper] ✅ Scraped post:`, {
            id: post.id,
            author: post.author.name,
            text: post.text.substring(0, 200),
            postUrl: post.postUrl,
            engagement: post.engagement
          })
        } catch (error) {
          console.error('[Scraper] Error extracting post data:', error)
        }
      }

      const summaryMsg = isSearchResultsPage
        ? `[Scraper] Summary: ${posts.length} posts scraped from search results, ${skippedDuplicate} skipped (duplicates), ${totalFound} total processed`
        : `[Scraper] Summary: ${posts.length} new hiring posts, ${skippedNoKeywords} skipped (no keywords), ${skippedDuplicate} skipped (duplicates in this session), ${totalFound} total processed`
      console.log(summaryMsg)
    } catch (error) {
      console.error('[Scraper] Error scraping posts:', error)
    }

    return posts
  }

  private extractPostData(postElement: HTMLElement, skipKeywordFilter: boolean = false): LinkedInPost | null {
    try {
      // Extract post ID from data attributes
      const urn = postElement.getAttribute('data-urn') || postElement.getAttribute('data-chameleon-result-urn') || ''
      const postId = urn.split(':').pop() || `post_${Date.now()}_${Math.random()}`

      // Extract post text via layered selectors; fallback to all visible text
      const { text, html } = this.getTextFromSelectors(postElement, this.config.text_selectors)
      const fallbackText = !text ? this.getAllVisibleText(postElement) : ''
      const combinedText = text || fallbackText

      // If no text found, skip this post
      if (!combinedText || combinedText.trim().length === 0) {
        return null
      }

      // Check for hiring keywords (only if not on search results page)
      const detectedKeywords = this.detectKeywords(combinedText.toLowerCase())
      const hasHiringKeywords = detectedKeywords.length > 0

      // On search results page, skip keyword filtering - accept all posts with text
      if (!skipKeywordFilter && !hasHiringKeywords) {
        return null
      }

      // Extract author information
      const author = this.getTextFromSelectors(postElement, this.config.author_selectors)
      const authorName = author.text || 'Unknown'
      const authorProfileUrl = (postElement.querySelector(this.config.author_selectors.join(',')) as HTMLAnchorElement | null)?.getAttribute('href') || ''
      const authorHeadline = '' // optional; avoided brittle selector

      // Extract timestamp
      const timestampEl = this.getTextFromSelectors(postElement, this.config.timestamp_selectors)
      const timestamp = timestampEl.text || new Date().toISOString()

      // Extract post URL
      let postUrl = this.getHrefFromSelectors(postElement, this.config.post_link_selectors)

      // If we couldn't find the URL via selectors, construct it from the post ID
      if (!postUrl && postId && !postId.startsWith('post_')) {
        // postId should be the numeric ID from the URN (e.g., "7408913474199941120")
        // Construct LinkedIn post URL
        postUrl = `/feed/update/urn:li:activity:${postId}`
      }

      const rawText = combinedText.trim()
      const detectedEmails = this.detectEmails(rawText)

      // Extract engagement data (simplified)
      const engagement = this.extractEngagement(postElement)

      return {
        id: postId,
        text: rawText,
        html: html || postElement.innerHTML,
        author: {
          name: authorName,
          profileUrl: authorProfileUrl,
          headline: authorHeadline
        },
        timestamp,
        postUrl: postUrl ? (postUrl.startsWith('http') ? postUrl : `https://www.linkedin.com${postUrl}`) : (postId && !postId.startsWith('post_') ? `https://www.linkedin.com/feed/update/urn:li:activity:${postId}` : ''),
        engagement,
        scrapedAt: Date.now(),
        hasHiringKeywords: true
      }
    } catch (error) {
      console.error('Error extracting post data:', error)
      return null
    }
  }

  private extractEngagement(postElement: HTMLElement): { likes: number; comments: number; shares: number } {
    try {
      // This is a simplified extraction - LinkedIn's engagement counts are dynamic
      // In a real implementation, you'd need more sophisticated selectors
      const engagementText = this.getTextFromSelectors(postElement, this.config.engagement_selectors).text || ''

      // Parse engagement numbers (this is approximate)
      const likes = (engagementText.match(/(\d+)\s*like/) || [])[1] || '0'
      const comments = (engagementText.match(/(\d+)\s*comment/) || [])[1] || '0'
      const shares = (engagementText.match(/(\d+)\s*share/) || [])[1] || '0'

      return {
        likes: parseInt(likes.replace(/,/g, '')) || 0,
        comments: parseInt(comments.replace(/,/g, '')) || 0,
        shares: parseInt(shares.replace(/,/g, '')) || 0
      }
    } catch (error) {
      return { likes: 0, comments: 0, shares: 0 }
    }
  }

  private getHrefFromSelectors(root: Element, selectors: string[]): string {
    for (const sel of selectors) {
      const el = root.querySelector(sel) as HTMLAnchorElement | null
      if (!el) continue
      if (this.isVisible(el) && el.href) return el.href
      const href = el.getAttribute('href')
      if (href) return href
    }
    return ''
  }

  // Perform scroll action
  async performScroll(): Promise<void> {
    const scrollAmount = 500 + Math.random() * 300 // Random scroll between 500-800px
    const beforeScroll = window.scrollY

    console.log(`[Scraper] 📜 Starting scroll action #${this.scrollCount + 1}...`)

    // Smooth scroll down
    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth'
    })

    this.lastScrollPosition = window.scrollY
    this.scrollCount++

    console.log(`[Scraper] ✅ Scrolled ${scrollAmount.toFixed(0)}px to position ${this.lastScrollPosition}px`)
    return Promise.resolve()
  }

  // Get scraping statistics
  getStats() {
    return {
      scrapedPostUrls: this.scrapedPostUrls.size,
      scrollCount: this.scrollCount,
      lastScrollPosition: this.lastScrollPosition,
      isActive: true
    }
  }

  // Reset scraper state
  reset(): void {
    this.scrapedPostUrls.clear()
    this.lastScrollPosition = 0
    this.scrollCount = 0
  }
}

// Global scraper instance
let scraper: LinkedInScraper | null = null

// Initialize scraper when content script loads
function initializeScraper(): void {
  if (!scraper) {
    scraper = new LinkedInScraper()
    console.log('LinkedIn scraper initialized')
  }
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log('Scraping content script received message:', message)

  handleScrapingMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Scraping message error:', error)
      sendResponse({ error: error.message })
    })

  return true
})

async function handleScrapingMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any> {
  initializeScraper()
  initInterceptionOnce() // Ensure network interception is active

  switch (message.type) {
    case 'START_SCRAPING':
      scraper!.reset()
      return { success: true, message: 'Scraping started' }

    case 'STOP_SCRAPING':
      return { success: true, message: 'Scraping stopped' }

    case 'PERFORM_SCROLL':
      await scraper!.performScroll()
      return { success: true, message: 'Scroll performed' }

    case 'GET_SCRAPING_STATS':
      return scraper!.getStats()

    case 'RESET_SCRAPER_SESSION':
      // Reset session-level duplicate tracking
      if (scraper) {
        scraper.reset()
      }
      return { success: true, message: 'Scraper session reset' }

    case 'SCRAPE_VISIBLE_POSTS':
      // Send debug info to background script
      const sendDebugToBackground = (msg: string, data?: any) => {
        if (message.debug) {
          chrome.runtime.sendMessage({
            type: 'SCRAPER_DEBUG',
            message: msg,
            data: data
          }).catch(() => { }) // Ignore errors if no listener
        }
      }

      sendDebugToBackground('Starting scrape', { url: window.location.href })

      // Try LinkedInScraper first (more comprehensive)
      const scraperPosts = await scraper!.scrapeVisiblePosts()
      sendDebugToBackground('Scraper completed', { postsFound: scraperPosts.length })

      // Also check network buffer and DOM fallback for additional posts
      const cap = Math.min(message.cap || DEFAULT_CAP, DEFAULT_CAP)
      let networkPosts: PostPayload[] = []

      while (networkBuffer.length && networkPosts.length < cap) {
        networkPosts.push(networkBuffer.shift()!)
      }

      // Convert PostPayload to LinkedInPost format if needed
      // For now, prioritize LinkedInScraper results
      const allPosts = scraperPosts.length > 0 ? scraperPosts : []

      // If no posts from scraper, try DOM fallback
      if (allPosts.length === 0 && networkPosts.length === 0) {
        sendDebugToBackground('Trying DOM fallback')
        const domPosts = scrapeDomFallback(cap)
        sendDebugToBackground('DOM fallback completed', { postsFound: domPosts.length })
        // Convert PostPayload format to LinkedInPost format
        const convertedPosts = domPosts.map(p => ({
          id: p.post_id || `post_${Date.now()}_${Math.random()}`,
          text: p.raw_text,
          html: '',
          author: {
            name: p.author_name || 'Unknown',
            profileUrl: '',
            headline: ''
          },
          timestamp: p.scraped_at,
          postUrl: p.post_url,
          engagement: { likes: 0, comments: 0, shares: 0 },
          scrapedAt: Date.now(),
          hasHiringKeywords: true
        }))
        return { posts: convertedPosts, count: convertedPosts.length }
      }

      sendDebugToBackground('Returning posts', { totalPosts: allPosts.length })
      return { posts: allPosts, count: allPosts.length }

    case 'REFRESH_SCRAPER_CONFIG':
      scraper!.configLoaded = false
      await scraper!.scrapeVisiblePosts() // this triggers ensureConfigLoaded
      return { success: true }

    default:
      // Ignore unknown messages (e.g. LINKEDIN_PAGE_LOADED) so we don't spam errors
      return { success: false, message: `Ignored message type: ${message.type}` }
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScraper)
} else {
  initializeScraper()
}

console.log('LinkedIn scraping content script loaded')



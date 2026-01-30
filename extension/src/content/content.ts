// Content script for LinkedIn pages
console.log('Hireoo content script loaded on LinkedIn')

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  // Only handle messages that this script is responsible for
  const handledTypes = ['LINKEDIN_PAGE_LOADED', 'SCRAPE_JOBS', 'GET_PAGE_INFO']

  if (!handledTypes.includes(message.type)) {
    // Don't respond - let other content scripts (like scraping.ts) handle it
    return false
  }

  console.log('Content script received message:', message)

  handleContentMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Content script error:', error)
      sendResponse({ error: error.message })
    })

  return true // Keep message channel open for async response
})

async function handleContentMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any> {
  switch (message.type) {
    case 'LINKEDIN_PAGE_LOADED':
      return await handleLinkedInPageLoaded(message)

    case 'SCRAPE_JOBS':
      return await scrapeLinkedInJobs()

    case 'GET_PAGE_INFO':
      return getPageInfo()

    default:
      // This should never happen since we filter messages in the listener
      throw new Error(`Unexpected message type: ${message.type}`)
  }
}

async function handleLinkedInPageLoaded(message: any): Promise<any> {
  console.log('LinkedIn page loaded:', message.url)

  // Check if this is a job search page
  if (message.url.includes('/jobs/')) {
    // Add visual indicator that extension is active
    addExtensionIndicator()

    // Listen for job cards being loaded
    observeJobCards()
  }

  return { success: true, pageType: getPageType(message.url) }
}

function getPageType(url: string): string {
  if (url.includes('/jobs/')) return 'jobs'
  if (url.includes('/feed/')) return 'feed'
  if (url.includes('/in/')) return 'profile'
  if (url.includes('/company/')) return 'company'
  return 'other'
}

function addExtensionIndicator(): void {
  // Remove existing indicator if any
  const existingIndicator = document.getElementById('hireoo-indicator')
  if (existingIndicator) {
    existingIndicator.remove()
  }

  // Create and add new indicator
  const indicator = document.createElement('div')
  indicator.id = 'hireoo-indicator'
  indicator.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 6px;
    ">
      <div style="
        width: 6px;
        height: 6px;
        background: #10b981;
        border-radius: 50%;
      "></div>
      Hireoo Active
    </div>
  `

  document.body.appendChild(indicator)

  // Auto-hide after 3 seconds
  setTimeout(() => {
    indicator.style.opacity = '0'
    setTimeout(() => indicator.remove(), 300)
  }, 3000)
}

function observeJobCards(): void {
  // Observe for new job cards being added to the page
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element

            // Check if this is a job card
            if (element.matches('[data-job-id]') ||
              element.querySelector('[data-job-id]') ||
              element.matches('.job-card-container') ||
              element.querySelector('.job-card-container')) {

              // Add Hireoo action button to job card
              addJobCardActions(element as HTMLElement)
            }
          }
        })
      }
    })
  })

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Also check existing job cards
  document.querySelectorAll('[data-job-id], .job-card-container').forEach(card => {
    addJobCardActions(card as HTMLElement)
  })
}

function addJobCardActions(jobCard: HTMLElement): void {
  // Check if we've already added actions to this card
  if (jobCard.querySelector('.hireoo-job-actions')) {
    return
  }

  // Create actions container
  const actionsContainer = document.createElement('div')
  actionsContainer.className = 'hireoo-job-actions'
  actionsContainer.innerHTML = `
    <button class="hireoo-apply-btn" style="
      background: #2563eb;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    ">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      Apply with Hireoo
    </button>
  `

  // Add click handler
  const applyBtn = actionsContainer.querySelector('.hireoo-apply-btn') as HTMLButtonElement
  applyBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const jobInfo = extractJobInfo(jobCard)
      const response = await chrome.runtime.sendMessage({
        type: 'PROCESS_JOB_APPLICATION',
        jobInfo,
      })

      if (response.success) {
        applyBtn.textContent = '✓ Applied'
        applyBtn.style.background = '#10b981'
        applyBtn.disabled = true
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error('Failed to apply:', error)
      applyBtn.textContent = '❌ Failed'
      applyBtn.style.background = '#ef4444'
    }
  })

  // Add to job card
  jobCard.appendChild(actionsContainer)
}

function extractJobInfo(jobCard: HTMLElement): any {
  // Extract job information from LinkedIn job card
  // This is a placeholder implementation - will be enhanced in the scraping module

  const title = jobCard.querySelector('[data-job-title]')?.textContent ||
    jobCard.querySelector('.job-card-list__title')?.textContent ||
    'Unknown Title'

  const company = jobCard.querySelector('[data-organization-name]')?.textContent ||
    jobCard.querySelector('.job-card-container__company-name')?.textContent ||
    'Unknown Company'

  const location = jobCard.querySelector('[data-job-location]')?.textContent ||
    jobCard.querySelector('.job-card-container__metadata-item')?.textContent ||
    'Unknown Location'

  return {
    title: title?.trim(),
    company: company?.trim(),
    location: location?.trim(),
    linkedinUrl: window.location.href,
    scrapedAt: new Date().toISOString(),
  }
}

function getPageInfo(): any {
  return {
    url: window.location.href,
    title: document.title,
    pageType: getPageType(window.location.href),
    timestamp: Date.now(),
  }
}

console.log('Hireoo content script initialized')


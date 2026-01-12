// Offscreen document for background processing
// Used for DOM parsing and other background tasks that need a document context

console.log('Hireoo offscreen document loaded')

// Listen for messages from background script
chrome.runtime.onMessage.addListener(
  (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log('Offscreen received message:', request)

    handleOffscreenMessage(request, sender)
      .then(sendResponse)
      .catch((error) => {
        console.error('Offscreen error:', error)
        sendResponse({ error: error.message })
      })

    return true
  }
)

async function handleOffscreenMessage(
  request: any,
  sender: chrome.runtime.MessageSender
): Promise<any> {
  switch (request.type) {
    case 'PARSE_HTML':
      return await parseHTML(request.html)

    case 'EXTRACT_JOB_DATA':
      return await extractJobData(request.html, request.selectors)

    case 'VALIDATE_DOM':
      return validateDOMAccess()

    default:
      throw new Error(`Unknown offscreen message type: ${request.type}`)
  }
}

async function parseHTML(html: string): Promise<any> {
  try {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Extract basic information
    const title = doc.querySelector('title')?.textContent || ''
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const links = Array.from(doc.querySelectorAll('a[href]')).map(a => ({
      text: a.textContent?.trim() || '',
      href: a.getAttribute('href') || '',
    }))

    return {
      success: true,
      title,
      metaDescription,
      links,
      hasContent: doc.body?.textContent?.trim().length > 0,
    }
  } catch (error) {
    console.error('HTML parsing error:', error)
    throw new Error('Failed to parse HTML')
  }
}

async function extractJobData(html: string, selectors: any): Promise<any> {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const jobData: any = {}

    // Extract data using provided selectors
    for (const [key, selector] of Object.entries(selectors)) {
      const element = doc.querySelector(selector as string)
      if (element) {
        if (key.includes('text')) {
          jobData[key] = element.textContent?.trim()
        } else if (key.includes('href')) {
          jobData[key] = element.getAttribute('href')
        } else if (key.includes('src')) {
          jobData[key] = element.getAttribute('src')
        } else {
          jobData[key] = element.textContent?.trim()
        }
      }
    }

    // Additional processing can be added here
    if (jobData.salary && typeof jobData.salary === 'string') {
      jobData.salaryRange = extractSalaryRange(jobData.salary)
    }

    return {
      success: true,
      jobData,
      extractedAt: Date.now(),
    }
  } catch (error) {
    console.error('Job data extraction error:', error)
    throw new Error('Failed to extract job data')
  }
}

function extractSalaryRange(salaryText: string): any {
  // Basic salary range extraction
  // This can be enhanced with more sophisticated parsing
  const numbers = salaryText.match(/[\d,]+/g)
  if (numbers && numbers.length >= 1) {
    const min = parseInt(numbers[0].replace(/,/g, ''))
    const max = numbers.length > 1 ? parseInt(numbers[1].replace(/,/g, '')) : min

    return {
      min,
      max,
      currency: salaryText.includes('$') ? 'USD' :
                salaryText.includes('€') ? 'EUR' :
                salaryText.includes('£') ? 'GBP' : 'USD',
      period: salaryText.toLowerCase().includes('year') ? 'yearly' :
              salaryText.toLowerCase().includes('month') ? 'monthly' :
              salaryText.toLowerCase().includes('hour') ? 'hourly' : 'yearly',
    }
  }

  return null
}

function validateDOMAccess(): any {
  return {
    success: true,
    hasDocument: !!document,
    hasWindow: !!window,
    hasDOMParser: !!window.DOMParser,
    timestamp: Date.now(),
  }
}

// Keep the offscreen document alive
setInterval(() => {
  console.log('Offscreen document heartbeat')
}, 30000) // Every 30 seconds

console.log('Hireoo offscreen document initialized')



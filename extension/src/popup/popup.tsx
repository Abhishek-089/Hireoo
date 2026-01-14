import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthUser } from '../utils/auth'

interface ExtensionMessage {
  type: string
  [key: string]: any
}

// Helper to use chrome.runtime.sendMessage with Promises reliably
function sendMessage<T = any>(message: any): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        const err = chrome.runtime.lastError
        if (err) {
          reject(err)
        } else {
          resolve(response as T)
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

const Popup: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginUrl, setLoginUrl] = useState('')
  const [error, setError] = useState('')
  const [runnerStatus, setRunnerStatus] = useState<any>(null)
  const [isRunnerLoading, setIsRunnerLoading] = useState(false)

  useEffect(() => {
    checkAuthStatus()
    setupMessageListener()
    if (isAuthenticated) {
      checkRunnerStatus()
      // Poll runner status every 5 seconds when authenticated
      const statusInterval = setInterval(() => {
        if (isAuthenticated) {
          checkRunnerStatus()
        }
      }, 5000)
      return () => clearInterval(statusInterval)
    }
  }, [isAuthenticated])

  const checkAuthStatus = async () => {
    try {
      const response = await sendMessage<boolean>({ type: 'AUTH_CHECK' })
      setIsAuthenticated(response)

      if (response) {
        const authData = await sendMessage<AuthUser | null>({ type: 'GET_AUTH_DATA' })
        setUser(authData)
      }
    } catch (error) {
      console.error('Failed to check auth status:', error)
      setError('Failed to check authentication status')
    } finally {
      setLoading(false)
    }
  }

  const setupMessageListener = () => {
    chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
      if (message.type === 'AUTH_STATUS_CHANGED') {
        setIsAuthenticated(message.authenticated)
        if (!message.authenticated) {
          setUser(null)
        }
      }
    })
  }

  const handleLogin = () => {
    // Open Hireoo sign-in page in the main web app.
    // URL is configured via VITE_APP_URL environment variable
    const appBaseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000'
    const loginUrl = `${appBaseUrl}/signin?from=extension=1`
    chrome.tabs.create({ url: loginUrl })
  }

  const handleLogout = async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' })
      setIsAuthenticated(false)
      setUser(null)
      setRunnerStatus(null)
    } catch (error) {
      console.error('Logout failed:', error)
      setError('Logout failed')
    }
  }

  const checkRunnerStatus = async () => {
    try {
      const status = await sendMessage<any>({ type: 'GET_RUNNER_STATUS' })
      setRunnerStatus(status)
    } catch (error) {
      console.error('Failed to get runner status:', error)
    }
  }

  const handleStartRunner = async () => {
    console.log('[Popup] 🚀 User clicked "Start LinkedIn Runner"')
    setIsRunnerLoading(true)
    setError('')

    try {
      console.log('[Popup] 📡 Sending START_HIDDEN_RUNNER message...')
      const response = await sendMessage<any>({ type: 'START_HIDDEN_RUNNER' })
      console.log('[Popup] 📥 Received response:', response)

      if (response.success) {
        console.log('[Popup] ✅ Runner started successfully')
        console.log('[Popup] 📊 Fetching runner status...')
        const status = await chrome.runtime.sendMessage({ type: 'GET_RUNNER_STATUS' })
        console.log('[Popup] 📊 Runner status:', status)
        setRunnerStatus(status)
      } else {
        console.error('[Popup] ❌ Failed to start runner:', response.message)
        setError(response.message || 'Failed to start runner')
      }
    } catch (error) {
      console.error('[Popup] ❌ Error starting runner:', error)
      setError('Failed to start LinkedIn runner')
    } finally {
      setIsRunnerLoading(false)
    }
  }

  const handleStopRunner = async () => {
    console.log('[Popup] 🛑 User clicked "Stop LinkedIn Runner"')
    setIsRunnerLoading(true)
    setError('')

    try {
      console.log('[Popup] 📡 Sending STOP_HIDDEN_RUNNER message...')
      const response = await sendMessage<any>({ type: 'STOP_HIDDEN_RUNNER' })
      console.log('[Popup] 📥 Received response:', response)

      if (response.success) {
        console.log('[Popup] ✅ Runner stopped successfully')
        const status = await chrome.runtime.sendMessage({ type: 'GET_RUNNER_STATUS' })
        console.log('[Popup] 📊 Final runner status:', status)
        setRunnerStatus(status)
      } else {
        console.error('[Popup] ❌ Failed to stop runner:', response.message)
        setError(response.message || 'Failed to stop runner')
      }
    } catch (error) {
      console.error('[Popup] ❌ Error stopping runner:', error)
      setError('Failed to stop LinkedIn runner')
    } finally {
      setIsRunnerLoading(false)
    }
  }

  const handleScrapeLinkedIn = async () => {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab.url?.includes('linkedin.com')) {
        setError('Please navigate to a LinkedIn page first')
        return
      }

      const response = await sendMessage<any>({
        type: 'SCRAPE_LINKEDIN',
        tabId: tab.id,
      })

      if (response.success) {
        alert('LinkedIn scraping completed! Check your dashboard for new job matches.')
      } else {
        setError(response.error || 'Scraping failed')
      }
    } catch (error) {
      console.error('Scraping failed:', error)
      setError('Failed to scrape LinkedIn')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <span className="text-blue-600 font-bold text-sm">H</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Hireoo</h1>
            <p className="text-xs text-blue-100">AI Job Search Assistant</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isAuthenticated ? (
          // Login Screen
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
              <p className="text-sm text-gray-600 mb-4">
                Connect your Hireoo account to start automating your job search
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In to Hireoo
            </button>

            <p className="text-xs text-gray-500 mt-3">
              Don't have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a>
            </p>
          </div>
        ) : (
          // Status Screen
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Welcome back!</h2>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Sign out
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-800 font-medium">Connected to Hireoo</span>
                </div>
              </div>
            </div>

            {/* Runner Status */}
            {runnerStatus && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">LinkedIn Runner</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${runnerStatus.isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-600">
                      {runnerStatus.isRunning ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                {runnerStatus.isRunning && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Posts scraped: {runnerStatus.postsScraped || 0}</p>
                    <p>Running time: {Math.floor((runnerStatus.uptime || 0) / 1000 / 60)}m {Math.floor(((runnerStatus.uptime || 0) / 1000) % 60)}s</p>
                    <p className="text-green-600 font-medium">✓ Auto-scraping search results</p>
                    <p className="text-gray-500 italic">Keywords: "freelance developer project"</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-3">
              {!runnerStatus?.isRunning ? (
                <button
                  onClick={handleStartRunner}
                  disabled={isRunnerLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3-3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isRunnerLoading ? 'Starting...' : 'Start LinkedIn Runner'}
                </button>
              ) : (
                <button
                  onClick={handleStopRunner}
                  disabled={isRunnerLoading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3 3h.01M9 16h1.586a1 1 0 01.707-.293l.707-.707A1 1 0 0012.414 13H15" />
                  </svg>
                  {isRunnerLoading ? 'Stopping...' : 'Stop LinkedIn Runner'}
                </button>
              )}

              <button
                onClick={handleScrapeLinkedIn}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Manual Scrape
              </button>

              <button
                onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('../frontend/dashboard.html') || 'https://hireoo.com/dashboard' })}
                className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Open Dashboard
              </button>
            </div>

            {/* Status Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Extension ready for LinkedIn scraping</p>
                <p>• Auto-sync with your dashboard</p>
                <p>• Secure JWT authentication</p>
                {runnerStatus?.isRunning && (
                  <p>• Background runner active: {runnerStatus.postsScraped} posts scraped</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mount React app
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Popup />)
}

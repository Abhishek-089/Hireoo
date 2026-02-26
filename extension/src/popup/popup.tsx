import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthUser } from '../utils/auth'
import '../index.css'

interface ExtensionMessage {
  type: string
  [key: string]: any
}

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
  const [error, setError] = useState('')
  const [runnerStatus, setRunnerStatus] = useState<any>(null)
  const [isRunnerLoading, setIsRunnerLoading] = useState(false)

  useEffect(() => {
    checkAuthStatus()
    setupMessageListener()
    if (isAuthenticated) {
      checkRunnerStatus()
      const statusInterval = setInterval(() => {
        if (isAuthenticated) {
          checkRunnerStatus()
        }
      }, 2000)
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
      if (message.type === 'RUNNER_STATUS_CHANGED' && message.status) {
        setRunnerStatus(message.status)
      }
    })
  }

  const handleLogin = () => {
    const appBaseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000'
    chrome.tabs.create({ url: `${appBaseUrl}/signin` })
  }

  const handleSignup = () => {
    const appBaseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000'
    chrome.tabs.create({ url: `${appBaseUrl}/signup` })
  }

  const handleOpenDashboard = () => {
    const appBaseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000'
    chrome.tabs.create({ url: `${appBaseUrl}/dashboard` })
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
    setIsRunnerLoading(true)
    setError('')
    try {
      const response = await sendMessage<any>({ type: 'START_HIDDEN_RUNNER' })
      if (response.success) {
        const status = await chrome.runtime.sendMessage({ type: 'GET_RUNNER_STATUS' })
        setRunnerStatus(status)
      } else {
        setError(response.message || 'Failed to start runner')
      }
    } catch (error) {
      setError('Failed to start LinkedIn runner')
    } finally {
      setIsRunnerLoading(false)
    }
  }

  const handleStopRunner = async () => {
    setIsRunnerLoading(true)
    setError('')
    try {
      const response = await sendMessage<any>({ type: 'STOP_HIDDEN_RUNNER' })
      if (response.success) {
        const status = await chrome.runtime.sendMessage({ type: 'GET_RUNNER_STATUS' })
        setRunnerStatus(status)
      } else {
        setError(response.message || 'Failed to stop runner')
      }
    } catch (error) {
      setError('Failed to stop LinkedIn runner')
    } finally {
      setIsRunnerLoading(false)
    }
  }

  const handleScrapeLinkedIn = async () => {
    try {
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
      setError('Failed to scrape LinkedIn')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        // ===== SIGNIN SCREEN =====
        <div className="p-6">

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Hireoo</h2>
              <p className="text-sm text-gray-600">
                Sign in to automate your job search with AI
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center group"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign in to Continue
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Don't have an account?{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handleSignup()
                }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Sign up
              </a>
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="text-2xl mb-1">🤖</div>
              <p className="text-xs font-medium text-gray-700">AI Powered</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-xs font-medium text-gray-700">Fast</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-xs font-medium text-gray-700">Secure</p>
            </div>
          </div>
        </div>
      ) : (
        // ===== AUTHENTICATED SCREEN =====
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Hireoo"
                className="h-20 w-auto"
              />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* User Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{user?.name || 'User'}</h3>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Qualified Posts</span>
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {runnerStatus?.qualifiedPosts || 0} / {runnerStatus?.targetPosts || 10}
              </p>
              <p className="text-xs text-indigo-600 font-medium mt-1">
                {runnerStatus?.isRunning ? 'Searching...' : 'Ready'}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Status</span>
                <div className={`w-2 h-2 rounded-full ${runnerStatus?.isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{runnerStatus?.isRunning ? 'Active' : 'Idle'}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {runnerStatus?.isRunning ? `${Math.floor((runnerStatus.uptime || 0) / 1000 / 60)}m uptime` : 'Not running'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-4">
            {!runnerStatus?.isRunning ? (
              <button
                onClick={handleStartRunner}
                disabled={isRunnerLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                {isRunnerLoading ? 'Starting...' : 'Start Automation'}
              </button>
            ) : (
              <button
                onClick={handleStopRunner}
                disabled={isRunnerLoading}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                {isRunnerLoading ? 'Stopping...' : 'Stop Automation'}
              </button>
            )}

            <button
              onClick={handleOpenDashboard}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Dashboard
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 pt-4 border-t border-gray-200">
            <span className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
              Ready
            </span>
            <span className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></div>
              Synced
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Popup />)
}

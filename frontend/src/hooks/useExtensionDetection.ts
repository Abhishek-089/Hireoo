'use client'

import { useState, useEffect, useCallback } from 'react'
import { EXTENSION_CONFIG } from '@/config/extension'

interface ExtensionInfo {
    installed: boolean
    version?: string
    name?: string
}

// Type declaration for Chrome extension API
declare global {
    interface Window {
        chrome?: typeof chrome
    }
}

export function useExtensionDetection() {
    const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo>({
        installed: false,
    })
    const [isChecking, setIsChecking] = useState(true)

    const checkExtension = useCallback(async () => {
        setIsChecking(true)

        try {
            // Try to send a message to the extension
            const response = await new Promise<any>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Extension ping timeout'))
                }, 1000)

                // Check if chrome API is available (only in Chrome browser)
                if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
                    window.chrome.runtime.sendMessage(
                        EXTENSION_CONFIG.id,
                        { type: 'PING' },
                        (response: any) => {
                            clearTimeout(timeout)
                            if (window.chrome?.runtime?.lastError) {
                                reject(window.chrome.runtime.lastError)
                            } else {
                                resolve(response)
                            }
                        }
                    )
                } else {
                    clearTimeout(timeout)
                    reject(new Error('Chrome runtime not available'))
                }
            })

            if (response?.installed) {
                setExtensionInfo({
                    installed: true,
                    version: response.version,
                    name: response.name,
                })

                // Update the backend about installation status
                try {
                    await fetch('/api/extension/status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ installed: true }),
                    })
                } catch (error) {
                    console.error('Failed to update extension status on backend:', error)
                }
            } else {
                setExtensionInfo({ installed: false })
            }
        } catch (error) {
            // Extension not installed or not responding
            setExtensionInfo({ installed: false })
        } finally {
            setIsChecking(false)
        }
    }, [])

    useEffect(() => {
        checkExtension()

        // Re-check every 5 seconds to detect installation
        const interval = setInterval(checkExtension, 5000)

        return () => clearInterval(interval)
    }, [checkExtension])

    return {
        isInstalled: extensionInfo.installed,
        extensionInfo,
        isChecking,
        checkExtension,
    }
}

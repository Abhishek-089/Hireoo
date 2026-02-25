/**
 * Utility functions for communicating with the Hireoo Chrome Extension
 */

/**
 * Sends a JWT token to the Hireoo Chrome Extension for authentication
 * The extension's content script (auth-bridge.ts) listens for this message
 * 
 * @param token - JWT token from NextAuth session
 */
export function sendTokenToExtension(token: string): void {
    if (!token) {
        console.warn('Cannot send empty token to extension')
        return
    }

    try {
        // Post message to window - the extension's content script will intercept it
        window.postMessage({
            type: 'HIREOO_EXTENSION_LOGIN',
            token: token
        }, '*')

        console.log('JWT token sent to extension')
    } catch (error) {
        // Fail silently - extension might not be installed
        console.debug('Failed to send token to extension:', error)
    }
}

/**
 * Gets the JWT token from the current session and sends it to the extension
 * This is useful for syncing authentication state when navigating to authenticated pages
 */
export async function syncExtensionAuth(): Promise<void> {
    try {
        // Use the existing extension token endpoint
        const response = await fetch('/api/extension/token', {
            method: 'GET',
            credentials: 'include',
        })

        if (!response.ok) {
            // 401/403 just mean not eligible; silently ignore
            return
        }

        const data = await response.json()
        if (data?.token) {
            sendTokenToExtension(data.token)
        }
    } catch (error) {
        console.debug('Failed to sync extension auth:', error)
    }
}

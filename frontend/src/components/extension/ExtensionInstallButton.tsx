'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useExtensionDetection } from '@/hooks/useExtensionDetection'
import { Download, CheckCircle2, ExternalLink } from 'lucide-react'
import { EXTENSION_CONFIG } from '@/config/extension'

interface ExtensionInstallButtonProps {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
    showVersion?: boolean
    className?: string
}

export function ExtensionInstallButton({
    variant = 'outline',
    size = 'sm',
    showVersion = false,
    className = ''
}: ExtensionInstallButtonProps) {
    const { isInstalled, extensionInfo, isChecking } = useExtensionDetection()

    const handleInstall = () => {
        window.open(EXTENSION_CONFIG.storeUrl, '_blank', 'noopener,noreferrer')
    }

    if (isChecking) {
        return <Skeleton className="h-9 w-32" />
    }

    if (isInstalled) {
        return (
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Extension Installed
                </Badge>
                {showVersion && extensionInfo.version && (
                    <span className="text-xs text-muted-foreground">v{extensionInfo.version}</span>
                )}
            </div>
        )
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleInstall}
            className={className}
        >
            <Download className="h-4 w-4 mr-2" />
            Install Extension
            <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
        </Button>
    )
}

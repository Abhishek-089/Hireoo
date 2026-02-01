"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Download, UserCog, Linkedin, CheckCircle2, Circle, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExtensionInstallButton } from "@/components/extension/ExtensionInstallButton"
import { EXTENSION_CONFIG } from "@/config/extension"

interface QuickActionsProps {
  status: {
    gmail_connected: boolean
    extension_installed: boolean
    linkedin_connected: boolean
    resume_uploaded: boolean
  } | null
}

export function QuickActions({ status }: QuickActionsProps) {
  const checklist = [
    {
      title: "Gmail Account",
      description: "Connect your Gmail account",
      icon: Mail,
      href: "/dashboard/email-settings",
      isCompleted: status?.gmail_connected ?? false,
      buttonText: "Connect Now",
      completedText: "Connected",
      isExtension: false,
    },
    {
      title: "Extension Installed",
      description: "Install our chrome extension",
      icon: Download,
      href: EXTENSION_CONFIG.storeUrl,
      isCompleted: status?.extension_installed ?? false,
      buttonText: "Install Now",
      completedText: "Installed",
      isExtension: true,
    },
    {
      title: "Professional Profile",
      description: "Connect your professional network",
      icon: Linkedin,
      href: "#",
      isCompleted: status?.linkedin_connected ?? false,
      buttonText: "Connect Now",
      completedText: "Connected",
      isExtension: false,
    },
    {
      title: "Update Profile",
      description: "Complete your user profile",
      icon: UserCog,
      href: "/onboarding",
      isCompleted: status?.resume_uploaded ?? false,
      buttonText: "Update Now",
      completedText: "Updated",
      isExtension: false,
    },
  ]

  const handleExtensionClick = () => {
    window.open(EXTENSION_CONFIG.storeUrl, '_blank', 'noopener,noreferrer')
  }

  const handleStartAutomation = async () => {
    if (!status?.extension_installed) {
      // If extension not installed, redirect to store
      window.open(EXTENSION_CONFIG.storeUrl, '_blank', 'noopener,noreferrer')
      return
    }

    try {
      // Check if chrome runtime is available
      // @ts-ignore - Chrome is available in the browser but not in frontend types
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        // Send message to extension
        // @ts-ignore
        chrome.runtime.sendMessage(EXTENSION_CONFIG.id, {
          type: 'START_HIDDEN_RUNNER',
          source: 'DASHBOARD'
        }, (response: any) => {
          // @ts-ignore
          if (chrome.runtime.lastError) {
            console.error('Failed to trigger automation:', chrome.runtime.lastError)
            // @ts-ignore
            alert(`Failed to connect to extension: ${chrome.runtime.lastError.message}. \n\nPlease make sure the extension is installed and reloaded.`)
          } else {
            console.log('Automation triggered:', response)
            if (response && response.success === false) {
              alert(`Extension error: ${response.message}`)
            } else {
              alert('Automation signal sent. Please check the extension icon.')
            }
          }
        })
      } else {
        console.warn('Chrome runtime not found')
        alert('Chrome extension API not found. Please make sure you are using Chrome.')
      }
    } catch (error) {
      console.error('Failed to start automation:', error)
      alert('Failed to start automation.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Dashboard Checklist</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {checklist.map((item) => (
          <Card key={item.title} className={cn(
            "hover:shadow-md transition-all border-2",
            item.isCompleted ? "border-green-100 bg-green-50/10" : "border-gray-100"
          )}>
            <CardContent className="p-6 flex flex-col items-start gap-4">
              <div className="flex justify-between w-full items-start">
                <div className={cn(
                  "p-2 rounded-lg",
                  item.isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                {item.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
              </div>

              {item.isExtension ? (
                <div className="w-full mt-auto">
                  <ExtensionInstallButton
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  />
                </div>
              ) : item.isCompleted ? (
                <Button size="sm" variant="ghost" className="w-full mt-auto text-green-600 font-medium hover:bg-green-50" disabled>
                  {item.completedText}
                </Button>
              ) : (item as any).isAutomation ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-gray-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={handleStartAutomation}
                >
                  {item.buttonText}
                </Button>
              ) : (
                <Link href={item.href} className="w-full mt-auto">
                  <Button size="sm" variant="outline" className="w-full border-gray-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    {item.buttonText}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

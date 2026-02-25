import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import { EXTENSION_CONFIG } from "@/config/extension"

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-gradient-to-br from-blue-100 to-indigo-100 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm font-medium">
            <Sparkles className="mr-2 h-4 w-4" />
            AI-Powered Job Search Automation
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Automate Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Job Search
            </span>{" "}
            with AI
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
            Connect your Gmail, install our Chrome extension, and let AI discover opportunities,
            match them to your profile, and send personalized cold emails automatically.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3 text-lg w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={EXTENSION_CONFIG.storeUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg w-full sm:w-auto">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.894c-1.184 2.05-3.39 3.427-5.894 3.427a6.75 6.75 0 01-5.894-3.427l2.947-5.105a3.375 3.375 0 116.894 0l2.947 5.105z" />
                </svg>
                Install Extension
              </Button>
            </Link>

          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-x-8 text-sm text-gray-500">
            <div className="flex items-center gap-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Gmail OAuth secure</span>
            </div>
            <div className="flex items-center gap-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>GDPR compliant</span>
            </div>
          </div>
        </div>

        {/* Stats or preview image area */}
        <div className="mt-16 flow-root sm:mt-24">
          <div className="relative -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <div className="rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10 overflow-hidden">
              <Image
                src="/dashboard-preview.png"
                alt="Hireoo Dashboard Preview"
                width={2400}
                height={1600}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

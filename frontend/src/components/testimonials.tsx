import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Software Engineer",
    company: "Google",
    image: "/globe.svg",
    content: "Hireoo completely transformed my job search. I went from applying to 2-3 jobs a week to 50+ personalized applications. Landed my dream role at Google within 3 months!",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Product Manager",
    company: "Stripe",
    image: "/globe.svg",
    content: "The AI matching is incredible. It found opportunities I never would have discovered manually. The cold emails are professional and actually get responses.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "UX Designer",
    company: "Airbnb",
    image: "/globe.svg",
    content: "As a busy professional, I don't have time for manual job searching. Hireoo automates everything while maintaining a personal touch. Highly recommend!",
    rating: 5
  },
  {
    name: "David Kim",
    role: "Data Scientist",
    company: "Netflix",
    image: "/globe.svg",
    content: "The Chrome extension makes capturing job opportunities from professional networks effortless. Combined with the AI email generation, it's like having a personal recruiter working 24/7.",
    rating: 5
  },
  {
    name: "Lisa Thompson",
    role: "Marketing Director",
    company: "Spotify",
    image: "/globe.svg",
    content: "I was skeptical about automation, but Hireoo's approach is smart and ethical. The results speak for themselves - 300% increase in interview requests.",
    rating: 5
  },
  {
    name: "Alex Johnson",
    role: "DevOps Engineer",
    company: "Amazon",
    image: "/globe.svg",
    content: "Privacy-focused and secure. I love that my Gmail stays private with OAuth. The analytics help me understand what's working in my job search.",
    rating: 5
  }
]

export function Testimonials() {
  return (
    <div className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by job seekers worldwide
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join thousands of professionals who have transformed their job search with Hireoo.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-900 text-sm leading-relaxed mb-6">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">10,000+</div>
              <div className="text-sm text-gray-600 mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">500K+</div>
              <div className="text-sm text-gray-600 mt-1">Jobs Applied</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-600 mt-1">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600 mt-1">AI Automation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

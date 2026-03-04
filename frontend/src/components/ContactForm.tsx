"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type FormState = "idle" | "loading" | "success" | "error"

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Something went wrong. Please try again.")
        setState("error")
        return
      }

      setState("success")
      setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" })
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm h-full min-h-[460px]">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-5">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h3>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
          We&apos;ve received your message and will reply within one business day.
          Check your inbox — we&apos;ve also sent you a confirmation.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1.5">
            First name <span className="text-red-400">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={form.firstName}
            onChange={handleChange}
            placeholder="John"
            disabled={state === "loading"}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1.5">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Doe"
            disabled={state === "loading"}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
          Email address <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          disabled={state === "loading"}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-xs font-medium text-gray-700 mb-1.5">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          placeholder="How can we help?"
          disabled={state === "loading"}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1.5">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us what's on your mind..."
          disabled={state === "loading"}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition resize-none"
        />
      </div>

      {state === "error" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700 leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send message
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}

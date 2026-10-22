import { useState, useRef, useEffect } from 'react'

// Replace this URL with your deployed Google Apps Script web app URL
// See the setup guide for instructions on how to get this URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxqlkK7LR-NdX65co_gnbhQzHXcw6Jurg2kmqq-OhuRUiF3IdUAlkWXMlfWQ26JEAwS/exec'

const PROGRAMS = [
  {
    name: 'Basic',
    price: '₹2,000',
    period: '/ month',
    description:
      'Ideal for beginners to master calisthenics fundamentals, build baseline bodyweight strength, and establish solid workout habits.',
    features: [
      '1 video call / week',
      'Calisthenics foundations (Push-ups, Pull-ups, Dips)',
      'Core & mobility conditioning routine',
      'Weekly form check & progress tracking',
      'WhatsApp support',
    ],
    cta: 'Enrol Now',
  },
  {
    name: 'Standard',
    price: '₹3,000',
    period: '/ month',
    description:
      'For athletes aiming to unlock intermediate calisthenics skills and build functional hybrid strength & endurance.',
    features: [
      '2 video calls / week',
      'Intermediate skills (Handstand hold, L-sit, Muscle-up prep)',
      'Hybrid strength & stamina programming',
      'Personalized roadmap & weekly video feedback',
      'Priority WhatsApp support',
    ],
    cta: 'Enrol Now',
    featured: true,
  },
  {
    name: 'Premium',
    price: '₹4,000',
    period: '/ month',
    description:
      'Elite 1-on-1 coaching for mastering advanced calisthenics skills and building a high-performance hybrid athlete physique.',
    features: [
      '3 video calls / week',
      'Advanced skills (Muscle-up, Planche, Front Lever)',
      'Complete Hybrid Athlete conditioning roadmap',
      'Daily video form & technique breakdown',
      '24/7 priority WhatsApp & VIP access',
    ],
    cta: 'Enrol Now',
  },
]


/* ─── Enrollment Modal ─── */
function EnrollmentModal({
  plan,
  onClose,
}: {
  plan: string
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const modalRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => setScreenshotPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeScreenshot = () => {
    setScreenshot(null)
    setScreenshotPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Convert screenshot to base64 if present
      let screenshotData = null
      let screenshotName = null
      if (screenshot) {
        screenshotName = screenshot.name
        screenshotData = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            // Remove the data:image/xxx;base64, prefix
            resolve(result.split(',')[1])
          }
          reader.readAsDataURL(screenshot)
        })
      }

      const payload = {
        type: 'enrollment',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        plan: plan,
        message: formData.message,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        screenshot: screenshotData,
        screenshotName: screenshotName,
      }

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setSubmitted(true)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />



      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[modalIn_0.3s_ease-out]"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-text-h">Enrol Now</h3>
            <p className="text-sm text-text">
              Selected plan:{' '}
              <span className="font-semibold text-blue-600">{plan}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-text-h text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-text-h mb-2">
              Enrollment Submitted!
            </h4>
            <p className="text-text mb-6">
              Thank you for enrolling in the{' '}
              <span className="font-semibold">{plan}</span> plan. We'll get back
              to you within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Plan badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {plan} Plan
              </span>
            </div>

            {/* Payment QR Code Section */}
            <div className="rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-5">
              <h4 className="text-sm font-bold text-text-h mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Payment Instructions
              </h4>
              <ol className="text-sm text-text space-y-2 mb-4 list-decimal list-inside">
                <li>Scan the QR code below using any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>Pay the amount for your selected <span className="font-semibold text-blue-600">{plan}</span> plan</li>
                <li>Take a screenshot of the payment confirmation</li>
                <li>Upload the screenshot below and fill in your details</li>
              </ol>
              <div className="flex flex-col items-center gap-3 py-3">
                <div className="bg-white rounded-xl p-3 border border-border shadow-sm">
                  <img
                    src="/bee1e496-b8d3-4d12-9627-c3fa66bf346f.jpg"
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500">Scan to pay via UPI</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="enrol-name"
                className="block text-sm font-medium text-text-h mb-1.5"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="enrol-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text-h placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="enrol-email"
                className="block text-sm font-medium text-text-h mb-1.5"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="enrol-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text-h placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="enrol-phone"
                className="block text-sm font-medium text-text-h mb-1.5"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="enrol-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text-h placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="enrol-message"
                className="block text-sm font-medium text-text-h mb-1.5"
              >
                Message{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="enrol-message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                placeholder="Anything you'd like us to know..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text-h placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Payment Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium text-text-h mb-1.5">
                Upload Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Please upload the screenshot of your UPI payment confirmation
              </p>
              {screenshotPreview ? (
                <div className="relative rounded-lg border border-border overflow-hidden">
                  <img
                    src={screenshotPreview}
                    alt="Screenshot preview"
                    className="w-full max-h-48 object-contain bg-gray-50"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="px-2.5 py-1 bg-red-500 text-white text-xs rounded-md font-medium hover:bg-red-600 transition shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 border-t border-border text-xs text-text truncate">
                    {screenshot?.name}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition flex flex-col items-center gap-2 group"
                >
                  <svg
                    className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-sm text-gray-500 group-hover:text-blue-600 transition">
                    Click to upload a screenshot
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG up to 5MB
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submitting…
                </>
              ) : (
                'Submit Enrollment'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ─── Main App ─── */
export default function App() {
  const [enrollPlan, setEnrollPlan] = useState<string | null>(null)
  const [contactData, setContactData] = useState({ name: '', email: '', query: '' })
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactSubmitted, setContactSubmitted] = useState(false)

  return (
    <div className="min-h-screen bg-bg text-text font-sans antialiased">
      {/* Enrollment Modal */}
      {enrollPlan && (
        <EnrollmentModal
          plan={enrollPlan}
          onClose={() => setEnrollPlan(null)}
        />
      )}

      <nav className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="font-bold text-text-h text-xl tracking-tight">
                Train with Nalin Solanki
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#programs" className="text-text hover:text-blue-600 transition">
                Programs
              </a>
              <a href="#instagram" className="text-text hover:text-blue-600 transition">
                Instagram
              </a>
              <a href="#contact" className="text-text hover:text-blue-600 transition">
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      <header className="py-16 md:py-24 px-4 text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold text-text-h tracking-tight mb-4">
          Train with Nalin Solanki
        </h1>
        <p className="text-center text-lg md:text-xl text-text max-w-2xl mx-auto leading-relaxed">
          Master elite calisthenics skills, forge unbreakable functional strength, and build the conditioning of a true hybrid athlete — with personalized coaching tailored to your goals.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#programs"
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-600 transition shadow-lg shadow-blue-500/20"
          >
            View Programs
          </a>
          <a
            href="#contact"
            className="px-6 py-3 border border-border rounded-md font-medium hover:bg-blue-50 transition"
          >
            Request Info
          </a>
        </div>
      </header>

      <section id="programs" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-h mb-3">
              Coaching Programs
            </h2>
            <p className="text-text">Choose the plan that fits your goals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PROGRAMS.map((program) => (
              <article
                key={program.name}
                className={`rounded-xl border border-border p-8 text-center transition hover:shadow-xl flex flex-col ${
                  program.featured
                    ? 'ring-2 ring-blue-600 bg-blue-50'
                    : 'bg-white hover:bg-blue-50'
                }`}
              >
                {program.featured && (
                  <span className="mx-auto inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-full mb-6 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-text-h mb-2">{program.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-text-h">{program.price}</span>
                  <span className="text-text">{program.period}</span>
                </div>
                <p className="text-text mb-6 leading-relaxed text-sm">
                  {program.description}
                </p>
                <ul className="space-y-3 mb-8 text-sm inline-block text-left">
                  {program.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setEnrollPlan(program.name)}
                  className="w-full mt-auto py-3 rounded-md border border-border font-medium text-text hover:bg-blue-600 hover:text-white transition cursor-pointer"
                >
                  {program.cta}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="instagram" className="py-20 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text-h mb-3">
              Follow Nalin Solanki
            </h2>
            <p className="text-text max-w-xl mx-auto text-center">
              Check out coaching tips, success stories, and behind-the-scenes content on Instagram
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left — Instagram Profile Preview */}
            <a
              href="https://www.instagram.com/nalin_solanki_talks_/"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Profile Header */}
              <div className="p-5 flex items-center gap-4 border-b border-border">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2.5px] shrink-0">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                      NS
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-text-h truncate">nalin_solanki_talks_</h3>
                    <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <p className="text-xs text-text truncate">Coaching • Motivation • Growth</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 py-3 border-b border-border text-center bg-gray-50/50">
                <div>
                  <div className="text-base font-bold text-text-h">130</div>
                  <div className="text-[11px] text-text">Posts</div>
                </div>
                <div>
                  <div className="text-base font-bold text-text-h">8,110</div>
                  <div className="text-[11px] text-text">Followers</div>
                </div>
                <div>
                  <div className="text-base font-bold text-text-h">111</div>
                  <div className="text-[11px] text-text">Following</div>
                </div>
              </div>

              {/* Bio */}
              <div className="px-5 py-3 border-b border-border">
                <p className="text-sm font-semibold text-text-h">Nalin Solanki</p>
                <p className="text-xs text-text leading-relaxed mt-1">
                  🎯 Personal Coach & Mentor<br />
                  💡 Helping you grow, lead & succeed<br />
                  📩 DM for coaching inquiries
                </p>
              </div>

              {/* Post Grid Preview */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100">
                {[
                  {
                    img: '/1.JPG',
                    type: 'reel',
                    likes: '342',
                  },
                  {
                    img: '/2.JPG',
                    type: 'carousel',
                    likes: '418',
                  },
                  {
                    img: '/3.JPG',
                    type: 'reel',
                    likes: '512',
                  },
                  {
                    img: '/4.JPG',
                    type: 'post',
                    likes: '289',
                  },
                  {
                    img: '/5.JPG',
                    type: 'carousel',
                    likes: '625',
                  },
                  {
                    img: '/6.JPG',
                    type: 'reel',
                    likes: '470',
                  },
                ].map((post, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden bg-gray-200 group/tile"
                  >
                    <img
                      src={post.img}
                      alt={`Instagram post ${i + 1}`}
                      className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Badge top-right */}
                    {post.type === 'reel' && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm rounded-full p-1 text-white">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    {post.type === 'carousel' && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm rounded p-0.5 text-white">
                        <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                          <rect x="3" y="3" width="14" height="14" rx="2" />
                          <path d="M7 21h12a2 2 0 002-2V7" />
                        </svg>
                      </div>
                    )}

                    {/* Hover overlay with likes */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/tile:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                      <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span>{post.likes}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Profile CTA */}
              <div className="p-4 text-center border-t border-border">
                <span className="text-sm font-semibold text-blue-600 group-hover:underline">
                  View full profile on Instagram →
                </span>
              </div>
            </a>

            {/* Right — Follow Card */}
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white rounded-2xl border border-border p-8 md:p-10 shadow-sm w-full text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[3px] mx-auto mb-5">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                      NS
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-text-h mb-1">@nalin_solanki_talks_</h3>
                <p className="text-sm text-text mb-6">Calisthenics • Hybrid Athlete • Coaching</p>
                <a
                  href="https://www.instagram.com/nalin_solanki_talks_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  Follow on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-border p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-text-h mb-2 text-center">
              Have a Question?
            </h2>
            <p className="text-text mb-8 text-center text-sm">
              Send us your query and we'll get back to you within 24 hours.
            </p>

            {contactSubmitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-text-h mb-1">Message Sent!</h4>
                <p className="text-sm text-text">We'll get back to you shortly.</p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setContactSubmitting(true)

                  try {
                    const payload = {
                      type: 'contact',
                      name: contactData.name,
                      email: contactData.email,
                      query: contactData.query,
                      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                    }

                    await fetch(GOOGLE_SCRIPT_URL, {
                      method: 'POST',
                      mode: 'no-cors',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    })

                    setContactSubmitted(true)
                  } catch {
                    alert('Something went wrong. Please try again.')
                  } finally {
                    setContactSubmitting(false)
                  }
                }}
                className="space-y-5"
              >

                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-text-h mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text-h placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-text-h mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text-h placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="contact-query" className="block text-sm font-medium text-text-h mb-1.5">
                    Your Query <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-query"
                    rows={4}
                    required
                    value={contactData.query}
                    onChange={(e) => setContactData({ ...contactData, query: e.target.value })}
                    placeholder="Type your question here..."
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text-h placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {contactSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 border-t border-border text-center">
        <p className="text-xs text-text">
          © {new Date().getFullYear()} Train with Nalin Solanki. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

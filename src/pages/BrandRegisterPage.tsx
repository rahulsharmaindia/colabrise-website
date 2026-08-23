import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GradientBlobs from '../components/GradientBlobs'
import TiltCard from '../components/TiltCard'
import { FormInput, FormTextarea } from '../components/FormField'
import { registerBrand, loginBrand, type BrandAuthResponse } from '../api/brand'
import { getErrorMessage } from '../lib/api-client'
import { setBrandSessionId } from '../lib/session'

// ── Login form ──────────────────────────────────────────────

interface LoginFormValues {
  businessId: string
  password: string
}

function BrandLoginForm({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate()
  const [values, setValues] = useState<LoginFormValues>({ businessId: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChange = (field: keyof LoginFormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof LoginFormValues, string>> = {}
    if (!values.businessId.trim()) nextErrors.businessId = 'Business ID is required'
    if (!values.password) nextErrors.password = 'Password is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const response = await loginBrand({
        businessId: values.businessId.trim(),
        password: values.password,
      })
      setBrandSessionId(response.sessionId)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <h2 className="text-white font-semibold text-lg mb-2">Sign in to your brand</h2>

      <FormInput
        label="Business ID"
        required
        placeholder="your-brand-id"
        value={values.businessId}
        onChange={onChange('businessId')}
        error={errors.businessId}
        disabled={isSubmitting}
      />
      <FormInput
        label="Password"
        type="password"
        required
        value={values.password}
        onChange={onChange('password')}
        error={errors.password}
        disabled={isSubmitting}
      />

      {submitError && (
        <p className="text-sm font-medium text-pink-400" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 disabled:opacity-60"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
        {!isSubmitting && <ArrowRight className="w-4 h-4" />}
      </button>

      <p className="text-center text-xs text-gray-500 pt-2">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-purple-300 hover:text-purple-200">
          Register your brand
        </button>
      </p>
      <p className="text-center text-xs text-gray-500">
        Are you a creator?{' '}
        <Link to="/creators/register" className="text-purple-300 hover:text-purple-200">
          Creator login
        </Link>
      </p>
    </form>
  )
}

// ── Register form ───────────────────────────────────────────

interface RegisterFormValues {
  name: string
  businessId: string
  industry: string
  password: string
  confirmPassword: string
  website: string
  description: string
}

const initialRegisterValues: RegisterFormValues = {
  name: '',
  businessId: '',
  industry: '',
  password: '',
  confirmPassword: '',
  website: '',
  description: '',
}

function BrandRegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate()
  const [values, setValues] = useState<RegisterFormValues>(initialRegisterValues)
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<BrandAuthResponse | null>(null)

  const onChange = (field: keyof RegisterFormValues) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof RegisterFormValues, string>> = {}
    if (!values.name.trim()) nextErrors.name = 'Brand name is required'
    if (!values.businessId.trim()) {
      nextErrors.businessId = 'Business ID is required'
    } else if (!/^[a-z0-9-]+$/.test(values.businessId.trim())) {
      nextErrors.businessId = 'Use lowercase letters, numbers, and hyphens only'
    }
    if (!values.industry.trim()) nextErrors.industry = 'Industry is required'
    if (!values.password) {
      nextErrors.password = 'Password is required'
    } else if (values.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters'
    }
    if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }
    if (values.website && !/^https?:\/\/.+/.test(values.website)) {
      nextErrors.website = 'Enter a valid URL starting with http(s)://'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const response = await registerBrand({
        name: values.name.trim(),
        businessId: values.businessId.trim(),
        industry: values.industry.trim(),
        password: values.password,
        website: values.website.trim() || undefined,
        description: values.description.trim() || undefined,
      })
      setResult(response)
      setBrandSessionId(response.sessionId)
      // Redirect to dashboard after a brief success message
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-white font-semibold text-xl mb-2">You're in!</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          {result.brandData.name} is registered. Redirecting to your dashboard…
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <h2 className="text-white font-semibold text-lg mb-2">Register your brand</h2>

      <FormInput
        label="Brand name"
        required
        placeholder="e.g. Acme Cosmetics"
        value={values.name}
        onChange={onChange('name')}
        error={errors.name}
        disabled={isSubmitting}
      />
      <FormInput
        label="Business ID"
        required
        hint="Used to sign in — lowercase letters, numbers, hyphens."
        placeholder="acme-cosmetics"
        value={values.businessId}
        onChange={onChange('businessId')}
        error={errors.businessId}
        disabled={isSubmitting}
      />
      <FormInput
        label="Industry"
        required
        placeholder="e.g. Fashion, Food & Beverage"
        value={values.industry}
        onChange={onChange('industry')}
        error={errors.industry}
        disabled={isSubmitting}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="Password"
          type="password"
          required
          value={values.password}
          onChange={onChange('password')}
          error={errors.password}
          disabled={isSubmitting}
        />
        <FormInput
          label="Confirm password"
          type="password"
          required
          value={values.confirmPassword}
          onChange={onChange('confirmPassword')}
          error={errors.confirmPassword}
          disabled={isSubmitting}
        />
      </div>
      <FormInput
        label="Website"
        placeholder="https://yourbrand.com"
        value={values.website}
        onChange={onChange('website')}
        error={errors.website}
        disabled={isSubmitting}
      />
      <FormTextarea
        label="Tell us about your brand"
        placeholder="What do you sell, and who do you want to reach?"
        value={values.description}
        onChange={onChange('description')}
        disabled={isSubmitting}
      />

      {submitError && (
        <p className="text-sm font-medium text-pink-400" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 disabled:opacity-60"
      >
        {isSubmitting ? 'Registering…' : 'Register brand'}
        {!isSubmitting && <ArrowRight className="w-4 h-4" />}
      </button>

      <p className="text-center text-xs text-gray-500 pt-2">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-purple-300 hover:text-purple-200">
          Sign in
        </button>
      </p>
    </form>
  )
}

// ── Page ────────────────────────────────────────────────────

export default function BrandRegisterPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="relative min-h-screen bg-dark-900">
      <GradientBlobs />
      <Navbar />

      <main>
        <section id="brand-register" className="relative z-10 px-6 md:px-12 py-16 md:py-20 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                FOR BRANDS
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight mb-6">
                Grow with<br />
                creators who<br />
                <span className="text-gradient">actually convert.</span>
              </h1>

              <p className="text-gray-400 text-base md:text-lg max-w-md mb-8 leading-relaxed">
                {mode === 'login'
                  ? 'Sign in to manage your campaigns, discover creators, and track performance — all with your AI growth assistant.'
                  : 'Register your brand on Colabrise to get matched with vetted creators, launch campaigns, and track ROI with your own AI growth assistant.'}
              </p>

              <ul className="space-y-4 max-w-md">
                {[
                  'AI-matched creators for your brand DNA',
                  'Briefs, contracts & payouts in one workspace',
                  'Live growth forecasts before you spend a dollar',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: form panel — blue-tone gradient mockup style */}
            <div className="relative flex justify-center items-center">
              <TiltCard tiltStrength={6}>
                <div className="relative w-full max-w-2xl">
                  {/* Glow behind */}
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400 blur-2xl opacity-40 -z-10" />

                  {/* Outer gradient border */}
                  <div className="w-full rounded-[28px] bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400 p-[10px] md:p-[12px]">
                    {/* Inner frosted card */}
                    <div className="w-full rounded-[16px] bg-gradient-to-br from-white/20 to-white/5 relative overflow-hidden backdrop-blur-sm border border-white/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400 opacity-20" />
                      <div className="absolute inset-0 bg-black/50" />

                      {/* Content */}
                      <div className="relative z-10 px-6 py-8 md:px-8 md:py-10">
                        {mode === 'login' ? (
                          <BrandLoginForm onSwitch={() => setMode('register')} />
                        ) : (
                          <BrandRegisterForm onSwitch={() => setMode('login')} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

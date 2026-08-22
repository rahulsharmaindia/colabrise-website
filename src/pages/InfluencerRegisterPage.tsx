import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Upload, User } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GradientBlobs from '../components/GradientBlobs'
import TiltCard from '../components/TiltCard'
import { FormInput, FormSelect } from '../components/FormField'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { submitCreatorProfile } from '../api/creator'
import { getErrorMessage } from '../lib/api-client'
import { fileToDataUri } from '../lib/file'

const nicheOptions = [
  'Fashion', 'Fitness', 'Tech', 'Beauty', 'Travel',
  'Food', 'Lifestyle', 'Health', 'Education', 'Entertainment', 'Other',
]

interface ProfileFormValues {
  displayName: string
  instagramHandle: string
  niche: string
  customNiche: string
  followerCount: string
  contactNumber: string
  pricePerReel: string
  pricePerPost: string
  pricePerStory: string
  priceAdRights15Days: string
}

const initialValues: ProfileFormValues = {
  displayName: '', instagramHandle: '', niche: '', customNiche: '',
  followerCount: '', contactNumber: '',
  pricePerReel: '', pricePerPost: '', pricePerStory: '', priceAdRights15Days: '',
}

type FieldErrors = Partial<Record<keyof ProfileFormValues | 'profilePicture', string>>

export default function InfluencerRegisterPage() {
  const { state: authState, signIn } = useGoogleAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<ProfileFormValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (authState.step === 'authenticated' && authState.profileComplete) {
      navigate('/dashboard', { replace: true })
    }
  }, [authState, navigate])

  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
      return () => clearTimeout(timer)
    }
  }, [completed, navigate])

  const onChange = (field: keyof ProfileFormValues) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const onPhotoSelected = async (file: File | undefined) => {
    if (!file) return
    try {
      const dataUri = await fileToDataUri(file)
      setPhotoDataUri(dataUri)
      setErrors((prev) => ({ ...prev, profilePicture: undefined }))
    } catch {
      setErrors((prev) => ({ ...prev, profilePicture: 'Could not read that image, try another file' }))
    }
  }

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {}
    if (!values.displayName.trim()) nextErrors.displayName = 'Display name is required'
    if (!values.instagramHandle.trim()) nextErrors.instagramHandle = 'Instagram handle is required'
    const niche = values.niche === 'Other' ? values.customNiche : values.niche
    if (!niche.trim()) nextErrors.niche = 'Pick a niche'
    if (!values.followerCount.trim()) {
      nextErrors.followerCount = 'Follower count is required'
    } else if (!/^\d+$/.test(values.followerCount.trim())) {
      nextErrors.followerCount = 'Numbers only'
    }
    if (!values.contactNumber.trim()) nextErrors.contactNumber = 'Contact number is required'
    for (const field of ['pricePerReel', 'pricePerPost', 'pricePerStory', 'priceAdRights15Days'] as const) {
      const raw = values[field].trim()
      if (!raw) nextErrors[field] = 'Required'
      else if (!/^\d+$/.test(raw)) nextErrors[field] = 'Numbers only'
    }
    if (!photoDataUri) nextErrors.profilePicture = 'Profile photo is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate() || !photoDataUri) return
    const niche = values.niche === 'Other' ? values.customNiche.trim() : values.niche
    setIsSubmitting(true)
    try {
      await submitCreatorProfile({
        instagramHandle: values.instagramHandle.trim(),
        niche,
        followerCount: Number(values.followerCount),
        contactNumber: values.contactNumber.trim(),
        pricePerReel: Number(values.pricePerReel),
        pricePerPost: Number(values.pricePerPost),
        pricePerStory: Number(values.pricePerStory),
        priceAdRights15Days: Number(values.priceAdRights15Days),
        displayName: values.displayName.trim(),
        profilePictureDataUri: photoDataUri,
      })
      setCompleted(true)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const email = authState.step === 'authenticated' ? authState.email : null
  const isSignedIn = authState.step === 'authenticated'
  const alreadyComplete = authState.step === 'authenticated' && authState.profileComplete

  return (
    <div className="relative min-h-screen bg-dark-900">
      <GradientBlobs />
      <Navbar />

      <main>
        <section id="influencer-register" className="relative z-10 px-6 md:px-12 py-16 md:py-20 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                FOR CREATORS
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight mb-6">
                Turn your<br />
                following into<br />
                <span className="text-gradient">real income.</span>
              </h1>

              <p className="text-gray-400 text-base md:text-lg max-w-md mb-8 leading-relaxed">
                Sign in with Google to access your creator dashboard, get discovered by brands, and grow with
                your own AI growth assistant.
              </p>

              <ul className="space-y-4 max-w-md">
                {[
                  'Get matched with brands that fit your niche',
                  'Set your own rates for reels, posts & stories',
                  'AI assistant for content ideas and pricing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: visual panel */}
            <div className="relative flex justify-center items-center">
              {completed || alreadyComplete ? (
                <TiltCard tiltStrength={4}>
                  <div className="glass-card p-8 w-full text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h2 className="text-white font-semibold text-xl mb-2">You're all set!</h2>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      Redirecting to your dashboard…
                    </p>
                  </div>
                </TiltCard>
              ) : !isSignedIn ? (
                /* Login card styled like the PhoneMockup — thick gradient border, glow, frosted inner */
                <TiltCard tiltStrength={8}>
                  <div className="relative w-full">
                    {/* Glow behind */}
                    <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 blur-2xl opacity-40 -z-10" />

                    {/* Outer gradient border — full width, responsive height */}
                    <div className="w-full rounded-[28px] bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 p-[10px] md:p-[12px]">
                      {/* Inner frosted card */}
                      <div className="w-full rounded-[16px] bg-gradient-to-br from-white/20 to-white/5 relative overflow-hidden backdrop-blur-sm border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 opacity-20" />
                        <div className="absolute inset-0 bg-black/50" />

                        {/* Content */}
                        <div className="relative z-10 px-6 py-10 md:px-10 md:py-14 text-center">
                          <p className="text-[11px] text-white/70 font-medium uppercase tracking-wider mb-1">CREATOR</p>
                          <h2 className="text-white font-semibold text-2xl md:text-3xl mb-2">Sign in</h2>
                          <p className="text-white/60 text-sm mb-8 max-w-xs mx-auto">
                            Access your creator dashboard to manage collabs, track growth, and get paid.
                          </p>

                          <button
                            type="button"
                            onClick={signIn}
                            disabled={authState.step === 'awaiting-popup'}
                            className="w-full px-6 py-3 rounded-full bg-white text-dark-900 font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg"
                          >
                            <FcGoogle className="w-5 h-5" />
                            {authState.step === 'awaiting-popup' ? 'Waiting for Google…' : 'Continue with Google'}
                          </button>

                          {authState.step === 'error' && (
                            <p className="text-xs font-medium text-pink-200 mt-4" role="alert">
                              {authState.message}
                            </p>
                          )}

                          <p className="text-xs text-white/50 mt-6">
                            Are you a brand?{' '}
                            <Link to="/brands/register" className="text-white/80 hover:text-white underline">
                              Brand login
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              ) : (
                /* Profile completion form */
                <TiltCard tiltStrength={4}>
                  <div className="glass-card p-6 md:p-8 w-full">
                    <form className="space-y-4" onSubmit={onSubmit} noValidate>
                      <div>
                        <h2 className="text-white font-semibold text-lg mb-1">Complete your profile</h2>
                        {email && <p className="text-gray-500 text-xs">Signed in as {email}</p>}
                      </div>

                      {/* Profile photo */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-300">
                          Profile photo<span className="ml-0.5 text-pink-400">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-white/5 border border-white/10">
                            {photoDataUri ? (
                              <img src={photoDataUri} alt="Profile preview" className="size-full object-cover" />
                            ) : (
                              <User className="size-6 text-gray-500" />
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onPhotoSelected(e.target.files?.[0])}
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-full border border-white/20 text-white text-xs font-medium flex items-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-60"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload photo
                          </button>
                        </div>
                        {errors.profilePicture && (
                          <p className="text-xs font-medium text-pink-400 mt-1.5">{errors.profilePicture}</p>
                        )}
                      </div>

                      <FormInput label="Display name" required placeholder="How your name appears on your profile" value={values.displayName} onChange={onChange('displayName')} error={errors.displayName} disabled={isSubmitting} />
                      <FormInput label="Instagram handle" required placeholder="@yourhandle" value={values.instagramHandle} onChange={onChange('instagramHandle')} error={errors.instagramHandle} disabled={isSubmitting} />
                      <FormSelect label="Niche" required placeholder="Select a niche" value={values.niche} onChange={onChange('niche')} error={errors.niche} disabled={isSubmitting}>
                        {nicheOptions.map((option) => (
                          <option key={option} value={option} className="bg-dark-800 text-white">{option}</option>
                        ))}
                      </FormSelect>
                      {values.niche === 'Other' && (
                        <FormInput label="Tell us your niche" required placeholder="e.g. Sustainable living" value={values.customNiche} onChange={onChange('customNiche')} disabled={isSubmitting} />
                      )}
                      <FormInput label="Follower count" required inputMode="numeric" placeholder="e.g. 12000" value={values.followerCount} onChange={onChange('followerCount')} error={errors.followerCount} disabled={isSubmitting} />
                      <FormInput label="Contact number" required type="tel" placeholder="e.g. +1 555 123 4567" value={values.contactNumber} onChange={onChange('contactNumber')} error={errors.contactNumber} disabled={isSubmitting} />

                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-2">Your rate card</p>
                        <div className="grid grid-cols-2 gap-3">
                          <FormInput label="Per reel" required inputMode="numeric" placeholder="$" value={values.pricePerReel} onChange={onChange('pricePerReel')} error={errors.pricePerReel} disabled={isSubmitting} />
                          <FormInput label="Per post" required inputMode="numeric" placeholder="$" value={values.pricePerPost} onChange={onChange('pricePerPost')} error={errors.pricePerPost} disabled={isSubmitting} />
                          <FormInput label="Per story" required inputMode="numeric" placeholder="$" value={values.pricePerStory} onChange={onChange('pricePerStory')} error={errors.pricePerStory} disabled={isSubmitting} />
                          <FormInput label="Ad rights (15 days)" required inputMode="numeric" placeholder="$" value={values.priceAdRights15Days} onChange={onChange('priceAdRights15Days')} error={errors.priceAdRights15Days} disabled={isSubmitting} />
                        </div>
                      </div>

                      {submitError && (
                        <p className="text-sm font-medium text-pink-400" role="alert">{submitError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 disabled:opacity-60"
                      >
                        {isSubmitting ? 'Saving…' : 'Complete registration'}
                        {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                </TiltCard>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

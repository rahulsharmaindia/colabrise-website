import { useState } from 'react'
import {
  ArrowLeft, ArrowRight, Save, Loader2, CheckCircle2,
  FileText, Globe, Users, IndianRupee, Calendar, Target, BookOpen,
} from 'lucide-react'
import { DashCard, DashButton } from '../../components/ui'
import { createCampaign, updateCampaign } from '../../../api/campaigns'
import { getErrorMessage } from '../../../lib/api-client'

// ── Types ────────────────────────────────────────────────────

interface CampaignFormData {
  // Step 1 — Details
  title: string
  description: string
  objective: string
  campaignType: string
  platform: string
  deliverables: { reels: number; stories: number; posts: number }
  // Step 2 — Content
  postTypes: string[]
  contentCountPerInfluencer: string
  captionGuidelines: string
  hashtags: string
  mentions: string
  handleToTag: string
  referenceVideoUrl: string
  additionalReferenceLinks: string
  // Step 3 — Audience
  ageGroupMin: string
  ageGroupMax: string
  gender: string
  targetLocation: string
  interests: string
  languagePreference: string
  // Step 4 — Budget
  totalBudget: string
  budgetPerCreator: string
  paymentModel: string
  commissionRate: string
  productDetails: string
  bonusCriteria: string
  performanceIncentive: string
  // Step 5 — Timeline
  startDate: string
  endDate: string
  applicationDeadline: string
  submissionDeadline: string
  contentDeadline: string
  revisionAllowedCount: string
  reviewTurnaroundHours: string
  postingTimeWindow: string
  // Step 6 — Creators
  minimumFollowers: string
  requiredEngagementRate: string
  preferredNiche: string
  contentStyleExpectations: string
  totalSlots: string
  reserveSlots: string
  // Step 7 — Guidelines
  guidelinesDos: string
  guidelinesDonts: string
  brandMessaging: string
  requireApproval: boolean
}

const EMPTY_FORM: CampaignFormData = {
  title: '', description: '', objective: '', campaignType: '', platform: 'Instagram',
  deliverables: { reels: 0, stories: 0, posts: 0 },
  postTypes: [], contentCountPerInfluencer: '', captionGuidelines: '',
  hashtags: '', mentions: '', handleToTag: '', referenceVideoUrl: '', additionalReferenceLinks: '',
  ageGroupMin: '', ageGroupMax: '', gender: '', targetLocation: '', interests: '', languagePreference: '',
  totalBudget: '', budgetPerCreator: '', paymentModel: '', commissionRate: '',
  productDetails: '', bonusCriteria: '', performanceIncentive: '',
  startDate: '', endDate: '', applicationDeadline: '', submissionDeadline: '', contentDeadline: '',
  revisionAllowedCount: '', reviewTurnaroundHours: '', postingTimeWindow: '',
  minimumFollowers: '', requiredEngagementRate: '', preferredNiche: '', contentStyleExpectations: '',
  totalSlots: '', reserveSlots: '',
  guidelinesDos: '', guidelinesDonts: '', brandMessaging: '', requireApproval: true,
}

const OBJECTIVES = ['Brand Awareness', 'Product Promotion', 'App Install', 'Lead Generation', 'Event Promotion']
const CAMPAIGN_TYPES = ['Promotion', 'UGC', 'Review', 'Giveaway']
const POST_TYPES = ['Reel', 'Story', 'Static Post', 'Carousel', 'Live Session']
const GENDERS = ['Male', 'Female', 'All']
const PAYMENT_MODELS = ['Fixed', 'Commission', 'Barter']
const NICHES = ['Fashion', 'Fitness', 'Tech', 'Beauty', 'Travel', 'Food', 'Lifestyle', 'Health', 'Education', 'Entertainment', 'Other']

const STEPS = [
  { label: 'Details', icon: FileText },
  { label: 'Content', icon: BookOpen },
  { label: 'Audience', icon: Globe },
  { label: 'Budget', icon: IndianRupee },
  { label: 'Timeline', icon: Calendar },
  { label: 'Creators', icon: Target },
  { label: 'Guidelines', icon: Users },
]

// ── Validation ───────────────────────────────────────────────

type Errors = Record<string, string>

function validateStep(step: number, form: CampaignFormData, isDraft: boolean): Errors {
  const errors: Errors = {}
  if (isDraft) return errors // Drafts skip validation

  switch (step) {
    case 0:
      if (!form.title.trim()) errors.title = 'Title is required'
      if (!form.description.trim()) errors.description = 'Description is required'
      if (!form.objective) errors.objective = 'Objective is required'
      if (!form.campaignType) errors.campaignType = 'Campaign type is required'
      break
    case 2:
      if (!form.ageGroupMin) errors.ageGroupMin = 'Min age is required'
      else if (Number(form.ageGroupMin) < 13 || Number(form.ageGroupMin) > 65) errors.ageGroupMin = 'Age must be 13–65'
      if (!form.ageGroupMax) errors.ageGroupMax = 'Max age is required'
      else if (Number(form.ageGroupMax) < 13 || Number(form.ageGroupMax) > 65) errors.ageGroupMax = 'Age must be 13–65'
      if (form.ageGroupMin && form.ageGroupMax && Number(form.ageGroupMin) >= Number(form.ageGroupMax)) errors.ageGroupMax = 'Max must be greater than min'
      if (!form.gender) errors.gender = 'Gender is required'
      if (!form.targetLocation.trim()) errors.targetLocation = 'Location is required'
      break
    case 3:
      if (!form.totalBudget || Number(form.totalBudget) <= 0) errors.totalBudget = 'Total budget is required'
      if (!form.budgetPerCreator || Number(form.budgetPerCreator) <= 0) errors.budgetPerCreator = 'Budget per creator is required'
      if (!form.paymentModel) errors.paymentModel = 'Payment model is required'
      if (form.paymentModel === 'Commission' && (!form.commissionRate || Number(form.commissionRate) <= 0 || Number(form.commissionRate) > 100)) {
        errors.commissionRate = 'Commission rate must be 1–100%'
      }
      break
    case 4:
      if (!form.startDate) errors.startDate = 'Start date is required'
      if (!form.endDate) errors.endDate = 'End date is required'
      if (!form.applicationDeadline) errors.applicationDeadline = 'Application deadline is required'
      if (form.startDate && form.endDate && form.startDate >= form.endDate) errors.endDate = 'End date must be after start'
      if (form.applicationDeadline && form.startDate && form.applicationDeadline > form.startDate) errors.applicationDeadline = 'Deadline must be before start'
      break
    case 5:
      if (!form.minimumFollowers || Number(form.minimumFollowers) < 1) errors.minimumFollowers = 'Min followers required (≥1)'
      if (!form.preferredNiche) errors.preferredNiche = 'Niche is required'
      if (!form.totalSlots || Number(form.totalSlots) < 1) errors.totalSlots = 'At least 1 slot required'
      break
  }
  return errors
}

// ── Build payload ────────────────────────────────────────────

function buildPayload(form: CampaignFormData, status: string) {
  const csvToArr = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
  const numOrNull = (s: string) => s ? Number(s) || null : null

  return {
    status,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    objective: form.objective || undefined,
    campaignType: form.campaignType || undefined,
    platform: form.platform || 'Instagram',
    deliverables: (form.deliverables.reels || form.deliverables.stories || form.deliverables.posts) ? form.deliverables : undefined,
    postTypes: form.postTypes.length > 0 ? form.postTypes : undefined,
    contentCountPerInfluencer: numOrNull(form.contentCountPerInfluencer),
    captionGuidelines: form.captionGuidelines.trim() || undefined,
    hashtags: form.hashtags ? csvToArr(form.hashtags) : undefined,
    mentions: form.mentions ? csvToArr(form.mentions) : undefined,
    handleToTag: form.handleToTag.trim() || undefined,
    referenceVideoUrl: form.referenceVideoUrl.trim() || undefined,
    additionalReferenceLinks: form.additionalReferenceLinks ? csvToArr(form.additionalReferenceLinks) : undefined,
    ageGroupMin: numOrNull(form.ageGroupMin),
    ageGroupMax: numOrNull(form.ageGroupMax),
    gender: form.gender || undefined,
    targetLocation: form.targetLocation.trim() || undefined,
    interests: form.interests ? csvToArr(form.interests) : undefined,
    languagePreference: form.languagePreference.trim() || undefined,
    totalBudget: numOrNull(form.totalBudget),
    budgetPerCreator: numOrNull(form.budgetPerCreator),
    paymentModel: form.paymentModel || undefined,
    commissionRate: form.paymentModel === 'Commission' ? numOrNull(form.commissionRate) : undefined,
    productDetails: form.paymentModel === 'Barter' ? form.productDetails.trim() || undefined : undefined,
    bonusCriteria: form.bonusCriteria.trim() || undefined,
    performanceIncentive: form.performanceIncentive.trim() || undefined,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    applicationDeadline: form.applicationDeadline || undefined,
    submissionDeadline: form.submissionDeadline || undefined,
    contentDeadline: form.contentDeadline || undefined,
    revisionAllowedCount: numOrNull(form.revisionAllowedCount),
    reviewTurnaroundHours: numOrNull(form.reviewTurnaroundHours),
    postingTimeWindow: form.postingTimeWindow.trim() || undefined,
    minimumFollowers: numOrNull(form.minimumFollowers),
    requiredEngagementRate: numOrNull(form.requiredEngagementRate),
    preferredNiche: form.preferredNiche || undefined,
    contentStyleExpectations: form.contentStyleExpectations.trim() || undefined,
    totalSlots: numOrNull(form.totalSlots),
    reserveSlots: numOrNull(form.reserveSlots),
    guidelinesDos: form.guidelinesDos.trim() || undefined,
    guidelinesDonts: form.guidelinesDonts.trim() || undefined,
    brandMessaging: form.brandMessaging.trim() || undefined,
    requireApproval: form.requireApproval,
  }
}

// ── Main component ───────────────────────────────────────────

interface CampaignFormPageProps {
  onBack: () => void
  editingCampaignId?: string | null
  initialData?: Record<string, unknown> | null
}

export function CampaignFormPage({ onBack, editingCampaignId, initialData }: CampaignFormPageProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<CampaignFormData>(() => {
    if (!initialData) return EMPTY_FORM
    return hydrateForm(initialData)
  })
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isEdit = !!editingCampaignId

  const set = <K extends keyof CampaignFormData>(key: K, value: CampaignFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const copy = { ...e }; delete copy[key]; return copy })
  }

  const next = () => {
    const errs = validateStep(step, form, false)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    if (step < 6) setStep(step + 1)
  }

  const prev = () => { if (step > 0) setStep(step - 1) }

  const submit = async (status: 'Draft' | 'Published') => {
    const isDraft = status === 'Draft'
    if (!isDraft) {
      // Validate all required steps
      for (let s = 0; s <= 5; s++) {
        const errs = validateStep(s, form, false)
        if (Object.keys(errs).length > 0) {
          setStep(s)
          setErrors(errs)
          setSaveError('Please fix the errors before publishing.')
          return
        }
      }
    }
    setSaving(true)
    setSaveError(null)
    try {
      const payload = buildPayload(form, status)
      if (isEdit) {
        await updateCampaign(editingCampaignId!, payload as never)
      } else {
        await createCampaign(payload as never)
      }
      setSuccess(true)
    } catch (e) {
      setSaveError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  // ── Success state ──────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">
          {isEdit ? 'Campaign updated!' : 'Campaign created!'}
        </h2>
        <p className="text-sm text-gray-400">Your campaign has been saved successfully.</p>
        <DashButton onClick={onBack} className="mt-2">Back to Campaigns</DashButton>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to campaigns
        </button>
        <DashButton variant="secondary" size="sm" onClick={() => submit('Draft')} disabled={saving}>
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </DashButton>
      </div>

      <h1 className="text-xl font-semibold text-white">
        {isEdit ? 'Edit Campaign' : 'Create Campaign'}
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = i === step
          const isDone = i < step
          return (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                isActive ? 'bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30' :
                isDone ? 'bg-emerald-500/10 text-emerald-400 cursor-pointer hover:bg-emerald-500/15' :
                'text-gray-500 hover:text-gray-400'
              }`}
              disabled={i > step}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
              {isDone && <CheckCircle2 className="w-3 h-3" />}
            </button>
          )
        })}
      </div>

      {/* Form content */}
      <DashCard className="space-y-5">
        {step === 0 && <Step1 form={form} set={set} errors={errors} />}
        {step === 1 && <Step2 form={form} set={set} errors={errors} />}
        {step === 2 && <Step3 form={form} set={set} errors={errors} />}
        {step === 3 && <Step4 form={form} set={set} errors={errors} />}
        {step === 4 && <Step5 form={form} set={set} errors={errors} />}
        {step === 5 && <Step6 form={form} set={set} errors={errors} />}
        {step === 6 && <Step7 form={form} set={set} errors={errors} />}
      </DashCard>

      {/* Error */}
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-sm text-red-400">{saveError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <DashButton variant="secondary" onClick={prev} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4" /> Previous
        </DashButton>
        <div className="flex gap-3">
          {step === 6 ? (
            <DashButton onClick={() => submit('Published')} disabled={saving} size="lg">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? 'Publishing...' : 'Publish Campaign'}
            </DashButton>
          ) : (
            <DashButton onClick={next}>
              Next <ArrowRight className="w-4 h-4" />
            </DashButton>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Hydrate from existing campaign data ──────────────────────

function hydrateForm(d: Record<string, unknown>): CampaignFormData {
  const s = (k: string) => (d[k] as string) ?? ''
  const n = (k: string) => d[k] != null ? String(d[k]) : ''
  const arr = (k: string) => Array.isArray(d[k]) ? (d[k] as string[]).join(', ') : ''
  const deliverables = d.deliverables as Record<string, number> | undefined

  return {
    title: s('title'), description: s('description'), objective: s('objective'),
    campaignType: s('campaignType'), platform: s('platform') || 'Instagram',
    deliverables: { reels: deliverables?.reels ?? 0, stories: deliverables?.stories ?? 0, posts: deliverables?.posts ?? 0 },
    postTypes: Array.isArray(d.postTypes) ? d.postTypes as string[] : [],
    contentCountPerInfluencer: n('contentCountPerInfluencer'), captionGuidelines: s('captionGuidelines'),
    hashtags: arr('hashtags'), mentions: arr('mentions'), handleToTag: s('handleToTag'),
    referenceVideoUrl: s('referenceVideoUrl'), additionalReferenceLinks: arr('additionalReferenceLinks'),
    ageGroupMin: n('ageGroupMin'), ageGroupMax: n('ageGroupMax'), gender: s('gender'),
    targetLocation: s('targetLocation'), interests: arr('interests'), languagePreference: s('languagePreference'),
    totalBudget: n('totalBudget'), budgetPerCreator: n('budgetPerCreator'), paymentModel: s('paymentModel'),
    commissionRate: n('commissionRate'), productDetails: s('productDetails'),
    bonusCriteria: s('bonusCriteria'), performanceIncentive: s('performanceIncentive'),
    startDate: s('startDate')?.split('T')[0] ?? '', endDate: s('endDate')?.split('T')[0] ?? '',
    applicationDeadline: s('applicationDeadline')?.split('T')[0] ?? '',
    submissionDeadline: s('submissionDeadline')?.split('T')[0] ?? '',
    contentDeadline: s('contentDeadline')?.split('T')[0] ?? '',
    revisionAllowedCount: n('revisionAllowedCount'), reviewTurnaroundHours: n('reviewTurnaroundHours'),
    postingTimeWindow: s('postingTimeWindow'),
    minimumFollowers: n('minimumFollowers'), requiredEngagementRate: n('requiredEngagementRate'),
    preferredNiche: s('preferredNiche'), contentStyleExpectations: s('contentStyleExpectations'),
    totalSlots: n('totalSlots'), reserveSlots: n('reserveSlots'),
    guidelinesDos: s('guidelinesDos'), guidelinesDonts: s('guidelinesDonts'),
    brandMessaging: s('brandMessaging'),
    requireApproval: d.requireApproval !== false,
  }
}

// ── Step components ──────────────────────────────────────────

type StepProps = { form: CampaignFormData; set: <K extends keyof CampaignFormData>(k: K, v: CampaignFormData[K]) => void; errors: Errors }

function Step1({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Campaign Details</h3>
      <Field label="Title *" value={form.title} onChange={(v) => set('title', v)} error={errors.title} placeholder="Give your campaign a catchy name" />
      <Select label="Objective *" value={form.objective} onChange={(v) => set('objective', v)} options={OBJECTIVES} error={errors.objective} />
      <Select label="Campaign Type *" value={form.campaignType} onChange={(v) => set('campaignType', v)} options={CAMPAIGN_TYPES} error={errors.campaignType} />
      <Field label="Platform" value={form.platform} onChange={(v) => set('platform', v)} placeholder="Instagram" />
      <Field label="Description *" value={form.description} onChange={(v) => set('description', v)} error={errors.description} multiline placeholder="Describe what this campaign is about..." />
      <div>
        <p className="text-xs font-medium text-gray-400 mb-2">Deliverables</p>
        <div className="grid grid-cols-3 gap-3">
          <NumberStepper label="Reels" value={form.deliverables.reels} onChange={(v) => set('deliverables', { ...form.deliverables, reels: v })} />
          <NumberStepper label="Stories" value={form.deliverables.stories} onChange={(v) => set('deliverables', { ...form.deliverables, stories: v })} />
          <NumberStepper label="Posts" value={form.deliverables.posts} onChange={(v) => set('deliverables', { ...form.deliverables, posts: v })} />
        </div>
      </div>
    </div>
  )
}

function Step2({ form, set }: StepProps) {
  const toggle = (t: string) => {
    const next = form.postTypes.includes(t) ? form.postTypes.filter((x) => x !== t) : [...form.postTypes, t]
    set('postTypes', next)
  }
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Content Requirements</h3>
      <div>
        <p className="text-xs font-medium text-gray-400 mb-2">Post Types</p>
        <div className="flex flex-wrap gap-2">
          {POST_TYPES.map((t) => (
            <button key={t} onClick={() => toggle(t)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.postTypes.includes(t) ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>{t}</button>
          ))}
        </div>
      </div>
      <Field label="Content Count (per creator)" value={form.contentCountPerInfluencer} onChange={(v) => set('contentCountPerInfluencer', v)} type="number" />
      <Field label="Handle to Tag" value={form.handleToTag} onChange={(v) => set('handleToTag', v)} placeholder="@yourbrand" />
      <Field label="Hashtags (comma-separated)" value={form.hashtags} onChange={(v) => set('hashtags', v)} placeholder="#brandname, #campaign" />
      <Field label="Mentions (comma-separated)" value={form.mentions} onChange={(v) => set('mentions', v)} placeholder="@account1, @account2" />
      <Field label="Caption Guidelines" value={form.captionGuidelines} onChange={(v) => set('captionGuidelines', v)} multiline placeholder="Instructions for captions..." />
      <Field label="Reference Video URL" value={form.referenceVideoUrl} onChange={(v) => set('referenceVideoUrl', v)} placeholder="https://..." />
      <Field label="Additional Links (comma-separated)" value={form.additionalReferenceLinks} onChange={(v) => set('additionalReferenceLinks', v)} placeholder="https://link1.com, https://link2.com" />
    </div>
  )
}

function Step3({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Target Audience</h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Min Age *" value={form.ageGroupMin} onChange={(v) => set('ageGroupMin', v)} type="number" error={errors.ageGroupMin} placeholder="13" />
        <Field label="Max Age *" value={form.ageGroupMax} onChange={(v) => set('ageGroupMax', v)} type="number" error={errors.ageGroupMax} placeholder="65" />
      </div>
      <Select label="Gender *" value={form.gender} onChange={(v) => set('gender', v)} options={GENDERS} error={errors.gender} />
      <Field label="Target Location *" value={form.targetLocation} onChange={(v) => set('targetLocation', v)} error={errors.targetLocation} placeholder="e.g. India, Mumbai" />
      <Field label="Interests (comma-separated)" value={form.interests} onChange={(v) => set('interests', v)} placeholder="Fashion, Fitness, Tech" />
      <Field label="Language Preference" value={form.languagePreference} onChange={(v) => set('languagePreference', v)} placeholder="e.g. English, Hindi" />
    </div>
  )
}

function Step4({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Budget & Payment</h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Budget Per Creator (₹) *" value={form.budgetPerCreator} onChange={(v) => set('budgetPerCreator', v)} type="number" error={errors.budgetPerCreator} />
        <Field label="Total Budget (₹) *" value={form.totalBudget} onChange={(v) => set('totalBudget', v)} type="number" error={errors.totalBudget} />
      </div>
      <Select label="Payment Model *" value={form.paymentModel} onChange={(v) => set('paymentModel', v)} options={PAYMENT_MODELS} error={errors.paymentModel} />
      {form.paymentModel === 'Commission' && (
        <Field label="Commission Rate (%) *" value={form.commissionRate} onChange={(v) => set('commissionRate', v)} type="number" error={errors.commissionRate} placeholder="e.g. 15" />
      )}
      {form.paymentModel === 'Barter' && (
        <Field label="Product Details" value={form.productDetails} onChange={(v) => set('productDetails', v)} multiline placeholder="Describe the product/service offered..." />
      )}
      <Field label="Bonus Criteria" value={form.bonusCriteria} onChange={(v) => set('bonusCriteria', v)} placeholder="e.g. 10K+ views bonus ₹500" />
      <Field label="Performance Incentive" value={form.performanceIncentive} onChange={(v) => set('performanceIncentive', v)} placeholder="e.g. Top performer gets ₹5000" />
    </div>
  )
}

function Step5({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Timeline</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Start Date *" value={form.startDate} onChange={(v) => set('startDate', v)} type="date" error={errors.startDate} />
        <Field label="End Date *" value={form.endDate} onChange={(v) => set('endDate', v)} type="date" error={errors.endDate} />
        <Field label="Application Deadline *" value={form.applicationDeadline} onChange={(v) => set('applicationDeadline', v)} type="date" error={errors.applicationDeadline} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Submission Deadline" value={form.submissionDeadline} onChange={(v) => set('submissionDeadline', v)} type="date" />
        <Field label="Content Go-Live Deadline" value={form.contentDeadline} onChange={(v) => set('contentDeadline', v)} type="date" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Max Revisions" value={form.revisionAllowedCount} onChange={(v) => set('revisionAllowedCount', v)} type="number" placeholder="e.g. 2" />
        <Field label="Review Turnaround (hrs)" value={form.reviewTurnaroundHours} onChange={(v) => set('reviewTurnaroundHours', v)} type="number" placeholder="e.g. 48" />
        <Field label="Posting Window" value={form.postingTimeWindow} onChange={(v) => set('postingTimeWindow', v)} placeholder="e.g. 6-9 PM IST" />
      </div>
    </div>
  )
}

function Step6({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Creator Requirements & Slots</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Minimum Followers *" value={form.minimumFollowers} onChange={(v) => set('minimumFollowers', v)} type="number" error={errors.minimumFollowers} placeholder="e.g. 10000" />
        <Field label="Engagement Rate (%)" value={form.requiredEngagementRate} onChange={(v) => set('requiredEngagementRate', v)} type="number" placeholder="e.g. 3.5" />
      </div>
      <Select label="Preferred Niche *" value={form.preferredNiche} onChange={(v) => set('preferredNiche', v)} options={NICHES} error={errors.preferredNiche} />
      <Field label="Content Style" value={form.contentStyleExpectations} onChange={(v) => set('contentStyleExpectations', v)} placeholder="e.g. Aesthetic, raw, informative" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Total Slots *" value={form.totalSlots} onChange={(v) => set('totalSlots', v)} type="number" error={errors.totalSlots} placeholder="e.g. 10" />
        <Field label="Reserve Slots" value={form.reserveSlots} onChange={(v) => set('reserveSlots', v)} type="number" placeholder="e.g. 2" />
      </div>
    </div>
  )
}

function Step7({ form, set }: StepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Guidelines & Approval</h3>
      <Field label="Do's" value={form.guidelinesDos} onChange={(v) => set('guidelinesDos', v)} multiline placeholder="List what creators should do..." />
      <Field label="Don'ts" value={form.guidelinesDonts} onChange={(v) => set('guidelinesDonts', v)} multiline placeholder="List what creators should avoid..." />
      <Field label="Brand Messaging" value={form.brandMessaging} onChange={(v) => set('brandMessaging', v)} multiline placeholder="Key messages to communicate..." />
      <div className="flex items-center gap-3">
        <button
          onClick={() => set('requireApproval', !form.requireApproval)}
          className={`w-10 h-6 rounded-full transition-colors relative ${form.requireApproval ? 'bg-purple-500' : 'bg-white/10'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.requireApproval ? 'left-5' : 'left-1'}`} />
        </button>
        <span className="text-sm text-gray-300">Require content approval before posting</span>
      </div>
    </div>
  )
}

// ── Shared form primitives ───────────────────────────────────

function Field({ label, value, onChange, error, placeholder, type = 'text', multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string; type?: string; multiline?: boolean
}) {
  const cls = `w-full rounded-lg border ${error ? 'border-red-500/50' : 'border-white/10'} bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all`
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={`${cls} resize-none`} placeholder={placeholder} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder={placeholder} />
      )}
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}

function Select({ label, value, onChange, options, error }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; error?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border ${error ? 'border-red-500/50' : 'border-white/10'} bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 [&>option]:bg-gray-900`}
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}

function NumberStepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-center">
      <p className="text-[11px] text-gray-500 mb-2">{label}</p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10">−</button>
        <span className="text-lg font-bold text-white w-6 text-center">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center hover:bg-purple-500/30">+</button>
      </div>
    </div>
  )
}

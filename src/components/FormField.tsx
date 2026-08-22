import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  htmlFor?: string
}

function FieldWrapper({ label, hint, error, required, children, htmlFor }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="ml-0.5 text-pink-400">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-pink-400">{error}</p>}
    </div>
  )
}

const fieldBase =
  'w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/60 disabled:opacity-50'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  required?: boolean
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, hint, error, required, className = '', id, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <FieldWrapper label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <input
          ref={ref}
          id={inputId}
          className={`${fieldBase} ${error ? 'border-pink-500/60' : 'border-white/10'} ${className}`}
          {...props}
        />
      </FieldWrapper>
    )
  },
)
FormInput.displayName = 'FormInput'

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  required?: boolean
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, hint, error, required, className = '', id, rows = 4, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <FieldWrapper label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`${fieldBase} resize-none ${error ? 'border-pink-500/60' : 'border-white/10'} ${className}`}
          {...props}
        />
      </FieldWrapper>
    )
  },
)
FormTextarea.displayName = 'FormTextarea'

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, hint, error, required, className = '', id, placeholder, children, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <FieldWrapper label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <select
          ref={ref}
          id={inputId}
          className={`${fieldBase} pr-8 ${error ? 'border-pink-500/60' : 'border-white/10'} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-gray-500">
              {placeholder}
            </option>
          )}
          {children}
        </select>
      </FieldWrapper>
    )
  },
)
FormSelect.displayName = 'FormSelect'

import Select from 'react-select'
import { CustomField } from './CustomFieldManager'

interface CustomFieldRendererProps {
  field: CustomField
  value: any
  onChange: (value: any) => void
  error?: string
}

export default function CustomFieldRenderer({ field, value, onChange, error }: CustomFieldRendererProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
            rows={3}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
            required={field.required}
          />
        )

      case 'select':
        const selectOptions = (field.options || []).map(opt => ({
          value: opt.value,
          label: opt.label
        }))
        
        return (
          <Select
            options={selectOptions}
            value={selectOptions.find(opt => opt.value === value) || null}
            onChange={(option) => onChange(option?.value || '')}
            placeholder={field.placeholder || 'Selecione uma opção'}
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
            required={field.required}
          />
        )

      case 'multiselect':
        const multiselectOptions = (field.options || []).map(opt => ({
          value: opt.value,
          label: opt.label
        }))
        
        const selectedValues = Array.isArray(value) ? value : []
        const selectedOptions = multiselectOptions.filter(opt => 
          selectedValues.includes(opt.value)
        )
        
        return (
          <Select
            options={multiselectOptions}
            value={selectedOptions}
            onChange={(options) => onChange((options || []).map(opt => opt.value))}
            placeholder={field.placeholder || 'Selecione uma ou mais opções'}
            isMulti
            className="react-select-container"
            classNamePrefix="react-select"
            required={field.required}
          />
        )

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="mr-2 text-primary-600 focus:ring-primary-500"
              required={field.required}
            />
            <span className="text-sm text-gray-700">
              {field.placeholder || 'Marcar esta opção'}
            </span>
          </label>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {(field.options || []).map((option) => (
              <label key={option.id} className="flex items-center">
                <input
                  type="radio"
                  name={`radio_${field.id}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                  required={field.required}
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <label className="form-label">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
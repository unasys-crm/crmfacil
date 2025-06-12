import React, { useState } from 'react'
import { Plus, Edit, Trash2, X, Check, Settings, ChevronDown, ChevronUp } from 'lucide-react'

export interface CustomFieldOption {
  id: string
  label: string
  value: string
}

export interface CustomField {
  id: string
  name: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio'
  required: boolean
  placeholder?: string
  options?: CustomFieldOption[]
  defaultValue?: string | string[]
}

interface CustomFieldManagerProps {
  fields: CustomField[]
  onFieldsChange: (fields: CustomField[]) => void
  isOpen: boolean
  onToggle: () => void
}

export default function CustomFieldManager({ fields, onFieldsChange, isOpen, onToggle }: CustomFieldManagerProps) {
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [newField, setNewField] = useState<Partial<CustomField>>({
    name: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: []
  })

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'textarea', label: 'Texto Longo' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' },
    { value: 'select', label: 'Lista (Seleção Única)' },
    { value: 'multiselect', label: 'Lista (Múltipla Seleção)' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Opções (Radio)' }
  ]

  const needsOptions = (type: string) => ['select', 'multiselect', 'radio'].includes(type)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addField = () => {
    if (!newField.name?.trim()) return

    const field: CustomField = {
      id: generateId(),
      name: newField.name.trim(),
      type: newField.type as CustomField['type'],
      required: newField.required || false,
      placeholder: newField.placeholder || '',
      options: needsOptions(newField.type!) ? (newField.options || []) : undefined
    }

    onFieldsChange([...fields, field])
    setNewField({
      name: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: []
    })
  }

  const updateField = (field: CustomField) => {
    const updatedFields = fields.map(f => f.id === field.id ? field : f)
    onFieldsChange(updatedFields)
    setEditingField(null)
  }

  const removeField = (fieldId: string) => {
    onFieldsChange(fields.filter(f => f.id !== fieldId))
  }

  const addOption = (field: CustomField | Partial<CustomField>, isEditing = false) => {
    const newOption: CustomFieldOption = {
      id: generateId(),
      label: '',
      value: ''
    }

    const updatedOptions = [...(field.options || []), newOption]

    if (isEditing && editingField) {
      setEditingField({ ...editingField, options: updatedOptions })
    } else {
      setNewField({ ...newField, options: updatedOptions })
    }
  }

  const updateOption = (field: CustomField | Partial<CustomField>, optionId: string, updates: Partial<CustomFieldOption>, isEditing = false) => {
    const updatedOptions = (field.options || []).map(opt => 
      opt.id === optionId ? { ...opt, ...updates } : opt
    )

    if (isEditing && editingField) {
      setEditingField({ ...editingField, options: updatedOptions })
    } else {
      setNewField({ ...newField, options: updatedOptions })
    }
  }

  const removeOption = (field: CustomField | Partial<CustomField>, optionId: string, isEditing = false) => {
    const updatedOptions = (field.options || []).filter(opt => opt.id !== optionId)

    if (isEditing && editingField) {
      setEditingField({ ...editingField, options: updatedOptions })
    } else {
      setNewField({ ...newField, options: updatedOptions })
    }
  }

  const FieldEditor = ({ field, isNew = false }: { field: CustomField | Partial<CustomField>, isNew?: boolean }) => (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Nome do Campo *</label>
          <input
            type="text"
            value={field.name || ''}
            onChange={(e) => {
              if (isNew) {
                setNewField({ ...newField, name: e.target.value })
              } else if (editingField) {
                setEditingField({ ...editingField, name: e.target.value })
              }
            }}
            className="form-input"
            placeholder="Ex: Área de Atuação"
          />
        </div>

        <div>
          <label className="form-label">Tipo do Campo *</label>
          <select
            value={field.type || 'text'}
            onChange={(e) => {
              const newType = e.target.value as CustomField['type']
              if (isNew) {
                setNewField({ 
                  ...newField, 
                  type: newType,
                  options: needsOptions(newType) ? [] : undefined
                })
              } else if (editingField) {
                setEditingField({ 
                  ...editingField, 
                  type: newType,
                  options: needsOptions(newType) ? (editingField.options || []) : undefined
                })
              }
            }}
            className="form-input"
          >
            {fieldTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Placeholder</label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => {
              if (isNew) {
                setNewField({ ...newField, placeholder: e.target.value })
              } else if (editingField) {
                setEditingField({ ...editingField, placeholder: e.target.value })
              }
            }}
            className="form-input"
            placeholder="Texto de ajuda"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) => {
                if (isNew) {
                  setNewField({ ...newField, required: e.target.checked })
                } else if (editingField) {
                  setEditingField({ ...editingField, required: e.target.checked })
                }
              }}
              className="mr-2 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Campo obrigatório</span>
          </label>
        </div>
      </div>

      {/* Options for select, multiselect, radio */}
      {needsOptions(field.type!) && (
        <div>
          <label className="form-label">Opções</label>
          <div className="space-y-2">
            {(field.options || []).map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateOption(field, option.id, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }, !isNew)}
                  className="form-input flex-1"
                  placeholder="Rótulo da opção"
                />
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => updateOption(field, option.id, { value: e.target.value }, !isNew)}
                  className="form-input w-32"
                  placeholder="Valor"
                />
                <button
                  type="button"
                  onClick={() => removeOption(field, option.id, !isNew)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(field, !isNew)}
              className="btn-secondary text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Opção
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {isNew ? (
          <>
            <button
              type="button"
              onClick={() => setNewField({
                name: '',
                type: 'text',
                required: false,
                placeholder: '',
                options: []
              })}
              className="btn-secondary text-sm"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={addField}
              disabled={!newField.name?.trim()}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Campo
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditingField(null)}
              className="btn-secondary text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => updateField(editingField as CustomField)}
              disabled={!editingField?.name?.trim()}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 mr-1" />
              Salvar
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Campos Personalizados
        </h3>
        <button
          type="button"
          onClick={onToggle}
          className="btn-secondary text-sm"
        >
          <Settings className="h-4 w-4 mr-1" />
          Gerenciar Campos
          {isOpen ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </button>
      </div>

      {/* Field Manager */}
      {isOpen && (
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Gerenciar Campos Personalizados
            </h4>
            
            {/* Existing Fields List */}
            {fields.length > 0 && (
              <div className="space-y-3 mb-4">
                <h5 className="text-sm font-medium text-gray-700">Campos Existentes</h5>
                {fields.map((field) => (
                  <div key={field.id}>
                    {editingField?.id === field.id ? (
                      <FieldEditor field={editingField} />
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{field.name}</span>
                            {field.required && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                Obrigatório
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {fieldTypes.find(t => t.value === field.type)?.label}
                            </span>
                            {field.options && field.options.length > 0 && (
                              <span className="text-xs text-gray-500">
                                ({field.options.length} opções)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => setEditingField(field)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeField(field.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Field */}
            <div className="border-t pt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Adicionar Novo Campo</h5>
              <FieldEditor field={newField} isNew />
            </div>
          </div>
        </div>
      )}

      {/* Display Fields (for form usage) */}
      {!isOpen && fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum campo personalizado criado.</p>
          <p className="text-sm">Use o gerenciador para adicionar campos personalizados.</p>
        </div>
      )}
    </div>
  )
}
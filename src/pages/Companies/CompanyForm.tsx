import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, ArrowLeft, Search, Plus, X, Palette, Check, Edit, Trash2, Settings } from 'lucide-react'
import InputMask from 'react-input-mask'
import Select from 'react-select'
import CustomFieldManager, { CustomField } from '../../components/CustomFields/CustomFieldManager'
import CustomFieldRenderer from '../../components/CustomFields/CustomFieldRenderer'
import ClientSelector from '../../components/ClientSelector/ClientSelector'

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  razao_social: z.string().optional(),
  cnpj: z.string().optional(),
  segment: z.string().optional(),
  origin: z.string().optional(),
  store_count: z.number().min(0).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  cep: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  responsible_ids: z.array(z.string()).optional(),
  observations: z.string().optional(),
  tags: z.array(z.string()).optional(),
  associated_clients: z.array(z.any()).optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

// Mock data for selects
const segments = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'industria', label: 'Indústria' },
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
]

const origins = [
  { value: 'site', label: 'Site' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'email', label: 'Email' },
  { value: 'evento', label: 'Evento' },
  { value: 'redes-sociais', label: 'Redes Sociais' },
]

const salespeople = [
  { value: '1', label: 'Maria Santos' },
  { value: '2', label: 'Pedro Oliveira' },
  { value: '3', label: 'Ana Costa' },
]

export default function CompanyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  // Custom Fields Management
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomField[]>([
    {
      id: '1',
      name: 'Área de Atuação',
      type: 'select',
      required: false,
      placeholder: 'Selecione a área principal',
      options: [
        { id: '1', label: 'Varejo', value: 'varejo' },
        { id: '2', label: 'Atacado', value: 'atacado' },
        { id: '3', label: 'E-commerce', value: 'ecommerce' },
        { id: '4', label: 'Serviços', value: 'servicos' }
      ]
    },
    {
      id: '2',
      name: 'Canais de Venda',
      type: 'multiselect',
      required: false,
      placeholder: 'Selecione os canais utilizados',
      options: [
        { id: '1', label: 'Loja Física', value: 'loja_fisica' },
        { id: '2', label: 'Site Próprio', value: 'site_proprio' },
        { id: '3', label: 'Marketplace', value: 'marketplace' },
        { id: '4', label: 'Redes Sociais', value: 'redes_sociais' },
        { id: '5', label: 'WhatsApp Business', value: 'whatsapp' }
      ]
    },
    {
      id: '3',
      name: 'Possui Sistema ERP',
      type: 'checkbox',
      required: false,
      placeholder: 'Empresa possui sistema de gestão integrado'
    }
  ])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({})
  const [showCustomFieldManager, setShowCustomFieldManager] = useState(false)
  
  const [tags, setTags] = useState<Array<{ name: string; color: string }>>([])
  const [newTag, setNewTag] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)
  const [availableTags, setAvailableTags] = useState([
    { name: 'Cliente Premium', color: '#10b981' },
    { name: 'Prospect', color: '#f59e0b' },
    { name: 'Ativo', color: '#3b82f6' },
    { name: 'Inativo', color: '#ef4444' },
    { name: 'VIP', color: '#8b5cf6' },
    { name: 'Novo Cliente', color: '#06b6d4' },
    { name: 'Renovação', color: '#84cc16' },
    { name: 'Urgente', color: '#f97316' },
  ])
  const [editingTag, setEditingTag] = useState<{ index: number; name: string; color: string } | null>(null)
  const [newAvailableTag, setNewAvailableTag] = useState('')
  const [newAvailableTagColor, setNewAvailableTagColor] = useState('#3b82f6')
  const [associatedClients, setAssociatedClients] = useState<any[]>([])

  const predefinedColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
    '#6b7280', '#ec4899', '#14b8a6', '#f43f5e'
  ]
  const [cnpjData, setCnpjData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      razao_social: '',
      cnpj: '',
      segment: '',
      origin: '',
      store_count: 1,
      email: '',
      phone: '',
      cep: '',
      address: '',
      city: '',
      state: '',
      observations: '',
      tags: [],
      responsible_ids: [],
      associated_clients: [],
    },
  })

  const watchedCep = watch('cep')
  const watchedCnpj = watch('cnpj')

  // CEP lookup function
  const handleCepLookup = async () => {
    if (watchedCep && watchedCep.length === 9) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${watchedCep.replace('-', '')}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setValue('address', `${data.logradouro}, ${data.bairro}`)
          setValue('city', data.localidade)
          setValue('state', data.uf)
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  // CNPJ lookup function (mock - in real app would use API Brasil)
  const handleCnpjLookup = async () => {
    if (watchedCnpj && watchedCnpj.length === 18) {
      try {
        // Mock CNPJ data - in real app would call API Brasil
        const mockData = {
          razao_social: 'Empresa Exemplo Ltda',
          nome_fantasia: 'Empresa Exemplo',
          endereco: 'Rua das Flores, 123',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01234-567',
          telefone: '(11) 1234-5678',
          email: 'contato@exemplo.com'
        }
        
        setCnpjData(mockData)
        setValue('razao_social', mockData.razao_social)
        setValue('name', mockData.nome_fantasia)
        setValue('address', mockData.endereco)
        setValue('city', mockData.cidade)
        setValue('state', mockData.uf)
        setValue('cep', mockData.cep)
        setValue('phone', mockData.telefone)
        setValue('email', mockData.email)
      } catch (error) {
        console.error('Erro ao buscar CNPJ:', error)
      }
    }
  }

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    // Clear error when user starts typing
    if (customFieldErrors[fieldId]) {
      setCustomFieldErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }))
    }
  }

  const validateCustomFields = () => {
    const errors: Record<string, string> = {}
    
    customFieldDefinitions.forEach(field => {
      if (field.required) {
        const value = customFieldValues[field.id]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors[field.id] = `${field.name} é obrigatório`
        }
      }
    })
    
    setCustomFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const addTag = () => {
    if (newTag.trim() && !tags.some(tag => tag.name === newTag.trim())) {
      const updatedTags = [...tags, { name: newTag.trim(), color: selectedColor }]
      setTags(updatedTags)
      setValue('tags', updatedTags.map(tag => tag.name))
      setNewTag('')
      setShowColorPicker(false)
    }
  }

  const addExistingTag = (tagToAdd: { name: string; color: string }) => {
    if (!tags.some(tag => tag.name === tagToAdd.name)) {
      const updatedTags = [...tags, tagToAdd]
      setTags(updatedTags)
      setValue('tags', updatedTags.map(tag => tag.name))
    }
  }

  const removeTag = (tagToRemove: { name: string; color: string }) => {
    const updatedTags = tags.filter(tag => tag.name !== tagToRemove.name)
    setTags(updatedTags)
    setValue('tags', updatedTags.map(tag => tag.name))
  }

  const addAvailableTag = () => {
    if (newAvailableTag.trim() && !availableTags.some(tag => tag.name === newAvailableTag.trim())) {
      setAvailableTags([...availableTags, { name: newAvailableTag.trim(), color: newAvailableTagColor }])
      setNewAvailableTag('')
      setNewAvailableTagColor('#3b82f6')
    }
  }

  const updateAvailableTag = (index: number, name: string, color: string) => {
    if (name.trim() && !availableTags.some((tag, i) => i !== index && tag.name === name.trim())) {
      const updated = [...availableTags]
      updated[index] = { name: name.trim(), color }
      setAvailableTags(updated)
      setEditingTag(null)
    }
  }

  const removeAvailableTag = (index: number) => {
    const tagToRemove = availableTags[index]
    setAvailableTags(availableTags.filter((_, i) => i !== index))
    // Remove from selected tags if it was selected
    const updatedTags = tags.filter(tag => tag.name !== tagToRemove.name)
    setTags(updatedTags)
    setValue('tags', updatedTags.map(tag => tag.name))
  }

  const onSubmit = async (data: CompanyFormData) => {
    try {
      // Validate custom fields
      if (!validateCustomFields()) {
        return
      }
      
      // Here you would save to your database
      console.log('Saving company:', { 
        ...data, 
        associated_clients: associatedClients,
        customFields: customFieldValues,
        customFieldDefinitions 
      })
      navigate('/companies')
    } catch (error) {
      console.error('Error saving company:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/companies')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Empresa' : 'Nova Empresa'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Atualize as informações da empresa' : 'Cadastre uma nova empresa'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nome da Empresa *</label>
              <input
                {...register('name')}
                className="form-input"
                placeholder="Nome fantasia"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Razão Social</label>
              <input
                {...register('razao_social')}
                className="form-input"
                placeholder="Razão social completa"
              />
            </div>

            <div>
              <label className="form-label">CNPJ</label>
              <div className="flex">
                <InputMask
                  mask="99.999.999/9999-99"
                  {...register('cnpj')}
                  className="form-input rounded-r-none"
                  placeholder="00.000.000/0000-00"
                />
                <button
                  type="button"
                  onClick={handleCnpjLookup}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                  title="Consultar CNPJ"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Quantidade de Lojas</label>
              <input
                {...register('store_count', { valueAsNumber: true })}
                type="number"
                min="1"
                className="form-input"
                placeholder="1"
              />
            </div>

            <div>
              <label className="form-label">Segmento</label>
              <Select
                options={segments}
                placeholder="Selecione o segmento"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
                onChange={(option) => setValue('segment', option?.value || '')}
              />
            </div>

            <div>
              <label className="form-label">Origem</label>
              <Select
                options={origins}
                placeholder="Como conheceu a empresa?"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
                onChange={(option) => setValue('origin', option?.value || '')}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informações de Contato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email</label>
              <input
                {...register('email')}
                type="email"
                className="form-input"
                placeholder="contato@empresa.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Telefone</label>
              <InputMask
                mask="(99) 99999-9999"
                {...register('phone')}
                className="form-input"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Endereço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">CEP</label>
              <div className="flex">
                <InputMask
                  mask="99999-999"
                  {...register('cep')}
                  className="form-input rounded-r-none"
                  placeholder="00000-000"
                />
                <button
                  type="button"
                  onClick={handleCepLookup}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Endereço Completo</label>
              <input
                {...register('address')}
                className="form-input"
                placeholder="Rua, número, bairro"
              />
            </div>

            <div>
              <label className="form-label">Cidade</label>
              <input
                {...register('city')}
                className="form-input"
                placeholder="Cidade"
              />
            </div>

            <div>
              <label className="form-label">Estado</label>
              <input
                {...register('state')}
                className="form-input"
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        {/* Responsible */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Responsáveis
          </h3>
          <div>
            <label className="form-label">Responsáveis</label>
            <Select
              options={salespeople}
              placeholder="Selecione os responsáveis"
              isMulti
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {/* Associated Clients */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Contatos da Empresa
          </h3>
          <ClientSelector
            selectedClients={associatedClients}
            onClientsChange={setAssociatedClients}
          />
        </div>

        {/* Tags */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Marcadores
            </h3>
            <button
              type="button"
              onClick={() => setShowTagManager(!showTagManager)}
              className="btn-secondary text-sm"
            >
              <Settings className="h-4 w-4 mr-1" />
              Gerenciar Marcadores
            </button>
          </div>

          {/* Tag Manager */}
          {showTagManager && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Gerenciar Marcadores Disponíveis
              </h4>
              
              {/* Available Tags List */}
              <div className="space-y-2 mb-4">
                {availableTags.map((tag, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    {editingTag?.index === index ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                          className="form-input flex-1 text-sm"
                          placeholder="Nome do marcador"
                        />
                        <input
                          type="color"
                          value={editingTag.color}
                          onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                          className="w-8 h-8 rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => updateAvailableTag(index, editingTag.name, editingTag.color)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTag(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => setEditingTag({ index, name: tag.name, color: tag.color })}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAvailableTag(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Available Tag */}
              <div className="border-t pt-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAvailableTag}
                    onChange={(e) => setNewAvailableTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAvailableTag())}
                    className="form-input flex-1 text-sm"
                    placeholder="Nome do novo marcador"
                  />
                  <input
                    type="color"
                    value={newAvailableTagColor}
                    onChange={(e) => setNewAvailableTagColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={addAvailableTag}
                    disabled={!newAvailableTag.trim()}
                    className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Available Tags */}
            <div>
              <label className="form-label">Marcadores Disponíveis</label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                {availableTags.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => addExistingTag(tag)}
                    disabled={tags.some(t => t.name === tag.name)}
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all
                      ${tags.some(t => t.name === tag.name)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-105 cursor-pointer'
                      }
                    `}
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      border: `1px solid ${tag.color}40`
                    }}
                  >
                    {tags.some(t => t.name === tag.name) && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {tag.name}
                  </button>
                ))}
                {availableTags.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    Nenhum marcador disponível. Use o gerenciador para adicionar marcadores.
                  </p>
                )}
              </div>
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.name}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    border: `1px solid ${tag.color}40`
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:opacity-70"
                    style={{ color: tag.color }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add New Tag */}
            <div className="border-t pt-4">
              <label className="form-label">Criar Novo Marcador</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="form-input flex-1"
                  placeholder="Nome do marcador"
                />
                
                {/* Color Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <Palette className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {showColorPicker && (
                    <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                      <div className="grid grid-cols-4 gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setSelectedColor(color)
                              setShowColorPicker(false)
                            }}
                            className={`
                              w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform
                              ${selectedColor === color ? 'border-gray-800' : 'border-gray-300'}
                            `}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full h-8 rounded border border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Fields */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Campos Personalizados
            </h3>
            <button
              type="button"
              onClick={() => setShowCustomFieldManager(!showCustomFieldManager)}
              className="btn-secondary text-sm"
            >
              <Settings className="h-4 w-4 mr-1" />
              Gerenciar Campos
            </button>
          </div>

          {showCustomFieldManager && (
            <div className="mb-6">
              <CustomFieldManager
                fields={customFieldDefinitions}
                onFieldsChange={setCustomFieldDefinitions}
              />
            </div>
          )}

          <div className="space-y-4">
            {customFieldDefinitions.map((field) => (
              <div key={field.id}>
                <CustomFieldRenderer
                  field={field}
                  value={customFieldValues[field.id]}
                  onChange={(value) => handleCustomFieldChange(field.id, value)}
                  error={customFieldErrors[field.id]}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Observations */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Observações
          </h3>
          <div>
            <label className="form-label">Observações Gerais</label>
            <textarea
              {...register('observations')}
              rows={4}
              className="form-input"
              placeholder="Informações adicionais sobre a empresa..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/companies')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar Empresa'}
          </button>
        </div>
      </form>
    </div>
  )
}
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, ArrowLeft, Search, Plus, X } from 'lucide-react'
import InputMask from 'react-input-mask'
import Select from 'react-select'

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

  const [customFields, setCustomFields] = useState<Array<{ name: string; value: string; type: string }>>([])
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldType, setNewFieldType] = useState('text')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
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

  const addCustomField = () => {
    if (newFieldName.trim()) {
      setCustomFields([...customFields, {
        name: newFieldName,
        value: '',
        type: newFieldType
      }])
      setNewFieldName('')
    }
  }

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      setValue('tags', updatedTags)
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    setTags(updatedTags)
    setValue('tags', updatedTags)
  }

  const onSubmit = async (data: CompanyFormData) => {
    try {
      // Here you would save to your database
      console.log('Saving company:', { ...data, customFields })
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

        {/* Tags */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Marcadores
          </h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="form-input rounded-r-none"
                placeholder="Adicionar marcador"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-primary-50 hover:bg-primary-100 text-primary-600"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Fields */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Campos Personalizados
          </h3>
          <div className="space-y-4">
            {customFields.map((field, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="form-label">{field.name}</label>
                  {field.type === 'text' && (
                    <input
                      type="text"
                      className="form-input"
                      value={field.value}
                      onChange={(e) => {
                        const updated = [...customFields]
                        updated[index].value = e.target.value
                        setCustomFields(updated)
                      }}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      className="form-input"
                      rows={3}
                      value={field.value}
                      onChange={(e) => {
                        const updated = [...customFields]
                        updated[index].value = e.target.value
                        setCustomFields(updated)
                      }}
                    />
                  )}
                  {field.type === 'number' && (
                    <input
                      type="number"
                      className="form-input"
                      value={field.value}
                      onChange={(e) => {
                        const updated = [...customFields]
                        updated[index].value = e.target.value
                        setCustomFields(updated)
                      }}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomField(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Nome do campo"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                  className="form-input w-32"
                >
                  <option value="text">Texto</option>
                  <option value="textarea">Texto Longo</option>
                  <option value="number">Número</option>
                  <option value="date">Data</option>
                </select>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="btn-secondary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Observations */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Observações
          </h3>
          <textarea
            {...register('observations')}
            rows={4}
            className="form-input"
            placeholder="Observações sobre a empresa..."
          />
        </div>

        {/* Actions */}
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
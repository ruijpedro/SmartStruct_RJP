import type { ModuleId } from './types'

export interface ModuleItem {
  id: ModuleId
  label: string
  group: string
  status: 'ready' | 'planned'
}

export const modules: ModuleItem[] = [
  { id: 'dashboard', label: 'Início', group: 'Geral', status: 'ready' },
  { id: 'beams', label: 'Vigas', group: 'Análise Estrutural', status: 'ready' },
  { id: 'frames', label: 'Pórticos', group: 'Análise Estrutural', status: 'ready' },
  { id: 'trusses', label: 'Treliças', group: 'Análise Estrutural', status: 'ready' },
  { id: 'combinations', label: 'Combinações', group: 'Análise Estrutural', status: 'ready' },
  { id: 'columns', label: 'Pilares', group: 'Betão Armado', status: 'ready' },
  { id: 'slabs', label: 'Lajes', group: 'Betão Armado', status: 'ready' },
  { id: 'foundations', label: 'Sapatas', group: 'Fundações', status: 'ready' },
  { id: 'walls', label: 'Muros', group: 'Contenção', status: 'ready' },
  { id: 'geotechnics', label: 'Solos e Ensaios', group: 'Geotecnia', status: 'planned' },
  { id: 'slopes', label: 'Taludes', group: 'Geotecnia', status: 'planned' },
  { id: 'hydraulics', label: 'Hidráulica', group: 'Infraestruturas', status: 'planned' },
  { id: 'roads', label: 'Estradas', group: 'Infraestruturas Viárias', status: 'ready' },
  { id: 'cycleways', label: 'Ciclovias', group: 'Infraestruturas Viárias', status: 'planned' },
  { id: 'roundabouts', label: 'Rotundas', group: 'Infraestruturas Viárias', status: 'planned' },
  { id: 'library', label: 'Biblioteca Técnica', group: 'Ferramentas', status: 'planned' },
  { id: 'tools', label: 'Ferramentas', group: 'Ferramentas', status: 'planned' },
  { id: 'settings', label: 'Configurações', group: 'Ferramentas', status: 'planned' },
]

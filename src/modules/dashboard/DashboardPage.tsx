import type { ModuleId } from '../../app/types'
import { Icon } from '../../ui/Icon'

const quick: { id: ModuleId; label: string; code: string; tone: string }[] = [
  { id: 'beams', label: 'VIGAS', code: 'EC2', tone: 'blue' },
  { id: 'columns', label: 'PILARES', code: 'EC2', tone: 'green' },
  { id: 'slabs', label: 'LAJES', code: 'EC2', tone: 'orange' },
  { id: 'foundations', label: 'FUNDAÇÕES', code: 'EC7', tone: 'purple' },
  { id: 'walls', label: 'CONTENÇÃO', code: 'EC7', tone: 'teal' },
  { id: 'roads', label: 'ESTRADAS', code: 'VIÁRIO', tone: 'red' },
  { id: 'hydraulics', label: 'HIDRÁULICA', code: 'DRENAGEM', tone: 'yellow' },
]

const main: { id: ModuleId; title: string; body: string }[] = [
  { id: 'beams', title: 'Análise Estrutural', body: 'Vigas, pórticos, treliças, apoios, cargas e diagramas' },
  { id: 'columns', title: 'Betão Armado', body: 'Vigas, pilares, lajes, sapatas e verificações EC2' },
  { id: 'geotechnics', title: 'Geotecnia', body: 'Solos, ensaios, fundações, assentamentos e EC7' },
  { id: 'walls', title: 'Contenção', body: 'Muros, pregagens, ancoragens, betão projetado e drenagem' },
  { id: 'slopes', title: 'Taludes', body: 'Estabilidade, reforço, drenagem e proteção' },
  { id: 'roads', title: 'Infraestruturas Viárias', body: 'Estradas, ciclovias, rotundas, pavimentos e drenagem' },
  { id: 'library', title: 'Biblioteca Técnica', body: 'Materiais, perfis, solos, fórmulas, tabelas e normas' },
  { id: 'tools', title: 'Ferramentas', body: 'Conversões, calculadoras rápidas e utilitários' },
]

export function DashboardPage({ onOpen }: { onOpen: (id: ModuleId) => void }) {
  return <div className="page dashboardPage">
    <div className="pageTitle"><h1>Dashboard</h1><span>Base limpa V27</span></div>
    <div className="quickGrid">{quick.map((q) => <button key={q.id} className={`quickCard ${q.tone}`} onClick={() => onOpen(q.id)}><Icon id={q.id} size={40}/><strong>{q.label}</strong><span>{q.code}</span></button>)}</div>
    <section className="panel"><div className="panelTitle">Módulos principais</div><div className="moduleGrid">{main.map((m) => <button className="moduleCard" key={m.title} onClick={() => onOpen(m.id)}><div className="moduleIcon"><Icon id={m.id} size={34}/></div><div><strong>{m.title}</strong><span>{m.body}</span></div><b>›</b></button>)}</div></section>
  </div>
}

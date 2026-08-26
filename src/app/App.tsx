import { useState } from 'react'
import type { ModuleId } from './types'
import { Sidebar } from '../ui/Sidebar'
import { Topbar } from '../ui/Topbar'
import { DashboardPage } from '../modules/dashboard/DashboardPage'
import { BeamsPage } from '../modules/structures/beams/BeamsPage'
import { RoadsPage } from '../modules/roads/RoadsPage'
import { FramesPage, TrussesPage, ColumnsPage, SlabsPage, FoundationsPage, WallsPage, CombinationsPage } from '../modules/structures/basic/StructuralPages'

function Planned({ title }: { title: string }) {
  return <div className="page"><div className="pageTitle"><h1>{title}</h1><span>Em preparação</span></div><section className="panel planned"><h2>Módulo ainda não integrado</h2><p>Na V27 limpa só entram componentes reais e compiláveis. Este módulo será migrado numa fase própria, com WebApp e APK validadas antes de avançar.</p></section></div>
}

const titles: Partial<Record<ModuleId, string>> = {
  frames: 'Pórticos', trusses: 'Treliças', combinations: 'Combinações', columns: 'Pilares', slabs: 'Lajes', foundations: 'Fundações', walls: 'Contenção', geotechnics: 'Solos e Ensaios', slopes: 'Taludes', hydraulics: 'Hidráulica e Drenagem', cycleways: 'Ciclovias', roundabouts: 'Rotundas', library: 'Biblioteca Técnica', tools: 'Ferramentas', settings: 'Configurações'
}

export default function App() {
  const [active, setActive] = useState<ModuleId>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  let content = <Planned title={titles[active] ?? 'Módulo'} />
  if (active === 'dashboard') content = <DashboardPage onOpen={setActive}/>
  if (active === 'beams') content = <BeamsPage/>
  if (active === 'roads') content = <RoadsPage/>
  if (active === 'frames') content = <FramesPage/>
  if (active === 'trusses') content = <TrussesPage/>
  if (active === 'combinations') content = <CombinationsPage/>
  if (active === 'columns') content = <ColumnsPage/>
  if (active === 'slabs') content = <SlabsPage/>
  if (active === 'foundations') content = <FoundationsPage/>
  if (active === 'walls') content = <WallsPage/>
  return <div className="appShell"><Sidebar active={active} onSelect={setActive} open={menuOpen} onClose={() => setMenuOpen(false)}/><div className="mainShell"><Topbar onMenu={() => setMenuOpen(true)}/><main>{content}</main></div>{menuOpen && <button className="overlay" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"/>}</div>
}

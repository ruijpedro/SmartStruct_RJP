import type { ModuleId } from '../app/types'

const paths: Partial<Record<ModuleId, string>> = {
  dashboard: 'M4 11 12 4l8 7v9H5z',
  beams: 'M3 7h18v3H3zm3 3h3v8H6zm9 0h3v8h-3z',
  frames: 'M4 20V5h16v15M4 10h16',
  trusses: 'M3 19 12 5l9 14H3Zm4 0 5-8 5 8',
  columns: 'M8 3h8v4h-2v10h2v4H8v-4h2V7H8z',
  slabs: 'M4 8l8-4 8 4-8 4-8-4Zm0 5 8 4 8-4',
  foundations: 'M6 5h12v5H6zm3 5h6v9H9zm-4 9h14',
  walls: 'M5 20V4h9l5 16H5Zm4-4h7',
  geotechnics: 'M3 8c4-3 7 3 11 0s7 3 7 3v8H3V8Zm0 6c4-3 7 3 11 0s7 3 7 3',
  slopes: 'M3 20 9 7l12 13H3Zm6-4h7',
  hydraulics: 'M12 3s5 6 5 10a5 5 0 1 1-10 0c0-4 5-10 5-10Z',
  roads: 'M8 3 5 21h14L16 3H8Zm4 2v4m0 3v4m0 3v2',
  cycleways: 'M6 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 7h4l2 4h-4l-2 6m4-6 3-4h2',
  roundabouts: 'M7 7a7 7 0 1 1-1 9M7 7V3m0 4H3',
  library: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 1V4Zm3 0v16',
  tools: 'M14 6 6 14m8 4 4 4m-8-12L4 4m12 4a4 4 0 1 0 4 4',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5 1 3 3 1 3-1 2 3-2 2 1 3-3 2-1 3h-4l-1-3-3-2 1-3-2-2 2-3 3 1 3-1 1-3h4Z',
}

export function Icon({ id, size = 24 }: { id: ModuleId; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[id] ?? paths.dashboard} /></svg>
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return <header className="topbar">
    <button className="menuButton" onClick={onMenu} aria-label="Abrir menu">☰</button>
    <div><strong>SmartStruct_RJP</strong><span className="topTag">V27</span></div>
    <div className="topActions"><button>⌕</button><button>☆</button><button>⚙</button></div>
  </header>
}

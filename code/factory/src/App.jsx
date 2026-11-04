import { useEffect, useMemo, useState } from 'react'
import { Icon } from './components/icons.jsx'
import { useLive } from './lib/api.js'
import { useRoute } from './lib/router.js'
import { SelectionContext } from './lib/selection.js'
import AssistantPage from './pages/AssistantPage.jsx'
import CockpitPage from './pages/CockpitPage.jsx'
import DeliveryPage from './pages/DeliveryPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import IdeasPage from './pages/IdeasPage.jsx'
import IdeaWorkspacePage from './pages/IdeaWorkspacePage.jsx'
import RequirementsPage from './pages/RequirementsPage.jsx'
import RunPage from './pages/RunPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import StoryPage from './pages/StoryPage.jsx'

function NavItem({ href, icon, label, count, active, working }) {
  return (
    <a href={href} className={`dt-nav__item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
      <Icon name={icon} />
      {label}
      {working && <span className="f-working__dot f-nav__working" aria-label="Aktiv" />}
      {count > 0 && <span className="dt-nav__count">{count}</span>}
    </a>
  )
}

function initials(name) {
  return (name || 'Fachbereich')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function App() {
  const { segments, query } = useRoute()
  const [selected, setSelected] = useState([])
  const overview = useLive('/api/overview', ['ideas', 'requirements', 'runs', 'studio'])
  const system = useLive('/api/system')
  const reloadSystem = system.reload
  useEffect(() => {
    const id = setInterval(reloadSystem, 30000)
    return () => clearInterval(id)
  }, [reloadSystem])
  const section = segments[0] ?? 'cockpit'
  const nav = overview.data?.nav

  const selection = useMemo(
    () => ({
      selected,
      isSelected: (id) => selected.includes(id),
      toggle: (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      set: setSelected,
      clear: () => setSelected([]),
    }),
    [selected],
  )

  let page
  if (section === 'cockpit') page = <CockpitPage overview={overview} />
  else if (section === 'ideen') page = segments[1] ? <IdeaWorkspacePage id={segments[1]} key={segments[1]} /> : <IdeasPage />
  else if (section === 'anforderungen') page = segments[1] ? <StoryPage id={segments[1]} key={segments[1]} /> : <RequirementsPage query={query} />
  else if (section === 'assistent') page = <AssistantPage id={segments[1]} key={segments[1]} />
  else if (section === 'umsetzung') page = segments[1] ? <RunPage id={segments[1]} key={segments[1]} /> : <DeliveryPage />
  else if (section === 'verlauf') page = <HistoryPage />
  else if (section === 'einstellungen') page = <SettingsPage system={system} />
  else page = <CockpitPage overview={overview} />

  const app = system.data?.app

  return (
    <SelectionContext.Provider value={selection}>
      <div className="dt-app f-app">
        <aside className="dt-sidebar">
          <div className="dt-sidebar__brand">
            <a className="dt-brand f-brand" href="#/">
              Software<span className="dt-brand__slash">//</span>Factory
              <span className="dt-brand__tag f-brand__tag">Von der Idee zur Auslieferung</span>
            </a>
          </div>
          <div className="dt-sidebar__body">
            <nav className="dt-nav" aria-label="Hauptnavigation">
              <div className="dt-nav__group-label">Steuerung</div>
              <NavItem href="#/" icon="cockpit" label="Cockpit" active={section === 'cockpit'} />
              <div className="dt-nav__group-label f-nav__group">Fertigung</div>
              <NavItem href="#/ideen" icon="idea" label="Ideen" count={nav?.ideasOpen} active={section === 'ideen'} />
              <NavItem
                href="#/anforderungen"
                icon="list"
                label="Anforderungen"
                count={nav?.requirementsOpen}
                active={section === 'anforderungen' || section === 'assistent'}
              />
              <NavItem
                href="#/umsetzung"
                icon="factory"
                label="Umsetzung"
                active={section === 'umsetzung'}
                working={nav?.runsActive > 0}
              />
              <div className="dt-nav__group-label f-nav__group">Transparenz</div>
              <NavItem href="#/verlauf" icon="history" label="Verlauf" active={section === 'verlauf'} />
              <NavItem href="#/einstellungen" icon="settings" label="Einstellungen" active={section === 'einstellungen'} />
            </nav>
          </div>
          {app && (
            <a className="f-appstatus" href={app.url} target="_blank" rel="noreferrer">
              <span className={`f-appstatus__dot ${app.online ? 'is-online' : 'is-offline'}`} />
              <span>
                <span className="f-appstatus__label">Anwendung</span>
                <span className="dt-cell-muted f-appstatus__state">{app.online ? 'In Betrieb' : 'Nicht erreichbar'}</span>
              </span>
              <Icon name="external" />
            </a>
          )}
          <div className="dt-sidebar__foot">
            <div className="dt-avatar">{initials(system.data?.user)}</div>
            <div>
              <div className="dt-cell-strong">{system.data?.user || 'Fachbereich'}</div>
              <div className="dt-cell-muted">Fachbereich</div>
            </div>
          </div>
        </aside>
        <div className="dt-main f-main">{page}</div>
      </div>
    </SelectionContext.Provider>
  )
}

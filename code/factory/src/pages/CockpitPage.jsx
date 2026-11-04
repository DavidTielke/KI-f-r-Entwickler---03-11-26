import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Icon } from '../components/icons.jsx'
import { Card, ErrorNote, Topbar, Working } from '../components/ui.jsx'
import { formatDate, formatDateTime, formatShortDuration, plural, RUN_TYPE } from '../lib/format.js'

const GREEN = '#7cb342'
const ORANGE = '#f38a2c'

function ChartTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="f-tooltip">
      {label != null && <div className="f-tooltip__label">{labelFormatter ? labelFormatter(label) : label}</div>}
      {payload.map((entry) => (
        <div key={entry.name} className="f-tooltip__row">
          <span className="f-tooltip__swatch" style={{ background: entry.payload?.fill ?? entry.color }} />
          {entry.name}
          <span className="f-tooltip__value">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function Legend({ items }) {
  return (
    <ul className="f-legend">
      {items.map((item) => (
        <li key={item.name}>
          <span className="f-tooltip__swatch" style={{ background: item.color }} />
          {item.name}
          {item.value != null && <span className="f-legend__value">{item.value}</span>}
        </li>
      ))}
    </ul>
  )
}

function Station({ href, label, value, sub, highlight }) {
  return (
    <a className={`f-station ${highlight ? 'is-highlight' : ''}`} href={href}>
      <span className="dt-stat__label">{label}</span>
      <span className="dt-stat__value f-station__value">{value}</span>
      <span className="dt-stat__sub">{sub}</span>
    </a>
  )
}

function Line() {
  return (
    <span className="f-line__arrow" aria-hidden="true">
      <Icon name="chevronRight" size={20} />
    </span>
  )
}

function Stat({ label, value, sub, bar }) {
  return (
    <div className="dt-card">
      <div className="dt-stat">
        <div className="dt-stat__head">
          <span className="dt-stat__label">{label}</span>
        </div>
        <div className="dt-stat__value">{value}</div>
        {bar != null && (
          <div className="dt-bar f-stat__bar">
            <div className="dt-bar__fill" style={{ width: `${bar}%` }} />
          </div>
        )}
        <div className="dt-stat__sub">{sub}</div>
      </div>
    </div>
  )
}

const EVENT_LABEL = { idea: 'Idee', requirement: 'Anforderung', run: 'Auftrag', delivery: 'Auslieferung' }

export default function CockpitPage({ overview }) {
  const { data, error } = overview
  return (
    <>
      <Topbar kicker="Übersicht" title="Cockpit">
        <a className="dt-btn dt-btn--secondary" href="#/anforderungen">
          Anforderungen ansehen
        </a>
        <a className="dt-btn dt-btn--primary" href="#/ideen?neu=1">
          <Icon name="mic" /> Idee erfassen
        </a>
      </Topbar>
      <div className="dt-content">
        <ErrorNote>{error}</ErrorNote>
        {!data ? (
          !error && <div className="dt-stat__sub">Wird geladen …</div>
        ) : (
          <Cockpit data={data} />
        )}
      </div>
    </>
  )
}

function Cockpit({ data }) {
  const { totals, ideas, byEpic, daily, actions, activeRuns, recent } = data
  const statusData = [
    { name: 'Umgesetzt', value: totals.implemented, fill: GREEN },
    { name: 'Umsetzung offen', value: totals.open, fill: ORANGE },
  ]
  // Ein leeres Segment würde im Ring als schmale Naht erscheinen.
  const donutData = statusData.filter((entry) => entry.value > 0)
  const hasDaily = daily.some((day) => day.count > 0)

  return (
    <div className="f-stack">
      <section className="dt-card dt-card--lg">
        <div className="dt-card__pad">
          <div className="f-card__head">
            <div>
              <div className="dt-kicker">Fertigungsstraße</div>
              <h3 className="f-h3">
                Von der Idee zur Auslieferung<span className="dt-dot">.</span>
              </h3>
            </div>
          </div>
          <div className="f-line">
            <Station href="#/ideen" label="Ideen in Klärung" value={ideas.draft} sub="Im Dialog mit dem Product Owner" highlight={ideas.draft > 0} />
            <Line />
            <Station href="#/ideen" label="Freigegeben" value={ideas.ready} sub="Bereit für Anforderungen" highlight={ideas.ready > 0} />
            <Line />
            <Station href="#/anforderungen?filter=offen" label="Offene Anforderungen" value={totals.open} sub="Warten auf die Umsetzung" highlight={totals.open > 0} />
            <Line />
            <Station href="#/anforderungen?filter=umgesetzt" label="Umgesetzt" value={totals.implemented} sub={`In ${plural(totals.features, 'Funktion', 'Funktionen')}`} />
            <Line />
            <Station href="#/umsetzung" label="Auslieferungen" value={totals.deliveries} sub="Über die Software Factory" />
          </div>
        </div>
      </section>

      {(actions.length > 0 || activeRuns.length > 0) && (
        <div className="f-grid f-grid--2">
          <Card title="Das steht an" kicker="Handlungsbedarf">
            {actions.length === 0 ? (
              <div className="dt-stat__sub">Im Moment ist nichts von Ihnen erforderlich.</div>
            ) : (
              <ul className="f-actions">
                {actions.slice(0, 6).map((action) => (
                  <li key={action.title}>
                    <a href={action.href} className="f-action">
                      <span className={`f-action__mark is-${action.tone}`} />
                      <span className="f-action__title">{action.title}</span>
                      <span className="f-action__cta">
                        {action.cta} <Icon name="chevronRight" size={14} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Laufende Aufträge" kicker="Fertigung">
            {activeRuns.length === 0 ? (
              <div className="dt-stat__sub">Derzeit läuft kein Auftrag.</div>
            ) : (
              <ul className="f-actions">
                {activeRuns.map((run) => (
                  <li key={run.id}>
                    <a href={`#/umsetzung/${run.id}`} className="f-action">
                      <span className="dt-cell-mono">{run.id}</span>
                      <span className="f-action__title">
                        {RUN_TYPE[run.type]}: {run.title}
                      </span>
                      <span className="f-action__cta">
                        {run.status === 'running' ? (
                          <Working>{run.phases.find((p) => p.status === 'active')?.label ?? 'Läuft'}</Working>
                        ) : (
                          'Wartet'
                        )}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <div className="f-grid f-grid--4">
        <Stat label="Umsetzungsgrad" value={`${totals.rate} %`} bar={totals.rate} sub={`${totals.implemented} von ${plural(totals.stories, 'Anforderung', 'Anforderungen')}`} />
        <Stat label="Abnahmekriterien" value={totals.criteria} sub={`In ${plural(totals.epics, 'Themenbereich', 'Themenbereichen')}`} />
        <Stat label="Ideen gesamt" value={ideas.draft + ideas.ready + ideas.transferred} sub={`${ideas.transferred} in Anforderungen überführt`} />
        <Stat
          label="Durchlaufzeit"
          value={formatShortDuration(totals.avgDurationMs)}
          sub={totals.avgDurationMs == null ? 'Noch keine Auslieferung gemessen' : 'Je Auslieferung im Durchschnitt'}
        />
      </div>

      <div className="f-grid f-grid--cockpit">
        <Card title="Stand der Anforderungen" kicker="Anteile">
          <div className="f-donut">
            <div className="f-donut__chart">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={donutData.length > 1 ? 2 : 0} stroke={donutData.length > 1 ? '#ffffff' : 'none'} strokeWidth={2} isAnimationActive={false}>
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="f-donut__center">
                <span className="f-donut__value">{totals.stories}</span>
                <span className="dt-stat__sub f-donut__caption">gesamt</span>
              </div>
            </div>
            <Legend items={statusData.map((entry) => ({ name: entry.name, color: entry.fill, value: entry.value }))} />
          </div>
        </Card>

        <Card title="Stand je Themenbereich" kicker="Vergleich">
          {byEpic.length === 0 ? (
            <div className="dt-stat__sub">Noch keine Themenbereiche vorhanden.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={Math.max(180, byEpic.length * 54)}>
                <BarChart data={byEpic} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }} barCategoryGap={18}>
                  <CartesianGrid horizontal={false} stroke="#e5e5e5" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#7a7a7a' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#7a7a7a' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f2f2f2' }} />
                  <Bar dataKey="umgesetzt" name="Umgesetzt" stackId="a" fill={GREEN} stroke="#ffffff" strokeWidth={1} isAnimationActive={false} />
                  <Bar dataKey="offen" name="Umsetzung offen" stackId="a" fill={ORANGE} stroke="#ffffff" strokeWidth={1} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
              <Legend items={[{ name: 'Umgesetzt', color: GREEN }, { name: 'Umsetzung offen', color: ORANGE }]} />
            </>
          )}
        </Card>

        <Card title="Änderungen je Tag" kicker="Letzte 14 Tage">
          {!hasDaily ? (
            <div className="dt-stat__sub">Im Zeitraum gab es keine Änderungen.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={daily} margin={{ left: -20, right: 4, top: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="day" tickFormatter={(day) => day.slice(8, 10) + '.'} tick={{ fontSize: 11, fill: '#7a7a7a' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7a7a7a' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip labelFormatter={formatDate} />} cursor={{ fill: '#f2f2f2' }} />
                <Bar dataKey="count" name="Änderungen" fill={GREEN} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card
        title="Letzte Ereignisse"
        kicker="Verlauf"
        actions={
          <a className="dt-btn dt-btn--secondary dt-btn--modal" href="#/verlauf">
            Verlauf öffnen
          </a>
        }
      >
        {recent.length === 0 ? (
          <div className="dt-stat__sub">Sobald Sie mit der Software Factory arbeiten, erscheinen hier die Ereignisse.</div>
        ) : (
          <ul className="f-events">
            {recent.slice(0, 6).map((event, index) => (
              <li key={index}>
                <span className="dt-badge dt-badge--neutral">{EVENT_LABEL[event.type] ?? 'Ereignis'}</span>
                <span className="f-events__title">{event.title}</span>
                <span className="dt-stat__sub f-events__time">{formatDateTime(event.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

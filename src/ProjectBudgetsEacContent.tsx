import { useRef, useState } from 'react'
import clsx from 'clsx'
import { Icon } from './components/harmony/Icon'
import { EAC_HEALTH_SECTION_ID, HEALTH_INDICATOR_ROWS, OVERALL_HEALTH } from './eacHealth'

type Check = { checked: boolean; disabled?: boolean }

type BudgetStatus = 'Approved' | 'Complete' | 'Working' | 'Incomplete'

type BudgetRow = {
  type: 'BUD' | 'EAC'
  version: string
  finalVersion: Check | null
  status: BudgetStatus
  sourceType: string
  sourceVersion: string
  closedPeriod: string
  health: '' | 'At Risk'
  warnings: string
  newBusinessId: string
  newBusinessName: string
  complete: Check
  approved: Check
  subtaskHide: Check
  escalation: string
  selected?: boolean
}

const on = (disabled = false): Check => ({ checked: true, disabled })
const off = (disabled = false): Check => ({ checked: false, disabled })

const BUDGET_ROWS: BudgetRow[] = [
  { type: 'BUD', version: '1', finalVersion: on(), status: 'Approved', sourceType: '', sourceVersion: '', closedPeriod: '05/31/2016', health: '', warnings: '', newBusinessId: '', newBusinessName: '', complete: on(true), approved: on(), subtaskHide: off(true), escalation: '3.00%' },
  { type: 'BUD', version: '1', finalVersion: on(), status: 'Approved', sourceType: '', sourceVersion: '', closedPeriod: '07/31/2020', health: '', warnings: '', newBusinessId: '', newBusinessName: '', complete: on(true), approved: on(), subtaskHide: off(true), escalation: '3.00%' },
  { type: 'BUD', version: '2', finalVersion: off(), status: 'Approved', sourceType: 'BUD', sourceVersion: '1', closedPeriod: '05/31/2020', health: '', warnings: '', newBusinessId: '', newBusinessName: '', complete: on(true), approved: on(), subtaskHide: off(true), escalation: '3.00%' },
  { type: 'BUD', version: '3', finalVersion: off(), status: 'Complete', sourceType: 'BUD', sourceVersion: '2', closedPeriod: '11/30/2020', health: '', warnings: '', newBusinessId: '', newBusinessName: '', complete: on(), approved: off(), subtaskHide: off(true), escalation: '3.00%' },
  { type: 'BUD', version: '3', finalVersion: null, status: 'Working', sourceType: 'BUD', sourceVersion: '2', closedPeriod: '11/30/2020', health: '', warnings: '222', newBusinessId: '', newBusinessName: '', complete: on(), approved: off(), subtaskHide: off(), escalation: '3.00%' },
  { type: 'EAC', version: '1', finalVersion: off(true), status: 'Incomplete', sourceType: 'EAC', sourceVersion: '1', closedPeriod: '04/30/2020', health: 'At Risk', warnings: '', newBusinessId: '', newBusinessName: '', complete: off(), approved: off(), subtaskHide: off(true), escalation: '3.00%', selected: true },
  { type: 'EAC', version: '1', finalVersion: null, status: 'Working', sourceType: 'EAC', sourceVersion: '1', closedPeriod: '04/30/2020', health: 'At Risk', warnings: '2', newBusinessId: '', newBusinessName: '', complete: off(), approved: off(), subtaskHide: off(), escalation: '3.00%' },
  { type: 'EAC', version: '1', finalVersion: on(), status: 'Complete', sourceType: 'EAC', sourceVersion: '1', closedPeriod: '05/31/2020', health: 'At Risk', warnings: '', newBusinessId: '', newBusinessName: '', complete: on(), approved: off(), subtaskHide: off(true), escalation: '3.00%' },
  { type: 'EAC', version: '2', finalVersion: null, status: 'Working', sourceType: 'EAC', sourceVersion: '1', closedPeriod: '05/31/2020', health: 'At Risk', warnings: '2', newBusinessId: '', newBusinessName: '', complete: on(), approved: off(), subtaskHide: off(), escalation: '3.00%' },
  { type: 'EAC', version: '3', finalVersion: null, status: 'Working', sourceType: 'EAC', sourceVersion: '1', closedPeriod: '11/30/2020', health: 'At Risk', warnings: '2', newBusinessId: '', newBusinessName: '', complete: off(), approved: off(), subtaskHide: off(), escalation: '3.00%' },
  { type: 'EAC', version: '4', finalVersion: null, status: 'Working', sourceType: 'EAC', sourceVersion: '2', closedPeriod: '05/31/2020', health: 'At Risk', warnings: '0', newBusinessId: '', newBusinessName: '', complete: off(), approved: off(), subtaskHide: off(), escalation: '3.00%' },
  { type: 'BUD', version: '1', finalVersion: null, status: 'Working', sourceType: 'NB - 18-0108', sourceVersion: '1', closedPeriod: '11/30/2020', health: '', warnings: '0', newBusinessId: '18-0108', newBusinessName: '', complete: off(), approved: off(), subtaskHide: off(), escalation: '3.00%' },
  { type: 'BUD', version: '1', finalVersion: on(true), status: 'Complete', sourceType: 'EXCEL', sourceVersion: '0', closedPeriod: '11/30/2020', health: '', warnings: '', newBusinessId: '00016.AA', newBusinessName: 'DLA IT Support Services - Labor', complete: on(), approved: off(), subtaskHide: off(true), escalation: '0.00%' },
  { type: 'BUD', version: '1', finalVersion: null, status: 'Working', sourceType: '', sourceVersion: '', closedPeriod: '11/30/2020', health: '', warnings: '33', newBusinessId: '', newBusinessName: '', complete: off(), approved: off(), subtaskHide: off(), escalation: '3.00%' },
]

const EMPTY_TRAILING_ROWS = 2

const LEFT_COLUMNS = [
  { key: 'type', label: 'Type', width: 'xs' },
  { key: 'version', label: 'Version', width: 'sm' },
  { key: 'versionCode', label: 'Version Code', width: 'md' },
  { key: 'finalVersion', label: 'Final Version', width: 'sm' },
  { key: 'status', label: 'Status', width: 'md' },
  { key: 'sourceType', label: 'Source Type', width: 'md' },
  { key: 'sourceVersion', label: 'Source Version', width: 'sm' },
  { key: 'closedPeriod', label: 'Closed Period', width: 'md' },
  { key: 'health', label: 'EAC Health Indicator', width: 'xl' },
] as const

const RIGHT_COLUMNS = [
  { key: 'warnings', label: 'Warnings', width: 'sm' },
  { key: 'newBusinessId', label: 'New Business ID', width: 'md' },
  { key: 'newBusinessName', label: 'New Business Name', width: 'xl' },
  { key: 'recalcMethod', label: 'Recalc Method', width: 'md' },
  { key: 'manualRecalc', label: 'Needs Manual Recalc', width: 'sm' },
  { key: 'complete', label: 'Complete', width: 'sm' },
  { key: 'approved', label: 'Approved', width: 'sm' },
  { key: 'subtaskHide', label: 'Enable Subtask Row Hide', width: 'md' },
  { key: 'escalation', label: 'Escalation', width: 'sm' },
  { key: 'escalationMonth', label: 'Escalation Month', width: 'md' },
] as const

const DETAIL_TABS = [
  'Revenue Setup/Ceilings',
  'Hours',
  'Amounts',
  'Units',
  'Staff Escalation',
  'Service Centers',
  'Revenue Analysis',
  'Analysis by Period',
  'Funding',
  'Project Labor Categories',
  'EAC Health Indicator',
] as const

const ACTIVE_DETAIL_TAB = 'EAC Health Indicator'

function GridCheckbox({ value, label }: { value: Check; label: string }) {
  return (
    <input
      type="checkbox"
      className="pb-checkbox"
      defaultChecked={value.checked}
      disabled={value.disabled}
      aria-label={label}
    />
  )
}

function WindowControls({ expand = false }: { expand?: boolean }) {
  return (
    <div className="pb-window-controls">
      {expand && (
        <button type="button" aria-label="Expand">
          <Icon name="arrows-pointing-out" size="sm" />
        </button>
      )}
      <button type="button" aria-label="Minimize">
        <Icon name="minus" size="sm" />
      </button>
      <button type="button" aria-label="Maximize">
        <span className="pb-window-controls__square" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Close">
        <Icon name="x-mark" size="sm" />
      </button>
    </div>
  )
}

function statusClass(status: string) {
  return `pb-cell--${status.toLowerCase().replace(/\s+/g, '-')}`
}

function LeftPaneRow({ row }: { row: BudgetRow }) {
  const locked = row.status !== 'Working'
  const health = row.type === 'EAC' ? row.health : ''
  return (
    <tr className={clsx(locked && 'pb-row--locked', row.selected && 'pb-row--selected')}>
      <td className="pb-selector" />
      <td>{row.type}</td>
      <td>{row.version}</td>
      <td className={clsx(row.selected && 'pb-cell--active')}>N/A</td>
      <td className={clsx('pb-cell--center', !row.finalVersion && 'pb-cell--shaded')}>
        {row.finalVersion && <GridCheckbox value={row.finalVersion} label="Final Version" />}
      </td>
      <td className={clsx('pb-cell--status', statusClass(row.status))}>{row.status}</td>
      <td>{row.sourceType}</td>
      <td>{row.sourceVersion}</td>
      <td>{row.closedPeriod}</td>
      <td className={clsx(health && ['pb-cell--status', statusClass(health)])}>{health}</td>
    </tr>
  )
}

function RightPaneRow({ row }: { row: BudgetRow }) {
  const editable = row.status === 'Working'
  const hasWarning = row.warnings !== '' && row.warnings !== '0'
  return (
    <tr className={clsx(!editable && 'pb-row--locked', row.selected && 'pb-row--selected')}>
      <td className={clsx('pb-cell--right', hasWarning && 'pb-cell--warning')}>{row.warnings}</td>
      <td>
        {row.newBusinessId && (
          <a href="#" className="pb-link" onClick={(e) => e.preventDefault()}>
            {row.newBusinessId}
          </a>
        )}
      </td>
      <td>{row.newBusinessName}</td>
      <td>
        <span className="pb-select-cell">
          Automatic
          {editable && <Icon name="chevron-down" size="xs" />}
        </span>
      </td>
      <td>N</td>
      <td className="pb-cell--center"><GridCheckbox value={row.complete} label="Complete" /></td>
      <td className="pb-cell--center"><GridCheckbox value={row.approved} label="Approved" /></td>
      <td className="pb-cell--center"><GridCheckbox value={row.subtaskHide} label="Enable Subtask Row Hide" /></td>
      <td className="pb-cell--right">{row.escalation}</td>
      <td>March</td>
    </tr>
  )
}

function EmptyRows({ count, columns }: { count: number; columns: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <tr key={i} className="pb-row--locked">
          {Array.from({ length: columns }, (_, j) => <td key={j} />)}
        </tr>
      ))}
    </>
  )
}

function FilterRow({ columns }: { columns: number }) {
  return (
    <tr className="pb-row--filter">
      {Array.from({ length: columns }, (_, j) => <td key={j} />)}
    </tr>
  )
}

function syncScroll(source: HTMLDivElement | null, target: HTMLDivElement | null) {
  if (source && target && target.scrollTop !== source.scrollTop) {
    target.scrollTop = source.scrollTop
  }
}

export function ProjectBudgetsEacContent() {
  const [detailTab, setDetailTab] = useState<string>(ACTIVE_DETAIL_TAB)
  const leftPaneRef = useRef<HTMLDivElement>(null)
  const rightPaneRef = useRef<HTMLDivElement>(null)

  return (
    <div className="project-budget-eac">
      <section className="project-budget-panel" aria-labelledby="project-budget-title">
        <div className="project-budget-panel__titlebar">
          <h1 id="project-budget-title">Project Budgets / EACs</h1>
          <div className="project-budget-panel__window-actions">
            <button type="button" className="pb-criteria-select">
              -Default- <Icon name="chevron-down" size="xs" />
            </button>
            <button type="button" className="pb-outline-btn">Save Criteria</button>
            <WindowControls />
          </div>
        </div>

        <div className="project-budget-criteria">
          <label htmlFor="pb-project" className="pb-criteria__label pb-criteria__label--project">
            Project<span className="pb-required" aria-hidden="true">*</span>
          </label>
          <span className="pb-input pb-criteria__project">
            <input id="pb-project" defaultValue="10105" required />
            <Icon name="magnifying-glass" size="xs" />
          </span>
          <span className="pb-input pb-input--readonly pb-criteria__name">
            <input defaultValue="Cybersecurity Diag & Mit" aria-label="Project name" readOnly />
            <span className="pb-input__dot" aria-hidden="true" />
          </span>
          <button type="button" className="pb-smart-summary">Smart Summary</button>
          <label className="pb-check pb-criteria__inactive">
            <input type="checkbox" className="pb-checkbox" />
            <span>Include Inactive Projects</span>
          </label>
          <label htmlFor="pb-fiscal" className="pb-criteria__label pb-criteria__label--fiscal">
            Fiscal Year
          </label>
          <span className="pb-input pb-criteria__fiscal">
            <input id="pb-fiscal" defaultValue="ALL" />
            <Icon name="magnifying-glass" size="xs" />
          </span>
          <div className="pb-criteria__checks">
            <label className="pb-check">
              <input type="checkbox" className="pb-checkbox" />
              <span>Show Budget/EAC Only</span>
            </label>
            <label className="pb-check">
              <input type="checkbox" className="pb-checkbox" />
              <span>Show Hidden Budget/EAC</span>
            </label>
          </div>
        </div>
      </section>

      <section
        className="project-budget-panel project-budget-status"
        aria-labelledby="project-budget-status-title"
      >
        <div className="project-budget-panel__titlebar">
          <h2 id="project-budget-status-title">Project Budget Status</h2>
          <div className="project-budget-status__views">
            <span className="pb-input pb-find">
              <input placeholder="Find" aria-label="Find" />
            </span>
            <button type="button" className="pb-criteria-select">
              Query <Icon name="chevron-down" size="xs" />
            </button>
            <div className="pb-view-toggle" role="group" aria-label="View">
              <button type="button" aria-label="Card view">
                <span className="pb-view-toggle__card" aria-hidden="true" />
              </button>
              <button type="button" className="is-active" aria-label="Table view" aria-pressed="true">
                <Icon name="view-columns" size="sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="project-budget-actions" aria-label="Project budget actions">
          <button type="button">Create Blank BUD</button>
          <button type="button">Create BUD</button>
          {['Create EAC', 'MODIFY', 'INSPECT', 'RECALC', 'COMMIT', 'DELETE'].map((label) => (
            <button key={label} type="button" disabled>{label}</button>
          ))}
        </div>

        <div className="pb-grid">
          <div
            ref={leftPaneRef}
            className="pb-grid__pane pb-grid__pane--left"
            onWheel={(e) => {
              if (rightPaneRef.current) rightPaneRef.current.scrollTop += e.deltaY
            }}
          >
            <table className="pb-table">
              <thead>
                <tr>
                  <th className="pb-selector">
                    <Icon name="question-mark-circle" size="xs" />
                  </th>
                  {LEFT_COLUMNS.map((c) => (
                    <th key={c.key} className={`pb-col--${c.width}`}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <FilterRow columns={LEFT_COLUMNS.length + 1} />
                {BUDGET_ROWS.map((row, i) => <LeftPaneRow key={i} row={row} />)}
                <EmptyRows count={EMPTY_TRAILING_ROWS} columns={LEFT_COLUMNS.length + 1} />
              </tbody>
            </table>
          </div>
          <div className="pb-grid__splitter" aria-hidden="true" />
          <div
            ref={rightPaneRef}
            className="pb-grid__pane pb-grid__pane--right"
            onScroll={() => syncScroll(rightPaneRef.current, leftPaneRef.current)}
          >
            <table className="pb-table">
              <thead>
                <tr>
                  {RIGHT_COLUMNS.map((c) => (
                    <th key={c.key} className={`pb-col--${c.width}`}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <FilterRow columns={RIGHT_COLUMNS.length} />
                {BUDGET_ROWS.map((row, i) => <RightPaneRow key={i} row={row} />)}
                <EmptyRows count={EMPTY_TRAILING_ROWS} columns={RIGHT_COLUMNS.length} />
              </tbody>
            </table>
          </div>
        </div>

        <nav className="pb-detail-tabs" aria-label="Budget status details">
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={clsx(tab === detailTab && 'is-active')}
              aria-current={tab === detailTab ? 'page' : undefined}
              onClick={() => setDetailTab(tab)}
            >
              {tab}
            </button>
          ))}
          <button type="button" className="pb-detail-tabs__more" aria-label="More tabs">
            <Icon name="ellipsis-vertical" size="sm" />
          </button>
        </nav>
      </section>

      <section className="project-budget-panel" aria-labelledby={EAC_HEALTH_SECTION_ID}>
        <div className="project-budget-panel__titlebar">
          <h2 id={EAC_HEALTH_SECTION_ID} className="pb-breadcrumb">
            <a href="#" onClick={(e) => e.preventDefault()}>Project Budgets / EACs</a>
            <span aria-hidden="true"> &gt; </span>
            {detailTab}
          </h2>
          <WindowControls expand />
        </div>
        <div className="pb-indicator">
          <div className="pb-health-summary" role="status">
            <span className="pb-health-summary__label">Overall Health:</span>
            <span className={clsx('pb-health-summary__value', statusClass(OVERALL_HEALTH))}>
              {OVERALL_HEALTH}
            </span>
          </div>
          <table className="pb-table pb-table--indicator">
            <thead>
              <tr>
                <th className="pb-selector" />
                <th className="pb-col--desc">Description</th>
                <th className="pb-col--md">Budget</th>
                <th className="pb-col--md">EAC</th>
                <th className="pb-col--md">Variance</th>
                <th className="pb-col--md">Variance %</th>
                <th className="pb-col--md">Status</th>
                <th className="pb-col--reason">Reason</th>
              </tr>
            </thead>
            <tbody>
              {HEALTH_INDICATOR_ROWS.map((row) => (
                <tr
                  key={row.description}
                  className={clsx('pb-row--locked', row.selected && 'pb-row--selected')}
                >
                  <td className="pb-selector" />
                  <td>{row.description}</td>
                  <td className="pb-cell--right">{row.budget}</td>
                  <td className="pb-cell--right">{row.eac}</td>
                  <td>{row.variance}</td>
                  <td>{row.variancePct}</td>
                  <td className={clsx('pb-cell--status', statusClass(row.status))}>{row.status}</td>
                  <td>{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

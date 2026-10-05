import { useState } from 'react'
import type { MouseEvent } from 'react'
import clsx from 'clsx'
import { Icon } from './Icon'
import { Badge } from './Badge'
import { Button } from './Button'
import { Link } from './Link'
import {
  AT_RISK_COUNT,
  EAC_HEALTH_CONTEXT,
  EAC_HEALTH_SECTION_ID,
  HEALTH_INDICATOR_ROWS,
  OVERALL_HEALTH,
  type EacHealthIndicator,
  type EacHealthStatus,
} from '../../eacHealth'

/** `cards` boxes each indicator; `list` uses divider rows so no card pattern is needed. */
export type EacHealthLayout = 'cards' | 'list'

const AT_RISK_ROWS = HEALTH_INDICATOR_ROWS.filter((row) => row.status === 'At Risk')
const HEALTHY_ROWS = HEALTH_INDICATOR_ROWS.filter((row) => row.status === 'Healthy')
const RISK_FIRST_ROWS = [...AT_RISK_ROWS, ...HEALTHY_ROWS]

const INTERPRETATION =
  'Revenue, hours and cost forecasts are all 98–100% below budget, yet the EAC was updated this period. This usually means forecast data hasn’t been entered into this EAC yet, rather than the project genuinely under-running.'

function StatusBadge({ status }: { status: EacHealthStatus }) {
  return (
    <Badge
      variant={status === 'At Risk' ? 'error' : 'success'}
      size="medium"
      icon={status === 'At Risk' ? 'exclamation-triangle' : 'check-circle'}
    >
      {status}
    </Badge>
  )
}

function IndicatorCard({ row }: { row: EacHealthIndicator }) {
  const hasVariance = row.variancePct !== '-'
  return (
    <li className="dela-eac-health__indicator">
      <div className="dela-eac-health__indicator-head">
        <span className="dela-eac-health__indicator-name">{row.description}</span>
        <StatusBadge status={row.status} />
      </div>
      <dl className="dela-eac-health__figures">
        <div>
          <dt>Budget</dt>
          <dd>{row.budget}</dd>
        </div>
        <div>
          <dt>EAC</dt>
          <dd>{row.eac}</dd>
        </div>
        <div>
          <dt>Variance</dt>
          <dd className={clsx(hasVariance && row.status === 'At Risk' && 'dela-eac-health__variance--risk')}>
            {hasVariance ? row.variancePct : row.variance}
          </dd>
        </div>
      </dl>
      <p className="dela-eac-health__reason">{row.reason}</p>
    </li>
  )
}

function StatusIcon({ status }: { status: EacHealthStatus }) {
  const atRisk = status === 'At Risk'
  return (
    <>
      <Icon
        name={atRisk ? 'exclamation-circle' : 'check-circle'}
        size="sm"
        className={atRisk ? 'dela-panel__fail-icon' : 'dela-panel__check-icon'}
      />
      <span className="sr-only">{status}:</span>
    </>
  )
}

function IndicatorDetail({ row }: { row: EacHealthIndicator }) {
  return (
    <>
      <p className="dela-eac-rows__figures">
        Budget {row.budget} · EAC {row.eac} · Variance{' '}
        {row.variancePct !== '-' ? row.variancePct : row.variance}
      </p>
      <p className="dela-eac-health__reason">{row.reason}</p>
    </>
  )
}

function IndicatorRow({ row }: { row: EacHealthIndicator }) {
  const atRisk = row.status === 'At Risk'
  return (
    <li className="dela-eac-rows__item">
      <span className="dela-eac-rows__name">{row.description}</span>
      <div className="dela-eac-rows__meta">
        <span className="dela-eac-rows__status">
          <Icon
            name={atRisk ? 'exclamation-circle' : 'check-circle'}
            size="sm"
            className={atRisk ? 'dela-panel__fail-icon' : 'dela-panel__check-icon'}
          />
          {row.status}
        </span>
        <span className={clsx('dela-eac-rows__value', atRisk && 'dela-eac-health__variance--risk')}>
          {row.variancePct !== '-' ? row.variancePct : row.eac}
        </span>
      </div>
      <span className="dela-eac-rows__why" title={row.reason}>
        {row.shortReason}
      </span>
    </li>
  )
}

const scrollToHealthTable = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault()
  document
    .getElementById(EAC_HEALTH_SECTION_ID)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Plain-text verdict and divider rows: reads like Dela talking, not a dashboard. */
function EacHealthListResponse() {
  const { projectId, projectName, eacVersion, closedPeriod } = EAC_HEALTH_CONTEXT
  const atRisk = OVERALL_HEALTH === 'At Risk'

  return (
    <div className="dela-eac-health">
      <div className="dela-panel__transaction-heading">
        <img src="/RS_Dela_Active.svg" alt="" className="dela-panel__transaction-dela-icon" />
        <h4>
          EAC health for {projectId} · {projectName}
        </h4>
      </div>
      <p className="dela-eac-health__context">
        EAC version {eacVersion} · Closed period {closedPeriod}
      </p>

      <p className="dela-eac-rows__verdict" role="status">
        <Icon
          name={atRisk ? 'exclamation-triangle' : 'check-circle'}
          size="sm"
          className={atRisk ? 'dela-panel__fail-icon' : 'dela-panel__check-icon'}
        />
        <span>
          <strong>{OVERALL_HEALTH}</strong> · {AT_RISK_COUNT} of {HEALTH_INDICATOR_ROWS.length}{' '}
          indicators need attention
        </span>
      </p>

      <p className="dela-panel__response">{INTERPRETATION}</p>

      <ul className="dela-eac-rows" aria-label="EAC health indicators">
        {RISK_FIRST_ROWS.map((row) => (
          <IndicatorRow key={row.description} row={row} />
        ))}
      </ul>

      <Link href={`#${EAC_HEALTH_SECTION_ID}`} size="small" onClick={scrollToHealthTable}>
        View full EAC health table
      </Link>
    </div>
  )
}

export interface DelaEacHealthResponseProps {
  layout?: EacHealthLayout
}

export function DelaEacHealthResponse({ layout = 'cards' }: DelaEacHealthResponseProps) {
  if (layout === 'list') return <EacHealthListResponse />
  return <EacHealthCardsResponse />
}

function EacHealthCardsResponse() {
  const [showHealthy, setShowHealthy] = useState(false)
  const { projectId, projectName, eacVersion, closedPeriod } = EAC_HEALTH_CONTEXT

  return (
    <div className="dela-eac-health">
      <div className="dela-panel__transaction-heading">
        <img src="/RS_Dela_Active.svg" alt="" className="dela-panel__transaction-dela-icon" />
        <h4>
          EAC health for {projectId} · {projectName}
        </h4>
      </div>
      <p className="dela-eac-health__context">
        EAC version {eacVersion} · Closed period {closedPeriod}
      </p>

      <div
        className={clsx(
          'dela-eac-health__overall',
          OVERALL_HEALTH === 'At Risk' && 'dela-eac-health__overall--risk'
        )}
        role="status"
      >
        <div className="dela-eac-health__overall-text">
          <span className="dela-eac-health__overall-label">Overall health</span>
          <span className="dela-eac-health__overall-count">
            {AT_RISK_COUNT} of {HEALTH_INDICATOR_ROWS.length} indicators at risk
          </span>
        </div>
        <StatusBadge status={OVERALL_HEALTH} />
      </div>

      <p className="dela-panel__response">{INTERPRETATION}</p>

      <ul className="dela-eac-health__list" aria-label="At risk indicators">
        {AT_RISK_ROWS.map((row) => (
          <IndicatorCard key={row.description} row={row} />
        ))}
      </ul>

      {HEALTHY_ROWS.length > 0 && (
        <div className="dela-eac-health__healthy">
          <button
            type="button"
            className="dela-panel__readiness-summary"
            aria-expanded={showHealthy}
            onClick={() => setShowHealthy((open) => !open)}
          >
            <Icon name="check-circle" size="sm" className="dela-panel__check-icon" />
            <span className="dela-panel__readiness-summary-text">
              {HEALTHY_ROWS.length} healthy:{' '}
              {HEALTHY_ROWS.map((row) => row.description).join(', ')}
            </span>
            <Icon name={showHealthy ? 'chevron-up' : 'chevron-down'} size="sm" />
          </button>
          {showHealthy && (
            <ul className="dela-eac-health__list" aria-label="Healthy indicators">
              {HEALTHY_ROWS.map((row) => (
                <IndicatorCard key={row.description} row={row} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

const NEXT_STEPS_PROMPT = 'What should I do next?'

const whyPrompt = (row: EacHealthIndicator) =>
  `Why is ${row.description} ${row.status === 'At Risk' ? 'at risk' : 'healthy'}?`

const findIndicator = (text: string) =>
  HEALTH_INDICATOR_ROWS.find((r) => text.includes(r.description.toLowerCase()))

/** Suggested prompts for the latest Dela answer; `null` means the opening EAC health summary. */
export function eacHealthFollowUpPrompts(lastPrompt: string | null): string[] {
  if (lastPrompt === null) return [whyPrompt(AT_RISK_ROWS[0]), NEXT_STEPS_PROMPT]
  const text = lastPrompt.toLowerCase()
  const row = findIndicator(text)
  if (row) {
    const nextAtRisk = AT_RISK_ROWS[AT_RISK_ROWS.indexOf(row) + 1]
    return [...(nextAtRisk ? [whyPrompt(nextAtRisk)] : []), NEXT_STEPS_PROMPT]
  }
  if (/next|fix|should i/.test(text)) return []
  return HEALTH_INDICATOR_ROWS.map(whyPrompt)
}

export function DelaEacHealthFollowUps({
  prompts,
  onAsk,
}: {
  prompts: string[]
  onAsk: (prompt: string) => void
}) {
  return (
    <div className="dela-eac-health__follow-ups" aria-label="Suggested follow-ups">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          className="dela-eac-health__follow-up"
          onClick={() => onAsk(prompt)}
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}

export interface DelaEacHealthFollowUpProps {
  prompt: string
  layout?: EacHealthLayout
}

/** Answers a follow-up about one indicator, or the recommended next steps. */
export function DelaEacHealthFollowUp({ prompt, layout = 'cards' }: DelaEacHealthFollowUpProps) {
  const text = prompt.toLowerCase()
  const row = findIndicator(text)

  if (row) {
    return (
      <div className="dela-eac-health">
        {layout === 'list' ? (
          <div className="dela-eac-rows__answer">
            <p className="dela-eac-rows__verdict">
              <StatusIcon status={row.status} />
              <strong>{row.description}</strong>
            </p>
            <IndicatorDetail row={row} />
          </div>
        ) : (
          <ul className="dela-eac-health__list" aria-label={row.description}>
            <IndicatorCard row={row} />
          </ul>
        )}
        <p className="dela-panel__response">
          {row.status === 'At Risk'
            ? `EAC version ${EAC_HEALTH_CONTEXT.eacVersion} forecasts ${row.eac} against a budget of ${row.budget} (${row.variancePct}). A gap this large is outside the acceptable variance threshold, so the indicator is flagged At Risk.`
            : `This indicator is within threshold, so no action is needed.`}
        </p>
      </div>
    )
  }

  if (/next|fix|should i/.test(text)) {
    return (
      <div className="dela-eac-health">
        <p className="dela-panel__response">To bring EAC version {EAC_HEALTH_CONTEXT.eacVersion} back to healthy:</p>
        <ol className="dela-eac-health__steps">
          <li>Enter forecast revenue, hours and costs for the remaining periods.</li>
          <li>Recalc the EAC so totals roll up.</li>
          <li>Ask Dela to check EAC health again.</li>
        </ol>
        <div className="dela-panel__transaction-actions">
          <Button type="button" variant="primary" size="sm">
            Modify EAC
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="dela-eac-health">
      <p className="dela-panel__response">
        I can explain any of the {HEALTH_INDICATOR_ROWS.length} EAC health indicators. Pick one to
        see its budget, EAC and variance.
      </p>
    </div>
  )
}

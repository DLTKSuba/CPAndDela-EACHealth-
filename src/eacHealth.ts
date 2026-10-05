export type EacHealthStatus = 'At Risk' | 'Healthy'

export type EacHealthIndicator = {
  description: string
  budget: string
  eac: string
  variance: string
  variancePct: string
  status: EacHealthStatus
  reason: string
  /** One-line "why" for compact rows. */
  shortReason: string
  selected?: boolean
}

/** The EAC the Project Budgets / EACs screen has selected. */
export const EAC_HEALTH_CONTEXT = {
  projectId: '10105',
  projectName: 'Cybersecurity Diag & Mit',
  eacVersion: '1',
  closedPeriod: '04/30/2020',
} as const

export const HEALTH_INDICATOR_ROWS: EacHealthIndicator[] = [
  { description: 'Budget Revenue', budget: '$256,409', eac: '$0', variance: '-256409.02', variancePct: '-100.0%', status: 'At Risk', reason: 'Forecast Revenue ($0) is 100% below Budget Revenue ($256,409)', shortReason: 'No revenue forecast entered against $256K budget', selected: true },
  { description: 'Hours Total', budget: '6,010', eac: '100.3', variance: '-5909.97', variancePct: '-98.34%', status: 'At Risk', reason: 'Project is 98% under-utilized in terms of hours', shortReason: 'Only 100 of 6,010 budgeted hours forecast' },
  { description: 'Raw Cost Total', budget: '$179,500', eac: '$2,501', variance: '-176999.25', variancePct: '-98.61%', status: 'At Risk', reason: 'Raw Cost Forecast ($2,501) differs significantly from Budget ($179,500). Variance exceeds acceptable thresholds.', shortReason: 'Only $2.5K of $179.5K raw cost forecast' },
  { description: 'Burdened Cost Total', budget: '$244,109', eac: '$2,801', variance: '-241398.23', variancePct: '-98.85%', status: 'At Risk', reason: 'Lower cost than budget', shortReason: 'Only $2.8K of $244.1K burdened cost forecast' },
  { description: 'EAC Age', budget: 'N/A', eac: '0 periods', variance: '0 periods', variancePct: '-', status: 'Healthy', reason: 'EAC data is up-to-date; changes were recent (not stale data)', shortReason: 'Updated this period, so data isn’t stale' },
]

export const AT_RISK_COUNT = HEALTH_INDICATOR_ROWS.filter((r) => r.status === 'At Risk').length
export const OVERALL_HEALTH: EacHealthStatus = AT_RISK_COUNT > 0 ? 'At Risk' : 'Healthy'

/** Element id of the page section Dela links back to. */
export const EAC_HEALTH_SECTION_ID = 'eac-health-indicator-title'

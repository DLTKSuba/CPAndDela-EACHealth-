import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Icon } from './Icon'
import { Button } from './Button'
import { Input } from './Input'
import { Dropdown } from './Dropdown'
import { DelaChatHistory } from './DelaChatHistory'
import {
  DelaEacHealthFollowUp,
  DelaEacHealthFollowUps,
  DelaEacHealthResponse,
  eacHealthFollowUpPrompts,
  type EacHealthLayout,
} from './DelaEacHealthResponse'
import './DelaPanelContent.css'

interface DelaMessage {
  id: string
  text: string
}

type BudgetPhase = 'idle' | 'selecting' | 'confirmed' | 'status-confirmed' | 'cancelled'

type DelaIntent = 'budget' | 'eac-health'

const EAC_HEALTH_PROMPT = /health/i
const EAC_HEALTH_THINKING_MS = 1200

/** Projects an accountant would start a budget from; the first matches the open screen. */
const PROJECT_OPTIONS = [
  '9800.001.10 · V3 DATA PROCUREMENT',
  '9800.001.20 · V3 DATA MIGRATION',
  '1050-ADMIN · CORPORATE ADMINISTRATION',
  '2200.004.00 · FIELD SERVICES EXPANSION',
]

const WBS_LEVEL_OPTIONS = [
  'Project',
  'Level 1 · Task',
  'Level 2 · Subtask',
  'Level 3 · Work package',
]

const BUDGET_COMPLETION_OPTIONS = [
  { value: 'commit-budget', label: 'Commit Budget' },
  { value: 'commit-complete', label: 'Commit & Complete' },
  { value: 'commit-complete-approve', label: 'Commit, Complete & Approve' },
  { value: 'commit-mark-final', label: 'Commit & Mark Final' },
  { value: 'commit-complete-approve-final', label: 'Commit, Complete, Approve & Mark Final' },
]

export interface DelaProjectBudgetContentProps {
  /** Empty-state prompt shown before the first message is sent. */
  greeting?: string
  placeholder?: string
  disclaimer?: string
  /** Dropped into the empty composer on first click so the flow can be demoed in two clicks. */
  suggestedPrompt?: string
  /** `eac-health` answers every opening prompt with the EAC health summary. */
  scenario?: DelaIntent
  eacHealthLayout?: EacHealthLayout
}

export function DelaProjectBudgetContent({
  greeting = 'What’s on the agenda today?',
  placeholder = 'Ask Dela Anything...',
  disclaimer = 'Disclaimer',
  suggestedPrompt = 'Start project budget',
  scenario = 'budget',
  eacHealthLayout = 'cards',
}: DelaProjectBudgetContentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const statusStepRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [messages, setMessages] = useState<DelaMessage[]>([])
  const [startedOn, setStartedOn] = useState('')
  const [phase, setPhase] = useState<BudgetPhase>('idle')
  const [project, setProject] = useState('')
  const [wbsLevel, setWbsLevel] = useState('')
  const [budgetStatus, setBudgetStatus] = useState('commit-budget')
  const [intent, setIntent] = useState<DelaIntent>('budget')
  const [healthReady, setHealthReady] = useState(false)

  const hasConversation = messages.length > 0
  const canSend = draft.trim() !== ''
  const canContinue = project.trim() !== '' && wbsLevel.trim() !== ''
  /** Continue and Cancel both settle the selection, so the fields stay on screen read-only. */
  const selectionLocked =
    phase === 'confirmed' || phase === 'status-confirmed' || phase === 'cancelled'
  const statusLocked = phase === 'status-confirmed' || phase === 'cancelled'
  const followUpPrompts =
    intent === 'eac-health' && healthReady
      ? eacHealthFollowUpPrompts(messages.length > 1 ? messages[messages.length - 1].text : null)
      : []
  const budgetStatusLabel =
    BUDGET_COMPLETION_OPTIONS.find((option) => option.value === budgetStatus)?.label ??
    'Commit Budget'

  useEffect(() => {
    if (phase !== 'confirmed' && phase !== 'status-confirmed') return
    statusStepRef.current?.scrollIntoView({ block: 'nearest' })
  }, [phase])

  useEffect(() => {
    if (intent !== 'eac-health' || phase === 'idle' || healthReady) return
    const timer = window.setTimeout(() => setHealthReady(true), EAC_HEALTH_THINKING_MS)
    return () => window.clearTimeout(timer)
  }, [intent, phase, healthReady])

  const sendDraft = useCallback(() => {
    const text = draft.trim()
    if (text === '') return
    setMessages((prev) => {
      if (prev.length === 0) {
        setStartedOn(new Date().toLocaleDateString())
        setIntent(
          scenario === 'eac-health' || EAC_HEALTH_PROMPT.test(text) ? 'eac-health' : 'budget'
        )
        setPhase('selecting')
      }
      return [...prev, { id: `dela-message-${Date.now()}`, text }]
    })
    setDraft('')
  }, [draft, scenario])

  const prefillDraft = useCallback(() => {
    if (draft !== '' || suggestedPrompt === '') return
    setDraft(suggestedPrompt)
  }, [draft, suggestedPrompt])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      sendDraft()
    },
    [sendDraft]
  )

  const editTitle = useCallback(() => {
    const first = messages[0]
    if (!first) return
    setDraft(first.text)
    inputRef.current?.focus()
  }, [messages])

  const clearConversation = useCallback(() => {
    setHistoryOpen(false)
    setDraft('')
    setMessages([])
    setStartedOn('')
    setPhase('idle')
    setProject('')
    setWbsLevel('')
    setBudgetStatus('commit-budget')
    setIntent('budget')
    setHealthReady(false)
  }, [])

  const askFollowUp = useCallback((prompt: string) => {
    setMessages((prev) => [...prev, { id: `dela-message-${Date.now()}`, text: prompt }])
  }, [])

  useEffect(() => {
    if (intent !== 'eac-health' || messages.length < 2) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [intent, messages.length])

  const renderUserMessage = (message: DelaMessage) => (
    <div key={message.id} className="dela-panel__message-group">
      <div className="dela-panel__message-row dela-panel__message-row--user">
        <div className="dela-panel__bubble dela-panel__bubble--user">{message.text}</div>
      </div>
      <div className="dela-panel__message-actions">
        <button
          type="button"
          className="dela-panel__toolbar-action"
          aria-label="Copy message"
          onClick={() => void navigator.clipboard?.writeText(message.text)}
        >
          <Icon name="square-2-stack" size="sm" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="dela-panel__body">
      <div className="dela-panel__quick-actions">
        <button
          type="button"
          className="dela-panel__toolbar-action"
          aria-label="New conversation"
          title="New conversation"
          onClick={clearConversation}
        >
          <Icon name="plus" size="md" />
        </button>
        <button
          type="button"
          className="dela-panel__toolbar-action"
          aria-label="Chat history"
          title="Chat history"
          aria-pressed={historyOpen}
          onClick={() => setHistoryOpen((open) => !open)}
        >
          <Icon name="clock" size="md" />
        </button>
        <button
          type="button"
          className="dela-panel__toolbar-action"
          aria-label="Help"
          title="Help"
        >
          <Icon name="question-mark-circle" size="md" />
        </button>
        <button
          type="button"
          className="dela-panel__toolbar-action"
          aria-label="Dela settings"
          title="Dela settings"
        >
          <Icon name="cog-6-tooth" size="md" />
        </button>
      </div>

      {historyOpen ? (
        <DelaChatHistory
          onBack={() => setHistoryOpen(false)}
          onSelect={(entry) => {
            setHistoryOpen(false)
            setDraft(entry.title)
            inputRef.current?.focus()
          }}
        />
      ) : (
        <>
          {hasConversation && (
            <div className="dela-panel__conversation-header">
              <h3 className="dela-panel__conversation-title">{messages[0].text}</h3>
              <div className="dela-panel__conversation-actions">
                <button
                  type="button"
                  className="dela-panel__toolbar-action"
                  aria-label="Edit prompt"
                  onClick={editTitle}
                >
                  <Icon name="pencil" size="sm" />
                </button>
                <button
                  type="button"
                  className="dela-panel__toolbar-action"
                  aria-label="Delete conversation"
                  onClick={clearConversation}
                >
                  <Icon name="trash" size="sm" />
                </button>
              </div>
            </div>
          )}

          <div className="dela-panel__scroll" ref={scrollRef}>
            {hasConversation ? (
              <>
                <div className="dela-panel__date-divider">{startedOn}</div>
                {(intent === 'eac-health' ? messages.slice(0, 1) : messages).map(renderUserMessage)}

                {phase !== 'idle' && intent === 'eac-health' && (
                  <>
                  <div className="dela-panel__message-row">
                    <span className="dela-panel__mark-button" aria-hidden="true">
                      <img
                        src={healthReady ? '/RS_Dela_Active.svg' : '/Stars.svg'}
                        alt=""
                        className={
                          healthReady
                            ? 'dela-panel__message-icon dela-panel__message-icon--dela'
                            : 'dela-panel__message-icon dela-panel__message-icon--thinking'
                        }
                      />
                    </span>
                    <div className="dela-panel__turn">
                      {healthReady ? (
                        <DelaEacHealthResponse layout={eacHealthLayout} />
                      ) : (
                        <p className="dela-panel__readiness" role="status" aria-live="polite">
                          Checking EAC health indicators ...
                        </p>
                      )}
                    </div>
                  </div>
                  {healthReady &&
                    messages.slice(1).map((message) => (
                      <Fragment key={message.id}>
                        {renderUserMessage(message)}
                        <div className="dela-panel__message-row">
                          <span className="dela-panel__mark-button" aria-hidden="true">
                            <img
                              src="/RS_Dela_Active.svg"
                              alt=""
                              className="dela-panel__message-icon dela-panel__message-icon--dela"
                            />
                          </span>
                          <div className="dela-panel__turn">
                            <DelaEacHealthFollowUp
                              prompt={message.text}
                              layout={eacHealthLayout}
                            />
                          </div>
                        </div>
                      </Fragment>
                    ))}
                  </>
                )}

                {phase !== 'idle' && intent === 'budget' && (
                  <div className="dela-panel__message-row">
                    <button
                      type="button"
                      className="dela-panel__mark-button"
                      aria-label="Start a new conversation"
                      title="Start a new conversation"
                      onClick={clearConversation}
                    >
                      <img
                        src="/RS_Dela_Active.svg"
                        alt=""
                        className="dela-panel__message-icon dela-panel__message-icon--dela"
                      />
                    </button>
                    <div className="dela-panel__turn">
                      <div className="dela-panel__field-group">
                        <span className="dela-panel__field-group-label">
                          <img src="/RS_Dela_Active.svg" alt="" />
                          Select the project and WBS level you would like to create the budget for
                        </span>
                        <div className="dela-panel__field-row">
                          <Input
                            id="dela-budget-project"
                            name="project"
                            list="dela-budget-project-options"
                            placeholder="Project"
                            aria-label="Project"
                            value={project}
                            disabled={selectionLocked}
                            onChange={(event) => setProject(event.target.value)}
                          />
                          <datalist id="dela-budget-project-options">
                            {PROJECT_OPTIONS.map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                          <Input
                            id="dela-budget-wbs-level"
                            name="wbsLevel"
                            list="dela-budget-wbs-options"
                            placeholder="WBS level"
                            aria-label="WBS level"
                            value={wbsLevel}
                            disabled={selectionLocked}
                            onChange={(event) => setWbsLevel(event.target.value)}
                          />
                          <datalist id="dela-budget-wbs-options">
                            {WBS_LEVEL_OPTIONS.map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                        </div>
                      </div>

                      {phase === 'selecting' && (
                        <div className="dela-panel__turn-actions">
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={!canContinue}
                            onClick={() => setPhase('confirmed')}
                          >
                            Continue
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPhase('cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {(phase === 'confirmed' || phase === 'status-confirmed') && (
                        <>
                          <p className="dela-panel__period-confirm" role="status" aria-live="polite">
                            Creating a budget for {project} at {wbsLevel} level.
                          </p>
                          <div className="dela-panel__field-group" ref={statusStepRef}>
                            <span className="dela-panel__field-group-label">
                              <img src="/RS_Dela_Active.svg" alt="" />
                              What would you like Dela to do when budget creation is complete?
                            </span>
                            <div className="dela-panel__field-row dela-panel__field-row--single">
                              <Dropdown
                                id="dela-budget-status"
                                name="budgetStatus"
                                options={BUDGET_COMPLETION_OPTIONS}
                                value={budgetStatus}
                                onChange={setBudgetStatus}
                                disabled={statusLocked}
                              />
                            </div>
                          </div>
                          {phase === 'confirmed' && (
                            <div className="dela-panel__turn-actions">
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={() => setPhase('status-confirmed')}
                              >
                                Continue
                              </Button>
                            </div>
                          )}
                          {phase === 'status-confirmed' && (
                            <p
                              className="dela-panel__period-confirm"
                              role="status"
                              aria-live="polite"
                            >
                              Dela will {budgetStatusLabel} when budget creation is complete.
                            </p>
                          )}
                        </>
                      )}

                      {phase === 'cancelled' && (
                        <p className="dela-panel__response">
                          Project budget creation has been cancelled.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="dela-panel__greeting">{greeting}</p>
            )}
          </div>

          {followUpPrompts.length > 0 && (
            <DelaEacHealthFollowUps prompts={followUpPrompts} onAsk={askFollowUp} />
          )}

          <div className="dela-panel__input-row">
            <div className="dela-panel__input-box">
              <input
                ref={inputRef}
                type="text"
                className="dela-panel__input"
                placeholder={placeholder}
                aria-label={placeholder}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                onClick={prefillDraft}
                onFocus={prefillDraft}
              />
              <button type="button" className="dela-panel__input-action" aria-label="Attach file">
                <Icon name="paperclip" size="md" />
              </button>
              <button
                type="button"
                className="dela-panel__input-action"
                aria-label="Use microphone"
              >
                <Icon name="microphone" size="md" />
              </button>
              <button
                type="button"
                className="dela-panel__input-action dela-panel__input-action--send"
                aria-label="Send message"
                disabled={!canSend}
                onClick={sendDraft}
              >
                <Icon name="paper-airplane" size="md" />
              </button>
            </div>
          </div>

          <div className="dela-panel__footer">
            <Icon name="information-circle" size="sm" />
            <span>{disclaimer}</span>
          </div>
        </>
      )}
    </div>
  )
}

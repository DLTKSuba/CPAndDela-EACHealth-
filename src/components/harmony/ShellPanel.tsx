import type { CSSProperties, ReactNode, PointerEvent as ReactPointerEvent } from 'react'
import { useState, useCallback, forwardRef } from 'react'
import clsx from 'clsx'
import { Icon } from './Icon'
import './ShellPanel.css'

type ResizeEdge = 'inline' | 'block' | 'corner'

const MIN_PANEL_WIDTH = 360
const MIN_PANEL_HEIGHT = 320
/** Keeps the dragged edge clear of the viewport edge and the opposite sidebar. */
const VIEWPORT_GUTTER = 72
const VIEWPORT_BOTTOM_GAP = 5

export interface ShellPanelProps {
  side: 'left' | 'right'
  open: boolean
  title: string
  titleIcon?: string
  headerVariant?: 'theme' | 'default'
  width?: 'narrow' | 'full'
  showClose?: boolean
  showPopout?: boolean
  variant?: 'default' | 'dela'
  /** Theme header gradient (Dela AI / useGradientHeader items); mirrors data-gradient-header in Astro */
  useGradientHeader?: boolean
  id?: string
  className?: string
  onClose?: () => void
  onWidthToggle?: (width: 'narrow' | 'full') => void
  /** Adds drag handles on the inner edge, bottom edge and inner-bottom corner. Double-click a handle to reset. */
  resizable?: boolean
  header?: ReactNode
  children?: ReactNode
}

export const ShellPanel = forwardRef<HTMLDivElement, ShellPanelProps>(function ShellPanel(
  {
    side,
    open,
    title,
    titleIcon,
    headerVariant = 'theme',
    width: controlledWidth,
    showClose = true,
    showPopout = true,
    variant = 'default',
    useGradientHeader = false,
    id,
    className = '',
    onClose,
    onWidthToggle,
    resizable = false,
    header,
    children,
  },
  ref
) {
  const [internalWidth, setInternalWidth] = useState<'narrow' | 'full'>('narrow')
  const width = controlledWidth ?? internalWidth
  const [customSize, setCustomSize] = useState<{ width?: number; height?: number }>({})
  const [resizing, setResizing] = useState(false)

  const handleResizeStart = useCallback(
    (edge: ResizeEdge) => (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      const panel = event.currentTarget.parentElement
      if (!panel) return
      event.preventDefault()
      const handle = event.currentTarget
      handle.setPointerCapture(event.pointerId)

      const start = panel.getBoundingClientRect()
      const startX = event.clientX
      const startY = event.clientY
      const resizeInline = edge !== 'block'
      const resizeBlock = edge !== 'inline'
      setResizing(true)

      const onMove = (move: PointerEvent) => {
        const next: { width?: number; height?: number } = {}
        if (resizeInline) {
          const delta = side === 'right' ? startX - move.clientX : move.clientX - startX
          const maxWidth = Math.max(MIN_PANEL_WIDTH, window.innerWidth - VIEWPORT_GUTTER)
          next.width = Math.min(maxWidth, Math.max(MIN_PANEL_WIDTH, start.width + delta))
        }
        if (resizeBlock) {
          const maxHeight = Math.max(
            MIN_PANEL_HEIGHT,
            window.innerHeight - start.top - VIEWPORT_BOTTOM_GAP
          )
          next.height = Math.min(
            maxHeight,
            Math.max(MIN_PANEL_HEIGHT, start.height + move.clientY - startY)
          )
        }
        setCustomSize((prev) => ({ ...prev, ...next }))
      }

      const onEnd = () => {
        handle.removeEventListener('pointermove', onMove)
        handle.removeEventListener('pointerup', onEnd)
        handle.removeEventListener('pointercancel', onEnd)
        setResizing(false)
      }

      handle.addEventListener('pointermove', onMove)
      handle.addEventListener('pointerup', onEnd)
      handle.addEventListener('pointercancel', onEnd)
    },
    [side]
  )

  const handleResizeReset = useCallback(() => setCustomSize({}), [])

  const panelStyle: CSSProperties | undefined = resizable
    ? {
        width: width === 'narrow' ? customSize.width : undefined,
        height: customSize.height,
        bottom: customSize.height != null ? 'auto' : undefined,
      }
    : undefined

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const handleToggleWidth = useCallback(() => {
    const next = width === 'full' ? 'narrow' : 'full'
    if (controlledWidth == null) setInternalWidth(next)
    onWidthToggle?.(next)
  }, [width, controlledWidth, onWidthToggle])

  const panelClasses = clsx(
    'shell-panel',
    `shell-panel--${side}`,
    `shell-panel--${width}`,
    open && 'shell-panel--open',
    resizable && 'shell-panel--resizable',
    resizing && 'shell-panel--resizing',
    className
  )

  const headerClasses = clsx('shell-panel__header', `shell-panel__header--${headerVariant}`)

  return (
    <div
      ref={ref}
      id={id}
      className={panelClasses}
      data-side={side}
      data-open={open}
      data-width={width}
      data-dela-panel={variant === 'dela' ? 'true' : undefined}
      style={panelStyle}
    >
      {header != null ? (
        header
      ) : (
        <div
          className={headerClasses}
          data-header-variant={headerVariant}
          data-gradient-header={useGradientHeader ? 'true' : undefined}
        >
          <div className="shell-panel__header-content">
            <span className="shell-panel__header-icon" data-panel-icon-container>
              {titleIcon != null && (
                <Icon name={titleIcon} size="md" data-panel-icon={titleIcon} />
              )}
            </span>
            <h2 className="shell-panel__title">{title}</h2>
            <div className="shell-panel__actions">
              <button
                type="button"
                className="shell-panel__action shell-panel__action--toggle-width"
                aria-label="Toggle panel width"
                data-panel-toggle-width
                onClick={handleToggleWidth}
              >
                <Icon name="arrows-pointing-out" size="md" variant="outline" className="shell-panel__icon-maximize" />
                <Icon name="arrows-pointing-in" size="md" variant="outline" className="shell-panel__icon-minimize" />
              </button>
              {showPopout && (
                <button
                  type="button"
                  className="shell-panel__action shell-panel__action--popout"
                  aria-label="Pop out panel"
                  data-panel-popout
                >
                  <Icon name="arrow-top-right-on-square" size="md" />
                </button>
              )}
              {showClose && (
                <button
                  type="button"
                  className="shell-panel__action shell-panel__action--close"
                  aria-label="Close panel"
                  data-panel-close
                  onClick={handleClose}
                >
                  <Icon name="x-mark" size="lg" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="shell-panel__content">
        {children ?? (
          <p className="shell-panel__content-default">Panel content. Override by passing default slot content.</p>
        )}
      </div>
      {resizable && (
        <>
          {width === 'narrow' && (
            <div
              className="shell-panel__resize-handle shell-panel__resize-handle--inline"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panel width"
              onPointerDown={handleResizeStart('inline')}
              onDoubleClick={handleResizeReset}
            />
          )}
          <div
            className="shell-panel__resize-handle shell-panel__resize-handle--block"
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize panel height"
            onPointerDown={handleResizeStart('block')}
            onDoubleClick={handleResizeReset}
          />
          {width === 'narrow' && (
            <div
              className="shell-panel__resize-handle shell-panel__resize-handle--corner"
              aria-hidden="true"
              onPointerDown={handleResizeStart('corner')}
              onDoubleClick={handleResizeReset}
            />
          )}
        </>
      )}
    </div>
  )
})

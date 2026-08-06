'use client'

import { ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { erpModules } from '@/lib/erp-modules'
import { cn } from '@/lib/utils'

interface ErpSidebarProps {
  activeViewKey: string
  onSelectView: (viewKey: string) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  openModules: string[]
  onToggleModule: (moduleKey: string) => void
  counts: Record<string, number>
}

export function ErpSidebar({
  activeViewKey,
  onSelectView,
  collapsed,
  onToggleCollapsed,
  openModules,
  onToggleModule,
  counts,
}: ErpSidebarProps) {
  return (
    <aside
      aria-label="ERP modülleri"
      className={cn(
        'flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      {/* Sidebar başlığı + daralt/genişlet */}
      <div
        className={cn(
          'flex h-11 shrink-0 items-center border-b border-border',
          collapsed ? 'justify-center px-0' : 'justify-between px-3',
        )}
      >
        {collapsed ? null : (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Modüller
          </p>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2">
        <ul className="flex flex-col gap-0.5">
          {erpModules.map((mod) => {
            const isOpen = openModules.includes(mod.key)
            const hasActive = mod.views.some((v) => v.key === activeViewKey)

            // Daraltılmış modda yalnızca ikon; tıklayınca ilk görünüme geçer.
            if (collapsed) {
              return (
                <li key={mod.key}>
                  <button
                    type="button"
                    onClick={() => onSelectView(mod.views[0].key)}
                    aria-label={mod.label}
                    title={mod.label}
                    aria-current={hasActive ? 'true' : undefined}
                    className={cn(
                      'grid size-10 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                      hasActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <mod.icon className="size-4.5" />
                  </button>
                </li>
              )
            }

            return (
              <li key={mod.key}>
                <button
                  type="button"
                  onClick={() => onToggleModule(mod.key)}
                  aria-expanded={isOpen}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                    hasActive
                      ? 'font-semibold text-foreground'
                      : 'font-medium text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <mod.icon
                    className={cn('size-4 shrink-0', hasActive ? 'text-accent-foreground' : '')}
                  />
                  <span className="min-w-0 flex-1 truncate">{mod.label}</span>
                  <ChevronRight
                    className={cn(
                      'size-3.5 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-90',
                    )}
                  />
                </button>

                {isOpen ? (
                  <ul className="ml-4 flex flex-col gap-0.5 border-l border-border pl-2 pt-0.5">
                    {mod.views.map((view) => {
                      const active = view.key === activeViewKey
                      return (
                        <li key={view.key}>
                          <button
                            type="button"
                            onClick={() => onSelectView(view.key)}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                              active
                                ? 'bg-accent font-semibold text-accent-foreground'
                                : 'font-medium text-muted-foreground hover:bg-secondary hover:text-foreground',
                            )}
                          >
                            <span className="min-w-0 truncate">{view.label}</span>
                            <span
                              className={cn(
                                'shrink-0 font-mono text-[10px]',
                                active ? 'text-accent-foreground/70' : 'text-muted-foreground/70',
                              )}
                            >
                              {counts[view.key] !== undefined ? counts[view.key] : view.rows.length}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      </nav>

      {!collapsed ? (
        <div className="shrink-0 border-t border-border px-3 py-2">
          <p className="text-[10px] font-medium text-muted-foreground">
            ERP Çekirdek <span className="font-mono">v2.4</span>
          </p>
        </div>
      ) : null}
    </aside>
  )
}

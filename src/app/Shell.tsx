import { BasketIcon, CalendarDotsIcon, ForkKnifeIcon, UsersThreeIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { S, useT } from '../i18n'
import type { TabId } from '../store'
import { TABS, useAppStore } from '../store'
import { TAB_BAR_H, useDevice } from './device'
import { setTab } from './nav'
import { NavStack } from './NavStack'

const ICONS: Record<TabId, Icon> = {
  today: ForkKnifeIcon,
  week: CalendarDotsIcon,
  shop: BasketIcon,
  family: UsersThreeIcon,
}

/** The app: one navigation stack per tab (mounted on first visit, kept alive) + the tab bar. */
export function Shell() {
  const tab = useAppStore((s) => s.tab)
  const visited = useAppStore((s) => s.visited)
  return (
    <div className="absolute inset-0 overflow-hidden bg-bg-grouped">
      {TABS.map((id) => (visited.includes(id) || id === tab ? <NavStack key={id} tab={id} active={id === tab} /> : null))}
      <TabBar />
    </div>
  )
}

export function TabBar() {
  const t = useT()
  const tab = useAppStore((s) => s.tab)
  const badges = useAppStore((s) => s.tabBadges)
  const { safeBottom } = useDevice()
  return (
    <nav
      role="tablist"
      aria-label="FamilyMenu AI"
      className="absolute inset-x-0 bottom-0 z-[25] material-bar shadow-[inset_0_0.5px_0_var(--separator)]"
      style={{ height: TAB_BAR_H + safeBottom, paddingBottom: safeBottom }}
    >
      <div className="grid h-[49px] grid-cols-4 px-2">
        {TABS.map((id) => {
          const active = id === tab
          const Ico = ICONS[id]
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={t(S.tabs[id])}
              onClick={() => setTab(id)}
              className={clsx(
                'group relative flex flex-col items-center justify-start gap-[3px] pt-[6px] transition-colors duration-150',
                active ? 'text-primary' : 'text-[var(--gray)]',
              )}
            >
              <span className="relative flex transition-transform duration-100 ease-out group-active:scale-[0.88]">
                <Ico weight={active ? 'fill' : 'regular'} className="text-[26px]" />
                {badges[id] && <span className="absolute -top-0.5 -right-1 size-2.5 rounded-full bg-danger ring-2 ring-[var(--material-bar)]" />}
              </span>
              <span className="text-[10px] leading-[12px] font-medium tracking-[0.01em]">{t(S.tabs[id])}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

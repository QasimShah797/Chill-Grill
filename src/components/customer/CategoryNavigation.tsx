import { navGroups } from '../../data/categories'

export function CategoryNavigation({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="sticky top-16 z-30 border-y border-white/10 bg-ink/95 backdrop-blur">
      <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3" role="tablist" aria-label="Menu categories">
        {navGroups.map((group) => {
          const selected = active === group.id
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(group.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${selected ? 'bg-brand text-ink' : 'bg-white/8 text-white/80 ring-1 ring-white/10'}`}
            >
              {group.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

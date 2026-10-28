// Onboarding answers (local to the flow). Prefilled with the demo family so a presenter can tap straight through;
// every control still edits this draft. Budget and stores are committed to the app store (prefs).
import { create } from 'zustand'
import { family, onboarding } from '../../data'
import type { FoodTag, L10n, MealSlot, Preference } from '../../data'

export type ChildDraft = { key: string; name: L10n | string; age: number; avatar: string; color: string }
export type WeekdayTime = '30' | '45' | 'none'

export type Draft = {
  adults: number
  children: ChildDraft[]
  /** child key → food tag → preference */
  tastes: Record<string, Partial<Record<FoodTag, Preference>>>
  cuisines: string[]
  dislikes: string[]
  /** member key (adult id or child key) → allergen ids */
  allergies: Record<string, string[]>
  diets: string[]
  slots: Record<MealSlot, boolean>
  weekdayTime: WeekdayTime
  batch: boolean
  budget: number | null
  location: 'unknown' | 'granted' | 'postcode'
}

export const KID_AVATARS = ['👦🏻', '👧🏻', '🧒🏻', '👶🏻', '🧑🏻', '👦🏽', '👧🏽', '🐣']
const KID_COLORS = ['#22A06B', '#C26BD8', '#E0913A', '#3B82F6', '#E05A7A']

const adults = family.members.filter((m) => m.role === 'adult')
const kids = family.members.filter((m) => m.role === 'child')

function initial(): Draft {
  const allergies: Record<string, string[]> = {}
  for (const m of family.members) allergies[m.id] = [...m.allergies]
  return {
    adults: adults.length,
    children: kids.map((k) => ({ key: k.id, name: k.name, age: k.age, avatar: k.avatar, color: k.color })),
    tastes: Object.fromEntries(
      family.tastes.map((t) => [t.memberId, Object.fromEntries(t.foods.map((f) => [f.tag, f.pref]))]),
    ),
    cuisines: family.likes.map((l) => l.id),
    dislikes: family.dislikes.map((d) => d.id),
    allergies,
    diets: [...family.diets],
    slots: { breakfast: family.slots.includes('breakfast'), snack: family.slots.includes('snack'), lunch: family.slots.includes('lunch'), dinner: family.slots.includes('dinner') },
    weekdayTime: family.weekdayMinutes <= 30 ? '30' : family.weekdayMinutes <= 45 ? '45' : 'none',
    batch: family.batchCooking,
    budget: null,
    location: 'unknown',
  }
}

type DraftStore = Draft & {
  set: (patch: Partial<Draft>) => void
  setAdults: (n: number) => void
  setChildren: (n: number) => void
  updateChild: (key: string, patch: Partial<ChildDraft>) => void
  setTaste: (childKey: string, tag: FoodTag, pref: Preference) => void
  toggle: (field: 'cuisines' | 'dislikes' | 'diets', id: string) => void
  toggleAllergy: (memberKey: string, id: string) => void
  reset: () => void
}

let childSeq = 0

export const useDraft = create<DraftStore>()((set) => ({
  ...initial(),
  set: (patch) => set(patch),
  setAdults: (n) => set({ adults: n }),
  setChildren: (n) =>
    set((s) => {
      if (n <= s.children.length) return { children: s.children.slice(0, n) }
      const add: ChildDraft[] = []
      for (let i = s.children.length; i < n; i++) {
        childSeq += 1
        add.push({
          key: `child-${childSeq}`,
          name: '',
          age: 6,
          avatar: KID_AVATARS[(i + 2) % KID_AVATARS.length],
          color: KID_COLORS[i % KID_COLORS.length],
        })
      }
      const tastes = { ...s.tastes }
      for (const c of add) tastes[c.key] = Object.fromEntries(onboarding.foods.map((f) => [f.tag, 'eats' as Preference]))
      return { children: [...s.children, ...add], tastes }
    }),
  updateChild: (key, patch) => set((s) => ({ children: s.children.map((c) => (c.key === key ? { ...c, ...patch } : c)) })),
  setTaste: (childKey, tag, pref) => set((s) => ({ tastes: { ...s.tastes, [childKey]: { ...s.tastes[childKey], [tag]: pref } } })),
  toggle: (field, id) =>
    set((s) => {
      const list = s[field]
      return { [field]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } as Partial<Draft>
    }),
  toggleAllergy: (memberKey, id) =>
    set((s) => {
      const list = s.allergies[memberKey] ?? []
      return { allergies: { ...s.allergies, [memberKey]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } }
    }),
  reset: () => set(initial()),
}))

/** Adult rows for the allergies step: the demo adults first, then generic ones. */
export function adultRows(n: number): { key: string; name: L10n | string; avatar: string; color: string }[] {
  const rows: { key: string; name: L10n | string; avatar: string; color: string }[] = []
  for (let i = 0; i < n; i++) {
    const a = adults[i]
    rows.push(a ? { key: a.id, name: a.name, avatar: a.avatar, color: a.color } : { key: `adult-${i + 1}`, name: '', avatar: '🧑🏻', color: '#8E8E93' })
  }
  return rows
}

// Demo calendar: Mon 26 Oct – Sun 1 Nov 2026 ("today" is Tuesday 27), then 2–8 Nov.
import type { DayId, DemoDay, DemoWeek, L10n, MealSlot, SlotInfo } from './types.ts'

export const TODAY: DayId = 'tue'
export const DAY_IDS: DayId[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
export const SLOT_IDS: MealSlot[] = ['breakfast', 'snack', 'lunch', 'dinner']

export const dayIndex = (day: DayId): number => DAY_IDS.indexOf(day)
export const slotIndex = (slot: MealSlot): number => SLOT_IDS.indexOf(slot)

const SHORT: Record<DayId, L10n> = {
  mon: { el: 'Δε', en: 'Mon' },
  tue: { el: 'Τρ', en: 'Tue' },
  wed: { el: 'Τε', en: 'Wed' },
  thu: { el: 'Πε', en: 'Thu' },
  fri: { el: 'Πα', en: 'Fri' },
  sat: { el: 'Σα', en: 'Sat' },
  sun: { el: 'Κυ', en: 'Sun' },
}
const NAME: Record<DayId, L10n> = {
  mon: { el: 'Δευτέρα', en: 'Monday' },
  tue: { el: 'Τρίτη', en: 'Tuesday' },
  wed: { el: 'Τετάρτη', en: 'Wednesday' },
  thu: { el: 'Πέμπτη', en: 'Thursday' },
  fri: { el: 'Παρασκευή', en: 'Friday' },
  sat: { el: 'Σάββατο', en: 'Saturday' },
  sun: { el: 'Κυριακή', en: 'Sunday' },
}
/** "On <day>" with the right Greek article: «την Κυριακή», «το Σάββατο». */
export const ON_DAY: Record<DayId, L10n> = {
  mon: { el: 'τη Δευτέρα', en: 'on Monday' },
  tue: { el: 'την Τρίτη', en: 'on Tuesday' },
  wed: { el: 'την Τετάρτη', en: 'on Wednesday' },
  thu: { el: 'την Πέμπτη', en: 'on Thursday' },
  fri: { el: 'την Παρασκευή', en: 'on Friday' },
  sat: { el: 'το Σάββατο', en: 'on Saturday' },
  sun: { el: 'την Κυριακή', en: 'on Sunday' },
}
export const dayName = (day: DayId): L10n => NAME[day]

const MONTH_GEN: Record<number, L10n> = {
  10: { el: 'Οκτωβρίου', en: 'October' },
  11: { el: 'Νοεμβρίου', en: 'November' },
}

function makeDay(id: DayId, iso: string, extra: Partial<DemoDay> = {}): DemoDay {
  const [, m, d] = iso.split('-').map(Number)
  return {
    id,
    date: iso,
    short: SHORT[id],
    long: { el: `${NAME[id].el} ${d} ${MONTH_GEN[m].el}`, en: `${NAME[id].en}, ${d} ${MONTH_GEN[m].en}` },
    ...extra,
  }
}

export const week: DemoWeek = {
  label: { el: '26 Οκτ – 1 Νοε', en: '26 Oct – 1 Nov' },
  days: [
    makeDay('mon', '2026-10-26'),
    makeDay('tue', '2026-10-27', {
      note: { el: 'Αύριο αργία: τα σούπερ μάρκετ θα είναι κλειστά', en: 'Holiday tomorrow: supermarkets will be closed' },
    }),
    makeDay('wed', '2026-10-28', {
      note: {
        el: 'Επέτειος του «Όχι» · αργία, χωρίς σχολείο · νηστίσιμη Τετάρτη',
        en: 'Ochi Day · public holiday, no school · fasting Wednesday',
      },
      holiday: true,
      fasting: true,
    }),
    makeDay('thu', '2026-10-29'),
    makeDay('fri', '2026-10-30'),
    makeDay('sat', '2026-10-31'),
    makeDay('sun', '2026-11-01'),
  ],
}

/** The following demo week (2–8 Nov 2026), used after the Sunday recap. */
export const nextWeek: DemoWeek = {
  label: { el: '2 – 8 Νοε', en: '2 – 8 Nov' },
  days: [
    makeDay('mon', '2026-11-02'),
    makeDay('tue', '2026-11-03'),
    makeDay('wed', '2026-11-04', { note: { el: 'Νηστίσιμη Τετάρτη', en: 'Fasting Wednesday' }, fasting: true }),
    makeDay('thu', '2026-11-05'),
    makeDay('fri', '2026-11-06'),
    makeDay('sat', '2026-11-07'),
    makeDay('sun', '2026-11-08', {
      note: { el: 'Των Ταξιαρχών: γιορτάζουν Μιχάλης και Γαβριήλ', en: 'Feast of the Archangels: name day of Michalis and Gavriil' },
    }),
  ],
}

/** Fasting days of the family (same weekday in both demo weeks). */
export const isFastingDay = (day: DayId): boolean => week.days.find((d) => d.id === day)?.fasting === true

export const slots: Record<MealSlot, SlotInfo> = {
  breakfast: { id: 'breakfast', label: { el: 'Πρωινό', en: 'Breakfast' }, short: { el: 'Πρωινό', en: 'Breakfast' }, emoji: '☀️', time: '07:30' },
  snack: { id: 'snack', label: { el: 'Κολατσιό', en: 'School snack' }, short: { el: 'Κολατσιό', en: 'Snack' }, emoji: '🎒', time: '10:30' },
  lunch: { id: 'lunch', label: { el: 'Μεσημεριανό', en: 'Lunch' }, short: { el: 'Μεσημέρι', en: 'Lunch' }, emoji: '🍲', time: '14:30' },
  dinner: { id: 'dinner', label: { el: 'Βραδινό', en: 'Dinner' }, short: { el: 'Βράδυ', en: 'Dinner' }, emoji: '🌙', time: '20:00' },
}

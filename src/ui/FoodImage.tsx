import { clsx } from 'clsx'
import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { recipes } from '../data'
import { useLang } from '../i18n'
import { asset } from './asset'

export type FoodImageProps = {
  /** Recipe id → /images/food/<id>.jpg (and its name as alt text). */
  recipeId?: string
  /** Any other image path (e.g. '/images/hero.jpg'). */
  src?: string
  alt?: string
  /** CSS aspect-ratio, default '4 / 3'. Pass 'auto' when the parent sets the size. */
  aspect?: string
  /** Tailwind rounding class, default rounded-[14px]. */
  rounded?: string
  /** Fallback emoji (otherwise guessed from the recipe id). */
  emoji?: string
  /** Eager-load hero images. */
  priority?: boolean
  className?: string
  style?: CSSProperties
  /** Overlay content (gradients, badges). */
  children?: ReactNode
}

const EMOJI: [RegExp, string][] = [
  [/pizza/, '🍕'],
  [/soup|avgolemono|fasolada|revith|chickpea-soup/, '🍲'],
  [/spaghetti|pasta|hilopites|pastitsio|orzo|giouvetsi/, '🍝'],
  [/pancake/, '🥞'],
  [/omelette|egg/, '🍳'],
  [/toast|toastie/, '🥪'],
  [/yogurt/, '🥣'],
  [/fruit|apple|grape|banana/, '🍎'],
  [/spinach-pies|cheese-pie|greens-pie|pie/, '🥧'],
  [/cod|fish/, '🐟'],
  [/bean|lentil|chickpea/, '🫘'],
  [/salad|horiatiki/, '🥗'],
  [/burger|meatball|souvlaki/, '🍖'],
  [/chicken/, '🍗'],
  [/rice|pilaf/, '🍚'],
  [/koulouri|bread|breadsticks/, '🥯'],
  [/muffin/, '🧁'],
  [/bar|honey/, '🍯'],
  [/gemista/, '🫑'],
  [/zucchini/, '🥒'],
  [/wrap/, '🌯'],
]
export function foodEmoji(id = '') {
  for (const [re, e] of EMOJI) if (re.test(id)) return e
  return '🍽️'
}

/** Warm, deterministic gradient per id (fallback when the photo is missing). */
function gradientFor(id = '') {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const hue = 18 + (h % 50) // terracotta → ochre → olive
  const hue2 = (hue + 28) % 360
  return `radial-gradient(120% 90% at 20% 15%, hsl(${hue} 70% 82%) 0%, transparent 60%), linear-gradient(135deg, hsl(${hue} 58% 72%), hsl(${hue2} 45% 58%))`
}

/**
 * Food photo with skeleton → fade-in on load → graceful gradient + emoji fallback when the file is missing.
 *   <FoodImage recipeId="chicken-giouvetsi" aspect="16 / 10" priority />
 */
export function FoodImage({
  recipeId,
  src,
  alt,
  aspect = '4 / 3',
  rounded = 'rounded-[14px]',
  emoji,
  priority,
  className,
  style,
  children,
}: FoodImageProps) {
  const lang = useLang()
  const path = src ?? (recipeId ? recipes[recipeId]?.image ?? `/images/food/${recipeId}.jpg` : undefined)
  const url = path && asset(path)
  // Load state is keyed by url: a new url derives 'loading' during render (no effect race where a cached
  // image fires onLoad before a reset effect and stays invisible).
  const [loadState, setLoadState] = useState<{ url?: string; state: 'loaded' | 'error' } | null>(null)
  const state: 'loading' | 'loaded' | 'error' = !url ? 'error' : loadState?.url === url ? loadState.state : 'loading'
  const setState = (s: 'loaded' | 'error') => setLoadState({ url, state: s })
  const imgRef = useRef<HTMLImageElement>(null)
  // An image that completed before React attached its listeners (cache, eager) → mark it loaded.
  useLayoutEffect(() => {
    const img = imgRef.current
    if (img && img.complete && loadState?.url !== url) {
      setLoadState({ url, state: img.naturalWidth > 0 ? 'loaded' : 'error' })
    }
  }, [url, loadState?.url])
  const label = alt ?? (recipeId ? recipes[recipeId]?.name[lang] : undefined) ?? ''
  const key = recipeId ?? src ?? ''
  return (
    <div
      className={clsx('relative isolate overflow-hidden bg-fill-3', rounded, className)}
      style={{ aspectRatio: aspect === 'auto' ? undefined : aspect, ...style }}
    >
      {state === 'loading' && (
        <div
          aria-hidden
          className="absolute inset-0 animate-shimmer motion-reduce:animate-none"
          style={{
            backgroundImage: 'linear-gradient(100deg, transparent 30%, var(--fill-4) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      {state === 'error' ? (
        <div
          role="img"
          aria-label={label}
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: gradientFor(key), containerType: 'inline-size' }}
        >
          <span className="text-[clamp(28px,22cqw,72px)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)]" aria-hidden>
            {emoji ?? foodEmoji(key)}
          </span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={url}
          alt={label}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={clsx(
            'absolute inset-0 size-full object-cover transition-opacity duration-300 ease-out',
            state === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
      {children}
    </div>
  )
}

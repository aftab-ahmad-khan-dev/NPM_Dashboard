/**
 * BrandIcon renders a brand glyph using the simple-icons CDN.
 * Falls back to a colored monogram if loading fails.
 *
 * `slug` corresponds to a simple-icons slug. See https://simpleicons.org/
 */
import { useState } from 'react'

interface Props {
  slug: string
  /** Hex color WITHOUT leading # (e.g. "61DAFB"). When omitted, brand default. */
  color?: string
  /** Pixel size of the icon square. */
  size?: number
  className?: string
  /** Accessible label for the icon. */
  alt?: string
  /** Force light/white rendering (useful for very dark logos on dark backgrounds). */
  forceWhite?: boolean
}

export function BrandIcon({
  slug,
  color,
  size = 18,
  className = '',
  alt,
  forceWhite = false,
}: Props) {
  const [failed, setFailed] = useState(false)
  const finalColor = forceWhite ? 'ffffff' : color
  const url = finalColor
    ? `https://cdn.simpleicons.org/${slug}/${finalColor}`
    : `https://cdn.simpleicons.org/${slug}`

  if (failed) {
    return (
      <span
        aria-label={alt || slug}
        className={`inline-flex items-center justify-center rounded text-[10px] font-semibold text-white/80 ${className}`}
        style={{ width: size, height: size, background: '#3f3f46' }}
      >
        {(alt || slug).slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={url}
      width={size}
      height={size}
      alt={alt || slug}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}

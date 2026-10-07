type Props = {
  src?: string
  alt: string
  className?: string
}

export function FoodImage({ src, alt, className = '' }: Props) {
  if (!src) {
    return (
      <div className={`grid place-items-center bg-ink text-brand ${className}`} role="img" aria-label={alt}>
        <span className="font-display text-3xl">CG</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`bg-coal object-cover ${className}`}
      onError={(event) => {
        event.currentTarget.style.display = 'none'
        event.currentTarget.parentElement?.classList.add('image-failed')
      }}
    />
  )
}

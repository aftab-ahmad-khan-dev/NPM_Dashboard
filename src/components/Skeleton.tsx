interface Props {
  className?: string
}

export function Skeleton({ className = '' }: Props) {
  return <div className={`bg-zinc-900/80 animate-pulse rounded-xl ${className}`} />
}

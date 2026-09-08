import { PackageSearch } from "lucide-react"

export function EmptyState({ title, helper }: { title: string; helper?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-spyne-primary-soft text-spyne-primary">
        <PackageSearch size={20} />
      </div>
      <p className="text-[13.5px] font-semibold text-spyne-text-primary">{title}</p>
      {helper && <p className="max-w-xs text-[12px] text-spyne-text-muted">{helper}</p>}
    </div>
  )
}

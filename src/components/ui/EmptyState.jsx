import { PackageSearch } from 'lucide-react'

export default function EmptyState({
  icon: Icon = PackageSearch,
  title = 'Tidak ada data',
  description = '',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-[#F5F2EC] rounded-full flex items-center justify-center mb-5">
        <Icon size={28} strokeWidth={1} className="text-[#9C9890]" />
      </div>
      <h3 className="font-display text-2xl font-light text-[#1C1917] mb-2">{title}</h3>
      {description && (
        <p className="font-body text-sm text-[#9C9890] max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

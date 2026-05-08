export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const spinner = (
    <div className={`${sizes[size]} border-2 border-[#E8E4DC] border-t-[#C9A455] rounded-full animate-spin`} />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAF8F4] z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="font-body text-sm text-[#9C9890] tracking-wide">Memuat...</p>
        </div>
      </div>
    )
  }

  return <div className="flex items-center justify-center py-16">{spinner}</div>
}

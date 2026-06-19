export function LoadingSpinner({
  className = "w-5 h-5",
}: {
  className?: string;
}) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-atelier-ink/10 border-t-atelier-ink ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <LoadingSpinner className="w-7 h-7" />
      {label && (
        <p className="text-xs uppercase tracking-widest text-atelier-stone">
          {label}
        </p>
      )}
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div
                className="h-3.5 bg-gray-200/70 rounded-full animate-pulse"
                style={{ width: `${55 + j * 8}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200/70 rounded-full w-1/3" />
      <div className="h-10 bg-gray-200/70 rounded-full" />
      <div className="h-10 bg-gray-200/70 rounded-full" />
      <div className="h-10 bg-gray-200/70 rounded-full w-1/2" />
    </div>
  );
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200/60 animate-pulse"
        >
          <div className="w-12 h-12 rounded-lg bg-gray-200/70" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-200/70 rounded-full w-1/3" />
            <div className="h-3 bg-gray-200/70 rounded-full w-1/4" />
          </div>
          <div className="h-6 bg-gray-200/70 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

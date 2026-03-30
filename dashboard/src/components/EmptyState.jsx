export default function EmptyState({ message = 'No data yet.' }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-sm text-[#4a4a70]">{message}</p>
    </div>
  )
}

export default function Toast({ toasts }) {
  return (
    <>
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <div className="toast-ic">✦</div>
          <span>{t.msg}</span>
        </div>
      ))}
    </>
  )
}

/** Las estrellas (T16): llenas las ganadas, vacías las que faltan. */
export function Estrellas({ n, tam = 18, testid }: { n: number; tam?: number; testid?: string }) {
  return (
    <span className="estrellas" aria-label={`${n} de 3 estrellas`} data-testid={testid} data-estrellas={n}>
      {[1, 2, 3].map((i) => (
        <svg key={i} width={tam} height={tam} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill={i <= n ? '#f6c33b' : 'none'} stroke={i <= n ? '#f6c33b' : '#6b6966'} strokeWidth="1.5" />
        </svg>
      ))}
    </span>
  )
}

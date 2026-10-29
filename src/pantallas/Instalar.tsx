import type { ReactNode } from 'react'
import { abiertaComoApp } from '../estado/instalada.ts'

/**
 * "Instalar en el iPhone" (menú Más, ajustes de la app 2026-10-28): cómo dejar la app en la pantalla de inicio con
 * Safari, en los pasos que Carlos hizo en su iPhone. Los nombres de los botones van como los muestra el iPhone (en
 * inglés) con su explicación en español. Los dibujos son propios y simples, hechos aquí; nunca capturas (traen datos
 * personales y el repo es público). Para Android o la computadora no hay guía por ahora; Chrome en el iPhone, tampoco.
 */


// ---- los dibujos: un trozo de la pantalla del iPhone, con lo que se toca marcado por un aro verde
const FONDO = '#1c1b19'
const PANEL = '#3c3a37'
const RAYA = '#6b6864'
const TEXTO = '#f4f4f2'
const ARO = '#a3d160'

function Dibujo({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 104" aria-hidden="true" className="dibujo-paso">
      <rect width="160" height="104" rx="12" fill={FONDO} />
      {children}
    </svg>
  )
}

const Raya = ({ x, y, w }: { x: number; y: number; w: number }) => <rect x={x} y={y} width={w} height="6" rx="3" fill={RAYA} />
const Aro = (p: { x: number; y: number; w: number; h: number; r?: number }) => <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r ?? 8} fill="none" stroke={ARO} strokeWidth="3" />

/** 1. La barra de abajo de Safari: atrás, la dirección y el botón ⋯. */
const DibujoPuntos = () => (
  <Dibujo>
    <rect x="12" y="12" width="136" height="34" rx="6" fill="#2a2926" />
    <circle cx="24" cy="74" r="13" fill={PANEL} />
    <path d="M27 68l-6 6 6 6" fill="none" stroke={TEXTO} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="42" y="61" width="74" height="26" rx="13" fill={PANEL} />
    <Raya x={52} y={71} w={54} />
    <circle cx="136" cy="74" r="13" fill={PANEL} />
    <circle cx="130.5" cy="74" r="1.8" fill={TEXTO} />
    <circle cx="136" cy="74" r="1.8" fill={TEXTO} />
    <circle cx="141.5" cy="74" r="1.8" fill={TEXTO} />
    <Aro x={119} y={57} w={34} h={34} r={17} />
  </Dibujo>
)

/** 2. El menú que abre ⋯, con Share arriba. */
const DibujoShare = () => (
  <Dibujo>
    <rect x="22" y="8" width="126" height="88" rx="12" fill="#2b2a28" />
    <path d="M38 24v-8m-4 4l4-4 4 4M34 22v8h8v-8" fill="none" stroke={TEXTO} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <text x="52" y="28" fontSize="13" fill={TEXTO} fontFamily="Inter, sans-serif">
      Share
    </text>
    <Aro x={27} y={12} w={116} h={24} />
    {[48, 64, 80].map((y) => (
      <g key={y}>
        <rect x="34" y={y} width="8" height="8" rx="2" fill={RAYA} />
        <Raya x={52} y={y + 1} w={y === 64 ? 62 : 74} />
      </g>
    ))}
  </Dibujo>
)

/** 3. La fila de botones redondos al pie de la hoja para compartir, con View More al final. */
const DibujoVerMas = () => (
  <Dibujo>
    {[20, 54, 88].map((x) => (
      <g key={x}>
        <circle cx={x} cy="42" r="14" fill={PANEL} />
        <Raya x={x - 12} y={66} w={24} />
      </g>
    ))}
    <circle cx="131" cy="42" r="14" fill={PANEL} />
    <path d="M125 39l6 6 6-6" fill="none" stroke={TEXTO} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="131" y="74" fontSize="10" fill={TEXTO} textAnchor="middle" fontFamily="Inter, sans-serif">
      View More
    </text>
    <circle cx="131" cy="42" r="18.5" fill="none" stroke={ARO} strokeWidth="3" />
  </Dibujo>
)

/** 4. La lista que aparece, con Add to Home Screen. */
const DibujoAgregar = () => (
  <Dibujo>
    <rect x="8" y="8" width="144" height="88" rx="12" fill="#4a4845" />
    {[18, 36, 54].map((y) => (
      <g key={y}>
        <rect x="18" y={y} width="10" height="10" rx="2" fill="#7a7773" />
        <Raya x={36} y={y + 2} w={y === 36 ? 60 : 80} />
      </g>
    ))}
    <rect x="18" y="73" width="11" height="11" rx="2.5" fill="none" stroke={TEXTO} strokeWidth="1.5" />
    <path d="M23.5 76v5m-2.5-2.5h5" stroke={TEXTO} strokeWidth="1.5" strokeLinecap="round" />
    <text x="36" y="82.5" fontSize="10.5" fill={TEXTO} fontFamily="Inter, sans-serif">
      Add to Home Screen
    </text>
    <Aro x={12} y={67} w={136} h={24} />
  </Dibujo>
)

/** 5. El renglón Open as Web App con su interruptor prendido. */
const DibujoWebApp = () => (
  <Dibujo>
    <rect x="8" y="14" width="144" height="26" rx="6" fill="#2a2926" />
    <Raya x={16} y={24} w={70} />
    <rect x="8" y="48" width="144" height="36" rx="8" fill={PANEL} />
    <text x="14" y="70" fontSize="10" fill={TEXTO} fontFamily="Inter, sans-serif">
      Open as Web App
    </text>
    <rect x="114" y="56" width="30" height="20" rx="10" fill="#4cb84c" />
    <circle cx="134" cy="66" r="8" fill="#fff" />
    <Aro x={109} y={51} w={40} h={30} r={15} />
  </Dibujo>
)

/** 6. Arriba de la ventana: cerrar, el título y Add. */
const DibujoAdd = () => (
  <Dibujo>
    <circle cx="22" cy="28" r="12" fill={PANEL} />
    <path d="M18 24l8 8m0-8l-8 8" stroke={TEXTO} strokeWidth="1.8" strokeLinecap="round" />
    <Raya x={46} y={25} w={56} />
    <rect x="114" y="15" width="36" height="26" rx="13" fill="#6aaef0" />
    <text x="132" y="32" fontSize="12" fontWeight="700" fill="#0d2a47" textAnchor="middle" fontFamily="Inter, sans-serif">
      Add
    </text>
    <Aro x={109} y={10} w={46} h={36} r={18} />
    <rect x="12" y="56" width="30" height="30" rx="7" fill={PANEL} />
    <Raya x={52} y={62} w={60} />
    <Raya x={52} y={76} w={86} />
  </Dibujo>
)

/** 7. La pantalla de inicio con el ícono de la app. */
const DibujoInicio = () => (
  <Dibujo>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={20 + i * 34} y="62" width="22" height="22" rx="6" fill={PANEL} />
    ))}
    <image href={`${import.meta.env.BASE_URL}icono.svg`} x="16" y="10" width="30" height="30" />
    <text x="31" y="52" fontSize="9" fill={TEXTO} textAnchor="middle" fontFamily="Inter, sans-serif">
      Aperturas
    </text>
    <Aro x={11} y={5} w={40} h={40} r={10} />
  </Dibujo>
)

const PASOS: { dibujo: ReactNode; texto: ReactNode }[] = [
  {
    dibujo: <DibujoPuntos />,
    texto: (
      <>
        Toca <strong>⋯</strong>, junto a la dirección, abajo a la derecha.
      </>
    ),
  },
  {
    dibujo: <DibujoShare />,
    texto: (
      <>
        Toca <strong>Share</strong> (compartir).
      </>
    ),
  },
  {
    dibujo: <DibujoVerMas />,
    texto: (
      <>
        Toca <strong>View More</strong> (ver más), al final de la fila de botones.
      </>
    ),
  },
  {
    dibujo: <DibujoAgregar />,
    texto: (
      <>
        Toca <strong>Add to Home Screen</strong> (agregar a la pantalla de inicio).
      </>
    ),
  },
  {
    dibujo: <DibujoWebApp />,
    texto: (
      <>
        Revisa que <strong>Open as Web App</strong> (abrir como app) esté prendido.
      </>
    ),
  },
  {
    dibujo: <DibujoAdd />,
    texto: (
      <>
        Toca <strong>Add</strong> (agregar), arriba a la derecha.
      </>
    ),
  },
  {
    dibujo: <DibujoInicio />,
    texto: (
      <>
        Listo: el ícono <strong>Aperturas</strong> aparece en tu pantalla de inicio. Ábrela desde ahí.
      </>
    ),
  },
]

export function Instalar() {
  const instalada = abiertaComoApp()
  return (
    <div className="instalar">
      <h1>Instalar en el iPhone</h1>
      {instalada ? (
        <p className="tarjeta ya-instalada" data-testid="ya-instalada">
          Ya la tienes como app.
        </p>
      ) : (
        <>
          <p className="apagado">Con Safari. Para Android o computadora aún no hay guía.</p>
          <ol className="pasos-instalar" data-testid="pasos-instalar">
            {PASOS.map((p, i) => (
              <li key={i} data-testid="paso-instalar">
                {p.dibujo}
                <p>
                  <span className="numero-paso">{i + 1}.</span> {p.texto}
                </p>
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="apagado nota-instalar" data-testid="nota-instalar">
        Funciona sin internet después de abrirla una vez, y lo que guardas vive en esa app. Para pasar tu avance de Safari, usa Respaldo en Ajustes.
      </p>
    </div>
  )
}

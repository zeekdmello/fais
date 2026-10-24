export function Art({ kind = 'sun', className = '' }) {
  const shared = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  return (
    <svg className={`art ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <g {...shared}>
        {kind === 'sun' && (
          <>
            <path d="M19 76h64M26 71a27 27 0 0154 0" fill="#ffde71" />
            <path d="M53 28v-9M21 43l-7-6M82 42l7-7M14 63H7M90 63h5" />
            <path d="M44 56v3m17-3v3m-16 9q8 7 15 0" />
          </>
        )}
        {kind === 'book' && (
          <>
            <path d="M14 25q20-7 36 7 20-13 36-7v51q-17-5-36 7-16-12-36-7z" fill="#74b6a3" />
            <path d="M50 32v51M22 35l18 7m-18 3l18 7m20-10l16-6m-16 16l16-6" />
          </>
        )}
        {kind === 'water' && (
          <>
            <path d="M28 20h44L65 84H35z" fill="#bfe4f1" />
            <path d="M31 48q9-9 19 0t19 0M42 61v3m16-3v3m-15 8q7 5 13 0" />
          </>
        )}
        {kind === 'cup' && (
          <>
            <path d="M24 41h47v31q-2 13-23 13T24 72z" fill="#e4ba8c" />
            <path d="M71 45h7q18 13-6 23M19 88h59M36 31q-10-10 0-20m15 20q-10-10 0-20m14 20q-10-10 0-20" />
          </>
        )}
        {kind === 'leaf' && (
          <>
            <path
              d="M50 84V52M50 64Q12 70 19 30q34-3 31 34M50 51q-3-35 33-34 3 36-33 34"
              fill="#b1d890"
            />
            <path d="M29 42l21 22m20-35L50 51" />
          </>
        )}
        {kind === 'moon' && (
          <>
            <path d="M66 15A36 36 0 1079 75 34 34 0 0166 15z" fill="#c6b8e7" />
            <path d="M69 33v13m-7-7h14M84 15v8m-4-4h8M37 56v3m13-3v3m-13 9q6 4 12 0" />
          </>
        )}
        {kind === 'heart' && (
          <>
            <path d="M50 82L18 50C-4 20 38 9 50 30 62 9 104 20 82 50z" fill="#f5aab3" />
            <path d="M39 44v5m23-5v5m-24 12q13 12 25 0" />
          </>
        )}
        {kind === 'shoe' && (
          <>
            <path d="M20 24l21-5 12 29 26 12q15 6 11 19H21q-9-1-9-11z" fill="#f38f77" />
            <path d="M14 70h73M43 32l-10 6m15 5l-11 6m19 3l-11 7M5 47h13M2 57h12" />
          </>
        )}
        {kind === 'car' && (
          <>
            <path d="M15 49l15-18h34l14 18h10v22H11V52z" fill="#f2c75b" />
            <path d="M34 36h24l9 13H24z" fill="#fff" />
            <circle cx="29" cy="73" r="10" fill="#353b31" />
            <circle cx="73" cy="73" r="10" fill="#353b31" />
            <path d="M46 57h10M3 39h17M2 49h8" />
          </>
        )}
        {kind === 'plant' && (
          <>
            <path d="M32 65h39l-7 25H39z" fill="#d3b4e8" />
            <path
              d="M51 64V26M51 51Q13 51 23 23 51 22 51 51M51 39Q54 7 80 14 82 40 51 39"
              fill="#aad180"
            />
          </>
        )}
      </g>
    </svg>
  );
}
export function Spark() {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M30 1l5 19L53 9 41 26l18 5-20 5 12 18-19-12-6 17-4-20L3 50l12-18L1 26l20-4L10 6l17 13z"
        fill="currentColor"
      />
    </svg>
  );
}

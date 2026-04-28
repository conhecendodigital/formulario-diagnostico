import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Mentoria Avance';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0c1120',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: '160px',
            height: '160px',
            borderRadius: '40px',
            background: 'linear-gradient(to bottom right, #0ea5e9, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            boxShadow: '0 20px 40px rgba(14, 165, 233, 0.2)',
          }}
        >
          <svg width="80" height="80" fill="none" viewBox="0 0 48 48">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="white" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: '80px',
            fontWeight: 800,
            color: 'white',
            margin: 0,
            marginBottom: '20px',
            lineHeight: 1.1,
          }}
        >
          Mentoria Avance
        </h1>
        <p
          style={{
            fontSize: '32px',
            color: '#94a3b8',
            margin: 0,
          }}
        >
          Aplicação para a turma exclusiva
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}

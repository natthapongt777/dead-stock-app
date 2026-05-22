import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        borderRadius: '6px',
      }}
    >
      📦
    </div>,
    { ...size }
  )
}

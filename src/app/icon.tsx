import { ImageResponse } from 'next/server';
import { site } from '../util/site.mts';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 8 4" width={size.width}>
          <path d={site.logoPathD} fill="#1e293b" />
        </svg>
      </div>
    ),
    { ...size },
  );
}

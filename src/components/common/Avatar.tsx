import React, { useState } from 'react';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: number; // px
  className?: string;
  rounded?: string;
}

/** Photo avatar with graceful initials fallback (remote images may fail or be offline). */
export const Avatar: React.FC<AvatarProps> = ({ name = '?', src, size = 40, className = '', rounded = 'rounded-xl' }) => {
  const [failed, setFailed] = useState(false);
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
  const style = { width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.38)) };
  if (src && !failed) {
    return <img src={src} alt="" onError={() => setFailed(true)} style={style} className={`${rounded} object-cover bg-brand-800 shrink-0 ${className}`} />;
  }
  return (
    <span style={style} aria-hidden className={`${rounded} bg-brand-400 text-white font-bold flex items-center justify-center shrink-0 ${className}`}>
      {initials}
    </span>
  );
};

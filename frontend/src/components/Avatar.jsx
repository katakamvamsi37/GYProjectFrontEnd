import { useState } from 'react';

export default function Avatar({ user, src = user.avatar_url, large = false }) {
  const [failedSource, setFailedSource] = useState(null);
  return (
    <span className={`avatar${large ? ' large' : ''}`}>
      {src && src !== failedSource ? (
        <img src={src} alt={`${user.name}'s profile`} onError={() => setFailedSource(src)} />
      ) : (
        user.name
          .trim()
          .split(/\s+/)
          .map((part) => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      )}
    </span>
  );
}

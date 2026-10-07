import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

// ESPN serves a variant of each logo made for dark backgrounds
function darkVariant(logo) {
  return logo.includes('/500/') ? logo.replace('/500/', '/500-dark/') : null;
}

export default function TeamLogo({ logo, logoDark, alt, className }) {
  const theme = useTheme();
  const [darkFailed, setDarkFailed] = useState(false);
  if (!logo) return null;
  const dark = theme === 'dark' && !darkFailed ? logoDark ?? darkVariant(logo) : null;

  return (
    <img
      src={dark ?? logo}
      alt={alt}
      className={className}
      onError={() => dark && setDarkFailed(true)}
    />
  );
}

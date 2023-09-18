'use client';

import { useEffect, useState } from 'react';

export const Query = () => {
  const [query, setQuery] = useState('なし');
  useEffect(() => {
    if (typeof location !== 'undefined') {
      setQuery(location.search);
    }
  }, []);
  return <code>{query}</code>;
};

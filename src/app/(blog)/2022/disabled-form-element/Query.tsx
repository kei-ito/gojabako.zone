'use client';
import { useEffect, useState } from 'react';
import { getCurrentUrl } from '../../../../util/getCurrentUrl.mts';

export const Query = () => {
  const [query, setQuery] = useState('なし');
  useEffect(() => setQuery(getCurrentUrl().search), []);
  return <code>{query}</code>;
};

import {useCallback, useState} from 'react';

export const useFocus = () => {
    const [focused, setFocused] = useState(false);
    const onFocus = useCallback(() => setFocused(true), []);
    const onBlur = useCallback(() => setFocused(false), []);
    return {focused, onFocus, onBlur};
};

import { useEffect, useRef, useState } from "react";


export function useInterval(callback: () => void, delay: number, enabled: boolean = true) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    });

    useEffect(() => {
        function tick() {
            if (enabled)
                savedCallback.current();
        }

        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}

/**
 * returns: [value, setValueToTrue, setValueToFalse, toggleValue]
 */
export const useBoolState = (defaultValue = false): [boolean, () => void, () => void, () => void] => {
    const [value, setValue] = useState(defaultValue);

    return [value, () => setValue(true), () => setValue(false), () => setValue(!value)]
}

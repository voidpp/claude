import { useState } from "react";

export const useBoolState = (defaultValue = false): [boolean, () => void, () => void, () => void] => {
    const [value, setValue] = useState(defaultValue);

    return [value, () => setValue(true), () => setValue(false), () => setValue(!value)]
}

export function useForceUpdate() {
    const [_, setValue] = useState([]);
    return () => setValue([]);
}

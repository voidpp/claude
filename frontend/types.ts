
export type LocalStorageValue<T> = {
    value: T,
    setValue: (value: T) => void,
}

export type LocalStorageSchema = {
    selectedDashboard: LocalStorageValue<string>,
}

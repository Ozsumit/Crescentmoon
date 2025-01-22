export function setLocalStorageItem(key, value) {
  const stringValue = JSON.stringify(value)
  localStorage.setItem(key, stringValue)

  // Dispatch a custom event to trigger the storage listener
  window.dispatchEvent(new StorageEvent("storage", {
    key: key,
    newValue: stringValue,
  }))
}


// localStorage can be missing or throw (privacy modes, sandboxed iframes,
// blocked site data). Saved preferences are a convenience, so fail quietly.

export const readStorage = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore: the preference just won't persist.
  }
};

export const removeStorage = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore: nothing to clear.
  }
};

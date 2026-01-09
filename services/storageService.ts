
export const StorageKeys = {
  AUTH_TOKEN: 'safety_authToken',
  USER_ROLE: 'safety_userRole',
  OBSERVATIONS: 'safety_observations'
};

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`[StorageService] Failed to retrieve key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`[StorageService] Failed to save key "${key}":`, error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert("Storage quota exceeded. Some data may not be saved locally.");
      } else {
        alert("Local storage access error. Session persistence might be affected.");
      }
      return false;
    }
  },

  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] Failed to remove key "${key}":`, error);
    }
  },

  clearSession: (): void => {
    try {
      window.localStorage.removeItem(StorageKeys.AUTH_TOKEN);
      window.localStorage.removeItem(StorageKeys.USER_ROLE);
    } catch (error) {
      console.error("[StorageService] Failed to clear session data:", error);
    }
  }
};

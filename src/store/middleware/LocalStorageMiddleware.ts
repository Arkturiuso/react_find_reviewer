import { Middleware } from '@reduxjs/toolkit';

export const STORAGE_KEY = 'react_find_reviewer_settings';

export const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof action.type === 'string' &&
    action.type.startsWith('settings/')
  ) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().settings));
    } catch (error) {
      console.warn(`Не удалось сохранить настройки: ${error}`);
    }
  }

  return result;
};

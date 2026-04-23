import { useLayoutEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  setExcludeBots,
  setLogin,
  setRepo,
  setBlacklist,
  resetSettings,
} from './store/slices/Settings';
import { STORAGE_KEY } from './store/middleware/LocalStorageMiddleware';
import Settings from './AppSettings/Settings';
import Search from './ReviewerSearch/Search';

const App = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const initDone = useRef(false);

  useLayoutEffect(() => {
    if (initDone.current) {return;}
    initDone.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        dispatch(setLogin(s.login || ''));
        dispatch(setRepo(s.repo || ''));
        dispatch(setBlacklist(Array.isArray(s.blacklist) ? s.blacklist : []));
        dispatch(setExcludeBots(s.excludeBots ?? false));
      }
    } catch (error) {
      console.warn(`Ошибка парсинга localStorage: ${error}`);
    }
  }, [dispatch]);

  return (
    <>
      <Settings
        excludeBots={settings.excludeBots}
        login={settings.login}
        repo={settings.repo}
        blacklist={settings.blacklist}
        setExcludeBots={(value) => dispatch(setExcludeBots(value))}
        onLoginChange={(value) => dispatch(setLogin(value))}
        onRepoChange={(value) => dispatch(setRepo(value))}
        onBlacklistChange={(value) => dispatch(setBlacklist(value))}
        onReset={() => {
          dispatch(resetSettings());
          localStorage.removeItem(STORAGE_KEY);
        }}
      />
      <Search
        currentLogin={settings.login}
        currentRepo={settings.repo}
        blacklist={settings.blacklist}
        excludeBots={settings.excludeBots}
      />
    </>
  );
};

export default App;

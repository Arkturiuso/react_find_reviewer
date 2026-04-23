import cn from 'classnames';
import { useEffect, useState } from 'react';
import styles from './SettingsStyles.module.less';

interface SettingsProps {
  setExcludeBots: (value: boolean) => void;
  excludeBots: boolean;
  login: string;
  repo: string;
  blacklist: string[];
  onLoginChange: (value: string) => void;
  onRepoChange: (value: string) => void;
  onBlacklistChange: (value: string[]) => void;
  onReset: () => void;
}

const splitBlacklistLogins = (blacklist: string): string[] => blacklist
    .split(',')
    .map((login) => login.trim())
    .filter((login) => login.length > 0);

const Settings = ({
  setExcludeBots,
  excludeBots,
  login,
  repo,
  blacklist,
  onLoginChange,
  onRepoChange,
  onBlacklistChange,
  onReset,
}: SettingsProps) => {
  const [settingsVisibility, setSettingsVisibility] = useState<boolean>(false);
  const [blacklistInput, setBlacklistInput] = useState<string>(() => blacklist.join(', '));

  const isValidRepo = (): boolean => (
      repo.length > 0 &&
      repo.includes('/') &&
      !repo.startsWith('/') &&
      !repo.endsWith('/')
    );

  useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
    setBlacklistInput(blacklist.join(', '));
  }, [blacklist]);

  return (
    <div className={styles['settings']}>
      <button
        className={styles['settings__button']}
        onClick={() => setSettingsVisibility(!settingsVisibility)}
        type="button"
      >
        {settingsVisibility ? 'Скрыть' : 'Показать'} настройки
      </button>
      <div
        className={cn(
          styles['settings__block'],
          settingsVisibility ? styles['settings__block--active'] : styles['settings__block--inactive']
        )}
      >
        <input
          value={login}
          onChange={(event) => onLoginChange(event.target.value)}
          type="text"
          placeholder="Логин"
          className={styles['settings__input']}
        />
        <input
          value={repo}
          onChange={(event) => onRepoChange(event.target.value)}
          type="text"
          placeholder="Репозиторий (owner/repo)"
          className={cn(
            styles['settings__input'],
            isValidRepo() || !repo
              ? styles['settings__input--valid']
              : styles['settings__input--invalid']
          )}
        />
        {!isValidRepo() && repo !== '' && (
          <span className={styles['settings__invalid-value']}>Неверный формат</span>
        )}
        <input
          value={blacklistInput}
          onChange={(event) => onBlacklistChange(splitBlacklistLogins(event.target.value))}
          type="text"
          placeholder="Список логинов через запятую"
          className={styles['settings__input']}
        />
        <div className={styles['settings__checkbox']}>
          <input
            id="settings__checkbox__option"
            className={styles['settings__checkbox__option']}
            type="checkbox"
            checked={excludeBots}
            onChange={() => setExcludeBots(!excludeBots)}
          />
          <label className={styles['settings__checkbox__label']} htmlFor="settings__checkbox__option">
            Игнорировать ботов
          </label>
        </div>
        <button className={styles['settings__reset']} onClick={onReset} type="button">
          Сбросить все настройки
        </button>
      </div>
    </div>
  );
};

export default Settings;

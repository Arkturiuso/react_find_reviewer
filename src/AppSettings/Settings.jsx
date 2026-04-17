import cn from 'classnames';
import { useEffect, useState } from 'react';

import styles from './SettingsStyles.module.less';

const splitBlacklistLogins = (blacklist) => {
    return blacklist
        .split(',')
        .map((login) => login.trim())
        .filter((login) => login.length > 0);
};

const Settings = ({
    setExcludeBots,
    excludeBots,
    login,
    repo,
    blacklist,
    onLoginChange,
    onRepoChange,
    onBlacklistChange,
}) => {
    const [settingsVisibility, setSettingsVisibility] = useState(false);
    const [blacklistInput, setBlacklistInput] = useState(() =>
        blacklist.join(', ')
    );

    const isValidRepo = () => {
        return (
            repo.length > 0 &&
            repo.includes('/') &&
            !repo.startsWith('/') &&
            !repo.endsWith('/')
        );
    };

    const resetSettings = () => {
        onLoginChange('');
        onRepoChange('');
        onBlacklistChange([]);
        setExcludeBots(false);

        localStorage.removeItem('settings_login');
        localStorage.removeItem('settings_repo');
        localStorage.removeItem('settings_blacklist');
    };

    useEffect(() => {
        setBlacklistInput(blacklist.join(', '));
    }, [blacklist]);

    return (
        <div className={styles['settings']}>
            <button
                className={styles['settings__button']}
                onClick={() => setSettingsVisibility(!settingsVisibility)}
            >
                {settingsVisibility ? 'Скрыть' : 'Показать'} настройки
            </button>
            <div
                className={cn(
                    styles['settings__block'],
                    settingsVisibility
                        ? styles['settings__block--active']
                        : styles['settings__block--inactive']
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
                    <span className={styles['settings__invalid-value']}>
                        Неверный формат
                    </span>
                )}
                <input
                    value={blacklistInput}
                    onChange={(event) =>
                        onBlacklistChange(
                            splitBlacklistLogins(event.target.value)
                        )
                    }
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
                    <label
                        className={styles['settings__checkbox__label']}
                        htmlFor="settings__checkbox__option"
                    >
                        Игнорировать ботов
                    </label>
                </div>

                <button
                    className={styles['settings__reset']}
                    onClick={resetSettings}
                >
                    Сбросить все настройки
                </button>
            </div>
        </div>
    );
};

export default Settings;

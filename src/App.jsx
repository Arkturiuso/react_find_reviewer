import { useState } from 'react';

import Settings from './AppSettings/Settings';
import Search from './ReviewerSearch/Search';

const App = () => {
    const [excludeBots, setExcludeBots] = useState(false);
    const [settingsLogin, setSettingsLogin] = useState(
        () => localStorage.getItem('settings_login') || ''
    );
    const [settingsRepo, setSettingsRepo] = useState(
        () => localStorage.getItem('settings_repo') || ''
    );
    const [settingsBlacklist, setSettingsBlacklist] = useState(() => {
        const savedBlacklist = localStorage.getItem('settings_blacklist');
        try {
            return savedBlacklist ? JSON.parse(savedBlacklist) : [];
        } catch {
            return [];
        }
    });

    const handleLoginChange = (value) => {
        setSettingsLogin(value);
        localStorage.setItem('settings_login', value);
    };

    const handleRepoChange = (value) => {
        setSettingsRepo(value);
        localStorage.setItem('settings_repo', value);
    };

    const handleBlacklistChange = (value) => {
        setSettingsBlacklist(value);
        localStorage.setItem('settings_blacklist', JSON.stringify(value));
    };

    return (
        <div>
            <Settings
                excludeBots={excludeBots}
                login={settingsLogin}
                repo={settingsRepo}
                blacklist={settingsBlacklist}
                setExcludeBots={setExcludeBots}
                onLoginChange={handleLoginChange}
                onRepoChange={handleRepoChange}
                onBlacklistChange={handleBlacklistChange}
            />
            <Search
                currentLogin={settingsLogin}
                currentRepo={settingsRepo}
                blacklist={settingsBlacklist}
                excludeBots={excludeBots}
            />
        </div>
    );
};

export default App;

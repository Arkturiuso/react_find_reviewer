import { useState } from 'react';

import handleApiResponse from '../utils/githubApiHandler';
import styles from './SearchStyles.module.less';

const GITHUB_URL = 'https://api.github.com';
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const removeBots = (reviewers) => {
    return reviewers.filter((reviewer) => !reviewer.login.endsWith('[bot]'));
};

const Search = ({ currentLogin, currentRepo, blacklist, excludeBots }) => {
    const [currentUser, setCurrentUser] = useState([]);
    const [filteredReviewers, setFilteredReviewers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState('');

    const [isRolling, setIsRolling] = useState(false);
    const [rollingCandidate, setRollingCandidate] = useState(null);
    const [selectedReviewer, setSelectedReviewer] = useState(null);

    const filterReviewers = (reviewers, excludeBots) => {
        if (!reviewers || reviewers.length === 0) {
            return [];
        }

        const filtered = reviewers.filter(
            (reviewer) =>
                reviewer.login !== currentLogin &&
                !blacklist.includes(reviewer.login)
        );

        if (excludeBots) {
            return removeBots(filtered);
        }

        return filtered;
    };

    const startRollingAnimation = (candidates) => {
        if (!candidates || candidates.length === 0) {
            return;
        }

        setIsRolling(true);
        setSelectedReviewer(null);

        let currentIndex = 0;
        const totalCandidates = candidates.length;
        const finalIndex = Math.floor(Math.random() * totalCandidates);
        let delay = 20;

        const tick = () => {
            currentIndex = (currentIndex + 1) % totalCandidates;
            setRollingCandidate(candidates[currentIndex]);

            delay += 15;

            if (delay < 500) {
                setTimeout(tick, delay);
            } else {
                setIsRolling(false);
                setSelectedReviewer(candidates[finalIndex]);
                setLoading(false);
            }
        };

        setTimeout(tick, delay);
    };

    const findCurrentUser = async () => {
        if (!currentLogin) {
            return;
        }

        const userUrl = `${GITHUB_URL}/users/${currentLogin}?per_page=100`;
        const response = await fetch(userUrl, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        });

        if (!response.ok) {
            const error = handleApiResponse(response);
            console.error(error.message);
            return;
        }

        const userData = await response.json();
        setCurrentUser(userData);
    };

    const finishLoading = () => {
        setLoading(false);
        setHasSearched(true);
    };

    const reselect = () => {
        if (filteredReviewers.length > 1 && !isRolling && !loading) {
            startRollingAnimation(filteredReviewers);
        }
    };

    const findReviewers = async () => {
        setError('');

        if (!currentRepo || currentRepo.trim() === '') {
            setError('Заполните поле "Репозиторий" в настройках');
            return;
        }

        if (!currentLogin || currentLogin.trim() === '') {
            setError('Заполните поле "Логин" в настройках');
            return;
        }

        if (loading || isRolling) {
            return;
        }

        setLoading(true);
        setHasSearched(false);
        setFilteredReviewers([]);
        setSelectedReviewer(null);
        setIsRolling(false);

        try {
            await findCurrentUser();

            const reviewersUrl = `${GITHUB_URL}/repos/${currentRepo}/contributors`;
            const response = await fetch(reviewersUrl, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setError(`Репозиторий не найден`);
                } else {
                    console.error(`API Error: ${response.status}`);
                }
                finishLoading();
                return;
            }

            const reviewersData = await response.json();
            const filteredData = filterReviewers(reviewersData, excludeBots);

            setFilteredReviewers(filteredData);

            if (filteredData.length === 0) {
                setSelectedReviewer(null);
                finishLoading();
            } else if (filteredData.length === 1) {
                setSelectedReviewer(filteredData[0]);
                finishLoading();
            } else {
                startRollingAnimation(filteredData);
            }
        } catch (error) {
            console.log(error);
            finishLoading();
        }
    };

    return (
        <div className={styles['search-panel']}>
            <button
                className={styles['search-panel__find-reviewer']}
                onClick={findReviewers}
                disabled={loading || isRolling}
            >
                Найти ревьюера
            </button>

            {error && (
                <div className={styles['search-panel__error']}>{error}</div>
            )}

            {currentLogin && currentUser.login && (
                <div className={styles['search-panel__current-user']}>
                    <p className={styles['search-panel__current-user__login']}>
                        Пользователь: {currentUser.login}
                    </p>
                    <img
                        className={styles['search-panel__current-user__avatar']}
                        src={currentUser.avatar_url}
                    />
                </div>
            )}

            {isRolling && rollingCandidate && (
                <div className={styles['search-panel__rolling']}>
                    <p className={styles['search-panel__rolling__login']}>
                        Выбор ревьюера: {rollingCandidate.login}
                    </p>
                    <img
                        className={styles['search-panel__rolling__avatar']}
                        src={rollingCandidate.avatar_url}
                    />
                </div>
            )}

            {selectedReviewer && !isRolling && (
                <div className={styles['search-panel__reviewer-block']}>
                    <div className={styles['search-panel__reviewer-info']}>
                        <p
                            className={
                                styles['search-panel__reviewer-info__login']
                            }
                        >
                            Выбран: {selectedReviewer.login}
                        </p>
                        <img
                            className={
                                styles['search-panel__reviewer-info__avatar']
                            }
                            src={selectedReviewer.avatar_url}
                        />
                    </div>

                    {filteredReviewers.length > 1 && (
                        <button
                            className={
                                styles['search-panel__reselect-reviewer']
                            }
                            onClick={reselect}
                            disabled={isRolling}
                        >
                            Выбрать другого
                        </button>
                    )}
                </div>
            )}

            {hasSearched && filteredReviewers.length === 0 && !error && (
                <div className={styles['search-panel__empty']}>
                    Нет ревьюеров
                </div>
            )}
        </div>
    );
};

export default Search;

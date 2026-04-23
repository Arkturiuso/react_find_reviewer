import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setCurrentUser,
  setFilteredReviewers,
  setLoading,
  setHasSearched,
  setError,
  setIsRolling,
  setRollingCandidate,
  setSelectedReviewer,
} from '../store/slices/Search';
import handleApiResponse from '../utils/githubApiHandler';
import { GitHubUser } from '../types';
import styles from './SearchStyles.module.less';

const GITHUB_URL = 'https://api.github.com';
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const removeBots = (reviewers: GitHubUser[]): GitHubUser[] => reviewers.filter((reviewer) => !reviewer.login.endsWith('[bot]'));

interface SearchProps {
  currentLogin: string;
  currentRepo: string;
  blacklist: string[];
  excludeBots: boolean;
}

const Search = ({ currentLogin, currentRepo, blacklist, excludeBots }: SearchProps) => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.search);
  const {
    currentUser,
    filteredReviewers,
    loading,
    hasSearched,
    error,
    isRolling,
    rollingCandidate,
    selectedReviewer,
  } = search;

  const rollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
      if (rollingTimeoutRef.current) {
        clearTimeout(rollingTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, []);

  const filterReviewers = (reviewers: GitHubUser[], excludeBotsFlag: boolean): GitHubUser[] => {
    if (!reviewers || reviewers.length === 0) {
        return [];
    }

    const filtered = reviewers.filter(
      (reviewer) => reviewer.login !== currentLogin && !blacklist.includes(reviewer.login)
    );
    return excludeBotsFlag ? removeBots(filtered) : filtered;
  };

  const stopRollingAnimation = () => {
    if (rollingTimeoutRef.current) {
      clearTimeout(rollingTimeoutRef.current);
      rollingTimeoutRef.current = null;
    }
    dispatch(setIsRolling(false));
    dispatch(setRollingCandidate(null));
  };

  const startRollingAnimation = (candidates: GitHubUser[]) => {
    if (!candidates || candidates.length === 0) {
        return;
    }

    stopRollingAnimation();
    dispatch(setIsRolling(true));
    dispatch(setSelectedReviewer(null));

    let currentIndex = 0;
    const totalCandidates = candidates.length;
    const finalIndex = Math.floor(Math.random() * totalCandidates);
    let delay = 20;

    const tick = () => {
      currentIndex = (currentIndex + 1) % totalCandidates;
      dispatch(setRollingCandidate(candidates[currentIndex]));
      delay += 15;
      if (delay < 500) {
        rollingTimeoutRef.current = setTimeout(tick, delay);
      } else {
        dispatch(setIsRolling(false));
        dispatch(setSelectedReviewer(candidates[finalIndex]));
        dispatch(setLoading(false));
        rollingTimeoutRef.current = null;
      }
    };
    rollingTimeoutRef.current = setTimeout(tick, delay);
  };

  const finishLoading = () => {
    dispatch(setLoading(false));
    dispatch(setHasSearched(true));
  };

  const reselect = () => {
    if (filteredReviewers.length > 1 && !isRolling && !loading) {
      startRollingAnimation(filteredReviewers);
    }
  };

  const findCurrentUser = async (signal: AbortSignal): Promise<GitHubUser | null> => {
    if (!currentLogin) {return null;}
    const userUrl = `${GITHUB_URL}/users/${currentLogin}`;
    const response = await fetch(userUrl, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal,
    });
    if (!response.ok) {
      handleApiResponse(response);
    }
    return response.json();
  };

  const findReviewers = async () => {
    dispatch(setError(''));
    if (!currentLogin?.trim()) {
      dispatch(setError('Заполните поле "Логин" в настройках'));
      return;
    }
    if (!currentRepo?.trim()) {
      dispatch(setError('Заполните поле "Репозиторий" в настройках'));
      return;
    }
    if (loading || isRolling) {
        return;
    }

    stopRollingAnimation();
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    dispatch(setLoading(true));
    dispatch(setHasSearched(false));
    dispatch(setFilteredReviewers([]));
    dispatch(setSelectedReviewer(null));
    dispatch(setIsRolling(false));

    try {
      const contributorsUrl = `${GITHUB_URL}/repos/${currentRepo}/contributors?per_page=100`;
      const contributorsResponse = await fetch(contributorsUrl, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        signal,
      });

      if (!contributorsResponse.ok) {
        if (contributorsResponse.status === 404) {
          throw new Error('Репозиторий не найден');
        }
        throw handleApiResponse(contributorsResponse);
      }

      const [userData, reviewersData] = await Promise.all([
        findCurrentUser(signal),
        contributorsResponse.json(),
      ]);

      if (userData) {
        dispatch(setCurrentUser(userData));
      }

      const filteredData = filterReviewers(reviewersData, excludeBots);
      dispatch(setFilteredReviewers(filteredData));

      if (filteredData.length === 0) {
        dispatch(setSelectedReviewer(null));
        finishLoading();
      } else if (filteredData.length === 1) {
        dispatch(setSelectedReviewer(filteredData[0]));
        finishLoading();
      } else {
        startRollingAnimation(filteredData);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Ошибка при загрузке:', error);
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при загрузке данных';

      dispatch(setError(errorMessage));
      finishLoading();
    } finally {
      abortControllerRef.current = null;
    }
  };

  return (
    <div className={styles['search-panel']}>
      <button
        className={styles['search-panel__find-reviewer']}
        onClick={findReviewers}
        disabled={loading || isRolling}
        type="button"
      >
        Найти ревьюера
      </button>

      {error && <div className={styles['search-panel__error']}>{error}</div>}

      {currentUser?.login && currentUser?.avatar_url && (
        <div className={styles['search-panel__current-user']}>
          <p className={styles['search-panel__current-user__login']}>
            Пользователь: {currentUser.login}
          </p>
          <img
            className={styles['search-panel__current-user__avatar']}
            src={currentUser.avatar_url}
            alt={currentUser.login}
            title={currentUser.login}
          />
        </div>
      )}

      {isRolling && rollingCandidate?.login && rollingCandidate?.avatar_url && (
        <div className={styles['search-panel__rolling']}>
          <p className={styles['search-panel__rolling__login']}>
            Выбор ревьюера: {rollingCandidate.login}
          </p>
          <img
            className={styles['search-panel__rolling__avatar']}
            src={rollingCandidate.avatar_url}
            alt={rollingCandidate.login}
            title={rollingCandidate.login}
          />
        </div>
      )}

      {selectedReviewer?.login && selectedReviewer?.avatar_url && !isRolling && (
        <div className={styles['search-panel__reviewer-block']}>
          <div className={styles['search-panel__reviewer-info']}>
            <p className={styles['search-panel__reviewer-info__login']}>
              Выбран: {selectedReviewer.login}
            </p>
            <img
              className={styles['search-panel__reviewer-info__avatar']}
              src={selectedReviewer.avatar_url}
              alt={selectedReviewer.login}
              title={selectedReviewer.login}
            />
          </div>
          {filteredReviewers.length > 1 && (
            <button
              className={styles['search-panel__reselect-reviewer']}
              onClick={reselect}
              disabled={isRolling}
              type="button"
            >
              Выбрать другого
            </button>
          )}
        </div>
      )}

      {hasSearched && filteredReviewers.length === 0 && !error && (
        <div className={styles['search-panel__empty']}>Нет ревьюеров</div>
      )}
    </div>
  );
};

export default Search;

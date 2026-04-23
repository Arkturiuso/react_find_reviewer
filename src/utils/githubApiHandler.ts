const handleApiResponse = (response: Response): never => {
  switch (response.status) {
    case 401:
      throw new Error('Ошибка авторизации, проверьте токен доступа');
    case 403:
      throw new Error(
        `Превышен лимит запросов к API\nЛимит: ${response.headers.get('x-ratelimit-limit')}`
      );
    case 404:
      throw new Error('Репозиторий не найден. Проверьте название и формат');
    case 429:
      throw new Error('Превышен лимит запросов на сервер. Попробуйте позже');
    default:
      throw new Error(`Код ошибки: ${response.status}\nСообщение: ${response.statusText}`);
  }
};

export default handleApiResponse;

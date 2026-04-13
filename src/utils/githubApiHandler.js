const handleApiResponse = (response) => {
    switch (response.status) {
        case 401:
            throw new Error('Ошибка авторизации, проверьте токен доступа');

        case 403:
            throw new Error(`Превышен лимит запросов к Api\n
                Лимит: ${response.headers.get('x-ratelimit-limit')}`);

        case 429:
            throw new Error(
                'Превышен лимит запросов на сервер. Попробуйте позже'
            );

        default:
            throw new Error(`Код ошибки: ${response.status}\n
                Сообщение ошибки: ${response.statusText}`);
    }
};

export default handleApiResponse;

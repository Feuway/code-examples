/**
 * Created by Smirnov.Denis on 21.11.2017.
 *
 * @flow
 */

import store from '@/store/index';
import Loading from '@/utils/services/loading';

class CheckError extends Error {
    constructor(msgErr: string) {
        super();
        this.name = 'CheckError';
        this.message = msgErr;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CheckError);
        } else {
            this.stack = (new Error()).stack;
        }
    }
}

function findPath(to: Object, arr) {
    let result = false;
    result = !!arr.find((route) => {
        let match = false;
        match = route.path === to.path;
        if (route.children) {
            match = findPath(to, route.children);
        }
        return match;
    });
    return result;
}

export function checkAuthOnServer(): Promise<void> {
    return new Promise((resolve, reject) => {
        // находим в хранилище данные об авторизации
        const { isAuthorized } = store.state.auth;
        // если пользователь уже авторизован
        if (isAuthorized) {
            // разрешаем переход
            resolve();
        } else {
            // иначе запрашиваем данные об авторизации у сервера
            const loadingInstance = Loading({ fullscreen: true, text: 'Проверка авторизации...' });
            store.dispatch('checkAuth')
                .then((result) => {
                    resolve();
                    loadingInstance.close();
                    if (result) {
                        // если результат запроса - true
                        store.dispatch('fetchAccessibleRoutes');
                        store.dispatch('fetchDataCompany');
                    }
                })
                .catch((err) => {
                    reject(err);
                    // reject(new Error('access denied'));
                })
                .finally(() => (loadingInstance.close()));
        }
    });
}

export function checkAuthToRoute(): Promise<void | CheckError> {
    return new Promise(async (resolve, reject) => {
        // находим в хранилище данные об авторизации
        const { isAuthorized } = store.state.auth;
        // и если пользователь уже авторизован
        // разрешаем переход
        // иначе запрет, с именем ошибки
        return isAuthorized
            ? resolve()
            : reject(new CheckError('not authorized'));
    });
}

export function checkAccessToRoute(to: Object): Promise<void | CheckError> {
    return new Promise((resolve, reject) => {
        // находим в хранилище массив доступных путей для навигации
        const { accessibleRoutes } = store.state;
        // устанавливаем по умолчанию запрет
        let access = false;
        // ищем совпадение среди доступных путей
        access = findPath(to, accessibleRoutes);
        // и если совпадение есть
        // разрешаем переход
        // иначе запрет, с именем ошибки
        return access
            ? resolve()
            : reject(new CheckError('access denied'));
    });
}

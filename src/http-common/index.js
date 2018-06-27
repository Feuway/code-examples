/**
 * Created by Smirnov.Denis on 19.09.2017.
 *
 * @flow
 */

import axios, { CancelToken } from 'axios';
import router from "@/router";

type SuccessResponseType = {|
    error: [],
    result: mixed
|};
type ErrorResponseType = {|
    error: {
        code: number,
        value: string
    },
    result: null
|}

type ResponseType = SuccessResponseType | ErrorResponseType;

type MapTypeResponseData = {
    array: Array<any>,
    object: Object,
    boolean: boolean,
    string: string,
    number: number,
    'array-first-element': [any],
};

// eslint-disable-next-line no-undef
type TypesResponseData = $Keys<MapTypeResponseData>;

const mapError = new Map([
    /* eslint-disable */
]);

const BASE_URL = "/api/v1";

/**
 * Набор сурс токенов для отмены запрсов
 *
 * @type {Set<any>}
 */
export const setSourceTokens = new Set();

/**
 * Инстанс axios с предзаданными параметрами
 *
 * @type {AxiosInstance}
 */
export const API = axios.create({
    baseURL: BASE_URL,
    headers: {}
});

/**
 * Отмена всех установленых токенов
 */
export function cancelAllTokens() {
    setSourceTokens.forEach(source => source.cancel('cancel request: ' + source.name));
    // очистка набора
    setSourceTokens.clear();
    // очистка текущего cancel токена axios инстанса
    API.defaults.cancelToken = null;
}


/**
 * Конструктор инстансов axios
 * с предзаданными параметрами
 * и токенами для отмены запроса
 *
 * @returns {{HTTP: AxiosInstance, sourceToken: {token, cancel}}}
 */
export const createHTTP = (
    {
        nameF = 'Unknown fetching data name',
        cancelable = false,
    }: {
        nameF: string,
        cancelable: boolean,
    },
) => {
    const source = CancelToken.source();
    if (cancelable) {
        source.name = nameF;
        setSourceTokens.add(source);
    }

    return {
        HTTP: axios.create({
            baseURL: BASE_URL,
            headers: {},
            cancelToken: source.token
        }),
        sourceToken: source
    };
};

export const getHTTPInstance = (
    {
        nameF = 'Unknown fetching data name',
        cancelable = false,
    }: {
        nameF: string,
        cancelable: boolean,
    },
) => {
    if (cancelable) {
        const source = CancelToken.source();
        source.name = nameF;
        setSourceTokens.add(source);
        API.defaults.cancelToken = source.token;
    }

    return { HTTP: API };
};

/**
 * Обработчик ответов API
 *
 * @param response
 * @param expectedTypesData
 * @returns {Promise<any>}
 */
export const handleResponse = (
    response: Object,
    expectedTypesData: TypesResponseData[] | TypesResponseData,
): Promise<$Values<MapTypeResponseData>> => {
    return new Promise((resolve, reject) => {
        const responseData = response.data;
        let responseResult = null;
        let processedResult = null;

        if (Array.isArray(responseData.error)) {
            // success
            responseResult = responseData.result;
        } else if (typeof responseData.error === 'object') {
            // error
            const { code, value } = responseData.error;
            const nameError = mapError.get(code);
            reject(new Error([nameError, value].join("\n")));
        }

        const checkType = (data, expectedType): boolean => {
            processedResult = data;
            switch (expectedType) {
                case 'array':
                    return Array.isArray(data);
                case 'array-first-element':
                    if (Array.isArray(data)) {
                        processedResult = data[0];
                    }
                    return Array.isArray(data);
                case 'object':
                    return data && typeof data === 'object' && !Array.isArray(data);
                default:
                    return typeof data === expectedType;
            }
        };

        let resultChecking;
        if (Array.isArray(expectedTypesData)) {
            resultChecking = expectedTypesData.some((type) => {
                return checkType(responseResult, type);
            });
        } else {
            resultChecking = checkType(responseResult, expectedTypesData);
        }

        if (resultChecking) {
            resolve(processedResult);
        } else {
            reject(new Error(`Неожидаемый тип данных! Ожидается: "${Array.isArray(expectedTypesData) ? typeof expectedTypesData : expectedTypesData}", получено: "${typeof response}"`));
        }

        return processedResult;
    });
};

/* Вспомогательные константы для обертки */
const NOT_FETCHED = 'not fetched';
const PENDING = 'pending';
const FETCHED = 'fetched';
const allWrappers = new Set();

/**
 * Сброс состояния замыкания обертки для actions store
 * ex: используется после разлогина
 */
export function resetAllWrappers() {
    allWrappers.forEach(status => status.value = NOT_FETCHED);
}

/**
 * Обертка для функции запроса данных
 * Использует замыкание для хранения состояния загрузки
 *
 * @param cb - функциия запроса данных
 * @returns {Function}
 */
export const wrapperFetching = (cb: Function) => {
    // установка стутса NOT_FETCHED по умолчанию
    const status = {
        value: NOT_FETCHED,
    };
    allWrappers.add(status);

    // промиса запроса
    // всегда один на несколько вызовов
    let _resolve;
    let _reject;
    let promiseFetching = new Promise((resolve, reject) => {
        _resolve = resolve;
        _reject = reject;
    });

    /**
     * Стек промисов запросов
     * Необходим для подсчета кол-ва вызовов
     *
     * @type {Array}
     */
    const stackPromiseFetching = [];

    /**
     * Вызов функции запроса - cb
     *
     * @return {Promise<void>}
     */
    async function callFetching(arr: Array<mixed>) {
        // переводим статус в PENDING (ожидание)
        status.value = PENDING;

        await cb.apply(null, arr)
            .then(() => {
                // если вызов cb успешен
                // присваем статус FETCHED (получено)
                // для данной функции запроса данных
                status.value = FETCHED;
                _resolve();
                // обнуляем стек запросов
                stackPromiseFetching.length = 0;
            })
            .catch(async (err) => {
                // если вызов вызвал ошибку
                // присваем статус NOT_FETCHED (не получено)
                status.value = NOT_FETCHED;
                //
                // если ошибка вызвана отменой запроса
                if (err.__proto__.constructor.name === 'Cancel') {
                    // то удаляем первый вызов из стека
                    stackPromiseFetching.splice(0, 1);
                    //
                    if (stackPromiseFetching.length > 0) {
                        // и если есть запросы в стеке
                        // пытаемся по новой загрузить данные
                        await callFetching(arr);
                    }
                } else {
                    // если же ошибка любого другого рода
                    // сбрасываем запрос
                    _reject(err.message);
                }
            });
    }

    return async (...arr: Array<mixed>) => {
        // помещаем вызов функции в стек
        stackPromiseFetching.push(promiseFetching);

        // если стутус функции запроса - NOT_FETCHED (не получено)
        if (status.value === NOT_FETCHED) {
            // вызываем функцию запроса
            await callFetching(arr);
        }

        // если стутус функции запроса - PENDING (ожидание)
        if (status.value === PENDING) {
            // тогда это значит, что функция уже была вызвана
            // и необходимо в этом запросе
            // дождаться завершения в предшествующем
            await promiseFetching;
        }
    };
};

/**
 * Получение файла
 *
 * @param url - имя метода API
 * @param params - объект передачи для API
 * @param filename - имя, для устновки полученному файлу
 * @return {Promise<any>}
 */
export const fetchFile = (url: string, params: Object, filename: string): Promise<void | string> => {
    return new Promise((resolve, reject) => {
        axios({
            url: `${BASE_URL}${url}?query=${JSON.stringify(params)}`,
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            const blob = new Blob([response.data], { type: response.data.type });
            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                // IE workaround for "HTML7007: One or more blob URLs were
                // revoked by closing the blob for which they were created.
                // These URLs will no longer resolve as the data backing
                // the URL has been freed."
                window.navigator.msSaveBlob(blob, filename);
            } else {
                const blobURL = window.URL.createObjectURL(blob);
                const tempLink = document.createElement('a');
                tempLink.style.display = 'none';
                tempLink.href = blobURL;
                tempLink.setAttribute('download', filename);

                // Safari thinks _blank anchor are pop ups. We only want to set _blank
                // target if the browser does not support the HTML5 download attribute.
                // This allows you to download files in desktop safari if pop up blocking
                // is enabled.
                if (typeof tempLink.download === 'undefined') {
                    tempLink.setAttribute('target', '_blank');
                }

                document.body && document.body.appendChild(tempLink);
                tempLink.click();
                document.body && document.body.removeChild(tempLink);
                window.URL.revokeObjectURL(blobURL);
            }

            resolve();
        }).catch((err) => {
            let errorMessage = '';
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // console.log(err.response.data);
                // console.log(err.response.status);
                // console.log(err.response.headers);
                if (err.response.status === 404) {
                    errorMessage = 'File not found'
                }
            } else if (err.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(err.request);
                errorMessage = err.request
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', err.message);
                errorMessage = err.message
            }

            reject(errorMessage);
        });
    });
};

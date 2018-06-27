/**
 * Created by Smirnov.Denis on 23.03.2018.
 *
 * Модуль хранилища всевозможных заявок
 *
 * @flow
 */

import {
    API,
    getHTTPInstance,
    handleResponse,
    wrapperFetching,
} from '@/http-common';
import {
    REQUEST_PLACE, REQUEST_PROBLEM,
    REQUEST_TYPE,
} from '@/utils/constants/requests';
import {
    CommonRequest,
    DeliveryWaterRequest,
    HelpRequest,
} from '@/utils/classes/request';

import { REQUESTS } from '../mutation-types';

const getCode = (value: string) => (CommonRequest.codeByValue(value));
const getCodeHelp = (value: string) => (HelpRequest.codeByValueNewRequest(value));

export default {
    state: {
        listFeedbackRequests: [],
        listHelpRequests: [],
        listAccessControlRequests: [],
        listDeliveryWaterRequests: [],
    },
    getters: {
        /**
         * Список заявок по обратной связи
         *
         * @return {Array|*}
         */
        listFeedbackRequests(state: Object): Array<CommonRequest | void> {
            return state.listFeedbackRequests;
        },

        /**
         * Список заявок по связи c администрацией
         * в разделе помощь
         *
         * @return {Array|*}
         */
        listHelpRequests(state: Object): Array<HelpRequest | void> {
            return state.listHelpRequests;
        },

        /**
         * Список заявок по обратной связи
         * в контроле доступа
         *
         * @returns {Array}
         */
        listAccessControlRequests(state: Object): Array<CommonRequest | void> {
            return state.listAccessControlRequests;
        },

        /**
         * Список новых заявок и не закрытых по заказу воды
         *
         * @param state
         * @return {Array}
         */
        listNewDeliveryWaterRequests(state: Object): DeliveryWaterRequest[] {
            return state.listDeliveryWaterRequests
                .filter(el => el.status === 'Новая' && el.isClosed === 'Нет');
        },
    },
    mutations: {
        /**
         * Очистка состояния модуля
         */
        [REQUESTS.CLEAR_STATE](state: Object) {
            state.listFeedbackRequests = [];
            state.listHelpRequests = [];
            state.listAccessControlRequests = [];
            state.listDeliveryWaterRequests = [];
        },

        /**
         * Установка списка заявок по обратной связи
         */
        [REQUESTS.SET_LIST_FEEDBACK](state, payload) {
            state.listFeedbackRequests = payload.map(CommonRequest.createOnParams);
        },

        /**
         * Установка списка заявок по связи с администрацией
         */
        [REQUESTS.SET_LIST_HELP](state, payload) {
            state.listHelpRequests = payload.map(HelpRequest.createOnParams);
        },

        /**
         * Установка списка заявок по обратной связи
         * в контроле доступа
         */
        [REQUESTS.SET_LIST_ACCESS_CONTROL](state, payload) {
            state.listAccessControlRequests = payload.map(CommonRequest.createOnParams);
        },

        /**
         * Добавление заявки в список
         */
        [REQUESTS.ADD_FEEDBACK_REQUEST_TO_LIST](state, payload) {
            state.listFeedbackRequests.push(CommonRequest.createOnParams(payload));
        },

        /**
         * Добавление заявки в список
         */
        [REQUESTS.ADD_HELP_REQUEST_TO_LIST](state, payload) {
            state.listHelpRequests.push(HelpRequest.createOnParams(payload));
        },

        /**
         * Добавление заявки в список
         */
        [REQUESTS.ADD_ACCESS_CONTROL_REQUEST_TO_LIST](state, payload) {
            state.listAccessControlRequests.push(CommonRequest.createOnParams(payload));
        },

        [REQUESTS.SET_LIST_DELIVERY_WATER](state, payload) {
            state.listDeliveryWaterRequests = payload.map(DeliveryWaterRequest.createOnParams);
        },
        [REQUESTS.ADD_DELIVERY_WATER_REQUEST_TO_LIST](state, payload) {
            state.listDeliveryWaterRequests.push(DeliveryWaterRequest.createOnParams(payload));
        },
    },
    actions: {
        /**
         * Получение списка заявок по обратной связи
         *
         * @return {Promise<void>}
         */
        fetchListFeedbackRequests: wrapperFetching(async ({ commit }) => {
            const { HTTP } = getHTTPInstance({
                nameF: 'listFeedbackRequests',
                cancelable: true,
            });
            const response = await HTTP.post('/exploitation/get_orders', {
                filter: {
                    net_type: [
                        getCode(REQUEST_TYPE.TERMINATION_CONTRACT),
                    ],
                },
            });

            const result = await handleResponse(response, 'array');
            commit(REQUESTS.SET_LIST_FEEDBACK, result);
        }),

        /**
         * Получение списка заявок по обратной связи
         *
         * @return {Promise<void>}
         */
        fetchListHelpRequests: wrapperFetching(async ({ commit }) => {
            const { HTTP } = getHTTPInstance({
                nameF: 'listFeedbackRequests',
                cancelable: true,
            });
            const response = await HTTP.post('/exploitation/get_orders', {
                filter: {
                    place: [getCodeHelp(REQUEST_PLACE.CONNECTION_TO_ADMINS)],
                    problem: [
                        getCodeHelp(REQUEST_PROBLEM.REQUEST),
                        getCodeHelp(REQUEST_PROBLEM.COMPLAINT),
                        getCodeHelp(REQUEST_PROBLEM.OFFER),
                        getCodeHelp(REQUEST_PROBLEM.REVIEW),
                    ],
                },
            });

            const result = await handleResponse(response, 'array');
            commit(REQUESTS.SET_LIST_HELP, result);
        }),

        /**
         * Получение списка заявок по обратной связи
         * в контроле доступа (раздел услуги)
         *
         * @return {Promise<void>}
         */
        fetchListAccessControlRequests: wrapperFetching(async ({ commit }) => {
            const { HTTP } = getHTTPInstance({
                nameF: 'listAccessControlRequests',
                cancelable: true,
            });
            const response = await HTTP.post('/exploitation/get_orders', {
                filter: {
                    net_type: [
                        getCode(REQUEST_TYPE.MATERIAL_THINGS),
                        getCode(REQUEST_TYPE.VIDEO_SURVEILLANCE),
                    ],
                },
            });

            const result = await handleResponse(response, 'array');
            commit(REQUESTS.SET_LIST_ACCESS_CONTROL, result);
        }),

        /**
         * Получение списка заявок по заказу воды
         *
         * @return {Promise<void>}
         */
        fetchListDeliveryWaterRequests: wrapperFetching(async ({ commit }) => {
            const { HTTP } = getHTTPInstance({
                nameF: 'listDeliveryWaterRequests',
                cancelable: true,
            });
            const response = await HTTP.post('/exploitation/get_orders', {
                filter: {
                    net_type: [getCode(REQUEST_TYPE.WATER_DELIVERY)],
                },
            });
            const result = await handleResponse(response, 'array');
            commit(REQUESTS.SET_LIST_DELIVERY_WATER, result);
        }),

        /**
         * Создание новой заявки по обратной связи
         *
         * @return {Promise<void>}
         */
        async createNewFeedbackRequest({ commit, dispatch }: Object, formData: Object) {
            await dispatch('fetchListTerritories');

            const response = await API.post('/exploitation/add_order', {
                params: CommonRequest.createParamsApi(formData),
            });

            const result = await handleResponse(response, 'array-first-element');
            commit(REQUESTS.ADD_FEEDBACK_REQUEST_TO_LIST, result);
        },

        /**
         * Создание новой заявки по обратной связи
         *
         * @return {Promise<void>}
         */
        async createNewHelpRequest({ commit, dispatch }: Object, formData: Object) {
            await dispatch('fetchListTerritories');

            const response = await API.post('/exploitation/add_order', {
                params: HelpRequest.createParamsApi(formData),
            });

            const result = await handleResponse(response, 'array-first-element');
            commit(REQUESTS.ADD_HELP_REQUEST_TO_LIST, result);
        },

        /**
         * Создание новой заявки по обратной связи
         * в контроле доступа (раздел услуги)
         *
         * @return {Promise<void>}
         */
        async createNewAccessControlRequest({ commit, dispatch }: Object, formData: Object) {
            await dispatch('fetchListTerritories');

            const response = await API.post('/exploitation/add_order', {
                params: CommonRequest.createParamsApi(formData),
            });

            const result = await handleResponse(response, 'array-first-element');
            commit(REQUESTS.ADD_ACCESS_CONTROL_REQUEST_TO_LIST, result);
        },

        /**
         * Создание новой заявки на срочную доставку воды
         *
         * @return {Promise<void>}
         */
        async createNewDeliveryWaterRequest({ commit }: Object, formData: Object) {
            const response = await API.post('/exploitation/add_water_order', {
                params: DeliveryWaterRequest.createParamsApi(formData),
            });

            const result = await handleResponse(response, 'array-first-element');
            commit(REQUESTS.ADD_DELIVERY_WATER_REQUEST_TO_LIST, result);
        },
    },
};

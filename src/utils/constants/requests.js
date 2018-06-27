/**
 * Created by Smirnov.Denis on 07.02.2018.
 *
 * @flow
 */

type TObjectFreeze = $ReadOnly<{ [string]: string }>;

// place
export const REQUEST_PLACE: TObjectFreeze = {
    CONNECTION_TO_ADMINS: 'Связь с администрацией',
};

// problem
export const REQUEST_PROBLEM: TObjectFreeze = {
    REQUEST: 'Заявка',
    COMPLAINT: 'Жалоба',
    OFFER: 'Предложение',
    REVIEW: 'Отзыв',
};

// status
export const REQUEST_STATUS: TObjectFreeze = {
    NEW: 'Новая',
    REJECTED: 'Отклонена',
    IN_WORK: 'В работе',
    PAUSED: 'Приостановлена',
    COMPLETED: 'Выполнена',
};

// type
export const REQUEST_TYPE: TObjectFreeze = {
    HARD_COPY: 'Печатная копия',
    ORDER_SERVICE: 'Заказ новых услуг',
    WATER_DELIVERY: 'Доставка воды',
    TERMINATION_CONTRACT: 'Расторжение договора',
    MATERIAL_THINGS: 'Вывоз мат.ценностей',
    VIDEO_SURVEILLANCE: 'Видеонаблюдение',
    OTHER: 'Прочее',
};

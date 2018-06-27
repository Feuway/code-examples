/**
 * Created by Smirnov.Denis on 01.11.2017.
 *
 * Moment.js
 * Library for working with dates and times
 * http://momentjs.com/
 */

import moment from 'moment';

function install(Vue) {
    moment.locale('ru', {
        calendar: {
            lastDay: '[Вчера в] LT',
            sameDay: '[Сегодня в] LT',
            nextDay: '[Завтра в] LT',
            nextWeek: '[В] dd LT',
            lastWeek: 'DD MMM HH:mm',
            sameElse: 'DD MMM HH:mm',
        },
    });
    Object.defineProperty(Vue.prototype, '$moment', { value: moment });
}

export default install;

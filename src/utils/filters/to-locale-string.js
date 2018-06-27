/**
 * Created by Smirnov.Denis on 08.02.2018.
 *
 * Фильтр для приведения числа к ru-RU локали
 *
 * @flow
 */

export default function (value: mixed): mixed {
    let result = null;
    if ('toLocaleString' in Number.prototype) {
        if (typeof value === 'number') {
            result = value.toLocaleString('ru-RU');
        } else if (typeof value === 'string') {
            const num = Number(value);
            result = Number.isNaN(num) ? value : num.toLocaleString('ru-RU');
        }
    } else {
        result = value;
    }
    return result;
}

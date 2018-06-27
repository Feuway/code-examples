/**
 * Created by Smirnov.Denis on 15.06.2018.
 *
 * Вспомогательные функции для работы с массивами
 * @flow
 */

/**
 * Сранение значение полей двух переданных объектов
 *
 * @param dataOne - первый объект
 * @param dataTwo - второй объект
 * @param fieldName - имя поля сравниваемых значений
 * @return {boolean}
 */
function compareValuesFields(dataOne: Object, dataTwo: Object, fieldName: string) {
    const ALL_VALUE = '*';
    const valueItem = dataOne[fieldName];
    const valueFilter = dataTwo[fieldName];
    return valueFilter === ALL_VALUE || valueItem === valueFilter;
}

/**
 * Фильтрация массива по полям
 *
 * @param list - филтруемый список
 * @param dataFilter - объект с полями для филтрации
 * @return {Array<T>}
 */
export function filterByFields<T: Object>(list: Array<T>, dataFilter: Object): Array<T> {
    return list.filter((el) => {
        return Object.keys(dataFilter).every((filterName) => {
            return compareValuesFields(el, dataFilter, filterName);
        });
    });
}

export function plug() {}

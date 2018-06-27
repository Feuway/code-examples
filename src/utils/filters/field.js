/**
 * Created by Smirnov.Denis on 21.12.2017.
 *
 * Фильтр значения по указанному типу

 * @flow
 */

/**
 * Коды телефонных номер разных стран
 * @type {{}}
 */
const CODES_COUNTRIES: { [key: string]: string } = {
    RU: '7',
    BY: '375',
};

/**
 * Маски мобильных телефонов разных стран
 *
 * @type {Map}
 */
const mapMaskPhoneMobile: Map<string, string> = new Map([
    ['7', '(###) ###-##-##'],
    ['375', '(##) ###-##-##'],
]);

/**
 * Установка значения по маске
 *
 * @param mask
 * @param value
 * @return {string}
 */
function setValueByMask(mask: string, value: mixed): string {
    const valueString = String(value).split(' ').join('');
    const current = mask.split('');
    let currentValueCharIndex = 0;

    if (!value) return '';
    return current.map((char: string) => {
        let res = char;
        if (char === '#') {
            res = valueString[currentValueCharIndex];
            currentValueCharIndex++;
        }
        return res;
    }).join('');
}

export default function (value: mixed, type: string) {
    let result = null;

    switch (type) {
        // eslint-disable-next-line no-case-declarations
        case 'phoneMobile':
            let maskPhone = '+7 (###) ###-##-##';
            let valuePhone = value;

            Object.values(CODES_COUNTRIES).find((code) => {
                let matchedCode = false;
                // создаем регулярку из значения кода страны
                const regexp = new RegExp(`^${String(code)}`);
                // ищем совпадение в пераданном значении
                matchedCode = regexp.test(String(value));
                valuePhone = String(value).replace(regexp, '$`');
                // если совпадение есть
                if (matchedCode) {
                    let mask = mapMaskPhoneMobile.get(String(code));
                    if (!mask) mask = '(###) ###-##-##';

                    maskPhone = `+${String(code)} ${mask}`;
                }
                return matchedCode;
            });

            result = setValueByMask(maskPhone, valuePhone);
            break;
        case 'phoneWork':
            result = setValueByMask('### ## ##', value);
            break;
        case 'numberAuto':
            result = setValueByMask('# ### ## ###', value);
            break;
        case 'text':
        default:
            result = value;
    }

    return result;
}

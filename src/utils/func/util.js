/**
 * Created by Smirnov.Denis on 20.12.2017.
 *
 * Различные вспомогательные функции
 * @flow
 */


/**
 * Проверка наличия свойства в объекте
 *
 * @param obj
 * @param prop
 * @return {boolean}
 */
export function hasOwn(obj: {}, prop: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Проверка на пустоту объекта
 *
 * @param obj
 * @return {boolean}
 */
export function isEmptyObject(obj: {}): boolean {
    return JSON.stringify(obj) === '{}';
}

/**
 * Генерация случайного id
 *
 * @return {number}
 */
export function generateRandomId() {
    return Math.floor(Math.random() * 10000);
}

/**
 * «Тормозилка», которая возвращает обёртку,
 * передающую вызов cb не чаще, чем раз в ms миллисекунд.
 *
 * @param cb
 * @param ms
 * @return {wrapper}
 */
export function throttle(cb: Function, ms: number) {
    let isThrottled = false;
    let savedArgs = null;
    let savedThis = null;

    function wrapper(...arg: []) {
        if (isThrottled) {
            savedArgs = arg;
            savedThis = this;
            return;
        }

        cb.apply(this, arg);

        isThrottled = true;

        setTimeout(() => {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = null;
                savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}

/**
 * Чтение файла из Blob | File, с помощью FileReader API
 *
 * @param file
 * @return {Promise}
 */
export function readFile(file: Blob | File): Promise<mixed> {
    return new Promise((resolve, reject) => {
        if (typeof FileReader === 'function') {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.onerror = () => {
                reject(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            reject(new Error('Sorry, FileReader API not supported'));
        }
    });
}

/**
 * Получение пути изображения
 *
 * @param pathImage - путь до изображения
 */
export function getPathImage(pathImage: string): string {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require(`%/images/${pathImage}`);
}

/**
 * Возвращает случайное целое число между min (включительно) и max (не включая max)
 *
 * @param min
 * @param max
 * @return {*}
 */
export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Created by Smirnov.Denis on 08.11.2017.
 *
 * @flow
 */

import paModal from '@/components/pa-modal/PaModal';
import paButton from '@/components/pa-button/PaButton';
import paIcon from '@/components/pa-icon/PaIcon';

type column = {
    id: number,
    visible: boolean,
    label: string,
    prop: string,
    sortable: boolean,
    width: number | string,
    key: string,
    align: string,
};

/**
 *  1 - по возрастанию
 * -1 - по убыванию
 */
type orderSort = 1 | -1;

type data = {
    columns: column[],
    sortOrders: { [string]: orderSort },
    filterKey: string,
    sortKey: string,
    isVisibleModalSorting: boolean,
};

function throttle(func, ms) {
    let isThrottled = false;
    let savedArgs = null;
    let savedThis = null;

    function wrapper(...arg) {
        if (isThrottled) {
            savedArgs = arg;
            savedThis = this;
            return;
        }

        func.apply(this, arg);

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

export default {
    name: 'PaTable',
    components: {
        paModal,
        paButton,
        paIcon,
    },
    props: {
        isMobile: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Array,
            default: () => [],
        },
        filterable: {
            type: Boolean,
            default: false,
        },
        defaultSort: {
            type: Object,
            default() {
                return {
                    prop: '',
                    order: 1,
                };
            },
        },
        isHideCaption: {
            type: Boolean,
            default: false,
        },
        scrollable: {
            type: Boolean,
            default: false,
        },
        scrollingSize: {
            type: Number,
            default: 10,
        },
        hoverable: {
            type: Boolean,
            default: false,
        },
    },
    data(): data {
        return {
            columns: [],
            sortOrders: {},
            filterKey: '',
            sortKey: '',
            isVisibleModalSorting: false,
            //
            // увеличение отображаемых данных при скролле
            handleThrottledScroll: null,
            numberDisplayedRow: 10,
        };
    },
    watch: {
        /**
         * Когда получаем данные,
         * устанавлием ключи для анимации строк
         */
        data() {
            this.setKeyTransitionGroup();
        },

        /**
         * Когда добавляются новые колонки,
         * формируем список сортируемых колонок
         */
        columns() {
            // создание объекта с ключами сортирвки
            this.columns.forEach((col) => {
                if (col.sortable) {
                    if (!this.sortOrders[col.prop]) {
                        this.$set(this.sortOrders, col.prop, 1);
                    }
                }
            });
        },
        /*
         * На мобильных версиях скрываем модалку после выбора сортируемого значения
         */
        sortKey() {
            if (this.isMobile) this.isVisibleModalSorting = false;
        },
    },
    computed: {
        /**
         * Сортируемые колонки
         */
        sortingColumns() {
            return this.columns.filter(col => col.sortable);
        },

        /**
         * Текущая сортируемая колонка
         */
        currentSortedColumn() {
            return this.sortingColumns.find(col => col.key === this.sortKey);
        },

        /**
         * Проверка на наличие данных
         *
         * @return {boolean}
         */
        isEmptyData() {
            return this.data.length > 0;
        },

        /**
         * Отфильтрованный и отсортированный массив данных
         *
         * @return {[*]}
         */
        displayedData() {
            const { filterKey, sortKey } = this;
            const order = this.sortOrders[sortKey] || 1;
            let displayedData = [...this.data];

            if (filterKey) {
                displayedData = displayedData.filter((row) => {
                    return Object.keys(row).some((key) => {
                        return String(row[key]).toLowerCase().indexOf(filterKey.toLowerCase()) > -1;
                    });
                });
            }

            if (sortKey) {
                displayedData.sort((a, b) => {
                    a = this.getValueByPath(a, sortKey);
                    b = this.getValueByPath(b, sortKey);
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }
            return this.scrollable
                ? displayedData.slice(0, this.numberDisplayedRow)
                : displayedData;
        },
    },
    methods: {
        /**
         * Получение значения по пути ключа сортировка
         *
         * @param obj - объект, в котором происходит поиск значения
         * @param path - путь (ключ сортировки)
         * @return {*} значение для сортировки
         */
        getValueByPath(obj: {}, path: string) {
            return path.split('.').reduce((o, i) => o[i], obj);
        },

        /**
         * Добавление колонок в массив колонок
         *
         * @param obj - объект колонки
         */
        addColumn(obj: column) {
            this.columns.push(obj);
        },

        /**
         * Сортировка по выбранной колонке
         *
         * @param key - ключ сортировки (имя колонки)
         * @param order - порядок сортировки
         */
        sortColumnBy({ key }: column = {}, order: orderSort) {
            const { sortOrders } = this;
            if (sortOrders[key] !== order || key !== this.sortKey) {
                this.resetOrders(sortOrders, -1);
                // записать ключ сортировки
                this.sortKey = key;
                console.log('sortColumnBy');
                console.log(order);
                // изменить порядок сортировки
                sortOrders[key] = order;
            }
        },

        /**
         * Сброс порядка сортировки для все колонок
         *
         * @param orders - список всех сортируемых колонок
         * @param order - порядок сортировки
         */
        resetOrders(orders: { [string]: orderSort }, order: orderSort) {
            for (const key in orders) {
                if (Object.prototype.hasOwnProperty.call(orders, key)) {
                    orders[key] = order;
                }
            }
        },

        /**
         * Установка отсортированной колонки
         *
         * @param key - ключ сортировки (имя колонки)
         * @param order - порядок сортировки
         * @return {boolean}
         */
        setIsActive({ key }: column = {}, order: orderSort): boolean {
            const { sortKey, sortOrders } = this;
            let result = false;
            if (key) {
                result = sortKey === key && sortOrders[key] === order;
            }
            return result;
        },

        /**
         * Установка ключей для анимации строк таблицы
         */
        setKeyTransitionGroup() {
            this.data.forEach((el, index) => {
                el._keyTransitionGroup = index;
            });
        },

        /**
         * Обработчик клика по строке таблицы
         *
         * @param row - строка таблицы
         */
        handleClickRow(row: {}) {
            this.$emit('click-row', row);
        },

        /**
         * Установка сортировки по умолчанию
         */
        setDefaultSort() {
            const { prop, order } = this.defaultSort;
            this.$set(this.sortOrders, prop, order);
            this.sortKey = prop;
        },

        /**
         * Обработчик события скролла
         */
        handleScroll() {
            const coords = this.$refs.table.getBoundingClientRect();
            const windowHeight =
                document.documentElement && document.documentElement.clientHeight;
            const bottomVisible = coords.bottom < Number(windowHeight + 100) && coords.bottom > 0;
            if (bottomVisible) this.numberDisplayedRow += this.scrollingSize;
        },
    },
    mounted() {
        this.setDefaultSort();
    },
    created() {
        this.$on('add-column', (value: column) => {
            this.addColumn(value);
        });
        this.setKeyTransitionGroup();
        //
        if (this.scrollable) {
            this.handleThrottledScroll = throttle(this.handleScroll, 300);
            window.addEventListener('wheel', this.handleThrottledScroll);
        }
    },
    destroyed() {
        if (this.scrollable) {
            window.removeEventListener('wheel', this.handleThrottledScroll);
        }
    },
};

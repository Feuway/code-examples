/**
 * Created by Smirnov.Denis on 08.11.2017.
 *
 * @flow
 */

import emitter from '@/utils/mixins/emitter';

type data = {};

export default {
    name: 'PaTableColumn',
    mixins: [emitter],
    props: {
        main: {
            type: Boolean,
            default: false,
        },
        mainSize: {
            type: Number,
            default: 1,
            validator(value: number) {
                return value > 0 && value <= 10;
            },
        },
        visible: {
            type: Boolean,
            default: true,
        },
        label: {
            type: String,
            default: '',
        },
        prop: {
            type: String,
            default: '',
        },
        align: {
            type: String,
            default: 'left',
        },
        alignTitle: {
            type: String,
            default: 'left',
        },
        sortable: {
            type: Boolean,
            default: false,
        },
        width: [Number, String],
        customKey: [Number, String],
    },
    data(): data {
        return {
            key: this.customKey || this.prop,
        };
    },
    methods: {

        /**
         * Добавление данных колонки в стейт таблицы
         */
        addColumnInTable() {
            this.dispatch('PaTable', 'add-column', {
                visible: this.visible,
                label: this.label,
                prop: this.prop,
                sortable: this.sortable,
                width: this.width,
                key: String(this.key),
                align: this.align,
                alignTitle: this.alignTitle,
            });
        },
    },
    created() {
        const matched = this.$parent.$parent.columns.some(column => column.key === this.key);
        if (!matched) this.addColumnInTable();
    },
};


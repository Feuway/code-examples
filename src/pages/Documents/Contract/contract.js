/**
 * Created by Smirnov.Denis on 07.02.2018.
 *
 * @flow
 */

import { mapGetters, mapActions } from 'vuex';
import Contract from '@/utils/classes/contract';

import alertDebtWithPhone from '@/wrappers/alert-debt-with-phone/alert-debt-with-phone';
import paymentOnContract from '@/wrappers/payment-on-contract/PaymentOnContract';

type DataComponents = {
    loading: boolean,
    dataContract: ?Contract,
    activeLotNumber: number,
    isVisibleModalTermination: boolean,
};

export default {
    name: 'Contract',
    components: {
        alertDebtWithPhone,
        paymentOnContract,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    data(): DataComponents {
        return {
            loading: false,
            dataContract: null,
            activeLotNumber: 0,
            isVisibleModalTermination: false,
        };
    },
    computed: {
        ...mapGetters([
            'getDataContract',
            'listContracts',
        ]),

        /**
         * Тип договора
         *
         * @return {string}
         */
        typeContract() {
            return this.dataContract.type !== 'аренда' ? 'telecom' : 'rent';
        },

        /**
         * Имеется список лотов
         *
         * @return {boolean}
         */
        hasListLots(): boolean {
            return this.dataContract.fullListLots.length > 0;
        },

        /**
         * Имеется только один лот
         * в списке лотов
         *
         * @return {boolean}
         */
        hasOnlyOneLot(): boolean {
            return this.dataContract.fullListLots.length === 1;
        },
    },
    watch: {
        /**
         * Получение данных о договоре
         * после загрузки списка всех договоров
         */
        listContracts() {
            this.loadData();
        },
    },
    methods: {
        ...mapActions([
            'fetchListContracts',
        ]),

        /**
         * Установка номера активного лота в слайдере
         *
         * @param number
         */
        setActiveLolNumber(number: number) {
            this.activeLotNumber = (number + 1);
        },

        /**
         * Загрузка данных, необходимых для визуализации комопнента
         *
         * @return {Promise.<void>}
         */
        async loadData() {
            try {
                this.loading = true;
                await this.fetchListContracts();
                this.dataContract = this.getDataContract(Number(this.id));
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
    },
    created() {
        this.loadData();
    },
    beforeRouteUpdate(to: Object, from: Object, next: Function) {
        this.loadData();
        next();
    },
};

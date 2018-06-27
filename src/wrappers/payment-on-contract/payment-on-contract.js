/**
 * Created by Smirnov.Denis on 15.02.2018.
 *
 * Логика компонента платежа по договору
 * note: Возможен перевод на функциональный рендеринг
 * TODO: разделить на подкомпоненты разные оплачиваемые части + разделить по типам договоров
 *
 * @flow
 */

import { mapActions } from 'vuex';

type DataComponents = {
    fetchingDetail: boolean,
};

type Bill = number;

const FIRST_DAY_PAYMENT_VARIABLE_PART = 15;
const LAST_DAY_PAYMENT_VARIABLE_PART = 24;

// const FIRST_DAY_PAYMENT_TELECOM = 1;
// const LAST_DAY_PAYMENT_TELECOM = 20;

// const FIRST_DAY_PAYMENT_INTERCITY = 5;
// const LAST_DAY_PAYMENT_INTERCITY = 20;

// const FIRST_DAY_PAYMENT_EQUIPMENT_RENTAL = 5-15; ???
// const LAST_DAY_PAYMENT_EQUIPMENT_RENTAL = 20;

export default {
    name: 'PaymentOnContract',
    props: {
        title: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            required: true,
        },
        dataContract: {
            type: Object,
            required: true,
        },
    },
    data(): DataComponents {
        return {
            fetchingDetail: false,
            isVisibleModalDetailOnVariable: false,
        };
    },
    computed: {
        /**
         * Сегодняшняя дата
         */
        dateToday() {
            return this.$moment().format('D.MM');
        },

        /**
         * Дата платежа по фиксированной части
         *
         * @return {string}
         */
        datePaymentOnFixedPart() {
            const date = this.dataContract.paymentDay;
            return this.$moment(date, 'D').format('D.MM');
        },

        /**
         * Дата платежа по перменной части
         *
         * @return {string}
         */
        datePaymentOnVariablePart() {
            const date = LAST_DAY_PAYMENT_VARIABLE_PART + 1;
            return this.$moment(date, 'D').format('D.MM');
        },

        /**
         * Имя текущего месяца
         */
        nameCurrentMonth() {
            return this.$moment().format('MMMM');
        },

        /**
         * Имя следующего месяца
         */
        nameNextMonth() {
            return this.$moment().add(1, 'months').format('MMMM');
        },

        /**
         * Имеется ли выставленный счет
         * по фиксированной части
         *
         * @return {boolean}
         */
        hasBillOnFixedPart(): boolean {
            const {
                paymentDay,
            } = this.dataContract;
            const dateP = this.$moment(paymentDay, 'D').format('YYYY.MM.D');
            return this.$moment().isBefore(dateP);
        },

        /**
         * Имеется ли выставленный счет
         * по переменной части
         *
         * @return {boolean}
         */
        hasBillOnVariablePart(): boolean {
            const firstDate =
                this.$moment(FIRST_DAY_PAYMENT_VARIABLE_PART, 'D').format('YYYY.MM.D');
            const lastDate =
                this.$moment(LAST_DAY_PAYMENT_VARIABLE_PART, 'D').format('YYYY.MM.D');
            return this.$moment().isBetween(firstDate, lastDate, null, '');
        },

        /**
         * Оплачен ли счет
         * по фиксированной части
         *
         * @return {boolean}
         */
        isPaidBillOnFixedPart(): boolean {
            let result = false;
            const { debt } = this.dataContract;
            const debtR = debt.fixed;

            if (this.hasBillOnFixedPart) {
                result = debtR <= 0; // проверить
            } else {
                result = debtR <= 0;
            }

            return result;
        },

        /**
         * Баланс фиксированной части
         * Если баланс отрицательный, то это долг
         *
         * @return {number}
         */
        balanceFixedPart(): Bill {
            let result = 0;
            const {
                rentCost,
                debt,
            } = this.dataContract;
            let costR: Bill = rentCost;
            // переворачиваем, т.к. баланс = -долг
            const restR: Bill = -1 * debt.fixed;

            // если время показа счета на оплату уже истекло
            // обнуляем стоимость аренды
            if (!this.hasBillOnFixedPart) costR = 0;
            result = costR + restR;
            return result;
        },

        /**
         * Показывать ли баланс фиксированной части
         *
         * @return {boolean}
         */
        isVisibleBalanceFixedPart(): boolean {
            return this.balanceFixedPart !== 0;
        },

        /**
         * Баланс переменной части
         * Если баланс отрицательный, то это долг
         *
         * @return {number}
         */
        balanceVariablePart(): Bill {
            const { debt } = this.dataContract;
            // переворачиваем, т.к. баланс = -долг
            return debt.variable * -1;
        },

        /**
         * Показывать ли баланс переменной части
         *
         * @return {boolean}
         */
        isVisibleBalanceVariablePart(): boolean {
            return this.balanceVariablePart !== 0;
        },

        /**
         * Баланс переменной части
         * Если баланс отрицательный, то это долг
         *
         * @return {number}
         */
        balanceServices(): Bill {
            const { debt } = this.dataContract;
            // переворачиваем, т.к. баланс = -долг
            return debt.services * -1;
        },

        /**
         * Показывать ли баланс по сопутствующим услугам
         *
         * @return {boolean}
         */
        isVisibleBalanceServices(): boolean {
            return this.balanceServices !== 0;
        },

        /**
         * Счет на оплату фиксированной части
         * Не может быть < 0
         *
         * @return {number}
         */
        billOnFixedPart(): Bill {
            const debtRent = this.dataContract.debt.fixed;
            return debtRent > 0 ? debtRent : 0;
        },

        /**
         * Счет на оплату переменной части
         * Не может быть < 0
         *
         * @return {number}
         */
        billOnVariablePart(): Bill {
            const debtVar = this.dataContract.debt.variable;
            return debtVar > 0 ? debtVar : 0;
        },

        /**
         * Счет на оплату сопутствующих услуг
         * Не может быть < 0
         *
         * @return {number}
         */
        billOnServices(): Bill {
            const debt = this.dataContract.debt.services;
            return debt > 0 ? debt : 0;
        },

        /**
         * Общий счет по аренде
         *
         * @return {number}
         */
        totalBillRent(): Bill {
            const { rentCost } = this.dataContract;
            const total = this.billOnFixedPart + this.billOnVariablePart + this.billOnServices;

            return total > 0 ? total : rentCost;
        },

        /**
         * Счет на оплату пеней
         * Не может быть < 0
         *
         * @return {number}
         */
        billOnPenalties(): Bill {
            const debtP = this.dataContract.debt.penalties;
            return debtP > 0 ? debtP : 0;
        },

        /**
         * Баланс по услугам ссвязи
         * Если баланс отрицательный, то это долг
         *
         * @return {number}
         */
        balanceCommunication(): Bill {
            const debtT = this.dataContract.debt.fixed;
            // переворачиваем, т.к. баланс = -долг
            return debtT * -1;
        },

        /**
         * Показывать ли баланс по услугам ссвязи
         *
         * @return {boolean}
         */
        isVisibleBalanceCommunication(): boolean {
            return this.balanceCommunication !== 0;
        },

        /**
         * Счет на оплату по услугам связи
         * Не может быть < 0
         *
         * @return {number}
         */
        billOnCommunication(): Bill {
            const debtT = this.dataContract.debt.fixed;
            return debtT > 0 ? debtT : 0;
        },

        /**
         * Общий счет по телекому
         *
         * @return {number}
         */
        totalBillTelecom(): Bill {
            return this.billOnCommunication + this.billOnServices;
        },

        /**
         * Текст для формирования платежа
         *
         * @return {Object}
         */
        textPaymentAt() {
            const {
                dataContract,
                nameCurrentMonth,
                balanceFixedPart,
                balanceVariablePart,
                //
                billOnVariablePart,
                billOnFixedPart,
                billOnServices,
            } = this;
            const nameContract = dataContract.name;

            const textFixed = `${billOnFixedPart > 0 ? 'фиксированная арендная плата' : ''}`;
            const textVariable = `${billOnVariablePart > 0 ? 'переменная арендная плата' : ''}`;
            const textService = `${billOnServices > 0 ? 'сопутствующие услуги' : ''}`;
            const texts = [];
            if (textFixed) texts.push(textFixed);
            if (textVariable) texts.push(textVariable);
            if (textService) texts.push(textService);

            return {
                fixedRent: balanceFixedPart > 0
                    ? `Аренда объектов недвижимости (фиксированная арендная плата) за ${nameCurrentMonth} по договору №${nameContract}`
                    : `Долг по аренде объектов недвижимости (фиксированная арендная плата) по договору №${nameContract}`,
                variableRent: balanceVariablePart > 0
                    ? `Аренда объектов недвижимости (переменная арендная плата) за ${nameCurrentMonth} по договору №${nameContract}`
                    : `Долг по аренде объектов недвижимости (переменная арендная плата) по договору №${nameContract}`,
                services: `Сопутствующие услуги за ${nameCurrentMonth} по договору №${nameContract}`,
                totalRent: `Аренда объектов недвижимости (${texts.join(', ')}) за ${nameCurrentMonth} по договору №${nameContract}`,
                penalties: `Пени за просрочку платежа по аренде объектов недвижимости (фиксированная арендная плата) по договору №${nameContract}`,
                fixedTelecom: `Оплата за услуги связи за ${nameCurrentMonth} по договору №${nameContract}`,
            };
        },

        /**
         * Префикс для формирования платежа
         *
         * @returns {Object}
         */
        prefixPaymentAt() {
            return {
                fixed: 'ФЧ',
                variable: 'ПЧ',
                total: 'АА',
                penalties: 'ПН',
                services: 'СУ',
            };
        },

        /**
         * Текст платежа за следующий месяц
         */
        textPaymentNextMonth() {
            const {
                dataContract,
                nameNextMonth,
            } = this;
            const nameContract = dataContract.name;

            return {
                fixed: `Аренда объектов недвижимости (фиксированная арендная плата) за ${nameNextMonth} по договору №${nameContract}`,
            };
        },

        /**
         * Список счетов по аренде
         *
         * @return {[]}
         */
        listBillsOnRent() {
            const {
                billOnVariablePart,
                billOnFixedPart,
                billOnServices,
            } = this;
            return [billOnVariablePart, billOnFixedPart, billOnServices]
                .filter(num => num > 0);
        },

        /**
         * Тип кнопки формирования счета по аренде
         *
         * @return {string}
         */
        typeButtonBillOnRent() {
            return this.listBillsOnRent.length > 1
                ? 'default'
                : 'primary';
        },

        /**
         * Тип кнопки формирования счета по аренде
         *
         * @return {string}
         */
        typeButtonBillOnTelecom() {
            const {
                billOnCommunication,
                billOnServices,
            } = this;
            const listBills = [billOnCommunication, billOnServices]
                .filter(num => num > 0);
            return listBills.length > 1
                ? 'default'
                : 'primary';
        },
    },
    methods: {
        ...mapActions([
            'fetchBillOnPayment',
            'fetchDetailOnPenalty',
        ]),

        onViewLog() {
            window.open('https://docs.6550101.ru/');
            this.$router.push({ name: 'StartWorkingEDM', params: { nameSystem: 'taxcom', name: 'ТАКСКОМ' } });
        },

        /**
         * Создание счета на оплату
         *
         * @return {Promise.<void>}
         */
        async onCreateBillOnPayment(cost, nameT, nameP = nameT) {
            try {
                const { textPaymentAt, prefixPaymentAt } = this;
                await this.fetchBillOnPayment({
                    id: this.dataContract.id,
                    cost,
                    reason: textPaymentAt[nameT],
                    prefix: prefixPaymentAt[nameP],
                });
            } catch (err) {
                console.error(err.message);
            }
        },

        /**
         * Операция создания детализации по пеням
         *
         * @return {Promise<void>}
         */
        async onCreateDetailOnPenalty() {
            try {
                this.fetchingDetail = true;
                await this.fetchDetailOnPenalty({
                    id: this.dataContract.id,
                });
            } catch (err) {
                console.log(err);
                if (err === 'File not found') {
                    this.$message({
                        type: 'error',
                        message: 'Запрашиваемый файл не найден',
                    });
                }
            } finally {
                this.fetchingDetail = false;
            }
        },
    },
    created() {},
};

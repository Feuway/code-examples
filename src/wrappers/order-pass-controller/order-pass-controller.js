/**
 * Created by Smirnov.Denis on 15.03.2018.
 *
 * @flow
 */

import { Component } from 'vue';
import {
    createOrderPass,
    orderGuestPassPerson,
} from '@/wrappers/order-modal/create-pass';
import createModalDataControl from '@/wrappers/order-modal/create-modal';

import selectionStaffMember
    from '@/wrappers/order-modal/selection-staff-member/SelectionStaffMember';
import createOrderContractorPass from "@/wrappers/order-modal/create-contractor-pass";
import { PASS_TYPE, PASS_TYPE_AUTO } from "@/utils/constants/passes";

type ControlModal = {
    title: string,
    component: typeof Component,
};

/**
 * Объект управления модальными окнами заказа пропуска
 *
 * @type {{}}
 */
export const controlModalsOrderPass: { [key: string]: ControlModal } = {
    personGuest: {
        title: 'Заказ гостевого пропуска на человека',
        component: orderGuestPassPerson,
    },
    carGuest: {
        title: 'Заказ гостевого пропуска на легковой автомобиль',
        component: createOrderPass({
            usedComponents: ['selectionTerritories', 'selectionParking', 'regimeStaying'],
            nameComponent: 'OrderPassGuestCar',
            dataParams: {
                type: PASS_TYPE.GUEST_AUTO,
                typeAuto: PASS_TYPE_AUTO.CAR,
            },
            isVisibleValidatingScreen: false,
        }),
    },
    truckGuest: {
        title: 'Заказ гостевого пропуска на грузовой автомобиль',
        component: createOrderPass({
            usedComponents: ['selectionTerritories', 'selectionParking', 'regimeStaying'],
            nameComponent: 'OrderPassGuestTruck',
            dataParams: {
                type: PASS_TYPE.GUEST_AUTO,
                typeAuto: PASS_TYPE_AUTO.TRUCK,
            },
            isVisibleValidatingScreen: false,
        }),
    },
    car: {
        title: 'Заказ именного пропуска на легковой автомобиль',
        component: createOrderPass({
            usedComponents: ['selectionTerritories', 'selectionParking', 'numberCar', 'regimeStaying'],
            nameComponent: 'OrderPassCar',
            dataParams: {
                type: PASS_TYPE.AUTO,
                typeAuto: PASS_TYPE_AUTO.CAR,
            },
        }),
    },
    truck: {
        title: 'Заказ именного пропуска на грузовой автомобиль',
        component: createOrderPass({
            usedComponents: ['selectionTerritories', 'selectionParking', 'numberCar', 'regimeStaying'],
            nameComponent: 'OrderPassTruck',
            dataParams: {
                type: PASS_TYPE.AUTO,
                typeAuto: PASS_TYPE_AUTO.TRUCK,
            },
        }),
    },
    bike: {
        title: 'Заказ именного пропуска на велосипед',
        component: createOrderPass({
            usedComponents: ['selectionTerritories', 'selectionParking', 'regimeStaying'],
            nameComponent: 'OrderPassBike',
            dataParams: {
                type: PASS_TYPE.BIKE,
            },
        }),
    },
    person: {
        title: 'Заказ нового именного пропуска на человека',
        component: createOrderPass({
            usedComponents: ['selectionTerritories', 'regimeStaying', 'durationPass'],
            nameComponent: 'OrderPassPerson',
            dataParams: {
                type: PASS_TYPE.PERSON,
            },
        }),
    },
    contractorCar: {
        title: 'Заказ пропусков на легковые авто',
        component: createOrderContractorPass({
            nameComponent: 'OrderContractorPassCar',
            dataParams: {
                type: PASS_TYPE.AUTO,
                typeAuto: PASS_TYPE_AUTO.CAR,
            },
        }),
    },
    contractorTruck: {
        title: 'Заказ пропусков на грузовые авто',
        component: createOrderContractorPass({
            nameComponent: 'OrderContractorPassTruck',
            dataParams: {
                type: PASS_TYPE.AUTO,
                typeAuto: PASS_TYPE_AUTO.TRUCK,
            },
        }),
    },
    contractorPerson: {
        title: 'Заказ пропусков на рабочих',
        component: createOrderContractorPass({
            nameComponent: 'OrderContractorPassPerson',
            dataParams: {
                type: PASS_TYPE.PERSON,
            },
        }),
    },
};

type DataComponent = {};

export default {
    extends: createModalDataControl(),
    name: 'OrderPassController',
    components: {
        selectionStaffMember,
    },
    props: {
        typeForm: {
            type: String,
            required: true,
            validator(value: string) {
                return !!Object.keys(controlModalsOrderPass).find(el => el === value);
            },
        },
        dataStaffMember: {
            type: Object,
        },
        dataPass: {
            type: Object,
        },
    },
    data(): DataComponent {
        return {};
    },
    computed: {
        currentModalOrder() {
            return controlModalsOrderPass[this.typeForm];
        },
    },
    methods: {},
    mounted() {},
};


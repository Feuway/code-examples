/**
 * Created by Smirnov.Denis on 10.04.2018.
 */

import Vue from 'vue';

import { createWrapService } from '@/wrappers/order-modal/create-service';

import store from '../../store';

const defaultOptions = {
    titleModal: '',
    visible: false,
    dataService: null,
};

const ServiceModal = (options = {}) => {
    const mergedOptions = Object.assign({}, defaultOptions, options);

    const comp = createWrapService(options.type);
    const ModalConstructor = Vue.extend(comp);

    const instance = new ModalConstructor({
        data: mergedOptions,
        store,
    });
    instance.vm = instance.$mount();
    instance.vm.visible = true;
    document.body.appendChild(instance.vm.$el);

    return instance.vm;
};

// ServiceModal.close = () => {
//
// };

export default ServiceModal;

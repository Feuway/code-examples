/**
 * Created by Smirnov.Denis on 14.03.2018.
 *
 * Сервис для активации лоадера
 */

import Vue from 'vue';
import PaLoading from '@/components/pa-loading/PaLoading';
import { addClass, removeClass, getStyle } from 'element-ui/src/utils/dom';

const LoadingComponent = Vue.extend(PaLoading);

LoadingComponent.prototype.originalPosition = '';
LoadingComponent.prototype.originalOverflow = '';

LoadingComponent.prototype.close = function closeLoading() {
    setTimeout(() => {
        const target = this.fullscreen || this.body
            ? document.body
            : this.target;
        removeClass(target, 'pa-loading-parent--relative');
        removeClass(target, 'pa-loading-parent--hidden');
        if (this.$el && this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }

        this.$destroy();
    }, 300);

    this.visible = false;
};

const defaultOptions = {
    text: null,
    fullscreen: true,
    body: false,
    lock: false,
};

const addStyle = (options, parentEl, instance) => {
    const maskStyle = {};
    if (options.fullscreen) {
        instance.originalPosition = getStyle(document.body, 'position');
        instance.originalOverflow = getStyle(document.body, 'overflow');
        // maskStyle.zIndex = PopupManager.nextZIndex();
    } else if (options.body) {
        instance.originalPosition = getStyle(document.body, 'position');
        ['top', 'left'].forEach((property) => {
            const scrollPosition = property === 'top' ? 'scrollTop' : 'scrollLeft';
            maskStyle[property] = `${options.target.getBoundingClientRect()[property] +
            document.body[scrollPosition] +
            document.documentElement[scrollPosition]}px`;
        });
        ['height', 'width'].forEach((property) => {
            maskStyle[property] = `${options.target.getBoundingClientRect()[property]}px`;
        });
    } else {
        instance.originalPosition = getStyle(parentEl, 'position');
    }
    Object.keys(maskStyle).forEach((property) => {
        instance.$el.style[property] = maskStyle[property];
    });
};

const Loading = (options = {}) => {
    // if (!instance || !callback) throw new Error('instance & callback is required');

    const mergedOptions = Object.assign({}, defaultOptions, options);

    // если передан селектор
    if (typeof options.target === 'string') {
        options.target = document.querySelector(options.target);
    }
    // если ничего не передано, то умолчанию body
    options.target = options.target || document.body;
    // защита от дурака
    // если целевой элемент не body
    if (options.target !== document.body) {
        // то убираем флаг fullscreen
        options.fullscreen = false;
    } else {
        options.body = true;
    }
    // if (options.fullscreen && fullscreenLoading) {
    //     return fullscreenLoading;
    // }

    // определение родительского элемента для лоадера
    const parentLoader = options.body ? document.body : options.target;

    const instance = new LoadingComponent({
        el: document.createElement('div'),
        data: mergedOptions,
    });

    addStyle(options, parentLoader, instance);
    if (instance.originalPosition !== 'absolute' && instance.originalPosition !== 'fixed') {
        addClass(parentLoader, 'pa-loading-parent--relative');
    }
    if (options.fullscreen && options.lock) {
        addClass(parentLoader, 'pa-loading-parent--hidden');
    }

    parentLoader.appendChild(instance.$el);
    Vue.nextTick(() => {
        instance.visible = true;
    });

    return instance;
};

export default Loading;

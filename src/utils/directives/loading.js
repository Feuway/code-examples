/**
 * Created by Smirnov.Denis on 05.12.2017.
 *
 * Диерктива для отображения загрузки над элементом
 */

import Vue from 'vue';
import PaLoading from '@/components/pa-loading/PaLoading';
import { addClass, removeClass, getStyle } from 'element-ui/src/utils/dom';

const Mask = Vue.extend(PaLoading);

/**
 * Вставка элемента в DOM
 *
 * @param parentEl - родительский элемент, куда будет производится вставка
 * @param el - вставляемый элемент
 * @param binding - объект привязки директивы
 */
function insertDom(parentEl, el, binding) {
    if (!el.domVisible && getStyle(el, 'display') !== 'none' && getStyle(el, 'visibility') !== 'hidden') {
        Object.keys(el.maskStyle).forEach((property) => {
            el.mask.style[property] = el.maskStyle[property];
        });

        if (el.originalPosition !== 'absolute' && el.originalPosition !== 'fixed') {
            addClass(parentEl, 'pa-loading-parent--relative');
        }
        if (binding.modifiers.fullscreen && binding.modifiers.lock) {
            addClass(parentEl, 'pa-loading-parent--hidden');
        }
        el.domVisible = true;

        parentEl.appendChild(el.mask);
        Vue.nextTick(() => {
            el.instance.visible = binding.value;
        });
        el.domInserted = true;
    }
}

/**
 * Переключатель загрузки
 *
 * @param el - элемент, над которым возникает загрузка
 * @param binding - объект привязки директивы
 */
function toggleLoading(el, binding) {
    if (binding.value) {
        Vue.nextTick(() => {
            if (binding.modifiers.fullscreen) {
                el.originalPosition = getStyle(document.body, 'position');
                el.originalOverflow = getStyle(document.body, 'overflow');

                addClass(el.mask, 'is-fullscreen');
                insertDom(document.body, el, binding);
            } else {
                removeClass(el.mask, 'is-fullscreen');

                if (binding.modifiers.body) {
                    el.originalPosition = getStyle(document.body, 'position');

                    ['top', 'left'].forEach((property) => {
                        const scrollPosition = property === 'top' ? 'scrollTop' : 'scrollLeft';
                        el.maskStyle[property] =
                            `${el.getBoundingClientRect()[property]
                            + document.body[scrollPosition]
                            + document.documentElement[scrollPosition]}px`;
                    });
                    ['height', 'width'].forEach((property) => {
                        el.maskStyle[property] = `${el.getBoundingClientRect()[property]}px`;
                    });

                    insertDom(document.body, el, binding);
                } else {
                    el.originalPosition = getStyle(el, 'position');
                    insertDom(el, el, binding);
                }
            }
        });
    } else if (el.domVisible) {
        el.domVisible = false;
        const target = binding.modifiers.fullscreen || binding.modifiers.body
            ? document.body
            : el;
        removeClass(target, 'pa-loading-parent--relative');
        removeClass(target, 'pa-loading-parent--hidden');
        Vue.nextTick(() => {
            el.instance.visible = false;
        });
    }
}

export default {
    bind(el, binding, vnode) {
        const text = el.getAttribute('loading-text');
        const vm = vnode.context;
        const mask = new Mask({
            el: document.createElement('div'),
            data: {
                text: vm[text] || text,
                fullscreen: !!binding.modifiers.fullscreen,
                visible: binding.value,
            },
        });

        el.instance = mask;
        el.mask = mask.$el;
        el.maskStyle = {};

        toggleLoading(el, binding);
    },
    update(el, binding) {
        const text = el.getAttribute('loading-text');
        el.instance.setText(text);

        if (binding.oldValue !== binding.value) {
            toggleLoading(el, binding);
        }
    },
    unbind(el) {
        if (el.domInserted && el.mask && el.mask.parentNode) {
            el.mask.parentNode.removeChild(el.mask);
        }
        Vue.nextTick(() => {
            removeClass(document.body, 'pa-loading-parent--relative');
            removeClass(document.body, 'pa-loading-parent--hidden');
        });
    },
};

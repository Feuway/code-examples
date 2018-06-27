/**
 * Created by Smirnov.Denis on 05.02.2018.
 *
 * Директива для получения и установки высоты
 * вложенного элементпа по селектору
 */

import { throttle } from '@/utils/func/util';

/**
 * Установка высоты элементу как у его потомка
 *
 * @param el
 * @param child
 */
function setHeightAsChild(el, child) {
    const heightChild = child.getBoundingClientRect().height;
    el.style.height = `${heightChild}px`;
    return heightChild;
}

export default {
    bind(el, binding) {
        const child = el.children[0];
        el.handleResize = throttle(() => {
            binding.name = setHeightAsChild(el, child);
        }, 300);

        window.addEventListener('resize', el.handleResize);
    },
    inserted(el) {
        el.handleResize();
    },
    unbind(el) {
        window.removeEventListener('resize', el.handleResize);
    },
};

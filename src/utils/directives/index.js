/**
 * Created by Smirnov.Denis on 20.09.2017.
 *
 * Registration of global directives
 */

const directives = {
    loading: './loading.js',
    focus: './focus.js',
    widthInSymbols: './width-in-symbols.js',
    fixedBlockScrolling: './fixed-block-scrolling.js',
    heightFixedChild: './height-fixed-child.js',
    appendToBody: './append-to-body.js',
};

function install(Vue) {
    Object.keys(directives).forEach(async (key) => {
        const path = directives[key];
        const _ = await import(`${path}`);
        Vue.directive(key, _.default);
    });
}

export default install;

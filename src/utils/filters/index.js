/**
 * Created by Smirnov.Denis on 21.12.2017.
 *
 * Registration of global filters
 */

const filters = {
    field: './field.js',
    capitalize: './capitalize.js',
    toLocaleString: './to-locale-string.js',
    removeSpaceSymbols: './remove-space-symbols.js',
};

function install(Vue) {
    Object.keys(filters).forEach(async (key) => {
        const path = filters[key];
        const _ = await import(`${path}`);
        Vue.filter(key, _.default);
    });
}

export default install;

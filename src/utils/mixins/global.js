/**
 * Created by Smirnov.Denis on 26.12.2017.
 *
 * Глобальная примесь
 */


import { mapGetters } from 'vuex';

function install(Vue) {
    Vue.mixin({
        computed: {
            ...mapGetters(['isMobileVersion']),

            /**
             * Ширина горизонтального разделения сетки
             *
             * @return {number}
             */
            gutterGrid() {
                return this.isMobileVersion ? 10 : 20;
            },
        },
    });
}

export default install;

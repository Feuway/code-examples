/**
 * Created by Smirnov.Denis on 19.03.2018.
 *
 * @flow
 */

import { mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['fetchListServices']),

        /**
         * Загрузка данных, необходимых для визуализации комопнента
         *
         * @return {Promise.<void>}
         */
        async loadData() {
            try {
                await this.fetchListServices(false);
            } catch (err) {
                console.error(err);
            }
        },
    },
    created() {
        this.loadData();
    },
};

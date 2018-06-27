/**
 * Created by Smirnov.Denis on 09.02.2018.
 */

import { mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions([
            'fetchListContracts',
        ]),

        /**
         * Загрузка данных, необходимых для визуализации комопнента
         *
         * @return {Promise.<void>}
         */
        async loadData() {
            try {
                // this.loading = true;
                // this.loadingText = 'Загрузка договоров...';
                await this.fetchListContracts({ cancelable: false });
                this.loadingText = '';
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
                this.loadingText = '';
            }
        },
    },
    created() {
        this.loadData();
    },
};

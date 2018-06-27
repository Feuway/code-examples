/**
 * Created by Smirnov.Denis on 23.11.2017.
 *
 * @flow
 */

import { mapGetters, mapActions } from 'vuex';

import activatedServiceCard from '@/wrappers/services/activated-service-card/ActivatedServiceCard';
import deactivatedServiceCard from '@/wrappers/services/deactivated-service-card/DeactivatedServiceCard';
import OrderPassGroupBlocks from '@/wrappers/order-pass-group-blocks/OrderPassGroupBlocks';
import noteParkingPass from '@/wrappers/note-parking-numbers/note-parking-pass';
import noteParkingTicket from '@/wrappers/note-parking-numbers/note-parking-ticket';

import { PASS_STATUS } from "@/utils/constants/passes";
import { getPathImage } from "@/utils/func/util";

type DataComponent = {
    loading: boolean,
    loadingListPasses: boolean,
};

export default {
    name: 'ServicesIndex',
    components: {
        activatedServiceCard,
        deactivatedServiceCard,
        OrderPassGroupBlocks,
        noteParkingPass,
        noteParkingTicket,
    },
    props: {},
    data(): DataComponent {
        return {
            loading: false,
            loadingListPasses: false,
            loadingListServices: false,
            visibleManualAtNoteTicket: false,
            isVisibleModalCategoriesAuto: false,
            //
            listBlocksOrderGuestPass: [
                'carGuest', 'truckGuest', 'personGuest',
            ],
            listBlocksOrderNamedPass: [
                'car', 'truck', 'bike', 'person',
            ],
            listBlocksOrderContractorPass: [
                'contractorCar', 'contractorTruck', 'contractorPerson',
            ],
        };
    },
    computed: {
        ...mapGetters([
            'numberActivePersonNamedPasses',
            'numberActiveCarNamedPasses',
            'numberActiveTruckNamedPasses',
            'numberActiveCarGuestPasses',
            'numberActiveTruckGuestPasses',
            'hasActivePasses',
            'listActivatedServices',
            'listDeactivatedServices',
            'hasNotedParkingPass',
            'hasNotedParkingTicket',
        ]),
    },
    methods: {
        ...mapActions([
            'createListNamedPasses',
            'fetchListGuestPasses',
            'fetchListServices',
            'fetchListTerritories',
        ]),

        getPathImage,

        /**
         * Пеереход к отфильитрованной таблице всех пропусков
         *
         * @param fullType
         * @param personalization
         */
        goToFilteredListPasses(
            { fullType, personalization }: {
            fullType: string,
            personalization: string,
        }) {
            this.$router.push({
                name: 'Passes',
                query: {
                    status: PASS_STATUS.ISSUED,
                    fullType,
                    personalization,
                },
            });
        },

        /**
         * Загрузка данных, необходимых для визуализации комопнента
         *
         * @return {Promise.<void>}
         */
        async loadData() {
            try {
                this.loadingListServices = true;
                this.fetchListServices().then(() => {
                    this.loadingListServices = false;
                });

                this.loadingListPasses = true;
                await Promise.all([
                    this.createListNamedPasses(),
                    this.fetchListGuestPasses(),
                ]).then(() => {
                    this.loadingListPasses = false;
                });
            } catch (err) {
                console.error(err);
            } finally {
                this.loadingListPasses = false;
                this.loadingListServices = false;
            }
        },
    },
    created() {
        this.loadData();
        this.fetchListTerritories();
    },
};


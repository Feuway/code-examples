/**
 * Created by Smirnov.Denis on 07.11.2017.
 *
 * @flow
 */

import paTitle from '@/components/pa-title/pa-title';
import paButton from '@/components/pa-button/PaButton';
import paIcon from '@/components/pa-icon/PaIcon';

type data = {};

export default {
    name: 'PaModal',
    components: {
        paTitle,
        paButton,
        paIcon,
    },
    props: {
        title: {
            type: String,
            default: '',
        },
        visible: {
            type: Boolean,
            required: true,
        },
        showClose: {
            type: Boolean,
            default: true,
        },
        lockScroll: {
            type: Boolean,
            default: true,
        },
        size: {
            type: String,
            default: '',
        },
    },
    data(): data {
        return {
            ops: {
                scrollContent: {
                    padding: false,
                },
                vBar: {
                    background: '#41bab9',
                    opacity: 1,
                },
            },
        };
    },
    computed: {},
    watch: {
        visible(value: boolean) {
            this.$emit('update:visible', value);
            if (value) {
                if (document.body) {
                    document.body.style.overflow = 'hidden';
                }
            } else if (document.body) {
                document.body.style.overflow = 'auto';
            }
        },
    },
    methods: {
        close() {
            this.$emit('update:visible', false);
            this.$emit('close');
        },
        closeByEsc(evt: KeyboardEvent) {
            if (evt.which === 27) this.close();
        },
    },
    created() {
        window.addEventListener('keyup', this.closeByEsc);
    },
    beforeDestroy() {
        window.removeEventListener('keyup', this.closeByEsc);
        if (document.body) {
            document.body.style.overflow = 'auto';
        }
    },
};

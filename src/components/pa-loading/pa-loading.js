/**
 * Created by Smirnov.Denis on 05.12.2017.
 *
 * @flow
 */

export default {
    name: 'PaLoading',
    data() {
        return {
            text: null,
            fullscreen: false,
            visible: false,
        };
    },
    methods: {
        setText(text: string) {
            this.text = text;
        },
        handleAfterLeave() {
            this.$emit('after-leave');
        },
    },
};

/**
 * Created by Smirnov.Denis on 03.11.2017.
 *
 * Registration of global components
 */

const components = {
    // With state
    'pa-icon': './pa-icon/PaIcon.vue',
    'pa-sidebar': './pa-sidebar/PaSidebar.vue',
    'pa-layout': './pa-layout/PaLayout.vue',
    'pa-modal': './pa-modal/PaModal.vue',
    'pa-button': './pa-button/PaButton.vue',
    'pa-button-group': './pa-button-group/PaButtonGroup.vue',
    'pa-card': './pa-card/PaCard.vue',
    'pa-card-service': './pa-card-service/PaCardService.vue',
    'pa-card-notice': './pa-card-notice/PaCardNotice.vue',
    'pa-alert': './pa-alert/PaAlert.vue',
    'pa-table': './pa-table/PaTable.vue',
    'pa-table-column': './pa-table-column/PaTableColumn.vue',
    'pa-block-button': './pa-block-button/PaBlockButton.vue',
    'pa-block-button-group': './pa-block-button-group/PaBlockButtonGroup.vue',
    'pa-wrapper-content': './pa-wrapper-content/PaWrapperContent.vue',
    'pa-steps': './pa-steps/PaSteps.vue',
    'pa-step': './pa-step/PaStep.vue',
    'pa-upload-cropper': './pa-upload-cropper/PaUploadCropper.vue',

    // Functional
    'pa-title': './pa-title/pa-title.js',
    'pa-panel': './pa-panel/pa-panel.js',
    'pa-link': './pa-link/pa-link.js',
    'pa-avatar': './pa-avatar/pa-avatar.js',
    'pa-content-wrap': './pa-content-wrap/pa-content-wrap.js',
    'pa-cost-pass': './pa-cost-pass/pa-cost-pass.js',
};

function install(Vue) {
    Object.keys(components).forEach((key) => {
        const path = components[key];
        Vue.component(key, () => import(`${path}`));
    });
}

export default install;

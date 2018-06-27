/**
 * Created by Smirnov.Denis on 14.03.2018.
 *
 * Registration of global services
 */

import loading from './loading';
import modalService from './modal-service';
import modalAgreement from './modal-agreement';

function install(Vue) {
    Vue.prototype.$loading = loading;
    Vue.prototype.$modalService = modalService;
    Vue.prototype.$modalAgreement = modalAgreement;
}

export default install;

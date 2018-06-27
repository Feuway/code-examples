import Vue from 'vue';
import router from './router';
import store from './store';
import App from './app/App';

import './assets/images/fav/favicon.ico';

/*
 |------------------------------------------------
 | Libraries
 |------------------------------------------------
 */
import ElementUI from './vendors/element';
import Moment from './vendors/moment';
import ProgressBar from './vendors/vue-progressbar';
import VueTouch from './vendors/vue-touch';
import VueTheMask from './vendors/vue-the-mask';
import Vuescroll from './vendors/vuescroll';

/*
 |------------------------------------------------
 | Global components
 |------------------------------------------------
 */
import Components from './components';
import Wrappers from './wrappers';

/*
 |------------------------------------------------
 | Global directives
 |------------------------------------------------
 */
import Directives from './utils/directives';

/*
 |------------------------------------------------
 | Global filters
 |------------------------------------------------
 */
import Filters from './utils/filters';

/*
 |------------------------------------------------
 | Global mixin
 |------------------------------------------------
 */
import GlobalMixin from './utils/mixins/global';

/*
 |------------------------------------------------
 | Global mixin
 |------------------------------------------------
 */
import Services from './utils/services';

/*
 |------------------------------------------------
 | Plugins use
 |------------------------------------------------
 */
Vue.use(ElementUI);
Vue.use(Moment);
Vue.use(ProgressBar);
Vue.use(VueTouch);
Vue.use(VueTheMask);
Vue.use(Vuescroll);
Vue.use(Components);
Vue.use(Wrappers);
Vue.use(Directives);
Vue.use(Filters);
Vue.use(GlobalMixin);
Vue.use(Services);

Vue.config.productionTip = false;
// Vue.config.performance = true;
// Vue.config.devtools = true;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App },
});

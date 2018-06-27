/**
 * Created by Smirnov.Denis on 01.11.2017.
 *
 * Element
 * UI components library for Vue.js
 * http://element-cn.eleme.io/#/en-
 */

import CollapseTransition from 'element-ui/lib/transitions/collapse-transition';
import Menu from 'element-ui/lib/menu';
import Submenu from 'element-ui/lib/submenu';
import MenuItem from 'element-ui/lib/menu-item';
import Input from 'element-ui/lib/input';
import InputNumber from 'element-ui/lib/input-number';
import Radio from 'element-ui/lib/radio';
import RadioGroup from 'element-ui/lib/radio-group';
import RadioButton from 'element-ui/lib/radio-button';
import Checkbox from 'element-ui/lib/checkbox';
import CheckboxButton from 'element-ui/lib/checkbox-button';
import CheckboxGroup from 'element-ui/lib/checkbox-group';
import Popover from 'element-ui/lib/popover';
import Tooltip from 'element-ui/lib/tooltip';
import Form from 'element-ui/lib/form';
import FormItem from 'element-ui/lib/form-item';
import Tabs from 'element-ui/lib/tabs';
import TabPane from 'element-ui/lib/tab-pane';
import Row from 'element-ui/lib/row';
import Col from 'element-ui/lib/col';
import DatePicker from 'element-ui/lib/date-picker';
import Select from 'element-ui/lib/select';
import OptionGroupForSelect from 'element-ui/lib/option-group';
import OptionForSelect from 'element-ui/lib/option';
import Carousel from 'element-ui/lib/carousel';
import CarouselItem from 'element-ui/lib/carousel-item';
import Message from 'element-ui/lib/message';

import lang from 'element-ui/lib/locale/lang/ru-RU';
import locale from 'element-ui/lib/locale';

locale.use(lang);

function install(Vue) {
    Vue.use(Menu);
    Vue.use(Submenu);
    Vue.use(MenuItem);
    Vue.use(Input);
    Vue.use(InputNumber);
    Vue.use(Radio);
    Vue.use(RadioGroup);
    Vue.use(RadioButton);
    Vue.use(Checkbox);
    Vue.use(CheckboxButton);
    Vue.use(CheckboxGroup);
    Vue.use(Popover);
    Vue.use(Tooltip);
    Vue.use(Form);
    Vue.use(FormItem);
    Vue.use(Tabs);
    Vue.use(TabPane);
    Vue.use(Row);
    Vue.use(Col);
    Vue.use(DatePicker);
    Vue.use(Select);
    Vue.use(OptionGroupForSelect);
    Vue.use(OptionForSelect);
    Vue.use(Carousel);
    Vue.use(CarouselItem);
    //
    Vue.prototype.$message = Message;
    Vue.component(CollapseTransition.name, CollapseTransition);
}

export default install;

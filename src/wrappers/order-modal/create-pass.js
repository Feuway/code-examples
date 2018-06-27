/**
 * Created by Smirnov.Denis on 22.12.2017.
 *
 * Конструкторы компонентов действий с пропусками
 *
 * @flow
 */

import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import { AgreementServicePass } from '@/wrappers/agreements/agreement-row';
import { PASS_TYPE, PASS_TYPE_AUTO, PASS_STATUS } from "@/utils/constants/passes";
import controllerForm from "@/utils/mixins/controller-form";
import Pass from "@/utils/classes/pass";
import StaffMember from "@/utils/classes/staff-member";

import costPass from './cost-pass/CostPass';
import createModalDataControl from './create-modal';

const successRequest = () => import('@/wrappers/success-request/success-request');

const mapComponents = new Map([
    ['selectionTerritories', './selection-territories/SelectionTerritories.vue'],
    ['selectionParking', './selection-parking/SelectionParking.vue'],
    ['selectionStaffMember', './selection-staff-member/SelectionStaffMember.vue'],
    ['regimeStaying', './regime-staying/RegimeStaying.vue'],
    ['durationPass', './duration-pass/DurationPass.vue'],
    ['numberCar', './number-car/NumberCar.vue'],
]);

/**
 * Конструктор компонентов модального окна с формой
 *
 * @return {Vue.component}
 */
function createModalWithForm({
    usedComponents = [],
    requiredFields = [],
    nameComponent = 'OrderPass',
    dataParams = { type: '', typeAuto: '' },
    // typeForm = 'order',
    isVisibleValidatingScreen = true,
}) {
    const mapUsedComponents = {};

    usedComponents.forEach((nameC) => {
        const path = mapComponents.get(nameC);
        if (path) {
            mapUsedComponents[nameC] = () => import(`${path}`);
        }
    });

    // init component
    return Vue.component(nameComponent, {
        extends: createModalDataControl(),
        components: {
            successRequest,
            costPass,
            AgreementServicePass,
            ...mapUsedComponents,
        },
        props: {
            titleModal: {
                type: String,
                required: true,
            },
            dataStaffMember: {
                type: Object,
            },
            dataPass: {
                type: Object,
            },
        },
        mixins: [controllerForm],
        data() {
            return {
                loading: false,
                loadingButton: false,
                isVisibleValidating: isVisibleValidatingScreen,
                isVisibleSuccess: false,
                isOrderedPass: false,
                formValidatingPass: {
                    selectedAnswer: '',
                },
                formOrderPass: {
                    type: dataParams.type || '',
                    typeAuto: dataParams.typeAuto || '',
                    comment: '',
                },
                rulesOrderPass: {},
                dateRangePickerOptions: {
                    firstDayOfWeek: 1,
                    disabledDate(date) {
                        const msInDay = 1000 * 60 * 60 * 24;
                        return date < Date.now() - msInDay;
                    },
                },
                answers: [
                    {
                        action: 'another',
                        text: 'Нужен дополнительный пропуск',
                        desk: 'Все выданные пропуска останутся активны. ' +
                        'Заблокируйте лишние пропуска после получения новых, ' +
                        'чтобы увеличить лимит бесплатных пропусков.',
                    },
                    {
                        action: 'changed',
                        text: 'Изменились личные данные',
                        desk: 'Все выданные пропуска останутся активны. ' +
                        'Заблокируйте лишние пропуска после получения новых, ' +
                        'чтобы увеличить лимит бесплатных пропусков.',
                    },
                    {
                        action: 'unused',
                        text: 'Пропуск невозможно использовать (потерян, размагнитился и т. п.)',
                        desk: '',
                    },
                ],
                isInvalidateAllPasses: false,
            };
        },
        computed: {
            ...mapGetters([
                'getDataStaffMember',
                'numberActiveCarGuestPasses',
                'numberActiveTruckGuestPasses',
                'hasCFOArsenalStaff',
            ]),

            /**
             * Полный тип пропуска компнента
             *
             * @return {string}
             */
            fullTypePass() {
                const { type = '', typeAuto = '' } = dataParams;
                return Pass.getFullType({ type, typeAuto });
            },

            /**
             * Тип формы заказа пропуска
             */
            typeOrderPass() {
                switch (this.fullTypePass) {
                    case "Человек":
                        return "person";
                    case "Легковое авто":
                        return "car";
                    case "Грузовое авто":
                        return "truck";
                    case "Велосипед":
                        return "bike";
                    case "Легковое гостевое авто":
                        return "carGuest";
                    case "Грузовое гостевое авто":
                        return "truckGuest";
                    default:
                        return "";
                }
            },

            /**
             * Имеющиеся данные сотрудника
             *
             * @return {?StaffMember}
             */
            existingDataStaffMember(): ?StaffMember {
                const { dataStaffMember, dataPass } = this;
                const memberFromPass = dataPass && this.getDataStaffMember(dataPass.ownerId);
                return dataStaffMember || memberFromPass;
            },

            /**
             * Имеющиеся данные пропуска
             *
             * @return {?Pass}
             */
            existingDataPass(): ?Pass {
                const { dataStaffMember, dataPass } = this;
                const passFromMember = dataStaffMember
                    && dataStaffMember.findPassAtFullType(this.fullTypePass);
                return dataPass || passFromMember;
            },

            /**
             * Основные данные о сотрудники полученные из данных,
             * переданных в компнент как входные данные
             * или выбранных в селекте всех сотрудников
             *
             * @return {?StaffMember}
             */
            dataMainMember(): ?StaffMember {
                return this.existingDataStaffMember || this.formValidatingPass.staffMember;
            },

            /**
             * Список пропусков, соответствующих типу компнонента
             */
            listPasses(): Pass[] {
                const { dataMainMember, fullTypePass } = this;
                return dataMainMember && dataMainMember.passes
                    .filter(pass => pass.fullType === fullTypePass);
            },

            /**
             * Валидны(имеются) ли персональные данные сотрудника
             * для заказа пропуска
             *
             * @return {boolean}
             */
            isValidDataMemberForOrder() {
                const { dataMainMember } = this;
                let validatedFields = [
                    'surname', 'name', // personal
                    'hasPassportData', // pass
                    'image', // photo
                ];
                if (this.hasCFOArsenalStaff) {
                    validatedFields = [
                        ...validatedFields,
                        'education', 'nationality', 'residence', 'dateOfBirth', // personal
                    ];
                }

                return dataMainMember
                    && validatedFields.every(el => Boolean(dataMainMember[el]));
            },

            /**
             * Необходима ли валидация пропуска перед заказом
             * Используется для автовалидации
             */
            isNecessaryToValidationPass() {
                // Необходимо, если экран валидация показываеться и:
                // либо одновременно:
                //      - нет данных о сотруднике
                //      - не хватает личных данных для заказа пропуска
                // либо задан вопрос
                // (задается он из-за наличия у основного пропуска стутуса заказан или отклонен)
                return isVisibleValidatingScreen &&
                    (
                        !(this.existingDataStaffMember && this.isValidDataMemberForOrder)
                        || this.isVisibleQuestion
                    );
            },

            /**
             * Показывать ли вопрос
             * Только если есть пропуска со статусами:
             * - выдан
             * - приостановлен
             * - заблокирован
             * - недействителен
             * @return {boolean}
             */
            isVisibleQuestion() {
                const {
                    issued,
                    paused,
                    blocked,
                    invalid,
                } = this.hasStatuses;
                return issued || paused || blocked || invalid;
            },

            /**
             * Объект выбранного ответа на вопрос
             * *
             * @return {*}
             */
            selectedAnswer() {
                return this.formValidatingPass.selectedAnswer;
            },

            /**
             * Результат пройденной валидации
             *
             * @return {{}}
             */
            resultValidation() {
                const { listPasses } = this;
                const filterPassesAtStatus = (statusPass: string) => {
                    return listPasses.filter(pass => pass.status === statusPass);
                };
                return {
                    passes: {
                        ordered: filterPassesAtStatus(PASS_STATUS.ORDERED),
                        rejected: filterPassesAtStatus(PASS_STATUS.REJECTED),
                        issued: filterPassesAtStatus(PASS_STATUS.ISSUED),
                        paused: filterPassesAtStatus(PASS_STATUS.PAUSED),
                        blocked: filterPassesAtStatus(PASS_STATUS.BLOCKED),
                        invalid: filterPassesAtStatus(PASS_STATUS.INVALID),
                    },
                };
            },

            /**
             * Имеющиеся статусы у пропусков сотрудника,
             * которому заказывается пропуск
             */
            hasStatuses() {
                const { passes } = this.resultValidation;
                const dataStatuses = {};
                Object.keys(passes).forEach((pass) => {
                    dataStatuses[pass] = passes[pass].length > 0;
                });
                return dataStatuses;
            },
        },
        watch: {
            dataPass() {
                this.setDefaultState();
            },

            isVisibleModal(val) {
                if (!val) {
                    this.$emit('close-modal');
                }
            },

            isNecessaryToValidationPass(val: boolean) {
                this.isVisibleValidating = val;
                if (!val) {
                    this.hideValidatingScreen();
                }
            },

            selectedAnswer(val: Object) {
                // если выбранный ответ - "Невозможно использовать"
                this.isInvalidateAllPasses = val.action === 'unused';
            },
        },
        methods: {
            ...mapActions([
                'fetchLimitsPasses',
                'checkCFOArsenal',
            ]),

            /**
             * Показать модальное окно с ифнормацией для согласия
             *
             * @param type
             */
            showModalAgr(type) {
                this.$modalAgreement({ type });
            },

            /**
             * Сброс состояния компонента
             */
            resetStateComponent() {
                this.isVisibleValidating = isVisibleValidatingScreen;
                this.isVisibleSuccess = false;
                this.isOrderedPass = false;
                this.formOrderPass = Object.assign({}, {
                    type: dataParams.type || '',
                    typeAuto: dataParams.typeAuto || '',
                    comment: '',
                });
                this.formValidatingPass = Object.assign({}, {
                    selectedAnswer: '',
                });
            },

            /**
             * Валидация формы заказа пропуска
             *
             * @return {Promise}
             */
            validateFormOrderPass() {
                return new Promise((resolve, reject) => {
                    this.$refs.formOrderPass.validate((valid) => {
                        if (valid) {
                            console.log('form valid');
                            resolve();
                        } else {
                            console.error('form invalid');
                            reject();
                        }
                    });
                });
            },

            /**
             * Завершение работу по заказу/перезаказу пропуска
             */
            finishWorking() {
                this.resetStateComponent();
                this.closeModal();
                this.$emit('finish-order');
                this.$nextTick(() => {
                    // установка состояния по умолчанию
                    this.setDefaultState();
                });
            },

            /**
             * Установка начального состояния компонента
             */
            setDefaultState() {
                //
                // auto validating
                this.isVisibleValidating = this.isNecessaryToValidationPass;
                //
                const {
                    existingDataStaffMember,
                } = this;
                if (existingDataStaffMember) {
                    // если в компоненте уже есть данные о сотруднике
                    // то передаем их форме заказа пропуска
                    // TODO: возможно, необходиомость в этой проверке и присваивании исчезнет
                    this.formOrderPass.staffMember = existingDataStaffMember;
                }

                // this.isVisibleValidating = isVisibleValidatingScreen; // TODO: необходимо ли?
                //
                // set default value
                if (this.isVisibleValidating) {
                    const [firstAnswer] = this.answers;
                    this.formValidatingPass.selectedAnswer = firstAnswer;
                }
            },

            /**
             * Установка данных сотрудника в форму заказа пропуска
             */
            setStaffMemberInForm() {
                const dataStaffMember = this.existingDataStaffMember
                    || this.formValidatingPass.staffMember;
                if (dataStaffMember) {
                    this.formOrderPass.staffMember = dataStaffMember;
                }
            },

            /**
             * Скрыть экран валидации
             */
            hideValidatingScreen() {
                this.isVisibleValidating = false;
                //
                if (this.isVisibleQuestion) {
                    // присвоить текст ответа в комментарий формы заказа пропуска
                    // только если вопрос был показан
                    this.formOrderPass.comment = this.formValidatingPass.selectedAnswer.text;
                }

                this.setStaffMemberInForm();
            },

            /**
             * Вернуться к экрану валидации
             */
            backToValidatingScreen() {
                this.isVisibleValidating = true;
                this.formOrderPass.comment = '';
            },

            /**
             * Переход к следующей форме
             */
            async toNextForm() {
                try {
                    await this.validateForm('formValidatingPass');

                    if (
                        this.$route.name !== 'EditStaffMember' &&
                        (!this.isValidDataMemberForOrder ||
                        this.formValidatingPass.selectedAnswer.action === 'changed')
                    ) {
                        // осуществляем переход на экран редактирования если:
                        // - уже не находимся на экране редактирования
                        // - не хватает личных данных для заказа пропуска
                        //   или выбран ответ "Изменились личные данные"
                        this.$router.push({
                            name: 'EditStaffMember',
                            params: {
                                id: String(this.dataMainMember.id),
                                typeOrderPass: this.typeOrderPass,
                                observedPass: this.dataPass,
                            },
                            query: {
                                message: 'Измените ваши личные данные и нажмите кнопку Перезаказать пропуск',
                            },
                        });
                    } else {
                        this.hideValidatingScreen();
                    }
                } catch (err) {
                    console.error(err.message);
                }
            },

            /**
             * Загрузка данных, необходимых для визуализации комопнента
             *
             * @return {Promise.<void>}
             */
            async loadData() {
                try {
                    this.loading = true;
                    await Promise.all([
                        this.fetchLimitsPasses(),
                        this.checkCFOArsenal(),
                    ]);
                    this.setDefaultState();
                } catch (err) {
                    console.error(err.message);
                } finally {
                    this.loading = false;
                }
            },
        },
        mounted() {
            this.loadData();
        },
        render() {
            // инициализация всех возможных компонентов
            // используемых для построяния любого типа формы
            const allInitializedComponents = {
                selectionTerritories: (
                    <selection-territories
                        form={this.formOrderPass}
                        ref-form={this.$refs.formOrderPass}
                    />
                ),
                selectionParking: (
                    <selection-parking
                        form={this.formOrderPass}
                        ref-form={this.$refs.formOrderPass}
                    />
                ),
                selectionStaffMember: !this.staffMember ? (
                    <selection-staff-member
                        label="Выберите сотрудника"
                        form={this.formOrderPass}
                        ref-form={this.$refs.formOrderPass}
                        list-required-fields={requiredFields}
                    />
                ) : null,
                numberCar: (
                    <el-row class="container">
                        <el-col sm={10}>
                            <number-car
                                form={this.formOrderPass}
                                ref-form={this.$refs.formOrderPass}
                            />
                        </el-col>
                    </el-row>
                ),
                regimeStaying: (
                    <el-row>
                        <el-col sm={10}>
                            <regime-staying
                                form={this.formOrderPass}
                            />
                        </el-col>
                    </el-row>
                ),
                durationPass: (
                    <el-row class="container">
                        <el-col sm={10}>
                            <duration-pass
                                form={this.formOrderPass}
                                ref-form={this.$refs.formOrderPass}
                            />
                        </el-col>
                    </el-row>
                ),
            };

            function initComponents(all, used) {
                const result = [];
                Object.keys(all).forEach((key) => {
                    const isMatched = used.find(el => el === key);
                    if (isMatched) {
                        result.push(all[key]);
                    }
                });
                return result;
            }

            const renderFormComponents =
                () => [initComponents(allInitializedComponents, usedComponents)];

            const renderValidatingScreen = () => {
                return (
                    <el-form
                        label-position="top"
                        model={this.formValidatingPass}
                        ref="formValidatingPass"
                    >
                        {// если сщтрудник не передан
                            !this.existingDataStaffMember && (
                                <selection-staff-member
                                    form={this.formValidatingPass}
                                    refForm={this.$refs.formValidatingPass}
                                />
                            )
                        }

                        <transition name="slide-Y" mode="out-in">
                            {(() => {
                                if (!this.dataMainMember) {
                                    // если сотрудника еще не был выбран
                                    return (<div key="0" />);
                                } else if (!this.isValidDataMemberForOrder) {
                                    return (
                                        <div key="1">
                                            <success-request
                                                title="Недостаточно данных для заказа пропуска"
                                                path-image="pass-icons/error.svg"
                                            >
                                                <template slot="desc">
                                                    Нажмите <b>Далее</b>,
                                                    чтобы дополнить анкету сотрудника
                                                </template>
                                            </success-request>
                                        </div>
                                    );
                                } else if (this.isVisibleQuestion) {
                                    return (
                                        <div key="2">
                                            <pa-title level={3}>
                                                Что случилось со старым пропуском?
                                            </pa-title>

                                            <el-radio-group
                                                v-model={this.formValidatingPass.selectedAnswer}
                                            >
                                                <el-row class="container no-bottom">
                                                    {this.answers.map(answer => (
                                                        <el-col class="container">
                                                            <el-radio label={answer}>
                                                                {answer.text}
                                                            </el-radio>

                                                            <p>
                                                                {answer.desk}
                                                            </p>
                                                        </el-col>
                                                    ))}
                                                </el-row>
                                            </el-radio-group>

                                            <transition name="slide-Y" mode="out-in">
                                                {this.formValidatingPass.selectedAnswer.action === 'unused' && (
                                                    <el-checkbox
                                                        v-model={this.isInvalidateAllPasses}
                                                    >
                                                        Все выданные и приостановленные пропуска
                                                        данного типа станут недействительны -
                                                        это увеличит количество бесплатных пропусков
                                                        (при наличии таковых)
                                                    </el-checkbox>
                                                )}
                                            </transition>
                                        </div>
                                    );
                                }
                                return (
                                    <div key="3">
                                        <success-request
                                            title="Данных для заказа пропуска достаточно"
                                            path-image="pass-icons/success.svg"
                                        >
                                            <template slot="desc">
                                                Для продолжения нажмите кнопку <b>далее</b>
                                            </template>
                                        </success-request>
                                    </div>
                                );
                            })()}
                        </transition>
                    </el-form>
                );
            };

            const renderFormOrderScreen = () => {
                return (<el-form
                    label-position="top"
                    model={this.formOrderPass}
                    rules={this.rulesOrderPass}
                    ref="formOrderPass"
                >

                    {renderFormComponents()}

                    <el-row type="flex" justify="space-between">
                        <el-col sm={10}>
                            <el-form-item label="Комментарий">
                                <el-input
                                    v-model={this.formOrderPass.comment}
                                    type="textarea"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col sm={6}>
                            <cost-pass
                                form={this.formOrderPass}
                            />
                        </el-col>
                    </el-row>
                </el-form>);
            };

            const renderSuccessOrderedPass = () => {
                return (
                    <success-request
                        title="Пропуск заказан"
                        path-image="svg/pass.svg"
                    >
                        <template slot="desc">
                            Обычно выдача пропуска занимает 3 дня
                            Узнать о состоянии пропуска вы можете в разделе
                            Услуги -> <pa-button type="link" onClick={() => this.$router.push({ name: 'Passes' })}>Пропуска</pa-button>
                        </template>
                    </success-request>
                );
            };

            const renderSuccessIssuedGuestAutoPass = () => {
                return (
                    <success-request
                        title="Пропуск выдан"
                        path-image="svg/pass.svg"
                    >
                        <template slot="desc">
                            Теперь у вас могут одновременно находиться&nbsp;
                            {
                                this.formOrderPass.typeAuto === PASS_TYPE_AUTO.CAR
                                    ? this.numberActiveCarGuestPasses
                                    : this.numberActiveTruckGuestPasses
                            }
                            &nbsp;авто ({this.formOrderPass.typeAuto}).
                        </template>
                    </success-request>
                );
            };

            const renderSuccessScreen = () => {
                if (this.formOrderPass.type === PASS_TYPE.GUEST_AUTO) {
                    return renderSuccessIssuedGuestAutoPass();
                }
                return renderSuccessOrderedPass();
            };

            const renderContentModal = () => {
                if (this.isVisibleValidating) {
                    return (<section key="validation">{renderValidatingScreen()}</section>);
                } else if (this.isVisibleSuccess) {
                    return (<section key="success">{renderSuccessScreen()}</section>);
                }
                return (<section key="form">{renderFormOrderScreen()}</section>);
            };

            const renderFooterModal = () => {
                if (this.isVisibleValidating) {
                    // validating screen
                    return (
                        <el-row type="flex" justify="end">
                            <div style="display: flex">
                                <pa-button
                                    onClick={this.closeModal}
                                >
                                    Отменить
                                </pa-button>

                                <pa-button
                                    type="primary"
                                    onClick={this.toNextForm}
                                >
                                    Далее
                                </pa-button>
                            </div>
                        </el-row>
                    );
                } else if (this.isVisibleSuccess) {
                    // success screen
                    return (
                        <el-row type="flex" justify="space-between" style="width: 100%">
                            <div>
                                {this.$slots.cancel}
                            </div>

                            <pa-button
                                type="primary"
                                onClick={this.finishWorking}
                            >
                                Закончить
                            </pa-button>
                        </el-row>
                    );
                }
                return (
                    // form order screen
                    <el-row type="flex" justify="space-between" style="width: 100%">
                        {this.isNecessaryToValidationPass
                            ? (
                                <pa-button
                                    onClick={this.backToValidatingScreen}
                                >
                                    Назад
                                </pa-button>
                            ) : this.$slots.cancel
                        }
                        <div>

                        </div>

                        <el-row type="flex" align="middle">
                            <AgreementServicePass
                                text-link="условиями предоставления услуги"
                            >
                                Нажимая кнопку <b>Заказать</b>, вы соглашаетесь с&nbsp;
                            </AgreementServicePass>

                            <pa-button
                                style="margin-left: 20px"
                                type="primary"
                                loading={this.loadingButton}
                                onClick={this.handleClick}
                            >
                                Заказать
                            </pa-button>
                        </el-row>
                    </el-row>
                );
            };

            const directives = [
                { name: 'loading', value: this.loading },
            ];

            return (
                <pa-modal
                    title={this.titleModal}
                    visible={this.isVisibleModal}
                    onClose={this.closeModal}
                >
                    <template slot="default">
                        <div {...{ directives }}>
                            <transition name="slide-X" mode="out-in">
                                {renderContentModal()}
                            </transition>
                        </div>
                    </template>

                    <template slot="footer">
                        <transition name="slide-X" mode="out-in">
                            {renderFooterModal()}
                        </transition>
                    </template>
                </pa-modal>
            );
        },
    });
}

/**
 * Конструктор компонентов заказа пропуска
 *
 * @return {Vue.component}
 */
export function createOrderPass(options: Object) {
    return Vue.component(options.nameComponent, {
        extends: createModalWithForm({
            ...options,
            typeForm: 'order',
        }),
        data() {
            return {};
        },
        computed: {},
        watch: {},
        methods: {
            ...mapActions([
                'orderPass',
                'invalidatePass',
                'deletePass',
                'orderGuestPass',
            ]),

            /**
             * Обработчик клика по кнопке заказа/перезаказа пропуска
             */
            async handleClick() {
                try {
                    // валидируем форму заказа пропуска
                    await this.validateFormOrderPass();
                    //
                    // показываем лоадер на кнопке
                    this.loadingButton = true;
                    //
                    // если данные о сотруднике есть,
                    // значит заказывается пропуск именной
                    // иначе гостевой
                    if (this.dataMainMember) {
                        const { hasStatuses, resultValidation } = this;
                        const { rejected, paused, issued } = resultValidation.passes;
                        //
                        // устанавливаем данные сотрудника в форму заказа пропуска
                        this.setStaffMemberInForm();
                        //
                        // сначала заказываем новый пропуск
                        await this.orderPass(this.formOrderPass);
                        //
                        // потом чистим другие по условию
                        if (hasStatuses.rejected) {
                            // если есть пропуска в статусе "Отклонен"
                            await Promise.all(rejected.map(this.deletePass));
                        }
                        if (this.isInvalidateAllPasses) {
                            // если выбран ответ - "Невозмодно использовать"
                            // и стоит галочка - "Сделать недейств. все пропуска"
                            // переводим в стаутс "Недействителен"
                            // пропуска со статусами "Приостановлен" и "Выдан"
                            await Promise.all([...paused, ...issued].map(this.invalidatePass));
                        }
                    } else {
                        // заказываем гостевой пропуск
                        await this.orderGuestPass(this.formOrderPass);
                    }

                    this.$emit('order-pass');
                    this.isOrderedPass = true;
                    this.$nextTick(() => {
                        // показываем эхкран успеха
                        this.isVisibleSuccess = true;
                    });
                } catch (err) {
                    console.error('Отмена заказ пропуска');
                    console.error(err.message);
                } finally {
                    // скрываем лоадер на кнопке
                    this.loadingButton = false;
                }
            },
        },
        mounted() {},
    });
}

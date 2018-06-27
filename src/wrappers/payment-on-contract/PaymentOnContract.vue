/**
* Created by Smirnov.Denis on 15.02.2018.
*
* Шаблон компонента платежа по договору
*/

<template>

    <pa-panel :is-horizontal="!isMobileVersion" class-attr="payment">
        <!--загаловок-->
        <template slot="header">
            <slot name="title">
                <pa-title :level="3">{{ title }}</pa-title>
            </slot>
        </template>

        <!--платеж по аренде-->
        <template v-if="type === 'rent'">
            <!--фиксированная часть-->
            <template>
                <el-row class="container">
                    <pa-title :level="3">Фиксированная часть</pa-title>

                    <!--остаток/долг-->
                    <template v-if="isVisibleBalanceFixedPart">
                        <div class="payment__bill"
                             :class="[
                                 { 'payment__bill--balance': balanceFixedPart > 0 },
                                 { 'payment__bill--debt': balanceFixedPart < 0 }
                             ]"
                        >
                        <span>
                            {{ balanceFixedPart > 0 ? 'Остаток' : 'Долг' }} на {{ dateToday }}
                        </span>

                        <span>
                            {{ Math.abs(balanceFixedPart) | toLocaleString }} {{ dataContract.currency }}
                        </span>
                        </div>
                    </template>

                    <!--ежемесяный платеж-->
                    <template v-if="hasBillOnFixedPart">
                        <div class="payment__bill">
                            <span>
                            Платеж за {{ nameCurrentMonth | toLocaleString }}
                        </span>

                            <span>
                            оплатить до {{ datePaymentOnFixedPart }}
                        </span>

                            <span>
                            {{ dataContract.rentCost | toLocaleString }} {{ dataContract.currency }}
                        </span>
                        </div>
                    </template>

                    <!--возможность оплаты за следующий месяц-->
                    <template v-if="isPaidBillOnFixedPart">
                        <!--алерт об оплаченном счете за этот месяц-->
                        <el-row class="container">
                            <pa-alert type="success" :closable="false">
                                На {{ dateToday }} у вас всё оплачено.
                                Вы можете внести авансовый платёж за следующий месяц ({{ nameNextMonth }})
                            </pa-alert>
                        </el-row>

                        <!--кнопка формирования счета-->
                        <el-row class="container" v-if="dataContract.rentCost > 0">
                            <pa-button
                                    stretch
                                    @click="onCreateBillOnPayment(dataContract.rentCost, 'fixedRent', 'fixed')"
                            >
                                Сформировать счет на {{ dataContract.rentCost | toLocaleString }} {{ dataContract.currency }}
                            </pa-button>
                        </el-row>
                    </template>

                    <!--кнопка формирования счета по фикс. части-->
                    <template v-if="billOnFixedPart > 0">
                        <el-row class="container">
                            <pa-button
                                    :type="typeButtonBillOnRent"
                                    stretch
                                    @click="onCreateBillOnPayment(billOnFixedPart, 'fixedRent', 'fixed')"
                            >
                                Сформировать счёт на {{ billOnFixedPart | toLocaleString }} {{ dataContract.currency }}
                            </pa-button>
                        </el-row>
                    </template>
                </el-row>
            </template>

            <!--переменная часть-->
            <template v-if="isVisibleBalanceVariablePart">
                <el-row class="container">
                    <pa-title :level="3">Переменная часть</pa-title>

                    <!--остаток/долг-->
                    <template v-if="isVisibleBalanceVariablePart">
                        <div class="payment__bill"
                             :class="[
                             { 'payment__bill--balance': balanceVariablePart > 0 },
                             { 'payment__bill--debt': balanceVariablePart < 0 }
                         ]"
                        >
                            <span>
                            {{ balanceVariablePart > 0 ? 'Остаток' : 'Долг' }} на {{ dateToday }}
                        </span>

                            <span v-if="hasBillOnVariablePart && (balanceVariablePart < 0)">
                                оплатить до {{ datePaymentOnVariablePart }}
                            </span>

                            <span>
                                {{ Math.abs(balanceVariablePart) | toLocaleString }} {{ dataContract.currency }}
                            </span>
                        </div>
                    </template>

                    <!--кнопка формирования счета по перем. части-->
                    <template v-if="billOnVariablePart > 0">
                        <el-row class="container">
                            <pa-button
                                type="text"
                                @click="isVisibleModalDetailOnVariable = true"
                            >
                                Показать детализацию
                            </pa-button>

                            <pa-modal
                                title="Детализация по переменной части"
                                size="small"
                                :visible.sync="isVisibleModalDetailOnVariable"
                            >
                                <template>
                                    <p>
                                        Детализация по переменной части доступна
                                        в системе электронного документооборота
                                    </p>
                                </template>

                                <template slot="footer">
                                    <pa-button
                                        type="primary"
                                        @click="onViewLog"
                                    >
                                        Перейти
                                    </pa-button>
                                </template>
                            </pa-modal>
                        </el-row>

                        <el-row class="container">
                            <pa-button
                                    :type="typeButtonBillOnRent"
                                    stretch
                                    @click="onCreateBillOnPayment(billOnVariablePart, 'variableRent', 'variable')"
                            >
                                Сформировать счёт на {{ billOnVariablePart | toLocaleString }} {{ dataContract.currency }}
                            </pa-button>
                        </el-row>
                    </template>
                </el-row>
            </template>

            <!--сопутствующие услуги-->
            <template v-if="isVisibleBalanceServices">
                <el-row class="container">
                    <pa-title :level="3">Сопутствующие услуги</pa-title>

                    <!--остаток/долг-->
                    <template v-if="isVisibleBalanceServices">
                        <div class="payment__bill"
                             :class="[
                                 { 'payment__bill--balance': balanceServices > 0 },
                                 { 'payment__bill--debt': balanceServices < 0 }
                             ]"
                        >
                            <span>
                                {{ balanceServices > 0 ? 'Остаток' : 'Долг' }} на {{ dateToday }}
                            </span>

                            <span>
                                {{ Math.abs(balanceServices) | toLocaleString }} {{ dataContract.currency }}
                            </span>
                        </div>
                    </template>

                    <!--кнопка формирования счета по сопутствующим услугам-->
                    <template v-if="billOnServices > 0">
                        <el-row class="container">
                            <pa-button
                                :type="typeButtonBillOnRent"
                                stretch
                                @click="onCreateBillOnPayment(billOnServices, 'services')"
                            >
                                Сформировать счёт на {{ billOnServices | toLocaleString }} {{ dataContract.currency }}
                            </pa-button>
                        </el-row>
                    </template>
                </el-row>
            </template>

            <!--кнопка формирования общего счета-->
            <template v-if="listBillsOnRent.length > 1">
                <el-row class="container">
                    <pa-button
                            type="primary"
                            stretch
                            @click="onCreateBillOnPayment(totalBillRent, 'totalRent', 'total')"
                    >
                        Сформировать общий счёт на {{ totalBillRent | toLocaleString }} {{ dataContract.currency }}
                    </pa-button>
                </el-row>
            </template>

            <!--пени-->
            <template v-if="billOnPenalties > 0">
                <el-row class="container payment__penalties">
                    <pa-title :level="3">Пени</pa-title>

                    <!--долг по пени-->
                    <template v-if="true">
                        <div class="payment__bill payment__bill--debt">
                            <span>
                                Просрочка платежа аренды на {{ dateToday }}
                            </span>

                            <span>
                                {{ Math.abs(billOnPenalties) | toLocaleString }} {{ dataContract.currency }}
                            </span>
                        </div>
                    </template>

                    <template v-if="true">
                        <el-row>
                            <pa-button type="text"
                                       :loading="fetchingDetail"
                                       @click="onCreateDetailOnPenalty"
                            >
                                Посмотреть расшифровку пени
                            </pa-button>
                        </el-row>
                    </template>

                    <!--кнопка формирования счета по перем. части-->
                    <template v-if="true">
                        <el-row class="container" style="border-top: 1px solid transparent;">
                            <pa-button
                                    type="primary"
                                    stretch
                                    @click="onCreateBillOnPayment(billOnPenalties, 'penalties')"
                            >
                                Сформировать счёт на {{ billOnPenalties | toLocaleString }} {{ dataContract.currency }}
                            </pa-button>
                        </el-row>
                    </template>
                </el-row>
            </template>
        </template>

        <!--платеж по всему остальному-->
        <template v-if="type === 'telecom'">
            <!--услуги связи-->
            <template>
                <el-row class="container">
                    <pa-title :level="3">Услуги связи</pa-title>

                    <!--остаток/долг-->
                    <template v-if="isVisibleBalanceCommunication">
                        <div class="payment__bill"
                             :class="[
                             { 'payment__bill--balance': balanceCommunication > 0 },
                             { 'payment__bill--debt': balanceCommunication < 0 }
                         ]"
                        >
                            <span>
                                {{ balanceCommunication > 0 ? 'Остаток' : 'Долг' }} на {{ dateToday }}
                            </span>

                            <span>
                                {{ Math.abs(billOnCommunication) | toLocaleString }} {{ dataContract.currency }}
                            </span>
                        </div>
                    </template>

                    <!--алерт об оплаченном счете за услуги связи-->
                    <template v-if="balanceCommunication >= 0">
                        <el-row class="container">
                            <pa-alert type="success" :closable="false">
                                На {{ dateToday }} у вас всё оплачено.
                                Вы можете внести авансовый платёж за следующий месяц ({{ nameNextMonth }})
                            </pa-alert>
                        </el-row>
                    </template>

                    <!--кнопка формирования счета за услуги связи-->
                    <template v-if="billOnCommunication > 0">
                        <el-row class="container">
                            <pa-button
                                :type="typeButtonBillOnTelecom"
                                stretch
                                @click="onCreateBillOnPayment(billOnCommunication, 'fixedTelecom', 'fixed')"
                            >
                                Сформировать счёт на {{ billOnCommunication | toLocaleString }} {{ dataContract.currency }}
                            </pa-button>
                        </el-row>
                    </template>
                </el-row>
            </template>

            <!--сопутствующие услуги-->
            <template v-if="isVisibleBalanceServices">
                <el-row class="container">
                    <pa-title :level="3">Сопутствующие услуги</pa-title>

                    <!--остаток/долг-->
                    <template v-if="isVisibleBalanceServices">
                        <div class="payment__bill"
                             :class="[
                                 { 'payment__bill--balance': balanceServices > 0 },
                                 { 'payment__bill--debt': balanceServices < 0 }
                             ]"
                        >
                            <span>
                                {{ balanceServices > 0 ? 'Остаток' : 'Долг' }} на {{ dateToday }}
                            </span>

                            <span>
                                {{ Math.abs(balanceServices) | toLocaleString }} {{ dataContract.currency }}
                            </span>
                        </div>
                    </template>

                    <!--кнопка формирования счета по сопутствующим услугам-->
                    <template v-if="billOnServices > 0">
                        <el-row class="container">
                            <pa-button
                                :type="typeButtonBillOnTelecom"
                                stretch
                                @click="onCreateBillOnPayment(billOnServices, 'services')"
                            >
                                Сформировать счёт на {{ billOnServices | toLocaleString }} {{ dataContract.currency }}
                            </pa-button>
                        </el-row>
                    </template>
                </el-row>
            </template>

            <!--кнопка формирования общего счета-->
            <template v-if="(billOnCommunication > 0) && (billOnServices > 0)">
                <el-row class="container">
                    <pa-button
                        type="primary"
                        stretch
                        @click="onCreateBillOnPayment(totalBillRent, 'fixedTelecom', 'total')"
                    >
                        Сформировать общий счёт на {{ totalBillTelecom | toLocaleString }} {{ dataContract.currency }}
                    </pa-button>
                </el-row>
            </template>
        </template>
    </pa-panel>

</template>

<script src="./payment-on-contract.js"></script>

/**
* Created by Smirnov.Denis on 07.02.2018.
*/

<template>

    <section v-loading.lock="loading" lodaing-text="Загрузка договора...">
        <template v-if="dataContract">
            <el-row class="container">
                <header class="app-page-header">
                    <div class="app-page-header__block">
                        <div class="app-page-header__item">
                            <pa-title :level="4">{{ dataContract.fullNameType }}</pa-title>
                        </div>
                    </div>
                    <div class="app-page-header__block">
                        <div class="app-page-header__item">
                            <pa-button
                                    type="text"
                                    @click="$router.push({ name: 'DocumentsFeedback', params: { contract: dataContract } })"
                            >
                                Заявка на расторжения договора
                            </pa-button>
                        </div>
                        <div class="app-page-header__item">
                            <span>от {{ dataContract.dateCreation }}, {{ dataContract.validUntil }}</span>
                        </div>
                    </div>
                </header>
            </el-row>

            <!--карточки об аренде-->
            <template v-if="dataContract.type === 'аренда'">
                <el-row class="container wrap" :gutter="gutterGrid" type="flex">
                    <el-col :md="12" class="container">
                        <pa-card style="height: 100%;">
                            <template slot="header">
                                <pa-title :level="3">
                                    {{ dataContract.type | capitalize }} {{ dataContract.typeRent || ''}} (фиксированная&#160;часть)
                                </pa-title>
                            </template>

                            <!--общая площадь-->
                            <el-row class="container no-top">
                                <pa-title :level="1">
                                    {{ dataContract.totalArea | toLocaleString }} м²
                                </pa-title>
                            </el-row>

                            <el-row class="container" type="flex" style="align-items: baseline;">
                                <pa-title :level="1">{{ dataContract.rentCost | toLocaleString }}</pa-title>
                                <span style="padding-left: 10px;">за месяц</span>
                            </el-row>

                            <template slot="footer">
                                <pa-alert type="warning" :closable="false">
                                    <span>оплата до {{ dataContract.paymentDay }} числа текущего месяца</span>
                                </pa-alert>
                            </template>
                        </pa-card>
                    </el-col>

                    <el-col :md="12" class="container">
                        <pa-card style="height: 100%;">
                            <template slot="header">
                                <pa-title :level="3">
                                    Оплата по счётчикам (переменная&#160;часть)
                                </pa-title>
                            </template>

                            <ul>
                                <li v-for="service in dataContract.listServicesOnVariablePart"
                                    :key="service.id"
                                >
                                    {{ service.name | capitalize }}
                                </li>
                            </ul>
                            <template slot="footer">
                                <pa-alert type="warning" :closable="false">
                                    <span>оплата до 25 числа текущего месяца</span>
                                </pa-alert>
                            </template>
                        </pa-card>
                    </el-col>
                </el-row>
            </template>

            <!--алерт-->
            <template v-if="dataContract.debt.total > 0">
                <alert-debt-with-phone
                    :type-contract="dataContract.type"
                    :is-mobile="isMobileVersion"
                />
            </template>

            <!--платеж-->
            <el-row class="container">
                <payment-on-contract
                        title="Платежи"
                        :type="typeContract"
                        :data-contract="dataContract"
                ></payment-on-contract>
            </el-row>

            <!--лоты-->
            <el-row class="container">
                <pa-card v-if="hasListLots">
                    <template slot="header">
                        <el-row type="flex" justify="space-between">
                            <pa-title :level="3">
                                {{ dataContract.type | capitalize }}
                            </pa-title>

                            <pa-title :level="3" v-if="!hasOnlyOneLot">
                                {{ activeLotNumber}}/{{ dataContract.fullListLots.length }}
                            </pa-title>
                        </el-row>
                    </template>

                    <el-carousel
                                 :height="`${isMobileVersion ? 500 : 250}px`"
                                 :arrow="hasOnlyOneLot ? 'never' : 'hover'"
                                 @change="setActiveLolNumber"
                    >
                        <el-carousel-item v-for="(lot, index) in dataContract.fullListLots" :key="lot.id">

                            <el-row style="height: 100%; padding-left: 70px; padding-right: 70px;">
                                <el-col :sm="12">
                                    <el-row class="container">
                                        <pa-title :level="4">{{ lot.address }}</pa-title>
                                    </el-row>

                                    <el-row class="container">
                                        <p>Этаж</p>
                                        <pa-title :level="4">{{ lot.floorName }}</pa-title>
                                    </el-row>

                                    <el-row class="container">
                                        <p>Площадь</p>
                                        <pa-title :level="4">{{ lot.area }} м²</pa-title>
                                    </el-row>
                                </el-col>

                                <el-col :sm="12" style="height: 100%;">
                                    <div class="flex-center column" style="height: 100%;">
                                        <template v-if="lot.image">
                                            <img :src="lot.image" style="width: 100%; max-height: 200px;" alt="lot">
                                        </template>

                                        <template v-else>
                                            <pa-icon name="broken_image" size="big"></pa-icon>
                                            <span>Отсутствует схема арендуемых площадей</span>
                                        </template>
                                    </div>
                                </el-col>
                            </el-row>

                        </el-carousel-item>
                    </el-carousel>
                </pa-card>
            </el-row>

            <!--<el-row class="container">-->
                <!--<pa-title :level="2">Услуги, подключаемые по этому договору</pa-title>-->
            <!--</el-row>-->

            <!--список услуг для подключений-->
            <!--<el-row class="container"></el-row>-->
        </template>

        <!--модалка расторжения-->
        <template>
            <pa-modal
                    title="Заявки на расторжение договора"
                    :visible.sync="isVisibleModalTermination"
            >
                <template>
                    <el-form>
                    </el-form>
                </template>

                <template slot="footer">
                    <pa-button @click="isVisibleModalTermination = false">Закрыть</pa-button>
                </template>
            </pa-modal>
        </template>
    </section>

</template>

<script src="./contract.js"></script>

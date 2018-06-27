/**
* Created by Smirnov.Denis on 23.11.2017.
*/

<template>

    <section v-loading="loading">
        <el-row class="container">
            <header class="app-page-header  app-page-header--align-top">
                <div class="app-page-header__block" style="margin-bottom: 20px;">
                    <div class="app-page-header__item">
                        <pa-title :level="4">Услуги</pa-title>
                    </div>

                    <div class="app-page-header__item">
                        <pa-button type="primary"
                                   @click="$router.push({ name: 'AdditionNewStaffMember' })"
                        >
                            Заказать пропуск на нового человека
                        </pa-button>
                    </div>
                </div>

                <div class="app-page-header__block">
                    <div class="app-page-header__item">
                        <note-parking-pass v-if="hasNotedParkingPass" />
                    </div>
                </div>
            </header>
        </el-row>

        <el-row class="container">
            <pa-card v-if="hasNotedParkingTicket">
                <el-row class="container wrap" type="flex" justify="space-between" align="middle">
                    <p style="margin: 0;">Отметка парковочного билета</p>

                    <note-parking-ticket />

                    <pa-button
                        type="text"
                        @click="visibleManualAtNoteTicket = true"
                    >
                        Посмотреть инструкцию
                    </pa-button>
                </el-row>

                <pa-modal
                    title="Как отметить парковочный билет"
                    :visible.sync="visibleManualAtNoteTicket"
                >
                    <template>
                        <p>
                            Введите в поле "Отметить парковочный билет"
                            номер билета или комбинацию цифр и букв, указанную над штрих-кодом
                        </p>

                        <img :src="getPathImage('other/ticket.jpg')" alt="Парковочный билет">

                    </template>

                    <template slot="footer">
                        <pa-button
                            type="primary"
                            @click="visibleManualAtNoteTicket = false"
                        >
                            Закрыть
                        </pa-button>
                    </template>
                </pa-modal>
            </pa-card>
        </el-row>

        <el-row class="container">
            <el-col>
                <pa-title :level="3">Заказать гостевой пропуск (без имени)</pa-title>

                <pa-button type="text"
                           @click="isVisibleModalCategoriesAuto = true"
                >
                    Классификация автомобилей
                </pa-button>
            </el-col>

            <el-col>
                <order-pass-group-blocks
                        :types="listBlocksOrderGuestPass"
                >
                    <template slot-scope="{ dataBlock, disabled, showModal }">
                        <el-col :sm="12" :md="8" class="container">
                            <pa-block-button
                                    :title="dataBlock.title"
                                    :content="dataBlock.price"
                                    :name-icon="dataBlock.nameIcon"
                                    :disabled="disabled"
                                    @click="showModal(dataBlock.type)"
                            ></pa-block-button>
                        </el-col>
                    </template>
                </order-pass-group-blocks>
            </el-col>
        </el-row>

        <el-row class="container">
            <el-col>
                <pa-title :level="3">Заказать именной пропуск</pa-title>

                <p style="margin: 0;">
                    Вы всегда можете посмотреть и выдать пропуска из
                    <pa-button type="text"
                               @click="$router.push({ path: '/staff' })"
                    >
                        анкеты сотрудника
                    </pa-button>
                </p>
            </el-col>

            <el-col>
                <order-pass-group-blocks
                    :types="listBlocksOrderNamedPass"
                >
                    <template slot-scope="{ dataBlock, disabled, showModal }">
                        <el-col :sm="12" :lg="6" class="container">
                            <pa-block-button
                                :title="dataBlock.title"
                                :content="dataBlock.price"
                                :name-icon="dataBlock.nameIcon"
                                :disabled="disabled"
                                @click="showModal(dataBlock.type)"
                            ></pa-block-button>
                        </el-col>
                    </template>
                </order-pass-group-blocks>
            </el-col>
        </el-row>

        <el-row class="container">
            <el-col class="container">
                <pa-title :level="2">Подключенные услуги</pa-title>
            </el-col>

            <el-col>
                <el-row class="wrap"
                        :gutter="gutterGrid"
                        type="flex"
                        v-loading="loadingListServices"
                        loading-text="Загрузка подключенных услуг..."
                        style="min-height: 150px;"
                >
                    <template v-if="listActivatedServices.length > 0">
                        <el-col class="container"
                                :lg="12"
                                :xl="6"
                                v-for="service in listActivatedServices"
                                :key="service.id">
                            <activated-service-card
                                :data-service="service"
                            ></activated-service-card>
                        </el-col>
                    </template>

                    <template v-else>
                        <div class="flex-center full-width" v-if="!loadingListServices">
                            <pa-title :level="3" align="center">
                                Подключенные услуги отсутствуют
                            </pa-title>
                        </div>
                    </template>
                </el-row>
            </el-col>
        </el-row>

        <el-row class="container">
            <el-col class="container">
                <pa-title :level="2">Популярные услуги</pa-title>
            </el-col>

            <el-col>
                <el-row class="wrap"
                        :gutter="gutterGrid"
                        type="flex"
                        v-loading="loadingListServices"
                        loading-text="Загрузка популярных услуг..."
                        style="min-height: 150px;"
                >
                    <template v-if="listDeactivatedServices.length > 0">
                        <el-col class="container"
                                :lg="12"
                                :xl="6"
                                v-for="service in listDeactivatedServices"
                                :key="service.id">
                            <deactivated-service-card
                                :data-service="service"
                            ></deactivated-service-card>
                        </el-col>
                    </template>

                    <template v-else>
                        <div class="flex-center full-width" v-if="!loadingListServices">
                            <pa-title :level="3" align="center">
                                Популярные услуги отсутствуют
                            </pa-title>
                        </div>
                    </template>
                </el-row>
            </el-col>
        </el-row>

        <!--модалки-->
        <template>
            <pa-modal
                title="Классификация автомобилей"
                :visible.sync="isVisibleModalCategoriesAuto"
                size="small"
            >
                <p>
                    Легковое авто - категория прав A, B
                </p>

                <p>
                    Грузовое авто - категория прав C
                </p>

                <template slot="footer">
                    <pa-button type="primary"
                               @click="isVisibleModalCategoriesAuto = false"
                    >
                        Закрыть
                    </pa-button>
                </template>
            </pa-modal>
        </template>
    </section>

</template>

<script src="./services-index.js"></script>

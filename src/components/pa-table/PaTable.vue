/**
* Created by Smirnov.Denis on 08.11.2017.
*
* Компонент таблицы
*/

<template>

    <div class="pa-table-wrapper">
        <table class="pa-table" ref="table">

            <caption v-if="!isHideCaption">
                <div class="pa-table__caption">
                    <div class="pa-table__caption-row">
                        <div class="pa-table__filter">
                            <input v-model="filterKey" type="text" class="pa-table__filter-input">
                            <button class="pa-table__filter-button">
                                <pa-icon slot="append" name="search" @click=""></pa-icon>
                            </button>
                        </div>
                    </div>

                    <div class="pa-table__caption-row">
                        <div class="pa-table__caption-col">
                            <div v-if="isMobile" class="">
                                <pa-button-group>
                                    <pa-button
                                        v-if="currentSortedColumn"
                                        stretch
                                        style="overflow: hidden"
                                        @click="isVisibleModalSorting = true"
                                    >
                                        {{ sortKey ? currentSortedColumn.label : 'Сортировка' }}
                                    </pa-button>

                                    <pa-button
                                            size="small"
                                            :selected="setIsActive(currentSortedColumn, 1)"
                                            :disabled="!Boolean(sortKey)"
                                            @click="sortColumnBy(currentSortedColumn, 1)"
                                    >
                                        <pa-icon
                                                :class="{ 'is-active': setIsActive(currentSortedColumn, 1) }"
                                                class="pa-table__sort-arrow"
                                                name="arrow_upward"
                                        ></pa-icon>
                                    </pa-button>

                                    <pa-button
                                            size="small"
                                            :selected="setIsActive(currentSortedColumn, -1)"
                                            :disabled="!Boolean(sortKey)"
                                            @click="sortColumnBy(currentSortedColumn, -1)"
                                    >
                                        <pa-icon
                                                :class="{ 'is-active': setIsActive(currentSortedColumn, -1) }"
                                                class="pa-table__sort-arrow"
                                                name="arrow_downward"
                                        ></pa-icon>
                                    </pa-button>
                                </pa-button-group>

                                <!--modal-->
                                <pa-modal
                                        :visible.sync="isVisibleModalSorting"
                                >

                                    <label v-for="(column, index) in columns"
                                           :key="index"
                                           v-if="column.sortable"
                                           class="pa-table__label"
                                    >
                                        <input type="radio" :value="column.key" v-model="sortKey">
                                        {{ column.label }}
                                    </label>

                                </pa-modal>
                                <!--modal-->
                            </div>
                        </div>

                        <div class="pa-table__caption-col">
                            <slot name="caption"></slot>
                        </div>
                    </div>

                </div>
                <div class="pa-table__caption">
                    <div class="pa-table__caption-row">
                        <slot name="caption-filters"></slot>
                    </div>
                </div>
            </caption>

            <thead class="pa-table__header">
                <tr v-if="!isMobile">
                    <th v-for="(column, index) in columns"
                        :key="index"
                        v-if="column.visible || column.visible === undefined"
                        :style="{
                            width: column.width + 'px',
                            'text-align': column.align
                        }"
                        class="pa-table__cell  pa-table__cell--head"
                    >

                        <template v-if="column.sortable">
                            <div class="pa-table__wrap-sort">
                                <pa-button
                                    class="pa-table__label-sort"
                                    type="text"
                                    line-wrap
                                    @click="sortColumnBy(column, sortOrders[column.key] * -1)"
                                >
                                    {{ column.label }}
                                </pa-button>
                                <div class="pa-table__sort">
                                    <pa-icon
                                        :class="{ 'is-active': setIsActive(column, 1) }"
                                        class="pa-table__sort-arrow"
                                        name="arrow_upward"
                                        @click.native="sortColumnBy(column, 1)"
                                    ></pa-icon>
                                    <pa-icon
                                        :class="{ 'is-active': setIsActive(column, -1) }"
                                        class="pa-table__sort-arrow"
                                        name="arrow_downward"
                                        @click.native="sortColumnBy(column, -1)"
                                    ></pa-icon>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <span>{{ column.label }}</span>
                        </template>
                    </th>
                </tr>
            </thead>

            <transition name="flip-table" mode="out-in">
                <template v-if="displayedData.length > 0">
                    <transition-group
                            name="flip-table"
                            tag="tbody"
                            class="pa-table__body"
                    >
                        <tr v-for="row in displayedData"
                            :key="row._keyTransitionGroup"
                            class="pa-table__row"
                            :class="{ 'pa-table__row--hoverable': hoverable }"
                            @click="handleClickRow(row)"
                        >
                            <slot v-if="$scopedSlots.default"
                                  :row="row"
                                  :index="row._keyTransitionGroup"
                            />
                        </tr>
                    </transition-group>
                </template>

                <template v-else-if="data.length === 0">
                    <tbody>
                        <tr>
                            <td :colspan="columns.length" style="height: 300px">
                                <slot name="empty" />
                            </td>
                        </tr>
                    </tbody>
                </template>

                <template v-else>
                    <tbody>
                        <tr>
                            <td :colspan="columns.length" class="pa-table__not-found-cell">
                                Нет совпадений
                            </td>
                        </tr>
                    </tbody>
                </template>
            </transition>

            <tfoot v-if="isMobile" class="pa-table__footer"></tfoot>
        </table>
    </div>

</template>

<script src="./pa-table.js"></script>

<style lang="scss">

    .flip-table {
        &-move {
            transition: all .75s ease;
        }
        &-enter-active {
            transition: all .3s ease-out;
        }
        &-leave-active {
            transition: all .3s ease-in;
        }
        &-enter,
        &-leave-to {
            // height: 0;
            opacity: 0;
            transform: translateY(-50px);
        }
    }

</style>

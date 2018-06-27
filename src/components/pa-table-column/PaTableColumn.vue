/**
* Created by Smirnov.Denis on 08.11.2017.
*
* Компонент колонки таблицы
*/

<template>

    <td v-if="visible"
        :class="{ 'is-main': main }"
        class="pa-table__cell"
        :style="[
            main ? { flexGrow: mainSize } : { },
            {
                textAlign: align
            }
        ]"
        :data-label="label"
    >
        <span>
            <slot></slot>
        </span>
    </td>

</template>

<script src="./pa-table-column.js"></script>

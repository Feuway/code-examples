/**
* Created by Smirnov.Denis on 15.03.2018.
*/

<template>

    <component :is="currentModalOrder.component"
               :visible.sync="isVisibleModal"
               :title-modal="currentModalOrder.title"
               :data-staff-member="dataStaffMember"
               :data-pass="dataPass"
               @order-pass="$emit('order-pass')"
               @finish-order="$emit('finish-order')"
    />

</template>

<script src="./order-pass-controller.js"></script>

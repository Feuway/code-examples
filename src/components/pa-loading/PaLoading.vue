/**
* Created by Smirnov.Denis on 05.12.2017.
*/

<template>

    <transition name="loading-fade" @after-leave="handleAfterLeave">
        <div v-show="visible" class="pa-loading">
            <div class="pa-loading__wrap">
                <div class="pa-loading__spinner">
                    <div class="thecube">
                        <div class="cube c1"></div>
                        <div class="cube c2"></div>
                        <div class="cube c4"></div>
                        <div class="cube c3"></div>
                    </div>
                </div>
                <p v-if="text" class="pa-loading__text">{{ text }}</p>
            </div>
        </div>
    </transition>

</template>

<script src="./pa-loading.js"></script>

<style lang="scss" scoped>

    $prim: #b8e6d3;

    .thecube {
        position: relative;
        width: 50px;
        height: 50px;
        margin: 0 auto;
        -webkit-transform: rotateZ(45deg);
        transform: rotateZ(45deg);

        .cube {
            position: relative;
            -webkit-transform: rotateZ(45deg);
            transform: rotateZ(45deg);
        }

        .cube {
            float: left;
            width: 50%;
            height: 50%;
            position: relative;
            -webkit-transform: scale(1.1);
            -ms-transform: scale(1.1);
            transform: scale(1.1);
        }

        .cube:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: $prim;
            -webkit-animation: foldthecube 2.4s infinite linear both;
            animation: foldthecube 2.4s infinite linear both;
            -webkit-transform-origin: 100% 100%;
            -ms-transform-origin: 100% 100%;
            transform-origin: 100% 100%;
        }

        .c2 {
            -webkit-transform: scale(1.1) rotateZ(90deg);
            transform: scale(1.1) rotateZ(90deg);
        }

        .c3 {
            -webkit-transform: scale(1.1) rotateZ(180deg);
            transform: scale(1.1) rotateZ(180deg);
        }

        .c4 {
            -webkit-transform: scale(1.1) rotateZ(270deg);
            transform: scale(1.1) rotateZ(270deg);
        }

        .c2:before {
            background-color: #47ccc5;
            -webkit-animation-delay: 0.3s;
            animation-delay: 0.3s;
        }

        .c3:before {
            background-color: #41bab9;
            -webkit-animation-delay: 0.6s;
            animation-delay: 0.6s;
        }

        .c4:before {
            background-color: #489ea1;
            -webkit-animation-delay: 0.9s;
            animation-delay: 0.9s;
        }

        @keyframes foldthecube {
            0%, 10% {
                -webkit-transform: perspective(140px) rotateX(-180deg);
                transform: perspective(140px) rotateX(-180deg);
                opacity: 0;
            }

            25%,
            75% {
                -webkit-transform: perspective(140px) rotateX(0deg);
                transform: perspective(140px) rotateX(0deg);
                opacity: 1;
            }

            90%,
            100% {
                -webkit-transform: perspective(140px) rotateY(180deg);
                transform: perspective(140px) rotateY(180deg);
                opacity: 0;
            }
        }
    }

</style>
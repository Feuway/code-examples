/**
* Created by Smirnov.Denis on 07.11.2017.
*
* Компонент модального окна
*/

<template>

    <div>
        <transition name="fade-slide-modal">
            <div v-show="visible" class="pa-modal__wrapper" @click.self="close">
                <article class="pa-modal"
                         :class="[
                         size ? 'pa-modal--' + size : '',
                     ]"
                >
                    <header class="pa-modal__header">
                        <slot name="title">
                            <pa-title :level="size === 'small' ? 3 : 2">{{ title }}</pa-title>
                        </slot>
                        <pa-icon v-if="showClose"
                                 class="pa-modal__btn-close"
                                 name="close"
                                 @click="close"
                        ></pa-icon>
                    </header>

                    <div class="pa-modal__content">
                        <div class="pa-modal__content-inner">
                            <slot />
                        </div>
                    </div>

                    <footer v-if="$slots.footer" class="pa-modal__footer">
                        <slot name="footer"></slot>
                    </footer>
                </article>
            </div>
        </transition>

        <transition name="fade-overlay">
            <div v-show="visible"
                 class="pa-overlay"
            ></div>
        </transition>
    </div>

</template>

<script src="./pa-modal.js"></script>

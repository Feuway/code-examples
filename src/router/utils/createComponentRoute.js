/**
 * Created by Smirnov.Denis on 22.11.2017.
 *
 * @flow
 */

import Vue from 'vue';
import paSidebar from '@/components/pa-sidebar/PaSidebar';
import paNavMenuItems from '@/components/pa-nav-menu-items/PaNavMenuItems';

export function createChildrenIndexRoute(nameRoute: string) {
    return Vue.component(nameRoute, {
        render() {
            return <section>
                <transition name="slide-X" mode="out-in">
                    <router-view key={this.$route.path} />
                </transition>
            </section>;
        },
    });
}

export function createMainIndexRoute(
    nameRoute: string,
    pathRoute: string,
    isSidebar: boolean = false,
    component: typeof Vue.constructor = {},
) {
    return Vue.component(nameRoute, {
        extends: component,
        components: {
            paSidebar,
            paNavMenuItems,
        },
        computed: {
            selfRoute() {
                return this.$store.state.accessibleRoutes
                    .find(route => route.path === pathRoute);
            },
            childRoutes() {
                return this.selfRoute.children || [];
            },
            listRoutesSubMenu() {
                return this.childRoutes.filter(route => Boolean(route.children)).map(el => el.path);
            },
        },
        data() {
            return {
                loading: false,
                loadingText: '',
                ops: {
                    rail: {
                        vRail: {
                            width: '6px',
                            pos: 'right',
                            opacity: 0,
                        },
                    },
                },
            };
        },
        render() {
            const directives = [
                { name: 'loading', value: this.loading, modifiers: { fullscreen: true } },
            ];

            return <pa-layout isSidebar={isSidebar}
                {...{
                    scopedSlots: {
                        sidebar: ({ classNameAnimate, isActive }) => {
                            return <pa-sidebar
                                slot="sidebar"
                                classNameAnimate={classNameAnimate}
                                isActive={isActive}
                            >
                                <vue-scroll
                                    ops={this.ops}
                                >
                                    <el-menu
                                        router={true}
                                        className="side-bar__nav"
                                        defaultActive={this.$route.path}
                                        defaultOpeneds={this.listRoutesSubMenu}
                                        active-text-color="#ffffff"
                                    >

                                        <pa-nav-menu-items data={this.childRoutes}/>

                                    </el-menu>
                                </vue-scroll>
                            </pa-sidebar>;
                        },
                    },
                    directives,
                }}
                loading-text={this.loadingText}
            >
                <el-row type="flex" align="middle" style="min-height: 30px">
                    <p style="margin: 0 20px; font-weight: 500;">
                        Личный кабинет арендатора обновлён и находится в стадии тестирования.
                        Вы можете перейти на <pa-link path="http://cabinet2.6550101.ru/">старую версию</pa-link>.
                    </p>
                </el-row>

                <transition name="slide-Y" mode="out-in">
                    <router-view />
                </transition>
            </pa-layout>;
        },
    });
}

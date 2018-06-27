/**
 * Главный конфиг роутера приложения
 *
 * @flow
 *
 * eslint-disable import/no-unresolved,import/no-unresolved
 */

import Vue from 'vue';
import Router from 'vue-router';

import { setRouterHook } from '@/http-common';

import documentsRoutes from './routes/documents';
import staffRoutes from './routes/staff';
import servicesRoutes from './routes/services';
import maintenanceRoutes from './routes/maintenance';
import helpRoutes from './routes/help';
import watchingVideos from './routes/watching-videos';

import { checkAuthOnServer, checkAuthToRoute, checkAccessToRoute } from './utils/checkRoutes';

const Authorization = () => import('@/pages/Authorization/Authorization');
const Dashboard = () => import('@/pages/Dashboard/Dashboard');
const Profile = () => import('@/pages/Profile/Profile');
const NotFoundPage = () => import('@/pages/NotFoundPage/NotFoundPage');
const AccessDenied = () => import('@/pages/AccessDenied/AccessDenied');

const MainMenu = () => import('@/wrappers/main-menu/MainMenu');

Vue.use(Router);

const router = new Router({
    mode: 'history',
    base: __dirname,
    routes: [
        {
            path: '/authorization',
            name: 'Authorization',
            component: Authorization,
            meta: {
                requiredCheckAuthorization: false,
                requiredCheckAccess: false,
            },
        },
        {
            path: '/',
            name: 'Dashboard',
            components: {
                default: Dashboard,
                menu: MainMenu,
            },
            meta: {
                requiredCheckAuthorization: true,
                requiredCheckAccess: false,
            },
        },
        {
            path: '/profile',
            name: 'Profile',
            components: {
                default: Profile,
                menu: MainMenu,
            },
            meta: {
                requiredCheckAuthorization: true,
                requiredCheckAccess: false,
            },
        },
        {
            path: '*',
            name: 'NotFoundPage',
            component: NotFoundPage,
            meta: {
                requiredCheckAuthorization: true,
                requiredCheckAccess: false,
            },
        },
        {
            path: '/access-denied',
            name: 'AccessDenied',
            component: AccessDenied,
            meta: {
                requiredCheckAuthorization: true,
                requiredCheckAccess: false,
            },
        },
        documentsRoutes,
        staffRoutes,
        servicesRoutes,
        maintenanceRoutes,
        helpRoutes,
        watchingVideos,
    ],
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || { x: 0, y: 0 };
    },
});

export default router;

// проверка на авторизацию и доступ перед переходом
router.beforeEach(async (to, from, next) => {
    try {
        // проверяем залогинен ли на сервере
        await checkAuthOnServer();
        // если путь требует подтверждение авторизации
        if (to.meta.requiredCheckAuthorization) {
            // чекаем авторизацию
            await checkAuthToRoute();
        }
        // если путь требует подтверждения доступа
        if (to.meta.requiredCheckAccess) {
            // чекаем доступ
            await checkAccessToRoute(to);
        }
        next();
    } catch (err) {
        switch (err.message) {
            case 'not authorized':
                next({ path: '/authorization' });
                break;
            case 'access denied':
                next({ path: '/access-denied' });
                break;
            default:
                console.error(err.message);
                next(false);
        }
    }
});

// TODO: дополнить описанием
setRouterHook();

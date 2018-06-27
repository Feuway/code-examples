/**
 * Created by Smirnov.Denis on 24.05.2018.
 *
 * @flow
 */

// import { createMainIndexRoute } from '../utils/createComponentRoute';

const WatchingVideosIndex = () => import('@/pages/WatchingVideos/Index/WatchingVideosIndex');
const Camera = () => import('@/pages/WatchingVideos/Camera/Camera');

const MainMenu = () => import('@/wrappers/main-menu/MainMenu');

export default {
    path: '/watching-videos',
    name: 'WatchingVideosIndex',
    components: {
        default: WatchingVideosIndex,
        menu: MainMenu,
    },
    meta: {
        requiredCheckAuthorization: true,
        requiredCheckAccess: true,
    },
    children: [
        {
            path: 'camera-:id',
            name: 'Camera',
            component: Camera,
            meta: {
                requiredCheckAuthorization: true,
            },
            props: true,
        },
    ],
};

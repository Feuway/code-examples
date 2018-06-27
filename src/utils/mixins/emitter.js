/**
 * Created by Smirnov.Denis on 07.11.2017.
 *
 * Генератор событий между родительскими и дочерними компонентами
 * Использовать только в крайних случаях
 * В основном лучше пользоваться подходом "props down, events up"
 * Подробнее: https://ru.vuejs.org/v2/guide/components.html#Композиция-компонентов
 */

function broadcast(componentName, eventName, params) {
    this.$children.forEach((child) => {
        const nameC = child.$options.name;

        if (nameC === componentName) {
            child.$emit.apply(child, [eventName, params]);
        } else {
            broadcast.apply(child, [componentName, eventName, params]);
        }
    });
}
export default {
    methods: {
        dispatch(componentName, eventName, params) {
            let parentComponent = this.$parent || this.$root;
            let nameC = parentComponent.$options.name;

            while (parentComponent && (!nameC || nameC !== componentName)) {
                parentComponent = parentComponent.$parent;

                if (parentComponent) {
                    nameC = parentComponent.$options.name;
                }
            }
            if (parentComponent) {
                parentComponent.$emit(eventName, params);
            }
        },
        broadcast(componentName, eventName, params) {
            broadcast.call(this, componentName, eventName, params);
        },
    },
};

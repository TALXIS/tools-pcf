export default function registerControl(namespace, control) {
    if (window.ComponentFramework && window.ComponentFramework.registerControl) {
        ComponentFramework.registerControl(namespace, control);
    } else {
        throw new Error('ComponentFramework not found when loading control');
    }
}
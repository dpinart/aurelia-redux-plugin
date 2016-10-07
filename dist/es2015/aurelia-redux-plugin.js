import { ObserverLocator } from 'aurelia-framework';
import { ReduxObservationAdapter } from './ReduxObservationAdapter';
import { Store } from './Store';
export function configure(config, pluginConfig) {
    const container = config.container;
    const store = container.invoke(Store, [config]);
    container.registerInstance(Store, store);
    container.get(ObserverLocator).addAdapter(container.get(ReduxObservationAdapter));
}
export * from './Store';
export * from './select';
export * from './dispatch';
export * from './ReduxObservationAdapter';
export * from './ReduxPropertyObserver';
//# sourceMappingURL=aurelia-redux-plugin.js.map
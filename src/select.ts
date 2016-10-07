import { metadata } from 'aurelia-framework';

import { isFunction, isString } from './utils';
import { Store, StoreSelector } from './Store';
import {Disposable} from 'aurelia-framework';
export interface ReduxSelectConfig {
  subscribe?: boolean|string;
  invoke?: boolean;
}

export interface ReduxSelectorConfig extends ReduxSelectConfig{
  autodispose?: boolean|string;
}

export const SELECTOR_METADATA_KEY = 'aurelia-redux:selector';

/**
 * Decorates a property that represents derived data from the applications store.
 * 
 * @export
 * @template S The root application state.
 * @template T The return type of the selector.
 * @param {(string|Array<string|number>|StoreSelector<S, T>|null)} [selector] If a string is used it will be used
 *   as a path to access on the root state. The path can also be an array of strings representing a path. If a function 
 *   is used, it will be invoked with the root state. If not value is given then the property name will be used as the path.
 * @param {ReduxSelectConfig} [config={}] A config object to configure behavior.
 * @returns {PropertyDecorator}
 * @example
 * 
 * const appState = {
 *   activeUserId: 5,
 *   entities: {
 *     users: {
 *       5: {} // User data here
 *     }
 *   }
 * };
 * 
 * ///////////////////////////
 * 
 * // Select can accept a selector functions as well as strings, including selectors using `reselect`.
 * 
 * const getActiveUser = state => entities.users[state.activeUserId];
 * 
 * class ActiveUser {
 *   @select(getActiveUser)
 *   user: User;
 * } 
 * 
 * activeUser.user; // Logs user data
 * 
 * // You can also create subscriber callback to be notify when the value has changed.
 * 
 * class ActiveUser {
 *   @select(getActiveUser, { subscribe: true })
 *   user: User;
 * 
 *   userChanged(newValue, oldValue) {
 *    // Do something here
 *   }
 * } 
 */
export function select<S, T>(selector?: string|Array<string|number>|StoreSelector<S, T>|null, config: ReduxSelectConfig = {}): PropertyDecorator {
  return function(target: any, propertyKey: string): void {
    metadata.define(SELECTOR_METADATA_KEY, true, target, propertyKey);
    selectImplementation(target, propertyKey, selector, config);
  }
}

export function selector<S, T>(target: any, propertyKey: string, selector?: string|Array<string|number>|StoreSelector<S, T>|null, config: ReduxSelectorConfig = {autodispose: true}): Disposable{
  let disposable = selectImplementation(target, propertyKey, selector, config);
  let oldDisposeMethod: Function;
  if(config.autodispose){
    let disposeMethod = isString(config.autodispose) ? config.autodispose as string : 'unbind';
    let oldDisposeMethod = target[disposeMethod];
    target[disposeMethod] = disposeSubscription;
  }
  function disposeSubscription(){
    if(disposable)
      disposable.dispose();
    if(oldDisposeMethod)
      oldDisposeMethod.call(this, arguments);
  }
  return disposable;
}

function selectImplementation<S, T>(target: any, propertyKey: string, selector?: string|Array<string|number>|StoreSelector<S, T>|null, config: ReduxSelectConfig = {}): Disposable{
  const handlerName = isString(config.subscribe) ? config.subscribe as string : `${propertyKey}Changed`;
  let lastValue: T;
  let lastChangeId: number;
  var observer: Disposable;
  let disposable: Disposable = {
    dispose: () =>{
      if(observer)
        observer.dispose();
    }
  }
  if (!selector) {
    selector = propertyKey;
  }

  // Used for a quick check later on when creating an observer.
  (getter as any).__redux__ = true;

  if (delete target[propertyKey]) {
    Object.defineProperty(target, propertyKey, {
      get: getter,
      enumerable: true,
      configurable: true
    });
  }

  if (config.subscribe) {
    // This needs to come after we define the getter to get the correct observer.
    Store.queue(() => {
      observer = Store.instance.observe(target, propertyKey, observer);
      return observer;
    });
  }

  function getter(): T {
    if (!Store.instance) {
      return lastValue;
    }

    let value = lastValue;

    if (Store.instance.changeId !== lastChangeId) {
      value = Store.instance.select(selector as StoreSelector<S, T>, this, { invoke: config.invoke });
      lastValue = value;
      lastChangeId = Store.instance.changeId;
    }

    return value
  }

  function observer(...args: any[]): void {
    target[handlerName].apply(target, args);
  }
  return disposable;
}
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { inject, BindingEngine } from 'aurelia-framework';
import { isString, get, isThenable, isFunction } from './utils';
export var Store = (function () {
    function Store(bindingEngine, config) {
        this.bindingEngine = bindingEngine;
        this.config = config;
        this._changeId = 0;
        Store.instance = this;
        this.config = Object.assign({ async: false }, this.config);
        if (this.config.store) {
            this.provideStore(this.config.store);
        }
    }
    Object.defineProperty(Store.prototype, "changeId", {
        get: function () {
            return this._changeId;
        },
        enumerable: true,
        configurable: true
    });
    Store.prototype.provideStore = function (store) {
        this.store = store;
        while (Store._queue.length) {
            var observerHandler = Store._queue.shift();
            if (observerHandler) {
                observerHandler();
            }
        }
    };
    Store.prototype.dispatch = function (action) {
        this._changeId++;
        if (this.config.async) {
            if (isThenable(action)) {
                return action.then(this.dispatch.bind(this));
            }
            if (isFunction(action)) {
                return action(this.dispatch.bind(this), this.store.getState.bind(this.store));
            }
        }
        return this.store.dispatch(action);
    };
    Store.prototype.getState = function () {
        return this.store.getState();
    };
    Store.prototype.subscribe = function (listener) {
        return this.store.subscribe(listener);
    };
    Store.prototype.replaceReducer = function (nextReducer) {
        this.store.replaceReducer(nextReducer);
    };
    Store.prototype.observe = function (target, property, handler) {
        return this.bindingEngine.propertyObserver(target, property).subscribe(handler);
    };
    Store.prototype.select = function (selector, instance, options) {
        if (options === void 0) { options = {}; }
        if (isString(selector)) {
            if (options.invoke) {
                var instanceSelector = get(instance, selector);
                if (isFunction(instanceSelector)) {
                    return instanceSelector.call(instance, this.getState());
                }
            }
            return get(this.getState(), selector);
        }
        else if (Array.isArray(selector)) {
            return get(this.getState(), selector);
        }
        return selector(this.getState());
    };
    Store.queue = function (fn) {
        if (this.instance) {
            fn();
        }
        else {
            this._queue.push(fn);
        }
    };
    Store._queue = [];
    Store = __decorate([
        inject(BindingEngine), 
        __metadata('design:paramtypes', [BindingEngine, Object])
    ], Store);
    return Store;
}());
//# sourceMappingURL=Store.js.map
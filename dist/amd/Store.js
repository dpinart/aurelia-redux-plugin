var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", 'aurelia-framework', './utils'], function (require, exports, aurelia_framework_1, utils_1) {
    "use strict";
    var Store = (function () {
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
                if (utils_1.isThenable(action)) {
                    return action.then(this.dispatch.bind(this));
                }
                if (utils_1.isFunction(action)) {
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
            if (utils_1.isString(selector)) {
                if (options.invoke) {
                    var instanceSelector = utils_1.get(instance, selector);
                    if (utils_1.isFunction(instanceSelector)) {
                        return instanceSelector.call(instance, this.getState());
                    }
                }
                return utils_1.get(this.getState(), selector);
            }
            else if (Array.isArray(selector)) {
                return utils_1.get(this.getState(), selector);
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
            aurelia_framework_1.inject(aurelia_framework_1.BindingEngine), 
            __metadata('design:paramtypes', [aurelia_framework_1.BindingEngine, Object])
        ], Store);
        return Store;
    }());
    exports.Store = Store;
});
//# sourceMappingURL=Store.js.map
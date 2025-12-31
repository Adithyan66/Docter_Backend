"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressRouterAdapter = void 0;
const express_request_adapter_1 = require("./express-request.adapter");
const express_response_adapter_1 = require("./express-response.adapter");
class ExpressRouterAdapter {
    constructor(expressRouter) {
        this.expressRouter = expressRouter;
    }
    adaptHandler(handler) {
        return (req, res, next) => {
            const adaptedReq = new express_request_adapter_1.ExpressRequestAdapter(req);
            const adaptedRes = new express_response_adapter_1.ExpressResponseAdapter(res);
            if (handler.length === 4) {
                const errorHandler = handler;
                const error = req.error || new Error('Unknown error');
                return errorHandler(error, adaptedReq, adaptedRes, next);
            }
            const httpHandler = handler;
            try {
                const result = httpHandler(adaptedReq, adaptedRes, next);
                if (result instanceof Promise) {
                    result.catch((err) => {
                        if (next) {
                            next(err);
                        }
                    });
                }
            }
            catch (err) {
                if (next) {
                    next(err);
                }
            }
        };
    }
    get(path, ...handlers) {
        this.expressRouter.get(path, ...handlers.map((h) => this.adaptHandler(h)));
    }
    post(path, ...handlers) {
        this.expressRouter.post(path, ...handlers.map((h) => this.adaptHandler(h)));
    }
    put(path, ...handlers) {
        this.expressRouter.put(path, ...handlers.map((h) => this.adaptHandler(h)));
    }
    patch(path, ...handlers) {
        this.expressRouter.patch(path, ...handlers.map((h) => this.adaptHandler(h)));
    }
    delete(path, ...handlers) {
        this.expressRouter.delete(path, ...handlers.map((h) => this.adaptHandler(h)));
    }
    use(...handlers) {
        this.expressRouter.use(...handlers.map((h) => this.adaptHandler(h)));
    }
    route(path) {
        const expressRoute = this.expressRouter.route(path);
        return new ExpressRouterAdapter(expressRoute);
    }
}
exports.ExpressRouterAdapter = ExpressRouterAdapter;

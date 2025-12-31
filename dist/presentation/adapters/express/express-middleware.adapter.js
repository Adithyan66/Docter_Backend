"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptMiddleware = void 0;
const express_request_adapter_1 = require("./express-request.adapter");
const express_response_adapter_1 = require("./express-response.adapter");
const adaptMiddleware = (handler) => {
    if (handler.length === 4) {
        const errorHandler = handler;
        return (err, req, res, next) => {
            const adaptedReq = new express_request_adapter_1.ExpressRequestAdapter(req);
            const adaptedRes = new express_response_adapter_1.ExpressResponseAdapter(res);
            const result = errorHandler(err, adaptedReq, adaptedRes, next);
            if (result instanceof Promise) {
                result.catch((error) => {
                    if (next) {
                        next(error);
                    }
                });
            }
        };
    }
    const httpHandler = handler;
    return (req, res, next) => {
        const adaptedReq = new express_request_adapter_1.ExpressRequestAdapter(req);
        const adaptedRes = new express_response_adapter_1.ExpressResponseAdapter(res);
        const result = httpHandler(adaptedReq, adaptedRes, next);
        if (result instanceof Promise) {
            result.catch((err) => next(err));
        }
    };
};
exports.adaptMiddleware = adaptMiddleware;

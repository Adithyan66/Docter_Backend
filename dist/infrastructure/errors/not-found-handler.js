"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const constants_1 = require("../constants");
const notFoundHandler = (req, res) => {
    (0, constants_1.errorResponse)(res, constants_1.ErrorCodes.NOT_FOUND, constants_1.NotFoundErrors.ROUTE_NOT_FOUND(req.method, req.path), constants_1.HttpStatus.NOT_FOUND);
};
exports.notFoundHandler = notFoundHandler;

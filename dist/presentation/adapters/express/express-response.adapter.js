"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressResponseAdapter = void 0;
class ExpressResponseAdapter {
    constructor(expressResponse) {
        this.expressResponse = expressResponse;
    }
    status(code) {
        this.expressResponse.status(code);
        return this;
    }
    json(data) {
        this.expressResponse.setHeader('Content-Type', 'application/json');
        this.expressResponse.json(data);
        return this;
    }
    send(data) {
        this.expressResponse.send(data);
        return this;
    }
    header(name, value) {
        this.expressResponse.header(name, value);
        return this;
    }
    setHeader(name, value) {
        this.expressResponse.setHeader(name, value);
        return this;
    }
    cookie(name, value, options) {
        if (options) {
            this.expressResponse.cookie(name, value, options);
        }
        else {
            this.expressResponse.cookie(name, value);
        }
        return this;
    }
    clearCookie(name, options) {
        if (options) {
            this.expressResponse.clearCookie(name, options);
        }
        else {
            this.expressResponse.clearCookie(name);
        }
        return this;
    }
}
exports.ExpressResponseAdapter = ExpressResponseAdapter;

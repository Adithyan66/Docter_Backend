"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressRequestAdapter = void 0;
class ExpressRequestAdapter {
    constructor(expressRequest) {
        this.expressRequest = expressRequest;
    }
    get body() {
        return this.expressRequest.body;
    }
    get query() {
        return this.expressRequest.query;
    }
    get params() {
        return this.expressRequest.params;
    }
    get headers() {
        return this.expressRequest.headers;
    }
    get method() {
        return this.expressRequest.method;
    }
    get path() {
        return this.expressRequest.path;
    }
    get url() {
        return this.expressRequest.url;
    }
    get ip() {
        return this.expressRequest.ip;
    }
    get protocol() {
        return this.expressRequest.protocol;
    }
    get user() {
        return this.expressRequest.user;
    }
    set user(value) {
        this.expressRequest.user = value;
    }
    get cookies() {
        return this.expressRequest.cookies;
    }
    get(header) {
        const value = this.expressRequest.get(header);
        return value || undefined;
    }
}
exports.ExpressRequestAdapter = ExpressRequestAdapter;

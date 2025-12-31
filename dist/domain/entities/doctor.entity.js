"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctor = void 0;
const base_entity_1 = require("./base.entity");
class Doctor extends base_entity_1.BaseEntity {
    constructor(id, email, password, createdAt, updatedAt, refreshToken) {
        super(id, createdAt, updatedAt);
        this.email = email;
        this.password = password;
        this.refreshToken = refreshToken;
    }
}
exports.Doctor = Doctor;

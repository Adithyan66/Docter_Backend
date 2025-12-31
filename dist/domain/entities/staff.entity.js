"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Staff = void 0;
const base_entity_1 = require("./base.entity");
class Staff extends base_entity_1.BaseEntity {
    constructor(id, username, password, clinicId, doctorId, refreshToken, isActive = true, createdAt, updatedAt) {
        super(id, createdAt, updatedAt);
        this.username = username;
        this.password = password;
        this.clinicId = clinicId;
        this.doctorId = doctorId;
        this.role = 'staff';
        this.refreshToken = refreshToken;
        this.isActive = isActive;
    }
}
exports.Staff = Staff;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clinic = void 0;
const base_entity_1 = require("./base.entity");
class Clinic extends base_entity_1.BaseEntity {
    constructor(id, clinicId, doctorId, name, createdAt, updatedAt, address, city, state, pincode, phone, email, website, locationUrl, workingDays, treatments, populatedTreatments, images, notes, isActive, isDeleted) {
        super(id, createdAt, updatedAt);
        this.clinicId = clinicId;
        this.doctorId = doctorId;
        this.name = name;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.phone = phone;
        this.email = email;
        this.website = website;
        this.locationUrl = locationUrl;
        this.workingDays = workingDays;
        this.treatments = treatments;
        this.populatedTreatments = populatedTreatments;
        this.images = images;
        this.notes = notes;
        this.isActive = isActive !== undefined ? isActive : true;
        this.isDeleted = isDeleted !== undefined ? isDeleted : false;
    }
}
exports.Clinic = Clinic;

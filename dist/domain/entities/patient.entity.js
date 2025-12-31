"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Patient = void 0;
const base_entity_1 = require("./base.entity");
class Patient extends base_entity_1.BaseEntity {
    constructor(id, doctorId, firstName, consultationType, createdAt, updatedAt, primaryClinic, clinics, patientId, lastName, fullName, dob, age, gender, phone, email, address, profilePicUrl, tags, treatmentCourses, visitCount, lastVisitAt, isActive, isDeleted) {
        super(id, createdAt, updatedAt);
        this.doctorId = doctorId;
        this.primaryClinic = primaryClinic;
        this.clinics = clinics || [];
        this.patientId = patientId;
        this.firstName = this.capitalizeFirst(firstName);
        this.lastName = lastName ? this.capitalizeFirst(lastName) : lastName;
        this.gender = this.ensureGender(gender);
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.profilePicUrl = profilePicUrl;
        this.tags = tags || [];
        this.treatmentCourses = treatmentCourses || [];
        this.age = age;
        this.visitCount = visitCount ?? 0;
        this.lastVisitAt = lastVisitAt;
        this.isActive = isActive !== undefined ? isActive : true;
        this.isDeleted = isDeleted !== undefined ? isDeleted : false;
        this.consultationType = this.ensureConsultationType(consultationType);
        this.fullName = this.buildFullName();
        if (dob) {
            this.setDob(dob);
        }
    }
    updateNames(firstName, lastName) {
        this.firstName = this.capitalizeFirst(firstName);
        this.lastName = lastName ? this.capitalizeFirst(lastName) : lastName;
        this.fullName = this.buildFullName();
    }
    setDob(dob) {
        this.dob = dob;
        if (dob) {
            this.age = this.calculateAge(dob);
            return;
        }
        this.age = undefined;
    }
    setConsultationType(type) {
        this.consultationType = this.ensureConsultationType(type);
    }
    setPatientId(patientId) {
        this.patientId = patientId;
    }
    setPhone(phone) {
        this.phone = phone;
    }
    setEmail(email) {
        this.email = email;
    }
    incrementVisitCount(visitedAt = new Date()) {
        this.visitCount = (this.visitCount ?? 0) + 1;
        this.lastVisitAt = visitedAt;
    }
    decrementVisitCount() {
        this.visitCount = Math.max(0, (this.visitCount ?? 0) - 1);
    }
    activate() {
        this.isActive = true;
    }
    deactivate() {
        this.isActive = false;
    }
    markDeleted() {
        this.isDeleted = true;
        this.isActive = false;
    }
    restore() {
        this.isDeleted = false;
        this.isActive = true;
    }
    addTreatmentCourse(treatmentCourseId) {
        if (!this.treatmentCourses.includes(treatmentCourseId)) {
            this.treatmentCourses.push(treatmentCourseId);
        }
    }
    removeTreatmentCourse(treatmentCourseId) {
        this.treatmentCourses = this.treatmentCourses.filter(id => id !== treatmentCourseId);
    }
    setDefaultTreatmentCourse(treatmentCourseId) {
        const index = this.treatmentCourses.indexOf(treatmentCourseId);
        if (index === -1) {
            throw new Error(`Treatment course with id "${treatmentCourseId}" not found in patient's treatment courses`);
        }
        if (index === 0) {
            return;
        }
        this.treatmentCourses.splice(index, 1);
        this.treatmentCourses.unshift(treatmentCourseId);
    }
    buildFullName() {
        const capitalizedFirstName = this.capitalizeFirst(this.firstName || '');
        const capitalizedLastName = this.capitalizeFirst(this.lastName || '');
        const computed = `${capitalizedFirstName} ${capitalizedLastName}`.trim();
        return computed || capitalizedFirstName;
    }
    capitalizeFirst(str) {
        if (!str || str.length === 0) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    ensureConsultationType(type) {
        if (type !== 'one-time' && type !== 'treatment-plan') {
            throw new Error('Invalid consultation type');
        }
        return type;
    }
    ensureGender(gender) {
        if (!gender) {
            return 'unknown';
        }
        if (gender !== 'male' && gender !== 'female' && gender !== 'other' && gender !== 'unknown') {
            return 'unknown';
        }
        return gender;
    }
    calculateAge(dob) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age -= 1;
        }
        return age;
    }
}
exports.Patient = Patient;

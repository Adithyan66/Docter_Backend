"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoPatientIdCounterRepository = void 0;
const tsyringe_1 = require("tsyringe");
const patient_counter_model_1 = require("../../database/mongoose/patient-counter.model");
let MongoPatientIdCounterRepository = class MongoPatientIdCounterRepository {
    async getNextSequence(clinicCode) {
        const normalized = clinicCode.trim().toUpperCase();
        const doc = await patient_counter_model_1.PatientIdCounterModel.findByIdAndUpdate(normalized, { $inc: { sequence: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        if (!doc) {
            // Should never happen because of upsert, but fallback to 1
            return 1;
        }
        return doc.sequence;
    }
};
exports.MongoPatientIdCounterRepository = MongoPatientIdCounterRepository;
exports.MongoPatientIdCounterRepository = MongoPatientIdCounterRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoPatientIdCounterRepository);

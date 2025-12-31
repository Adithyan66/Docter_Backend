"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Treatment = void 0;
const base_entity_1 = require("./base.entity");
class Treatment extends base_entity_1.BaseEntity {
    constructor(id, doctorId, name, createdAt, updatedAt, description, minDuration, maxDuration, avgDuration, minFees, maxFees, avgFees, steps, aftercare, followUpRequired, followUpAfterDays, risks, images, isOneTime, regularVisitInterval, isDeleted, isActive = true) {
        super(id, createdAt, updatedAt);
        this.doctorId = doctorId;
        this.name = name;
        this.description = description;
        this.minDuration = minDuration;
        this.maxDuration = maxDuration;
        this.avgDuration = avgDuration;
        this.minFees = minFees;
        this.maxFees = maxFees;
        this.avgFees = avgFees;
        this.steps = steps;
        this.aftercare = aftercare;
        this.followUpRequired = followUpRequired;
        this.followUpAfterDays = followUpAfterDays;
        this.risks = risks;
        this.images = images;
        this.isOneTime = isOneTime;
        this.regularVisitInterval = regularVisitInterval;
        this.isDeleted = isDeleted || false;
        this.isActive = isActive;
    }
}
exports.Treatment = Treatment;

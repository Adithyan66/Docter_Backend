"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyActivitiesSchema = void 0;
const zod_1 = require("zod");
exports.getDailyActivitiesSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    page: zod_1.z.coerce.number().int().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    clinicId: zod_1.z.string().trim().min(1).optional(),
});

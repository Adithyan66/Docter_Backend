"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log('Database disconnected');
    }
    catch (error) {
        console.error('Database disconnection error:', error);
        throw error;
    }
};
exports.disconnectDatabase = disconnectDatabase;

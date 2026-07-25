"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Node-only: populate process.env from a local .env file. On Cloudflare Workers
// process.env is populated by the runtime (nodejs_compat_populate_process_env),
// and this module is never imported by the Worker entry.
dotenv_1.default.config();

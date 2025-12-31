"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./auth"), exports);
__exportStar(require("./clinic"), exports);
__exportStar(require("./daily-activity"), exports);
__exportStar(require("./image"), exports);
__exportStar(require("./media"), exports);
__exportStar(require("./patient"), exports);
__exportStar(require("./payment"), exports);
__exportStar(require("./prescription"), exports);
__exportStar(require("./staff"), exports);
__exportStar(require("./treatment"), exports);
__exportStar(require("./treatment-course"), exports);
__exportStar(require("./visit"), exports);

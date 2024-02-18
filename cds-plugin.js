'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EntityFactory_1 = __importDefault(require("./core/EntityFactory"));
//@ts-ignore
const globalcds = global.cds || require("@sap/cds");
const logger = globalcds.log('cds-plugin-handlers');
logger.info("plugin loaded");
globalcds.on('serving', (service) => {
    logger.info(`Connecting custom handler for ${service.name}`);
    const inst = EntityFactory_1.default.getInstance();
    service.with((srv) => {
        inst.applyHandlers(srv);
    });
});

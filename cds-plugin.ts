'use strict';

import { Service } from "@sap/cds";
import EntityFactory from "./core/EntityFactory";
//@ts-ignore
const globalcds = global.cds || require("@sap/cds");
const logger = globalcds.log('cds-plugin-handlers');
logger.info("plugin loaded")
globalcds.on('serving', (service: any) => {   
    logger.info(`Connecting custom handler for ${service.name}`)
    const inst = EntityFactory.getInstance();
    service.with((srv: Service) => {
        inst.applyHandlers(srv);
    });
});
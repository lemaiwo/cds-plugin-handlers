import BaseHandler from "./BaseHandler";
import path from 'path';
import { EventHandler, OnEventHandler, ResultsHandler, Service } from "@sap/cds/apis/services";
import { camelize } from "../utils/general";
import { Definitions } from "@sap/cds/apis/linked";
import fs from 'fs';
import { Definition, FQN } from "@sap/cds/apis/csn";
import { Request } from "@sap/cds/apis/events";

type TypeEvent = (eve: string, entity: FQN, handler: OnEventHandler | EventHandler | ResultsHandler) => Service;

const operationsDir = "operations";
const startDir = "./";
const handlerDir = "handlers";
const afterFunctions = ["afterCreate", "afterDelete", "afterRead", "afterUpdate"];
//All folders to skip when pickup up files to import
const skipFolders = ["app", "node_modules", ".git", "resources", "gen", "docs", "db", "mta_archives", ".vscode", "tests"];

type OmitSupportedOperationsType = keyof Omit<BaseHandler, "addTemporalOperations" | "getSupportedOperations">;
type WithoutBaseSufixType<T> = T extends `${infer P}Base` ? P : never;
type SupportedOperationFnType = WithoutBaseSufixType<OmitSupportedOperationsType>;

interface DefinitionWithActions extends Definition {
    actions?: Definitions & ((namespace: string) => Definitions),
    includes: Array<string>
}

export default class EntityFactory {
    private handlers: Record<string, Record<string, BaseHandler>> = {};
    private operations: Record<string, Record<string, OnEventHandler>> = {};
    private entityOperations: Record<string, Record<string, Record<string, OnEventHandler>>> = {};

    private static instance: EntityFactory;
    private static files: any = [];

    constructor() {
        this.build();
    }

    public build() {
        //Retireve all files located in folder
        for (const file of EntityFactory.files) {
            //Get foldername = service
            const folderName = path.basename(path.dirname(file));
            //Get filename = handler or operation
            let fileName = path.basename(file, path.extname(file));

            //Skip mainfolder as it only contains basehandler
            if (folderName === handlerDir) continue;

            //Import the code
            const imp = require(path.resolve(startDir, file));

            //Safety reasons
            if (!imp.default) continue;

            //Here we will handle operations
            if (folderName === operationsDir) {
                //Use the name of the file to know for which entity and which operation
                const serviceName = path.parse(file).dir.split("/").splice(-2)[0];
                let entityName;
                const split = fileName.split(".");

                if (split.length > 1) {
                    entityName = split[0];
                    fileName = split[1];
                }

                //Unbound operations
                if (!entityName) {
                    if (!this.operations[serviceName]) this.operations[serviceName] = {};
                    this.operations[serviceName][fileName] = imp.default;
                    continue;
                }

                //Bound operations
                if (!this.entityOperations[serviceName]) this.entityOperations[serviceName] = {};
                if (!this.entityOperations[serviceName][entityName]) this.entityOperations[serviceName][entityName] = {};
                this.entityOperations[serviceName][entityName][fileName] = imp.default;

                continue;
            }

            if (!this.handlers[folderName]) this.handlers[folderName] = {};

            this.handlers[folderName][fileName] = imp.default;

        }
        return this;
    }

    public static getInstance(): EntityFactory {
        //Singleton
        if (EntityFactory.files.length < 1) {
            EntityFactory.files = this.getAllFiles(startDir);
        }
        return new EntityFactory();
    }

    public getHandlerInstanceService(srv: Service, Entity: string): BaseHandler | undefined {
        //Return a new object every time!
        //@ts-ignore
        return this.handlers[srv.name] && this.handlers[srv.name][`${Entity}Handler`] ? new this.handlers[srv.name][`${Entity}Handler`](srv) : undefined;
    }

    public async getOperationInstance(Service: string, Operation: string): Promise<OnEventHandler | undefined> {
        return this.operations[Service]?.[Operation];
    }

    public async getEntityOperationInstance(Service: string, Entity: string, Operation: string): Promise<OnEventHandler | undefined> {
        return this.entityOperations[Service]?.[Entity]?.[Operation];
    }

    public async applyHandlers(srv: Service) {
        //We can do this sync so why wouldn't we to increase startup time :)
        await Promise.all([this.applyServiceEntityHandlers(srv), this.applyServiceUnboundOperationHandlers(srv)]);
    }

    private applyServiceEntityHandlers(srv: Service) {
        //Loop over all entities
        for (const entity of Object.keys(srv.entities)) {
            const serviceEntityInstance = this.getHandlerInstanceService(srv, entity);
            const oEntity = srv.entities[entity] as DefinitionWithActions;

            if (oEntity.actions) this.applyServiceBoundOperationHandlers(srv, entity, oEntity.actions);

            if (!serviceEntityInstance) continue;

            //Loop over all supported operations
            for (const supportedOperation of serviceEntityInstance.getSupportedOperations()) {
                //Retrieve the method name here by combining event & type in camelcase
                const supportedOperationFn = camelize(`${supportedOperation.event} ${supportedOperation.type}`) as SupportedOperationFnType;

                //Bind the correct method to the correct event
                //We do have an addition for temporal to go through the temporalbase insteal of the normal base
                //& we also need to make sure to pass the correct params to the methods which are different for after events
                (srv[supportedOperation.event] as TypeEvent)(supportedOperation.type, entity,
                        afterFunctions.includes(supportedOperationFn) ?
                            async (each: any, req: Request) => (serviceEntityInstance)?.[`${supportedOperationFn}Base`]?.(each, req) :
                           async (req: Request, next: any) => (serviceEntityInstance)?.[`${supportedOperationFn}Base`]?.(req, next));
            }
        }
    }

    private async applyServiceUnboundOperationHandlers(srv: Service) {
        //Loop over operations
        for (const operation of Object.keys(srv.operations)) {
            //Get operation
            const operationInstance = await this.getOperationInstance(srv.name, operation);
            if (!operationInstance) continue;
            //Bind operation
            srv.on(operation, operationInstance);
        }
    }

    private async applyServiceBoundOperationHandlers(srv: Service, entity: string, actions: Definitions & ((namespace: string) => Definitions)) {
        //Loop over operations
        for (const operation of Object.keys(actions)) {
            //Get operation
            const operationInstance = await this.getEntityOperationInstance(srv.name, entity, operation);
            if (!operationInstance) continue;
            //Bind operation
            srv.on(operation, entity, operationInstance);
        }
    }

    private static getAllFiles(dir: any): Array<string> {
        const files: Array<string> = [];
        fs.readdirSync(dir).forEach(file => {
            const abs = path.join(dir, file);
            //Make sure to not return directories and files that we don't need (ex. node_modules)
            if (fs.statSync(abs).isDirectory() && !skipFolders.includes(abs)) return EntityFactory.getFiles(abs, files);
            if (abs.includes(`${handlerDir}`)) return files.push(abs);
        });
        return files;
    }

    private static getFiles(dir: string, files: Array<string>) {
        fs.readdirSync(dir).forEach(file => {
            const abs = path.join(dir, file);
            //Make sure to not return directories and files that we don't need (ex. node_modules)
            if (fs.statSync(abs).isDirectory() && !skipFolders.includes(abs)) return this.getFiles(abs, files);
            if (abs.includes(`${handlerDir}`)) return files.push(abs);
        });
    }
}
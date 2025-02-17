"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const general_1 = require("../utils/general");
const fs_1 = __importDefault(require("fs"));
const operationsDir = "operations";
const startDir = "./";
const handlerDir = "handlers";
const afterFunctions = ["afterCreate", "afterDelete", "afterRead", "afterUpdate"];
//All folders to skip when pickup up files to import
const skipFolders = ["app", "node_modules", ".git", "resources", "gen", "docs", "db", "mta_archives", ".vscode", "tests"];
class EntityFactory {
    constructor() {
        this.handlers = {};
        this.operations = {};
        this.entityOperations = {};
        this.build();
    }
    build() {
        //Retireve all files located in folder
        for (const file of EntityFactory.files) {
            //Get foldername = service
            const folderName = path_1.default.basename(path_1.default.dirname(file));
            //Get filename = handler or operation
            let fileName = path_1.default.basename(file, path_1.default.extname(file));
            //Skip mainfolder as it only contains basehandler
            if (folderName === handlerDir)
                continue;
            //Import the code
            const imp = require(path_1.default.resolve(startDir, file));
            //Safety reasons
            if (!imp.default)
                continue;
            //Here we will handle operations
            if (folderName === operationsDir) {
                //Use the name of the file to know for which entity and which operation
                const serviceName = path_1.default.parse(file).dir.split("/").splice(-2)[0];
                let entityName;
                const split = fileName.split(".");
                if (split.length > 1) {
                    entityName = split[0];
                    fileName = split[1];
                }
                //Unbound operations
                if (!entityName) {
                    if (!this.operations[serviceName])
                        this.operations[serviceName] = {};
                    this.operations[serviceName][fileName] = imp.default;
                    continue;
                }
                //Bound operations
                if (!this.entityOperations[serviceName])
                    this.entityOperations[serviceName] = {};
                if (!this.entityOperations[serviceName][entityName])
                    this.entityOperations[serviceName][entityName] = {};
                this.entityOperations[serviceName][entityName][fileName] = imp.default;
                continue;
            }
            if (!this.handlers[folderName])
                this.handlers[folderName] = {};
            this.handlers[folderName][fileName] = imp.default;
        }
        return this;
    }
    static getInstance() {
        //Singleton
        if (EntityFactory.files.length < 1) {
            EntityFactory.files = this.getAllFiles(startDir);
        }
        return new EntityFactory();
    }
    getHandlerInstanceService(srv, Entity) {
        //Return a new object every time!
        //@ts-ignore
        return this.handlers[srv.name] && this.handlers[srv.name][`${Entity}Handler`] ? new this.handlers[srv.name][`${Entity}Handler`](srv) : undefined;
    }
    getOperationInstance(Service, Operation) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.operations[Service]) === null || _a === void 0 ? void 0 : _a[Operation];
        });
    }
    getEntityOperationInstance(Service, Entity, Operation) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            return (_b = (_a = this.entityOperations[Service]) === null || _a === void 0 ? void 0 : _a[Entity]) === null || _b === void 0 ? void 0 : _b[Operation];
        });
    }
    applyHandlers(srv) {
        return __awaiter(this, void 0, void 0, function* () {
            //We can do this sync so why wouldn't we to increase startup time :)
            yield Promise.all([this.applyServiceEntityHandlers(srv), this.applyServiceUnboundOperationHandlers(srv)]);
        });
    }
    applyServiceEntityHandlers(srv) {
        //Loop over all entities
        for (const entity of Object.keys(srv.entities)) {
            const serviceEntityInstance = this.getHandlerInstanceService(srv, entity);
            const oEntity = srv.entities[entity];
            if (oEntity.actions)
                this.applyServiceBoundOperationHandlers(srv, entity, oEntity.actions);
            if (!serviceEntityInstance)
                continue;
            //Loop over all supported operations
            for (const supportedOperation of serviceEntityInstance.getSupportedOperations()) {
                //Retrieve the method name here by combining event & type in camelcase
                const supportedOperationFn = (0, general_1.camelize)(`${supportedOperation.event} ${supportedOperation.type}`);
                //Bind the correct method to the correct event
                //We do have an addition for temporal to go through the temporalbase insteal of the normal base
                //& we also need to make sure to pass the correct params to the methods which are different for after events
                srv[supportedOperation.event](supportedOperation.type, entity, afterFunctions.includes(supportedOperationFn) ?
                    (each, req) => __awaiter(this, void 0, void 0, function* () { var _a, _b; return (_b = (_a = (serviceEntityInstance)) === null || _a === void 0 ? void 0 : _a[`${supportedOperationFn}Base`]) === null || _b === void 0 ? void 0 : _b.call(_a, each, req); }) :
                    (req, next) => __awaiter(this, void 0, void 0, function* () { var _a, _b; return (_b = (_a = (serviceEntityInstance)) === null || _a === void 0 ? void 0 : _a[`${supportedOperationFn}Base`]) === null || _b === void 0 ? void 0 : _b.call(_a, req, next); }));
            }
        }
    }
    applyServiceUnboundOperationHandlers(srv) {
        return __awaiter(this, void 0, void 0, function* () {
            //Loop over operations
            for (const operation of Object.keys(srv.operations)) {
                //Get operation
                const operationInstance = yield this.getOperationInstance(srv.name, operation);
                if (!operationInstance)
                    continue;
                //Bind operation
                srv.on(operation, operationInstance);
            }
        });
    }
    applyServiceBoundOperationHandlers(srv, entity, actions) {
        return __awaiter(this, void 0, void 0, function* () {
            //Loop over operations
            for (const operation of Object.keys(actions)) {
                //Get operation
                const operationInstance = yield this.getEntityOperationInstance(srv.name, entity, operation);
                if (!operationInstance)
                    continue;
                //Bind operation
                srv.on(operation, entity, operationInstance);
            }
        });
    }
    static getAllFiles(dir) {
        const files = [];
        fs_1.default.readdirSync(dir).forEach(file => {
            const abs = path_1.default.join(dir, file);
            //Make sure to not return directories and files that we don't need (ex. node_modules)
            if (fs_1.default.statSync(abs).isDirectory() && !skipFolders.includes(abs))
                return EntityFactory.getFiles(abs, files);
            if (abs.includes(`${handlerDir}`))
                return files.push(abs);
        });
        return files;
    }
    static getFiles(dir, files) {
        fs_1.default.readdirSync(dir).forEach(file => {
            const abs = path_1.default.join(dir, file);
            //Make sure to not return directories and files that we don't need (ex. node_modules)
            if (fs_1.default.statSync(abs).isDirectory() && !skipFolders.includes(abs))
                return this.getFiles(abs, files);
            if (abs.includes(`${handlerDir}`))
                return files.push(abs);
        });
    }
}
EntityFactory.files = [];
exports.default = EntityFactory;

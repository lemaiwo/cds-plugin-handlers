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
const cds_1 = __importDefault(require("@sap/cds"));
class BaseService {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (BaseService.cdsServices[this.serviceName]) {
                this.setService(BaseService.cdsServices[this.serviceName]);
            }
            else {
                this.setService(yield cds_1.default.connect.to(this.serviceName));
                BaseService.cdsServices[this.serviceName] = this.getService();
            }
            return this.getService();
        });
    }
    getService() {
        return this.cdsService;
    }
    setService(service) {
        this.cdsService = service;
    }
    static getInstance(service) {
        return __awaiter(this, void 0, void 0, function* () {
            const newService = new service();
            if (BaseService.service[service.name])
                return BaseService.service[service.name];
            BaseService.service[service.name] = newService;
            yield BaseService.service[service.name].connect();
            return BaseService.service[service.name];
        });
    }
}
BaseService.service = {};
BaseService.cdsServices = {};
exports.default = BaseService;

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
const error_1 = __importDefault(require("../utils/error"));
class BaseHandler {
    constructor(srv, supportedOperations) {
        this.supportedOperations = [];
        this.filterMap = new Map();
        this.supportedOperations = supportedOperations;
        this.srv = srv;
    }
    getService() {
        return this.srv;
    }
    onReadBase(req, next, skip, top) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.onRead)
                throw new Error("Not implemented");
            try {
                const skipRead = skip || ((_b = (_a = req.query.SELECT.limit) === null || _a === void 0 ? void 0 : _a.offset) === null || _b === void 0 ? void 0 : _b.val) || 0;
                const topRead = top || ((_d = (_c = req.query.SELECT.limit) === null || _c === void 0 ? void 0 : _c.rows) === null || _d === void 0 ? void 0 : _d.val) || 100;
                //Execute single select
                if (req.query.SELECT.one)
                    return this.onRead(req, next, skipRead, topRead);
                //Execute multiple select
                else
                    return this.onRead(req, next, skipRead, topRead);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    onCreateBase(req, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.onCreate)
                throw new Error("Not implemented");
            try {
                return yield this.onCreate(req, next);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    onUpdateBase(req, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.onUpdate)
                throw new Error("Not implemented");
            try {
                return yield this.onUpdate(req, next);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    onDeleteBase(req, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.onDelete)
                throw new Error("Not implemented");
            try {
                return yield this.onDelete(req, next);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    beforeCreateBase(req, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.beforeCreate)
                throw new Error("Not implemented");
            try {
                return yield this.beforeCreate(req, next);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    beforeReadBase(req, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.beforeRead)
                throw new Error("Not implemented");
            try {
                return yield this.beforeRead(req, next);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    beforeUpdateBase(req, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.beforeUpdate)
                throw new Error("Not implemented");
            try {
                return yield this.beforeUpdate(req, next);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    beforeDeleteBase(req, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.beforeDelete)
                throw new Error("Not implemented");
            try {
                return yield this.beforeDelete(req, next);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    afterCreateBase(each, req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.afterCreate)
                throw new Error("Not implemented");
            try {
                yield this.afterCreate(each, req);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    afterSaveBase(each, req) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            if (!this.afterSave)
                throw new Error("Not implemented");
            try {
                //@ts-ignore
                yield this.afterSave(each, req);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    afterReadBase(each, req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.afterRead)
                throw new Error("Not implemented");
            try {
                yield this.afterRead(each, req);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    afterUpdateBase(each, req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.afterUpdate)
                throw new Error("Not implemented");
            try {
                yield this.afterUpdate(each, req);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    afterDeleteBase(each, req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.afterDelete)
                throw new Error("Not implemented");
            try {
                yield this.afterDelete(each, req);
            }
            catch (error) {
                (0, error_1.default)(req, error);
            }
        });
    }
    getSupportedOperations() {
        return this.supportedOperations;
    }
    getFilterMap(req) {
        return this.filterMap.get(req.timestamp) || [];
    }
    prepareFilters(filter, result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(filter))
                filter.forEach((x) => __awaiter(this, void 0, void 0, function* () { return yield this.prepareFilters(x, result); }));
            else if (filter.xpr)
                yield this.prepareFilters(filter.xpr, result);
            else if (filter.func) {
                if (result.length > 0 && result[result.length - 1].Sign === "not") {
                    result[result.length - 1].Sign = `${result[result.length - 1].Sign} ${filter.func}`;
                    result[result.length - 1].Ref = filter.args[0].ref[0];
                    result[result.length - 1].Val = filter.args[1].val;
                    result[result.length - 1].Op = undefined;
                    return;
                }
                result.push({
                    Ref: filter.args[0].ref[0],
                    Sign: filter.func,
                    Val: filter.args[1].val,
                    Op: undefined
                });
            }
            else if (filter.ref) {
                if (filter.ref[0].where) {
                    result.push({
                        Ref: filter.ref[0].where[0].ref[0],
                        Sign: filter.ref[0].where[1],
                        Val: filter.ref[0].where[2].val,
                        Op: ""
                    });
                }
                else {
                    result.push({
                        Ref: filter.ref[0],
                        Sign: "",
                        Val: "",
                        Op: ""
                    });
                }
            }
            else if (typeof (filter) === "string" && (filter === "and" || filter === "or"))
                result[result.length - 1].Op = filter;
            else if (filter.val) {
                result[result.length - 1].Val = filter.val;
            }
            else if (typeof (filter) === "string")
                result[result.length - 1] ? result[result.length - 1].Sign = filter : result.push({
                    Ref: "",
                    Sign: filter,
                    Val: "",
                    Op: ""
                });
        });
    }
}
exports.default = BaseHandler;

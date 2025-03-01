import { Service, Request, SELECT } from "@sap/cds";
import handleError from "../utils/error";

export type supportedOperationEvent = 'before' | 'after' | 'on';
export type supportedOperationType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
export type supportedOperation = {
    event: supportedOperationEvent;
    type: supportedOperationType;
};
export type supportedOperationsType = Array<supportedOperation>;

export interface cqlExpand {
    ref: Array<string>,
    expand: Array<cqlExpand>
}

export interface cqlSort {
    ref: Array<string>,
    sort: 'asc' | 'desc'
}

export interface cqlWhere {
    ref: Array<string>,
    val: any
}

export interface cqlFromItem {
    id: string
}

export interface keyValue { key: string, value: string }

export type filter = {
    Ref: string,
    Sign: string,
    Val: string | boolean,
    Op?: string
}

export default abstract class BaseHandler {
    private srv:Service;
    private supportedOperations: supportedOperationsType = [];
    private filterMap: Map<string, Array<filter>> = new Map();

    protected async onCreate?(req: Request, next: any): Promise<any>;
    protected async onRead?(req: Request, next: any, skip: number, top: number): Promise<any>;
    protected async onUpdate?(req: Request, next: any): Promise<any>;
    protected async onDelete?(req: Request, next: any): Promise<any>;
    protected async beforeCreate?(req: Request, next: any): Promise<any>;
    protected async beforeRead?(req: Request, next: any): Promise<any>;
    protected async beforeUpdate?(req: Request, next: any): Promise<any>;
    protected async beforeDelete?(req: Request, next: any): Promise<any>;
    protected async afterCreate?(each: any, req: Request): Promise<void>;
    protected async afterRead?(each: any, req: Request): Promise<void>;
    protected async afterUpdate?(each: any, req: Request): Promise<void>;
    protected async afterDelete?(each: any, req: Request): Promise<void>;

    constructor(srv:Service,supportedOperations: supportedOperationsType) {
        this.supportedOperations = supportedOperations;
        this.srv = srv;
    }
    protected getService(){
        return this.srv;
    }
    public async onReadBase(req: Request, next?: any, skip?: number, top?: number): Promise<any> {
        if (!this.onRead) throw new Error("Not implemented");

        try {
            const skipRead: number = skip || (req.query as SELECT).SELECT.limit?.offset?.val || 0;
            const topRead: number = top || (req.query as SELECT).SELECT.limit?.rows?.val || 100;

            //Execute single select
            if ((req.query as SELECT).SELECT.one) return this.onRead(req, next, skipRead, topRead);
            //Execute multiple select
            else return this.onRead(req, next, skipRead, topRead);

        } catch (error) {
            handleError(req, error);
        }
    }

    public async onCreateBase(req: Request, next: any): Promise<any> {
        if (!this.onCreate) throw new Error("Not implemented");

        try {
            return await this.onCreate(req, next);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async onUpdateBase(req: Request, next: any): Promise<any> {
        if (!this.onUpdate) throw new Error("Not implemented");

        try {
            return await this.onUpdate(req, next);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async onDeleteBase(req: Request, next: any): Promise<any> {
        if (!this.onDelete) throw new Error("Not implemented");

        try {
            return await this.onDelete(req, next);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async beforeCreateBase(req: Request, next: any): Promise<any> {
        if (!this.beforeCreate) throw new Error("Not implemented");

        try {
            return await this.beforeCreate(req, next);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async beforeReadBase(req: Request, next: any): Promise<any> {
        if (!this.beforeRead) throw new Error("Not implemented");

        try {
            return await this.beforeRead(req, next);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async beforeUpdateBase(req: Request, next: any): Promise<any> {
        if (!this.beforeUpdate) throw new Error("Not implemented");

        try {
            return await this.beforeUpdate(req, next);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async beforeDeleteBase(req: Request, next: any): Promise<any> {
        if (!this.beforeDelete) throw new Error("Not implemented");

        try {
            return await this.beforeDelete(req, next);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async afterCreateBase(each: any, req: Request): Promise<void> {
        if (!this.afterCreate) throw new Error("Not implemented");

        try {
            await this.afterCreate(each, req);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async afterSaveBase(each: any, req: Request): Promise<void> {
        //@ts-ignore
        if (!this.afterSave) throw new Error("Not implemented");

        try {
            //@ts-ignore
            await this.afterSave(each, req);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async afterReadBase(each: any, req: Request): Promise<void> {
        if (!this.afterRead) throw new Error("Not implemented");

        try {
            await this.afterRead(each, req);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async afterUpdateBase(each: any, req: Request): Promise<void> {
        if (!this.afterUpdate) throw new Error("Not implemented");

        try {
            await this.afterUpdate(each, req);
        } catch (error) {
            handleError(req, error);
        }
    }

    public async afterDeleteBase(each: any, req: Request): Promise<void> {
        if (!this.afterDelete) throw new Error("Not implemented");

        try {
            await this.afterDelete(each, req);
        } catch (error) {
            handleError(req, error);
        }
    }

    public getSupportedOperations(): supportedOperationsType {
        return this.supportedOperations;
    }

    protected getFilterMap(req: any): Array<filter> {
        return this.filterMap.get(req.timestamp) || [];
    }

    protected async prepareFilters(filter: any, result: filter[]) {
        if (Array.isArray(filter)) filter.forEach(async x => await this.prepareFilters(x, result))
        else if (filter.xpr) await this.prepareFilters(filter.xpr, result)
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
            })
        }
        else if (filter.ref) {
            if (filter.ref[0].where) {
                result.push({
                    Ref: filter.ref[0].where[0].ref[0],
                    Sign: filter.ref[0].where[1],
                    Val: filter.ref[0].where[2].val,
                    Op: ""
                })
            }
            else {
                result.push({
                    Ref: filter.ref[0],
                    Sign: "",
                    Val: "",
                    Op: ""
                })
            }
        }
        else if (typeof (filter) === "string" && (filter === "and" || filter === "or")) result[result.length - 1].Op = filter;
        else if (filter.val) {
            result[result.length - 1].Val = filter.val;
        }
        else if (typeof (filter) === "string") result[result.length - 1] ? result[result.length - 1].Sign = filter : result.push({
            Ref: "",
            Sign: filter,
            Val: "",
            Op: ""
        });
    }
}
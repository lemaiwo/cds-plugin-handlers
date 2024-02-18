// import BaseService from "../../../../../core/BaseService";
import BaseService from "cds-plugin-handlers/core/BaseService";
import BaseHandler from "cds-plugin-handlers/core/BaseHandler";
import { Service, services } from "@sap/cds";

export default class BooksHandler extends BaseHandler {

    constructor(srv: Service) {
        super(srv, [{ event: 'on', type: 'READ' }]);
    }
    protected async onRead(req: any, next: any, skip: number, top: number) {
        return [{
            ID:123,
            title:"custom handler",
            stock:12
        },{
            ID:12,
            title:"test 12",
            stock:12
        }];
    }
}
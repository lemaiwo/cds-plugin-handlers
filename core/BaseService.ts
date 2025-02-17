import cds, { Service } from "@sap/cds";

export default abstract class BaseService {
    private static service: { [key: string]: BaseService } = {};
    private static cdsServices: { [key: string]: Service } = {};
    protected serviceName: string;
    protected cdsService!: Service;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    public async connect() {
        if (BaseService.cdsServices[this.serviceName]) {
            this.setService(BaseService.cdsServices[this.serviceName]);
        } else {
            this.setService(await cds.connect.to(this.serviceName));
            BaseService.cdsServices[this.serviceName] = this.getService();
        }
        return this.getService();
    }

    public getService(): Service {
        return this.cdsService;
    }

    private setService(service: Service): void{
        this.cdsService = service;
    }

    public static async getInstance<T extends BaseService>(service: { new(): T; }): Promise<T> {
        const newService = new service();
        if (BaseService.service[service.name]) return BaseService.service[service.name] as T;
        BaseService.service[service.name] = newService;
        await BaseService.service[service.name].connect();
        return BaseService.service[service.name] as T;
    }

    public static async getInstances<T extends BaseService>(services: { new(): T; }[]): Promise<T[]> {
        return Promise.all(services.map(service => this.getInstance(service)))
    }
}
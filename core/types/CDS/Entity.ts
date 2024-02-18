import { ICQLColumns } from "./CQLColumns";

export interface IEntity extends ICQLColumns{
    ID: string;
    name: string;
}
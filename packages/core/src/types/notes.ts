import { UserRecord } from "./common.js";

export interface Note extends UserRecord{
    title: string;
    text: string;
}
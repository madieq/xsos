import { DataRouter } from './data-router'

export interface BaseRouter {
    id:string
    execute(data: DataRouter): Promise<any>
}
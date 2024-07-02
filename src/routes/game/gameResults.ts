import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'game.gameResults'
    async execute(data: DataRouter): Promise<any> {
        data.ok({ ok: true, ts: Date.now() })
    }
}
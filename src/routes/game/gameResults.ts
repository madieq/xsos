import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'game.gameResults'
    async execute(data: DataRouter): Promise<any> {
        let mongo: MongoDB = App.getDb('mongo')
        let players = mongo._getCollection('players')
        let games = mongo._getCollection('games')

        let r = await games.aggregate([
            
        ]).toArray()

        data.ok({ ok: true, ts: Date.now() })
    }
}
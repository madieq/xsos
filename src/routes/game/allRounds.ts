import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'game.allRounds'
    async execute(data: DataRouter): Promise<any> {
        let mongo: MongoDB = App.getDb('mongo')
        let players = mongo._getCollection('players')
        let games = mongo._getCollection('games')

        let r = await games.find({ state: 'end' }).toArray()
        data.ok({ ok: true, data: r.map(i => ({ winner: i.winner, empty_cells_count: i.cells.filter(c => c === 0).length, step_counter: i.step_counter })) })
    }
}
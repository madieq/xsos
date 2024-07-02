import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'game.action_cancel_search'
    async execute(data: DataRouter): Promise<any> {
        let mongo: MongoDB = App.getDb('mongo')
        let players = mongo._getCollection('players')
        let games = mongo._getCollection('games')

        let b = games.initializeOrderedBulkOp()
        b.find({ _id: data.user.game?._id }).updateOne({ $pull: { players: data.user.user } })
        b.find({ _id: data.user.game?._id, players: { $size: 0 } }).updateOne({ $set: { status: 'idle' } })
        b.find({ _id: data.user.game?._id, players: { $size: 1 } }).updateOne({ $set: { status: 'players_waiting' } })
        await b.execute()

        let r = await games.findOne({ _id: data.user.game?._id })

        data.ok({ ok: true, data: r })
    }
}
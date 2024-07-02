import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'game.action_find_game'
    async execute(data: DataRouter): Promise<any> {
        let mongo: MongoDB = App.getDb('mongo')
        let players = mongo._getCollection('players')
        let games = mongo._getCollection('games')

        let b = games.initializeOrderedBulkOp()
        b.find({ state: { $in: ['idle', 'players_waiting'] } }).upsert().update({
            $setOnInsert: {
                players: [],
                round_wins: [0, 0],
                players_approved: 0,
                round_counter: 0,
                winner: '',
                cells: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                state: 'idle',
            }
        })
        b.find({ state: { $in: ['idle', 'players_waiting'] } }).updateOne(
            {
                $addToSet: {
                    players: data.user.user,
                },
                $inc: { players_approved: 1 },
                $set: {
                    state: 'players_waiting'
                }
            }
        )
        b.find({ state: 'players_waiting', players_approved: 2 }).updateOne({ $set: { state: 'round' } })
        await b.execute()

        let g = await games.findOne({ players: data.user.user, state: 'round' })
        data.user.game = g
        data.ok({ ok: true, game_id: g._id.toString() })
    }
}
/* 
idle
players_waiting
waiting_approve
xs_round
os_round
*/
/* 
find_game
cancel_search
approve_game
disconnect_game
info
set_mark
*/


import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'game.action_set_mark'
    _getFreePositions(cells: string | number[]) {
        let r = []
        for (let i = 0; i < 9; i++)
            if (cells[i] === 0)
                r.push(i)
        return r
    }
    _getMask(cells: string | number[], type: 'x' | 'o' | 0) {
        let r = []
        for (let i = 0; i < 9; i++)
            r[i] = cells[i] === type ? 1 : 0
        return r
    }
    async execute(data: DataRouter): Promise<any> {
        let mongo: MongoDB = App.getDb('mongo')
        let socket: SocketConnector = App.getConnector('socket')
        let players = mongo._getCollection('players')
        let games = mongo._getCollection('games')

        let user_round = data.user.game.players[data.user.game.step_counter % 2]
        if (user_round !== data.user.user)
            throw ErrorFactory.CREATE('INVALID_ACTION', 'user_round = ' + user_round)

        let cell_position = data.body.cell
        let current_mark = data.user.game.step_counter % 2 === 0 ? 'x' : 'o'
        let b = games.initializeOrderedBulkOp()
        b.find({ _id: data.user.game._id }).updateOne({ ['cells.' + cell_position]: current_mark })
        await b.execute()
        data.user.game.cells[cell_position] = current_mark

        if (this.isWinned(data.user.game.cells, current_mark)) {
            await games.updateOne({ _id: data.user.game._id }, { $set: { state: 'end', winner: user_round } })
        } else {
            let f = data.user.game.cells.find(i => i === 0)
            if (f === 0) {
                await games.updateOne({ _id: data.user.game._id }, { $set: { state: 'end' } })
            } else {
                await games.updateOne({ _id: data.user.game._id }, { $inc: { step_counter: 1 } })
            }
        }

        let r = await games.findOne({ _id: data.user.game._id })
        data.user.game = r
        data.ok({ ok: true, data: r })
    }
    isWinned(cell, type) {
        let win_mask = [
            [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ],
            [
                1, 1, 1,
                0, 0, 0,
                0, 0, 0
            ],
            [
                0, 0, 0,
                1, 1, 1,
                0, 0, 0
            ],
            [
                0, 0, 0,
                0, 0, 0,
                1, 1, 1
            ],
            [
                1, 0, 0,
                1, 0, 0,
                1, 0, 0
            ],
            [
                0, 1, 0,
                0, 1, 0,
                0, 1, 0
            ],
            [
                0, 0, 1,
                0, 0, 1,
                0, 0, 1
            ]
        ]
        let maskcell = cell.map(i => i === type)
        for (let item of win_mask) {
            let matched = 0
            for (let i = 0; i < 9; i++) {
                if (item[i] === 1)
                    if (maskcell[i] === true)
                        matched++
            }
            if (matched >= 3)
                return true
        }
        return false
    }

}
/* 
find_game
cancel_search
approve_game
disconnect_game
info
set_mark
*/
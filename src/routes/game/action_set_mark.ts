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

        let user_round = data.user.game.players[data.user.game.round_counter % 2]
        if (user_round !== data.user.user)
            throw ErrorFactory.CREATE('INVALID_ACTION', 'user_round = ' + user_round)

        let cell_position=data.body.cell
        let current_mark = data.user.game.round_counter % 2 === 0 ? 'x' : 'o'
        let b=games.initializeOrderedBulkOp()
        b.find({ _id:data.user.game._id}).updateOne({['cells.'+cell_position]:current_mark})
        await b.execute()

        let r = await games.findOne({ _id:data.user.game._id})

        
        data.ok({ ok: true, data: r })
    }
    draw_mask = [[1, 1, 1, 1, 1, 1, 1, 1, 1]]
    win_mask = [
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
}
/* 
find_game
cancel_search
approve_game
disconnect_game
info
set_mark
*/
import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

/* 
players
{
user:
game:
}

games
{
players: [] //<player_name_xs>,<player_name_os>
players_approved:[0,0]
round_counter
state
}
*/

export default class RouteExecuter implements BaseRouter {
    id = 'game.action'
    state_game = {
        idle: ['ping', 'find_game', 'info'],
        players_waiting: ['ping', 'cancel_search', 'info'],
        waiting_approve: ['ping', 'approve_game', 'disconnect_game', 'info'],
        round: ['ping', 'disconnect_game', 'info', 'set_mark'],
        end: ['ping', 'find_game', 'info'],
    }
    // state_game = {
    //     players_waiting: [],
    //     xs_round: [],
    //     os_round: [],
    //     end: [],
    // }
    isAllowAction(state: string, action: string) {
        return (this.state_game[state] || []).includes(action)
    }
    async execute(data: DataRouter): Promise<any> {
        let mongo: MongoDB = App.getDb('mongo')
        let p = mongo._getCollection('players')
        let g = mongo._getCollection('games')

        let gg = await g.findOne({ players: data.user.user, state: { $ne: 'end' } })
        data.user.game = gg
        if (!this.isAllowAction(data.user.game?.state || 'idle', data.action))
            throw ErrorFactory.CREATE('INVALID_ACTION', '')

        let r = await App.getRoute('game.action_' + data.action).execute(data)
        data.ok({ ok: true, data: r || data.response_body })
    }
}
/* 
SIO>> to player

state_player
state_game
*/
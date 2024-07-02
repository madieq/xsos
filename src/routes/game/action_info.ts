import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'game.action_info'
    async execute(data: DataRouter): Promise<any> {
        let mongo: MongoDB = App.getDb('mongo')
        let players = mongo._getCollection('players')
        let games = mongo._getCollection('games')

        data.ok(data.user)
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
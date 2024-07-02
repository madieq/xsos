import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'game.action_approve_game'
    async execute(data: DataRouter): Promise<any> {
        data.ok({})
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
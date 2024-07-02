import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'auth.get_session'
    async execute(data: DataRouter): Promise<any> {
        let mongo: MongoDB = App.getDb('mongo')
        let p = mongo._getCollection('players')

        let u = await p.findOne({ user: data.query.ticket })
        if (!u)
            throw ErrorFactory.CREATE('INVALID_TOKEN', 'user is not exists')
        return u
    }
}
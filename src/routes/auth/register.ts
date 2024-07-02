import { ErrorFactory, App, Logger, BaseRouter, DataRouter } from '../../core'
import { MongoDB } from '../../db'
import { HttpConnector, SocketConnector } from '../../connectors'

export default class RouteExecuter implements BaseRouter {
    id = 'auth.register'
    async execute(data: DataRouter): Promise<any> {
        let mongo: MongoDB = App.getDb('mongo')
        let p = mongo._getCollection('players')

        try {
            await p.insertOne({ user: data.body.user})
            data.ok({ ok: true })
        } catch (error) {
            data.error('INVALID_PARAMS', error.message, 400)
        }
    }
}
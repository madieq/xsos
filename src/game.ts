import { App, ErrorFactory, Logger, ListenerOptions } from './core'
import { HttpConnector, SocketConnector } from './connectors'
import { MongoDB } from './db'
import * as routes from './routes'

async function m() {
    process.env.APP_PROJECT = 'xs0s'
    process.env.APP_NAME = 'game'
    App.initConfig()

    let runCb = async () => {
        let m = new MongoDB(App.config.MONGO_URI)
        let h = new HttpConnector(App.config.HTTP_PORT)
        let s = new SocketConnector(App.config.SOCKET_PORT)

        App.addDb(m)
        App.addConnector(h)
        App.addConnector(s)
        App.addRoute(new routes.status.ping())
        App.addRoute(new routes.game.allRounds())
        App.addRoute(new routes.game.gameResults())
        App.addRoute(new routes.game.action())
        App.addRoute(new routes.auth.get_session())
        App.addRoute(new routes.auth.register())
        App.addRoute(new routes.game.action_approve_game())
        App.addRoute(new routes.game.action_cancel_search())
        App.addRoute(new routes.game.action_disconnect_game())
        App.addRoute(new routes.game.action_find_game())
        App.addRoute(new routes.game.action_info())
        App.addRoute(new routes.game.action_ping())
        App.addRoute(new routes.game.action_set_mark())

        await m.onInit()
        m.addIndex('players', [{ user: 1 }, { unique: true }])
        m.addIndex('players', [{ game_id: 1 }, { unique: false }])
        m.addIndex('games', [{ state: 1 }, { unique: false }])
        await m.onRun()

        await h.onInit()
        await h.onEachListen(new ListenerOptions('GET', '/ping', App.getRoute('status.ping')))
        await h.onEachListen(new ListenerOptions('GET', '/allRounds', App.getRoute('game.allRounds')))
        await h.onEachListen(new ListenerOptions('GET', '/gameResults', App.getRoute('game.gameResults')))
        await h.onEachListen(new ListenerOptions('POST', '/register', App.getRoute('auth.register')))
        await h.onRun()

        await s.onInit()
        s.auth_handler = App.getRoute('auth.get_session')
        await s.onEachListen(new ListenerOptions('', 'ping', App.getRoute('status.ping')))
        await s.onEachListen(new ListenerOptions('', 'find_game', App.getRoute('game.action')))
        await s.onEachListen(new ListenerOptions('', 'cancel_search', App.getRoute('game.action')))
        await s.onEachListen(new ListenerOptions('', 'disconnect_game', App.getRoute('game.action')))
        await s.onEachListen(new ListenerOptions('', 'approve_game', App.getRoute('game.action')))
        await s.onEachListen(new ListenerOptions('', 'info', App.getRoute('game.action')))
        await s.onEachListen(new ListenerOptions('', 'set_mark', App.getRoute('game.action')))
        await s.onRun()
    }

    App.run(process.env, runCb)
}
m()
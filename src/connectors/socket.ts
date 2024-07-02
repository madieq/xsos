let io = require('socket.io')
import http, { createServer } from 'http';
import { Server } from 'socket.io';
import { App, ErrorFactory, ListenerOptions, Logger, BaseRouter, DataRouter } from '../core'

export class SocketConnector {
    id: string = 'socketio'

    path: string = '/api/socket'
    port: any = 3000
    io: Server
    _serverHttp: http.Server
    socket
    auth_handler: BaseRouter
    constructor(port) {
        this.port = port
    }
    async send() { }
    async onInit() {
        let self = this
        try {
            Logger.info(`[${this.id}] init port:${this.port} path:${this.path}`)

            this._serverHttp = createServer()
            this.io = io(this._serverHttp, { path: this.path, transports: [/* "pooling", */ "websocket"] })
            // this.io = this.io = new Server({ path: this.path, transports: [/* "pooling", */ "websocket"] })//io(this._serverHttp, socketOptions)
            return
        } catch (ee) {
            Logger.error(`[${this.id}] connector onInit ERROR ${ee.message}`)
            throw ee
        }
        return
    }
    async onRun() {
        let self = this
        let watchSocket = async () => {
            this.io.use(require('socketio-wildcard')())

            this.io.on('connection', async (_socket) => {
                let socket: any = _socket
                Logger.info(`[${self.id}] connection ${socket.id}`)

                socket.on('disconnect', () => {
                    Logger.info(`[${self.id}] disconnect ${socket.id}`)
                })
                socket.on('error', (err_ws) => {
                    Logger.info(`[${self.id}] error ${JSON.stringify(err_ws || '{}')}`)
                })
                socket.on('*', async (packet: any) => {
                    let gp = ((event?, ...args) => ({ event, args }))
                    packet = gp(...packet.data)
                    socket.ro = new DataRouter()
                    socket.ro.user = socket.user
                    try {
                        if (!self._prepared_listeners[packet.event].route) throw new Error('socket event is not have route')
                        let fq = (packet.args || []).length > 1 ? packet.args[0] : (packet.args || {})
                        if (Array.isArray(fq)) fq = packet.args[0] || {}
                        // fq.action = packet.event
                        socket.ro.action = packet.event
                        socket.ro.body = fq
                        //
                        let r = await self._prepared_listeners[packet.event].route.execute(socket.ro)

                        if (socket.ro.response_body || r) _socket.emit(packet.event, socket.ro.response_body || r)
                    } catch (error) {
                        // error = new Error(error.message)
                        _socket.emit('SOCKET_ERROR', [{ action: 'SOCKET_ERROR', data: error, ts: Date.now(), APPID: App.config.APPID }])
                    }
                    return
                })

                try {
                    if (this.auth_handler) {
                        let d = new DataRouter()

                        d.query = socket.handshake.query
                        socket.user = await this.auth_handler.execute(d)
                    }

                    let roomConnectCb = (err) => {
                        let connectMessage = { ok: true, user: { user: socket.user.user }, id: socket.id || '', }
                        _socket.emit('CONNECTED', [{ action: 'CONNECTED', data: connectMessage }])
                    }
                    _socket.join(['all'])
                    roomConnectCb(null)
                } catch (error) {
                    socket.disconnect()
                    Logger.error(`[${self.id}] disconnect ${error.message || error}`)
                }
            })
            this.io.on('error', (err_ws) => {
                Logger.error(`[${this.id}] socket error ${JSON.stringify(err_ws || '{}')}`)
            })
        }
        return new Promise(async (_r, _j) => {
            this._serverHttp.listen(this.port, '0.0.0.0',
                async () => {
                    Logger.info(`[${self.id}] listen ${self.port}`)
                    try { await watchSocket() } catch (e) { Logger.error(`[${self.id}] ${e.message}`); _j(e) }
                    _r(this)
                }
            )
        })
    }
    socketEmit() {

    }
    async onClose() {
        if (this._serverHttp)
            this._serverHttp.close()
        return
    }
    _prepared_listeners: any = {}
    async onEachListen(options) {
        let self = this
        let route = options.route
        if (options.method === '*') options.method = null
        if (!options.action) options.action = null
        if (options.action === '*') options.action = null
        self._prepared_listeners[options.action] = { ...options, route }
        return
    }

}
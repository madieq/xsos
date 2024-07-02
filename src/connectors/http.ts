import { fastify, FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from 'fastify'
import axios, { Axios, AxiosRequestConfig } from 'axios'
import _ from 'lodash'
import * as fastifycors from '@fastify/cors'
import * as mimeTypes from 'mime-types'
import { Stream } from 'stream'
import { IncomingMessage } from 'http'
import { App, ErrorFactory, ListenerOptions, Logger, BaseRouter, DataRouter } from '../core'

export class HttpConnector {
    id: string = 'http'
    port: string | number = 3000
    _app: FastifyInstance
    timeout = 9e6
    bodyLimit = 9e6 * 1024
    cors: boolean = true
    token_validator = ''
    constructor(port: string | number = 3000) { this.port = port }
    async send(opt: AxiosRequestConfig) {
        try {
            let r = await axios(opt)
            return r
        } catch (e) {
            let emsg = e
            throw ErrorFactory.CREATE(e)
        }
    }
    async onInit() {
        try {
            let self = this
            self.port = _.isInteger(self.port) ? _.parseInt(self.port as any) : self.port
            self.port = self.port === '*' ? '' : self.port
            this._app = await fastify({
                bodyLimit: this.bodyLimit,
                connectionTimeout: this.timeout,
            })
            if (self.cors)
                this._app.register(fastifycors.default, {})
        } catch (ee) {
            Logger.error(`[${this.id}] connector onInit ERROR ${ee.message}`)
            throw ee
        }
        return
    }
    async onRun() {
        let self = this
        return new Promise((r, j) => {
            let eh = async (e, req, res) => {
                res.headers()
                res.code(500)
                res.send(e)
                return
            }
            this._app.setErrorHandler(eh)
            this._app.setNotFoundHandler(async (req, res) => {
                let resultError = ErrorFactory.CREATE(404, 'route not found')
                return resultError
            })

            self._app.listen({ port: self.port as number, host: '0.0.0.0', }, async (e, addr) => {
                if (e) return j(e)
                Logger.info(`[CONNECTOR:${this.id}] ${addr} LISTEN DONE RUNNED`)
                r(this)
            })
        })
    }
    async onClose() {
        await this._app.close()
        return
    }
    async onEachListen(options: ListenerOptions) {
        let self = this
        options.method = (options.method || 'all').toLowerCase()

        let method_: any = options.method.toUpperCase()
        let handler = async (req: FastifyRequest, res: FastifyReply) => {
            try {
                // auth TODO
                let u = { user: req.headers.authorization || ('user_' + Math.floor(Math.random() * 1e6)) }

                let optsRequest = new DataRouter()
                optsRequest.user = u
                optsRequest.headers = req.headers
                optsRequest.body = req.body
                optsRequest.query = req.query
                optsRequest.params = req.params
                optsRequest.action = options.action

                let r = await options.route.execute(optsRequest)

                res.code(optsRequest.response_code)
                res.headers(optsRequest.response_headers)
                res.send(optsRequest.response_body || r)
                return
            } catch (e) {
                throw e
            }
        }
        let opts: RouteOptions = {
            method: method_,
            url: options.action,

            errorHandler(e, request, res) {
                try {
                    let er: any = e
                    res.code((e as any).status || (e as any).code || 500)
                    res.headers({})
                    res.send({ code: er.type || er.code || 'INVALID_PARAMETR', message: er.message || '' })
                } catch (e1) {
                    let ee = e || { code: 'INVALID_PARAMETR', message: 'httpc throw error ' + e1.message }
                    let er: any = ee
                    ee = { code: er.type || er.code || 'INVALID_PARAMETR', message: er.message || '' }
                    res.code(500)
                    res.headers({})
                    res.send(ee)
                }
            },
            onRequest: async (req: FastifyRequest, res: FastifyReply) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                res.header("Access-Control-Allow-Methods", "GET, POST");
                // res.header("X-APPID", App.config.APPID)
            },
            handler,
        }
        this._app.route(opts)
        return
    }
}
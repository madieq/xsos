import os from 'os'
import { ErrorFactory } from './error'
import { Logger } from './logger'

export class AppWorker {
    config = process.env
    is_shutdown_mark = false
    connectors: { [key: string]: any } = {}
    db: { [key: string]: any } = {}
    routes: { [key: string]: any } = {}
    addRoute(r) { this.routes[r.id] = r }
    getRoute(n = '') { if (!this.routes[n]) throw ErrorFactory.CREATE('ROUTE_NOT_FOUND', 'on getRoute Error'); return this.routes[n] }
    addDb(r) { this.db[r.id] = r }
    getDb(r) { return this.db[r] }
    getConnector(r) { return this.db[r] }
    addConnector(r) { this.connectors[r.id] = r }
    initConfig(process_env?) {
        process_env = process_env || process.env
        process.env.APP_NAME = process_env.APP_NAME || ''
        process.env.APP_PROJECT = process_env.APP_PROJECT || ''
        process.env.APP_INSTANCE = process_env.APP_INSTANCE || os.hostname() || ''
        process.env.APP = `${process.env.APP_PROJECT}:${process.env.APP_NAME}`
        process.env.APPID = `${process.env.APP_PROJECT}:${process.env.APP_NAME}:${process.env.APP_INSTANCE}`
    }
    async onRunNodeHandlers() {
        Error.stackTraceLimit = 30
        process.on('SIGINT', () => {
            // Logger.info(`[APP] :SIGINT`)
            console.log(`[APP] :SIGINT`)
            App.shutdown('SIGINT')
        });
        process.on('SIGTERM', () => {
            // Logger.info(`[APP] :SIGTERM`)
            console.log(`[APP] :SIGTERM`)
            App.shutdown('SIGTERM')
        });
        process.on('SIGHUP', () => {
            // Logger.info(`[APP] :SIGHUP`)
            console.log(`[APP] :SIGHUP`)
            App.shutdown('SIGHUP')
        });
        process.on('uncaughtException', (e) => {
            console.log(`[APP] [UNCAUGHT_EXCEPTION] ${(e as any).type || ''} ${(e.message || '').replace(/[ ]{2,}|\n|\r/g, ' ')} ${(e.stack || '').replace(/[ ]{2,}|\n|\r/g, ' ')}`)
        })
        process.on('warning', e => {
            // Logger.info(`[APP] ${e.message || ''}`)
            console.log(`[APP] ${(e as any).type || ''} ${(e.message || '').replace(/[ ]{2,}|\n|\r/g, ' ')} ${(e.stack || '').replace(/[ ]{2,}|\n|\r/g, ' ')}`)
        })
        Logger.info(`starting ${App.config.APP}  ...`)
    }
    async run(processEnv = process.env, runFunc = async () => { }) {
        Logger.info(`[APP:prepare run] ...`)
        App.initConfig(processEnv)
        await App.onRunNodeHandlers()
        try {
            Logger.info(`[APP:running] ${App.config.APPID}`)
            await runFunc()
            Logger.info(`[APP:started] ${App.config.APPID} ...`)
        } catch (e) {
            e = ErrorFactory.CREATE('INIT_STEP_RUN', e.message)
            App.shutdown('ONRUN_APPLICATION ' + e.message)
            // throw e
        }
    }
    async shutdown(message: string = '') {
        this.is_shutdown_mark = true
        console.log(`::APP.shutdown::${message}`)
        process.exit()
    }

}
export const App = new AppWorker()
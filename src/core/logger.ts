class LogWorker {
    debug(message: string | any = '') { console.log(`[${process.env.APP} ${new Date().toISOString()} :debug] ${(message || '')}`) }
    info(message: string | any = '') { console.log(`[${process.env.APP} ${new Date().toISOString()} :info] ${(message || '')}`) }
    warning(message: string | any = '') { console.log(`[${process.env.APP} ${new Date().toISOString()} :warning] ${(message || '')}`) }
    trace(message: string | any = '') { console.log(`[${process.env.APP} ${new Date().toISOString()} :trace] ${(message || '')}`) }
    error(message: string | any = '') { console.log(`[${process.env.APP} ${new Date().toISOString()} :error] ${(message || '')}`) }
}
export const Logger = new LogWorker()
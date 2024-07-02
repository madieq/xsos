export class DataRouter {
    action: string
    user: any
    // 
    query: any
    body: any
    params: any
    headers: any = {}
    response_body: any
    response_code: number = 200
    response_headers: any = {}
    error(type: string = '', message: string, code: number = 400, data: any = {}, headers = {}) {
        this.response_body = { ok: false, code, type, message, data }
        this.response_code = code
        this.response_headers = { ...this.response_headers, ...headers }
        return this
    }
    ok(data: any, code = 200, headers = {}) {
        this.response_body = data
        this.response_headers = { ...this.response_headers, ...headers }
        this.response_code = code
        return this
    }
}
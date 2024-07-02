export class ListenerOptions {
    constructor(method = '', action = '', route: any,) {
        this.action = action
        this.method = method
        this.route = route
    }
    method: string = ''
    action: string = ''
    route: any
    args: any = ''
    /**deprecated */
    middleware: any = []
    schema: object
    access: string[] = []
    connector: any
    mode: { [key: string]: any } = {}
}
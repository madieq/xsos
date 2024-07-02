interface IAppAnyprops {
    [key: string]: any
}

export class AppError implements IAppAnyprops {
    toString() { return `${this.type}:${this.message}:${this.stack}` }
    code: number = 400
    type: string | number = 0
    message: string = ''
    stack: string = ''
    set(propName = '', value: any) {
        this[propName] = value
        return this
    }
    constructor(type: string | number = 0, message = '', stack = '') {
        this.type = type;
        this.message = message;
        if (stack)
            this.stack = stack
        else {
            // let a = { stack: '' }
            // Error.captureStackTrace(a)
            // a.stack = a.stack.replace(/\n|(    )/g, ':')
            // this.stack = a.stack
        }
    }
}
export class ErrorFactory {
    static CREATE(type: string | number | Error | any = 0, message = '', ...args: any): any {
        if (typeof type === 'string' || typeof type === 'number') {
            return new AppError(type, message)
        } else if (type instanceof Error) {
            return new AppError(type.name, type.message, (type.stack || '').replace(/\n|(    )/g, ':'))
        } else if (type.type !== undefined && type.message !== undefined && type.stack !== undefined) {
            return type
        } else {
            return new AppError(0, message,)
        }
    }
}
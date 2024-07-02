import { App, ErrorFactory, Logger } from '../core'
import { Collection, ConnectOptions, MongoClient, Db, Document, ObjectId } from 'mongodb'

export class MongoDB {
    constructor(uri = '') {
        this.uri = uri
    }
    id: string = 'mongo'
    uri = ''
    settings: any = []
    client: MongoClient
    database: Db
    collections: Collection<Document>[] = []
    _collections: { [key: string]: Collection<Document> } = {}
    addIndex(collection = '', settings: any[] = []) {
        this.settings.push({
            collection,
            index: settings,
        })
    }
    async onInit() {
        try {
            let self = this
        } catch (ee) {
            Logger.error(`[${this.id}] connector onInit ERROR ${ee.message}`)
            throw ee
        }
        return
    }
    _genId(s?) { return new ObjectId(s) }
    _getCollection(name: string): Collection {
        if (!this._collections[name]) { this._updateCollections(); return null } //throw ErrorFactory.CREATE('APPCMONGO_COLLECTION_IS_NOT_EXIST')
        return this._collections[name]
    }
    async _updateCollections() {
        this.collections = await this.database.collections()
        for (let c of this.collections)
            this._collections[c.collectionName] = c
    }
    async onRun() {
        let self = this
        try {
            this.client = new MongoClient(this.uri)
            this.client = await this.client.connect()
            this.database = this.client.db()

            await this._updateCollections()

            for (let s of this.settings) {
                if (s.index)
                    try {
                        let c = this._getCollection(s.collection)
                        if (!c) await this.database.createCollection(s.collection)
                        await this._getCollection(s.collection).createIndex(s.index[0], s.index[1])
                    } catch (e) {
                        Logger.error(`[${this.id}] ${e.message}`)
                    }
            }

            await this._updateCollections()
            return
        } catch (error) {
            throw error
        }
    }
    async onClose() {
        try {
            await this.client.close(true)
        } catch (error) {

        }
        return
    }
}
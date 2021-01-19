"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const casbin_1 = require("casbin");
const mongodb_1 = require("mongodb");
const casbin_rule_entity_1 = require("./casbin-rule.entity");
/**
 * TypeORMAdapter represents the TypeORM adapter for policy storage.
 */
class MongoAdapter {
    constructor(uri, dbName, collectionName, filtered, option) {
        this.isFiltered = false;
        if (!uri) {
            throw new Error('You must provide Mongo URI to connect to!');
        }
        // Cache the mongo uri and db name for later use
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.isFiltered = filtered;
        try {
            // Create a new MongoClient
            const sharedOptions = option !== null ? option : {};
            this.mongoClient = new mongodb_1.MongoClient(uri, Object.assign(Object.assign({}, sharedOptions), { useUnifiedTopology: true, useNewUrlParser: true }));
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    /**
     * newAdapter is the constructor.
     * @param adapterOption
     */
    static async newAdapter(adapterOption) {
        const { uri, option, collectionName = 'casbin', databaseName = 'casbindb', filtered = false } = adapterOption;
        const a = new MongoAdapter(uri, databaseName, collectionName, filtered, option);
        await a.open();
        return a;
    }
    async close() {
        if (this.mongoClient && this.mongoClient.isConnected) {
            await this.mongoClient.close();
        }
    }
    /**
     * loadPolicy loads all policy rules from the storage.
     */
    async loadPolicy(model) {
        await this.loadFilteredPolicy(model);
    }
    /**
     * loadPolicy loads filtered policy rules from the storage.
     */
    async loadFilteredPolicy(model, filter) {
        try {
            let lines;
            if (this.isFiltered) {
                lines = await this.getCollection()
                    .find(filter)
                    .toArray();
            }
            else {
                lines = await this.getCollection()
                    .find()
                    .toArray();
            }
            for (const line of lines) {
                this.loadPolicyLine(line, model);
            }
        }
        catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e);
            throw new Error(e);
        }
    }
    /**
     * savePolicy saves all policy rules to the storage.
     */
    async savePolicy(model) {
        await this.clearCollection();
        let astMap = model.model.get('p');
        const lines = [];
        // @ts-ignore
        for (const [ptype, ast] of astMap) {
            for (const rule of ast.policy) {
                const line = this.savePolicyLine(ptype, rule);
                lines.push(line);
            }
        }
        astMap = model.model.get('g');
        // @ts-ignore
        for (const [ptype, ast] of astMap) {
            for (const rule of ast.policy) {
                const line = this.savePolicyLine(ptype, rule);
                lines.push(line);
            }
        }
        if (Array.isArray(lines) && lines.length > 0) {
            await this.getCollection().insertMany(lines);
        }
        return true;
    }
    /**
     * addPolicy adds a policy rule to the storage.
     */
    async addPolicy(_sec, ptype, rule) {
        const line = this.savePolicyLine(ptype, rule);
        await this.getCollection().insertOne(line);
    }
    /**
     * removePolicy removes a policy rule from the storage.
     */
    async removePolicy(_sec, ptype, rule) {
        const line = this.getPolicyLine(ptype, rule);
        await this.getCollection().deleteOne(line);
    }
    /**
     * removeFilteredPolicy removes policy rules that match the filter from the storage.
     */
    async removeFilteredPolicy(_sec, ptype, fieldIndex, ...fieldValues) {
        const line = {};
        line.ptype = ptype;
        if (fieldIndex <= 0 && 0 < fieldIndex + fieldValues.length) {
            line.v0 = fieldValues[0 - fieldIndex];
        }
        if (fieldIndex <= 1 && 1 < fieldIndex + fieldValues.length) {
            line.v1 = fieldValues[1 - fieldIndex];
        }
        if (fieldIndex <= 2 && 2 < fieldIndex + fieldValues.length) {
            line.v2 = fieldValues[2 - fieldIndex];
        }
        if (fieldIndex <= 3 && 3 < fieldIndex + fieldValues.length) {
            line.v3 = fieldValues[3 - fieldIndex];
        }
        if (fieldIndex <= 4 && 4 < fieldIndex + fieldValues.length) {
            line.v4 = fieldValues[4 - fieldIndex];
        }
        if (fieldIndex <= 5 && 5 < fieldIndex + fieldValues.length) {
            line.v5 = fieldValues[5 - fieldIndex];
        }
        await this.getCollection().deleteMany(line);
    }
    async createDBIndex() {
        try {
            const indexFields = [
                'ptype',
                'v0',
                'v1',
                'v2',
                'v3',
                'v4',
                'v5'
            ];
            for (const name of indexFields) {
                await this.getCollection().createIndex({ [name]: 1 });
            }
            // tslint:disable-next-line:no-console
            console.info('Indexes created');
        }
        catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e);
        }
    }
    async open() {
        try {
            await this.mongoClient.connect();
            await this.createDBIndex();
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    getCollection() {
        if (this.mongoClient.isConnected === undefined) {
            throw new Error('Mongo not connected');
        }
        return this.mongoClient.db(this.dbName).collection(this.collectionName);
    }
    getDatabase() {
        if (this.mongoClient.isConnected === undefined) {
            throw new Error('Mongo not connected');
        }
        return this.mongoClient.db(this.dbName);
    }
    async clearCollection() {
        try {
            const list = await this.getDatabase()
                .listCollections({ name: this.collectionName })
                .toArray();
            if (list && list.length > 0) {
                await this.getCollection().drop();
            }
            return;
        }
        catch (error) {
            return;
        }
    }
    loadPolicyLine(line, model) {
        const result = line.ptype +
            ', ' +
            [line.v0, line.v1, line.v2, line.v3, line.v4, line.v5]
                .filter(n => n)
                .join(', ');
        casbin_1.Helper.loadPolicyLine(result, model);
    }
    savePolicyLine(ptype, rule) {
        const line = new casbin_rule_entity_1.CasbinRule();
        return this.createPolicyLine(line, ptype, rule);
    }
    getPolicyLine(ptype, rule) {
        const line = {};
        return this.createPolicyLine(line, ptype, rule);
    }
    createPolicyLine(line, ptype, rule) {
        line.ptype = ptype;
        if (rule.length > 0) {
            line.v0 = rule[0];
        }
        if (rule.length > 1) {
            line.v1 = rule[1];
        }
        if (rule.length > 2) {
            line.v2 = rule[2];
        }
        if (rule.length > 3) {
            line.v3 = rule[3];
        }
        if (rule.length > 4) {
            line.v4 = rule[4];
        }
        if (rule.length > 5) {
            line.v5 = rule[5];
        }
        return line;
    }
}
exports.MongoAdapter = MongoAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFnRDtBQUNoRCxxQ0FNaUI7QUFDakIsNkRBQWtEO0FBVWxEOztHQUVHO0FBQ0gsTUFBYSxZQUFZO0lBK0J2QixZQUNFLEdBQVcsRUFDWCxNQUFjLEVBQ2QsY0FBc0IsRUFDdEIsUUFBaUIsRUFDakIsTUFBMkI7UUFYdEIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQWFqQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1NBQzlEO1FBRUQsZ0RBQWdEO1FBQ2hELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO1FBRTNCLElBQUk7WUFDRiwyQkFBMkI7WUFDM0IsTUFBTSxhQUFhLEdBQUcsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHFCQUFXLENBQUMsR0FBRyxrQ0FDakMsYUFBYSxLQUNoQixrQkFBa0IsRUFBRSxJQUFJLEVBQ3hCLGVBQWUsRUFBRSxJQUFJLElBQ3JCLENBQUM7U0FDSjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDaEM7SUFDSCxDQUFDO0lBekREOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGFBQWtDO1FBQy9ELE1BQU0sRUFDSixHQUFHLEVBQ0gsTUFBTSxFQUNOLGNBQWMsR0FBRyxRQUFRLEVBQ3pCLFlBQVksR0FBRyxVQUFVLEVB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
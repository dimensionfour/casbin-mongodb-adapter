import { Adapter, Model } from 'casbin';
import { MongoClientOptions, FilterQuery } from 'mongodb';
interface MongoAdapterOptions {
    readonly uri: string;
    readonly option?: MongoClientOptions;
    readonly databaseName: string;
    readonly collectionName: string;
    readonly filtered?: boolean;
}
/**
 * TypeORMAdapter represents the TypeORM adapter for policy storage.
 */
export declare class MongoAdapter implements Adapter {
    /**
     * newAdapter is the constructor.
     * @param adapterOption
     */
    static newAdapter(adapterOption: MongoAdapterOptions): Promise<MongoAdapter>;
    isFiltered: boolean;
    private readonly dbName;
    private readonly mongoClient;
    private readonly collectionName;
    private constructor();
    close(): Promise<void>;
    /**
     * loadPolicy loads all policy rules from the storage.
     */
    loadPolicy(model: Model): Promise<void>;
    /**
     * loadPolicy loads filtered policy rules from the storage.
     */
    loadFilteredPolicy(model: Model, filter?: FilterQuery<any>): Promise<void>;
    /**
     * savePolicy saves all policy rules to the storage.
     */
    savePolicy(model: Model): Promise<boolean>;
    /**
     * addPolicy adds a policy rule to the storage.
     */
    addPolicy(_sec: string, ptype: string, rule: string[]): Promise<void>;
    /**
     * removePolicy removes a policy rule from the storage.
     */
    removePolicy(_sec: string, ptype: string, rule: string[]): Promise<void>;
    /**
     * removeFilteredPolicy removes policy rules that match the filter from the storage.
     */
    removeFilteredPolicy(_sec: string, ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<void>;
    createDBIndex(): Promise<void>;
    open(): Promise<void>;
    private getCollection;
    private getDatabase;
    private clearCollection;
    private loadPolicyLine;
    private savePolicyLine;
    private getPolicyLine;
    private createPolicyLine;
}
export {};

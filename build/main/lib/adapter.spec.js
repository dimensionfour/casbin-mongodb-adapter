"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-expression-statement no-implicit-dependencies
const ava_1 = __importDefault(require("ava"));
const casbin_1 = require("casbin");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const adapter_1 = require("./adapter");
// Start MongoDB instance
const mongod = new mongodb_memory_server_1.MongoMemoryServer();
let adapter;
let e;
const m = casbin_1.newModel();
m.addDef('r', 'r', 'sub, obj, act');
m.addDef('p', 'p', 'sub, obj, act');
m.addDef('g', 'g', '_, _');
m.addDef('e', 'e', 'some(where (p.eft == allow))');
m.addDef('m', 'm', 'g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act');
ava_1.default.before('Setting up Casbin and Adapter', async () => {
    try {
        const uri = await mongod.getConnectionString();
        adapter = await adapter_1.MongoAdapter.newAdapter({
            uri,
            collectionName: 'casbin',
            databaseName: 'casbindb'
        });
        e = await casbin_1.newEnforcer(m, adapter);
    }
    catch (error) {
        throw new Error(error.message);
    }
});
ava_1.default('Missing Mongo URI', async (t) => {
    await t.throwsAsync(async () => adapter_1.MongoAdapter.newAdapter({
        // @ts-ignore
        uri: null,
        collectionName: 'casbin',
        databaseName: 'casbindb'
    }));
});
ava_1.default('Wrong Mongo Connection String', async (t) => {
    await t.throwsAsync(adapter_1.MongoAdapter.newAdapter({
        uri: 'wrong',
        collectionName: 'casbin',
        databaseName: 'casbindb'
    }));
});
ava_1.default('Add policy', t => {
    t.truthy(e.addPolicy('alice', 'data3', 'read'));
});
ava_1.default('Save the policy back to DB', async (t) => {
    t.true(await e.savePolicy());
});
ava_1.default('Load policy', async (t) => {
    t.deepEqual(await e.loadPolicy(), undefined);
});
ava_1.default('Check alice permission', async (t) => {
    t.falsy(await e.enforce('alice', 'data1', 'read'));
});
ava_1.default('Save policy against adapter', async (t) => {
    t.true(await adapter.savePolicy(m));
});
ava_1.default('Add policy against adapter', async (t) => {
    await t.notThrowsAsync(adapter.addPolicy('alice', 'data5', ['read']));
});
ava_1.default('Remove filtered policy against adapter', async (t) => {
    await t.notThrowsAsync(adapter.removeFilteredPolicy('alice', 'data5', 0, 'read'));
});
ava_1.default('Remove policy against adapter', async (t) => {
    await t.notThrowsAsync(adapter.removePolicy('alice', 'data5', ['read']));
});
ava_1.default.after('Close connection', async (t) => {
    t.notThrows(async () => adapter.close());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9hZGFwdGVyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrRUFBa0U7QUFDbEUsOENBQXVCO0FBQ3ZCLG1DQUF5RDtBQUN6RCxpRUFBMEQ7QUFDMUQsdUNBQXlDO0FBRXpDLHlCQUF5QjtBQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLHlDQUFpQixFQUFFLENBQUM7QUFFdkMsSUFBSSxPQUFxQixDQUFDO0FBQzFCLElBQUksQ0FBVyxDQUFDO0FBRWhCLE1BQU0sQ0FBQyxHQUFHLGlCQUFRLEVBQUUsQ0FBQztBQUNyQixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsOEJBQThCLENBQUMsQ0FBQztBQUNuRCxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUscURBQXFELENBQUMsQ0FBQztBQUUxRSxhQUFJLENBQUMsTUFBTSxDQUFDLCtCQUErQixFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3RELElBQUk7UUFDRixNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQy9DLE9BQU8sR0FBRyxNQUFNLHNCQUFZLENBQUMsVUFBVSxDQUFDO1lBQ3RDLEdBQUc7WUFDSCxjQUFjLEVBQUUsUUFBUTtZQUN4QixZQUFZLEVBQUUsVUFBVTtTQUN6QixDQUFDLENBQUM7UUFDSCxDQUFDLEdBQUcsTUFBTSxvQkFBVyxDQUFDLENBQUMs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
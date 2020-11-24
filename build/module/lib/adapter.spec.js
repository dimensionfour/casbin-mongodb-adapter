// tslint:disable:no-expression-statement no-implicit-dependencies
import test from 'ava';
import { newEnforcer, newModel } from 'casbin';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoAdapter } from './adapter';
// Start MongoDB instance
const mongod = new MongoMemoryServer();
let adapter;
let e;
const m = newModel();
m.addDef('r', 'r', 'sub, obj, act');
m.addDef('p', 'p', 'sub, obj, act');
m.addDef('g', 'g', '_, _');
m.addDef('e', 'e', 'some(where (p.eft == allow))');
m.addDef('m', 'm', 'g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act');
test.before('Setting up Casbin and Adapter', async () => {
    try {
        const uri = await mongod.getConnectionString();
        adapter = await MongoAdapter.newAdapter({
            uri,
            collectionName: 'casbin',
            databaseName: 'casbindb'
        });
        e = await newEnforcer(m, adapter);
    }
    catch (error) {
        throw new Error(error.message);
    }
});
test('Missing Mongo URI', async (t) => {
    await t.throwsAsync(async () => MongoAdapter.newAdapter({
        // @ts-ignore
        uri: null,
        collectionName: 'casbin',
        databaseName: 'casbindb'
    }));
});
test('Wrong Mongo Connection String', async (t) => {
    await t.throwsAsync(MongoAdapter.newAdapter({
        uri: 'wrong',
        collectionName: 'casbin',
        databaseName: 'casbindb'
    }));
});
test('Add policy', t => {
    t.truthy(e.addPolicy('alice', 'data3', 'read'));
});
test('Save the policy back to DB', async (t) => {
    t.true(await e.savePolicy());
});
test('Load policy', async (t) => {
    t.deepEqual(await e.loadPolicy(), undefined);
});
test('Check alice permission', async (t) => {
    t.falsy(await e.enforce('alice', 'data1', 'read'));
});
test('Save policy against adapter', async (t) => {
    t.true(await adapter.savePolicy(m));
});
test('Add policy against adapter', async (t) => {
    await t.notThrowsAsync(adapter.addPolicy('alice', 'data5', ['read']));
});
test('Remove filtered policy against adapter', async (t) => {
    await t.notThrowsAsync(adapter.removeFilteredPolicy('alice', 'data5', 0, 'read'));
});
test('Remove policy against adapter', async (t) => {
    await t.notThrowsAsync(adapter.removePolicy('alice', 'data5', ['read']));
});
test.after('Close connection', async (t) => {
    t.notThrows(async () => adapter.close());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9hZGFwdGVyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsa0VBQWtFO0FBQ2xFLE9BQU8sSUFBSSxNQUFNLEtBQUssQ0FBQztBQUN2QixPQUFPLEVBQUUsV0FBVyxFQUFZLFFBQVEsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUN6RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXpDLHlCQUF5QjtBQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7QUFFdkMsSUFBSSxPQUFxQixDQUFDO0FBQzFCLElBQUksQ0FBVyxDQUFDO0FBRWhCLE1BQU0sQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0FBQ25ELENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxxREFBcUQsQ0FBQyxDQUFDO0FBRTFFLElBQUksQ0FBQyxNQUFNLENBQUMsK0JBQStCLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDdEQsSUFBSTtRQUNGLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDL0MsT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQztZQUN0QyxHQUFHO1lBQ0gsY0FBYyxFQUFFLFFBQVE7WUFDeEIsWUFBWSxFQUFFLFVBQVU7U0FDekIsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxHQUFHLE1BQU0sV0FBVyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNuQztJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDaEM7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7SUFDbEMsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQzdCLFlBQVksQ0FBQyxVQUFVLENBQUM7UUFDdEIsYUFBYTtRQUNiLEdBQUcsRUFBRSxJQUFJO1FBQ1QsY0FBYyxFQUFFLFFBQVE7UUFDeEIsWUFBWSxFQUFFLFVBQVU7S0FDekIsQ0FBQyxDQUNILENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQywrQkFBK0IsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7SUFDOUMsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUNqQixZQUFZLENBQUMsVUFBVSxDQUFDO1FBQ3RCLEdBQUcsRUFBRSxPQUFPO1FBQ1osY0FBYyxFQUFFLFFBQVE7UUFDeEIsWUFBWSxFQUFFLFVBQVU7S0FDekIsQ0FBQyxDQUNILENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUU7SUFDckIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7SUFDM0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7SUFDNUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7SUFDdkMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRTtJQUM1QyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLDRCQUE0QixFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRTtJQUMzQyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRTtJQUN2RCxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQ3BCLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FDMUQsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLCtCQUErQixFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRTtJQUM5QyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNFLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7SUFDdkMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQzNDLENBQUMsQ0FBQyxDQUFDIn0=
import sinon from 'sinon';

import { expect } from 'chai';

import { DwnServerInfoCache, ServerInfo } from '../../../src/prototyping/clients/server-info-types.js';
import { DwnServerInfoCacheMemory } from '../../../src/prototyping/clients/dwn-server-info-cache-memory.js';
import { isNode } from '../../utils/runtimes.js';

describe('DwnServerInfoCache', () => {

  describe(`DwnServerInfoCacheMemory`, () => {
    let cache: DwnServerInfoCache;
    let clock: sinon.SinonFakeTimers;

    const exampleInfo:ServerInfo = {
      maxFileSize              : 100,
      webSocketSupport         : true,
      registrationRequirements : []
    };

    after(() => {
      sinon.restore();
    });

    beforeEach(() => {
      clock = sinon.useFakeTimers();
      cache = new DwnServerInfoCacheMemory();
    });

    afterEach(async () => {
      await cache.clear();
      await cache.close();
      clock.restore();
    });

    it('sets server info in cache', async () => {
      const key1 = 'some-key1';
      const key2 = 'some-key2';
      await cache.set(key1, { ...exampleInfo });
      await cache.set(key2, { ...exampleInfo, webSocketSupport: false }); // set to false

      const result1 = await cache.get(key1);
      expect(result1!.webSocketSupport).to.deep.equal(true);
      expect(result1).to.deep.equal(exampleInfo);

      const result2 = await cache.get(key2);
      expect(result2!.webSocketSupport).to.deep.equal(false);
    });

    it('deletes from cache', async () => {
      const key1 = 'some-key1';
      const key2 = 'some-key2';
      await cache.set(key1, { ...exampleInfo });
      await cache.set(key2, { ...exampleInfo, webSocketSupport: false }); // set to false

      const result1 = await cache.get(key1);
      expect(result1!.webSocketSupport).to.deep.equal(true);
      expect(result1).to.deep.equal(exampleInfo);

      const result2 = await cache.get(key2);
      expect(result2!.webSocketSupport).to.deep.equal(false);

      // delete one of the keys
      await cache.delete(key1);

      // check results after delete
      const resultAfterDelete = await cache.get(key1);
      expect(resultAfterDelete).to.equal(undefined);

      // key 2 still exists
      const result2AfterDelete = await cache.get(key2);
      expect(result2AfterDelete!.webSocketSupport).to.equal(false);
    });

    it('clears cache', async () => {
      const key1 = 'some-key1';
      const key2 = 'some-key2';
      await cache.set(key1, { ...exampleInfo });
      await cache.set(key2, { ...exampleInfo, webSocketSupport: false }); // set to false

      const result1 = await cache.get(key1);
      expect(result1!.webSocketSupport).to.deep.equal(true);
      expect(result1).to.deep.equal(exampleInfo);

      const result2 = await cache.get(key2);
      expect(result2!.webSocketSupport).to.deep.equal(false);

      // delete one of the keys
      await cache.clear();

      // check results after delete
      const resultAfterDelete = await cache.get(key1);
      expect(resultAfterDelete).to.equal(undefined);
      const result2AfterDelete = await cache.get(key2);
      expect(result2AfterDelete).to.equal(undefined);
    });

    it('returns undefined after ttl', async function () {
      // skip this test in the browser, sinon fake timers don't seem to work here
      // with a an await setTimeout in the test, it passes.
      if (!isNode) {
        this.skip();
      }

      const key = 'some-key1';
      await cache.set(key, { ...exampleInfo });

      const result = await cache.get(key);
      expect(result!.webSocketSupport).to.deep.equal(true);
      expect(result).to.deep.equal(exampleInfo);

      // wait until 15m default ttl is up
      await clock.tickAsync('15:01');

      const resultAfter = await cache.get(key);
      expect(resultAfter).to.be.undefined;
    });
  });
});
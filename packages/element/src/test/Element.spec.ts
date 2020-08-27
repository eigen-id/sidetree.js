import Element from '../Element';
import { EthereumLedger } from '@sidetree/ethereum';
import { generatedTestVectors } from '@sidetree/test-vectors';
import { resetDatabase, getTestLedger } from './utils';
import config from './element-config.json';

const {
  shortFormDid,
  createOperationBuffer,
  resolveBody,
} = generatedTestVectors;

console.info = () => null;

describe('Element', () => {
  let ledger: EthereumLedger;
  let element: Element;

  beforeAll(async () => {
    await resetDatabase();
    ledger = await getTestLedger();
  });

  afterAll(async () => {
    await element.close();
  });

  it('should create the element class', async () => {
    element = new Element(config, config.versions, ledger);
    expect(element).toBeDefined();
  });

  it('should initialize the element class', async () => {
    await element.initialize(false, false);
  });

  it('should get versions', async () => {
    const versions = await element.handleGetVersionRequest();
    expect(versions.status).toBe('succeeded');
    expect(JSON.parse(versions.body)).toHaveLength(3);
  });

  it('should handle operation request', async () => {
    const operation = await element.handleOperationRequest(
      createOperationBuffer
    );
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(resolveBody);
  });

  it('should resolve a did after Observer has picked up the transaction', async () => {
    await element.triggerBatchAndObserve();
    const operation = await element.handleResolveRequest(shortFormDid);
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(resolveBody);
  });
});

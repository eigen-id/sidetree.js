import {
  IBlockchain,
  IServiceStateStore,
  Logger,
  ServiceStateModel,
} from '@evan.network/sidetree-common';

import EventCode from './EventCode';
import EventEmitter from './EventEmitter';

/**
 * Class used to manage approximate blockchain time
 */
export default class BlockchainClock {
  // used only for testing purposes to stop periodic pulling
  private continuePulling = true;

  /**
   * The interval which to pull and update blockchain time
   */
  private blockchainTimePullIntervalInSeconds = 60;
  private cachedApproximateTime?: number;
  private timeoutsList: NodeJS.Timeout[] = [];

  /**
   *
   * @param blockchain The blockchain client to use
   * @param serviceStateStore The service state store to store time in
   * @param enableRealBlockchainTimePull If enabled, will pull real blockchain time from blockchain, else will only use time from db
   */
  public constructor(
    private blockchain: IBlockchain,
    private serviceStateStore: IServiceStateStore<ServiceStateModel>,
    private enableRealBlockchainTimePull: boolean
  ) {}

  /**
   * Get the time
   */
  public getTime(): number | undefined {
    return this.cachedApproximateTime;
  }

  /**
   * Start periodically pulling blockchain time. Will use real blockchain time if enabled
   */
  public async startPeriodicPullLatestBlockchainTime() {
    try {
      const serviceState = await this.serviceStateStore.get();

      if (this.enableRealBlockchainTimePull) {
        await this.pullRealBlockchainTime(serviceState);
      }

      this.cachedApproximateTime = serviceState.approximateTime;
      Logger.info(
        `Core cachedApproximateTime updated to: ${serviceState.approximateTime}`
      );
    } catch (e) {
      Logger.error(`Error occurred while updating BitcoinClock: ${e}`);
    }

    if (this.continuePulling) {
      this.timeoutsList.push(
        setTimeout(
          async () => this.startPeriodicPullLatestBlockchainTime(),
          this.blockchainTimePullIntervalInSeconds * 1000
        )
      );
    }
  }

  public async stopPeriodicPullLatestBlockchainTime() {
    this.timeoutsList.forEach((timeoutHandler) => {
      clearTimeout(timeoutHandler);
    });
  }

  /**
   * Gets latest blockchain time from bitcoin service, stores it in DB as well as updates the given service state with new time.
   */
  private async pullRealBlockchainTime(serviceState: ServiceStateModel) {
    try {
      const latestBlockchainTime = await this.blockchain.getLatestTime();
      if (serviceState.approximateTime !== latestBlockchainTime.time) {
        serviceState.approximateTime = latestBlockchainTime.time;
        await this.serviceStateStore.put(serviceState);
        EventEmitter.emit(EventCode.SidetreeBlockchainTimeChanged, {
          time: serviceState.approximateTime,
        });
      }
    } catch (e) {
      Logger.error(
        `Error occurred while updating blockchain time, investigate and fix: ${e}`
      );
    }
  }
}

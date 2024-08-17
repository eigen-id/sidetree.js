import * as Factory from 'factory.ts';
import * as UniversalWallet from '@transmute/universal-wallet';
import * as SidetreeWallet from '@evan.network/sidetree-wallet';

export interface DashboardWallet
  extends UniversalWallet.Wallet,
    SidetreeWallet.SidetreePlugin {}

// Ensure that SidetreeWalletPlugin and UniversalWallet.walletFactory are properly typed
const sidetreePlugin: Factory.Sync.Factory<SidetreeWallet.SidetreePlugin> =
  SidetreeWallet.SidetreeWalletPlugin as any;
const universalWalletFactory: Factory.Sync.Factory<UniversalWallet.Wallet> =
  UniversalWallet.walletFactory as any;

export const dashboardWalletFactory: Factory.Sync.Factory<DashboardWallet> =
  Factory.Sync.makeFactory<DashboardWallet>({} as any)
    .combine(sidetreePlugin)
    .combine(universalWalletFactory);

import * as sidetreeCrypto from '@sidetree/crypto';
import { UNIVERSAL_WALLET_CONTEXT_URL, placeHolderImage } from '../constants';

export const toKeyPair = async (
  mnemonic: string,
  index: number,
  type = 'Ed25519'
): Promise<any> => {
  const keypair: any = await sidetreeCrypto.toKeyPair(mnemonic, index, type);
  const jsonWebKeyPair = keypair.toJsonWebKeyPair(true);

  return {
    ...jsonWebKeyPair,
    '@context': [UNIVERSAL_WALLET_CONTEXT_URL],
    id: jsonWebKeyPair.controller + jsonWebKeyPair.id,
    name: 'Sidetree Key',
    image: placeHolderImage,
    description: 'Generated by @sidetree/wallet.',
    // TODO: consider tag structure for linking back to mnemonic
    tags: [],
  };
};

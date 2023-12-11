/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  FetchResultCode,
  ICasService,
  FetchResult,
  ServiceVersionModel,
} from '@evan.network/sidetree-common';
import { IPFSHTTPClient, create } from 'ipfs-http-client';

const { version } = require('../package.json');

export default class CasIpfs implements ICasService {
  private ipfs: IPFSHTTPClient;

  constructor(multiaddr: string) {
    const parts = multiaddr.split('/');

    if (parts[1] === 'ip4') {
      this.ipfs = create({ host: parts[2], port: parseInt(parts[4], 10) });
    } else if (parts[1] === 'dns4') {
      this.ipfs = create({
        host: parts[2],
        port: parseInt(parts[4], 10),
        protocol: parts[5],
      });
    } else {
      this.ipfs = create({url: multiaddr});
    }


  }
  public async initialize(): Promise<void> {
    return;
  }

  public async close(): Promise<void> {
    return;
  }

  public getServiceVersion: () => Promise<ServiceVersionModel> = () => {
    return Promise.resolve({
      name: 'ipfs',
      version,
    });
  };

  public async write(content: Buffer): Promise<string> {
    const source = await this.ipfs.add(content);
    if(!source.path) {
      source.path = source.cid.toString();
    }
    return source.path;
  }

  public async read(address: string): Promise<FetchResult> {
    try {
      const source = this.ipfs.cat(address);
      let chunks: Uint8Array[] = [];
      for await (const chunk of source) {
        chunks.push(chunk);
      }
      const content = Buffer.concat(chunks);
      if (content) {
        return {
          code: FetchResultCode.Success,
          content,
        };
      }
      return {
        code: FetchResultCode.NotFound,
      };
    } catch (e) {
      const err = e as { name: string };
      if (err.name === 'TimeoutError') {
        return {
          code: FetchResultCode.NotFound,
        };
      } else {
        throw e;
      }
    }
  }
}

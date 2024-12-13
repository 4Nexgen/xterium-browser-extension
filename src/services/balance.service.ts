import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { BalanceModel } from '@/models/balance.model';
import { TokenModel } from '@/models/token.model';
import { Storage } from '@plasmohq/storage';
import CryptoJS from 'crypto-js';
import { SubstrateFeeModel } from '@/models/substrate.model';
import { WalletModel } from '@/models/wallet.model';

export class BalanceServices {
  private storage = new Storage({
    area: 'local',
    allCopied: true
  })
  private key = 'network';

  async getBalance(network: string, public_key: string): Promise<BalanceModel[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const balances = await this.getSubstrateBalance(network, public_key);
        resolve(balances);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getSubstrateBalance(network: string, public_key: string): Promise<BalanceModel[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const balances: BalanceModel[] = [];
        const wsProvider = new WsProvider('wss://rpcnodea01.xode.net/n7yoxCmcIrCF6VziCcDmYTwL8R03a/rpc');
        const api = await ApiPromise.create({ provider: wsProvider });
  
        const accountInfo = await api.query.system.account(public_key);
        const { balance, reservedBalance } = (accountInfo.toJSON() as any).data;
  
        const assets = await this.storage.get('assets');
        console.log('Assets from storage:', assets);
  
        if (!assets) {
          console.error('Assets are not available in storage');
          return reject(new Error('No assets found in storage'));
        }
  
        const tokens: TokenModel[] = JSON.parse(assets);
  
        if (Array.isArray(tokens)) {
          for (const token of tokens) {
            if (token.network === network) {
              let freeBalance = '0';
              let reserved_Balance = '0';
              let is_frozen = false;
  
              if (token.type === 'Native') {
                freeBalance = balance.toString();
                reserved_Balance = reservedBalance.toString();
              } else if (token.type === 'Asset') {
                const assetAccount = await api.query.assets.account(token.network_id, public_key);
                const assetMetadata = await api.query.assets.metadata(token.network_id);
  
                const metadata = assetMetadata.toHuman() as { [key: string]: any };
                is_frozen = metadata?.is_frozen || false;
  
                if (assetAccount && !assetAccount.isEmpty) {
                  const humanData = (assetAccount.toHuman() as { [key: string]: any })?.balance;
                  freeBalance = humanData ? humanData.split(',').join('') : '0';
                }
              }
  
              balances.push({
                owner: public_key,
                network: network,
                network_id: token.network_id,
                type: token.type,
                symbol: token.symbol,
                description: token.description,
                balance: freeBalance,
                reserveBalance: reservedBalance,
                is_frozen,
                image_url: token.image_url,
              });
            }
          }
          resolve(balances);
        } else {
          console.error('Tokens data is invalid or empty:', tokens);
          reject(new Error('Invalid tokens format'));
        }
      } catch (error) {
        console.error('Error fetching substrate balance:', error);
        reject(error);
      }
    });
  }

  async getUserPasswordFromStorage(): Promise<string | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const userPasswordData = await this.storage.get<string>('userPassword');
        resolve(userPasswordData || null);
      } catch (error) {
        console.error('Error retrieving User Password:', error);
        reject(error);
      }
    });
  }

  async decryptMnemonicPhrase(encryptedMnemonicPhrase: string): Promise<string | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const userPassword = await this.getUserPasswordFromStorage();
        if (userPassword) {
          const bytes = CryptoJS.AES.decrypt(encryptedMnemonicPhrase, userPassword);
          resolve(bytes.toString(CryptoJS.enc.Utf8));
        } else {
          console.error('User Password not found');
          reject(new Error('User Password not found'));
        }
      } catch (error) {
        console.error('Decryption failed:', error);
        reject(error);
      }
    });
  }

  getEstimateFee(owner: string, value: number, recipient: string, balance: BalanceModel): Promise<SubstrateFeeModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const rpc = await this.storage.get('network');
        const wsProvider = new WsProvider(rpc);
        const api = await ApiPromise.create({ provider: wsProvider });

        const info = await api.tx.balances['transfer'](recipient, value).paymentInfo(owner);

        const substrateFee: SubstrateFeeModel = {
          feeClass: info.class.toString(),
          weight: info.weight.toString(),
          partialFee: info.partialFee.toString(),
        };

        resolve(substrateFee);
      } catch (error) {
        reject(error);
      }
    });
  }

  transfer(owner: string, value: number, recipient: string, balance: BalanceModel): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let wallets: Array<WalletModel> = [];

        const rpc = await this.storage.get('network');
        const wsProvider = new WsProvider(rpc);
        const api = await ApiPromise.create({ provider: wsProvider });

        if (await this.storage.get('wallets')) {
          wallets = JSON.parse(await this.storage.get('wallets'));

          for (const wallet of wallets) {
            if (wallet.public_key === owner && wallet.mnemonic_phrase != null) {
              const decryptedMnemonicPhrase = await this.decryptMnemonicPhrase(wallet.mnemonic_phrase);

              if (!decryptedMnemonicPhrase) {
                return reject("Decryption failed");
              }

              const keyring = new Keyring({ type: 'sr25519' });
              const signature = keyring.addFromUri(decryptedMnemonicPhrase);

              api.tx.balances
                .transferAllowDeath(recipient, value)
                .signAndSend(signature, (result) => {
                  if (result.status.isFinalized) {
                    resolve("Transfer Successful!");
                  }
                });

              return;
            }
          }
        }
        reject("No valid wallet found");
      } catch (error) {
        reject(error);
      }
    });
  }

  transferAssets(owner: string, assetId: number, value: number, recipient: string, balance: BalanceModel): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let wallets: Array<WalletModel> = [];

        const rpc = await this.storage.get('network');
        const wsProvider = new WsProvider(rpc);
        const api = await ApiPromise.create({ provider: wsProvider });

        if (await this.storage.get('wallets')) {
          wallets = JSON.parse(await this.storage.get('wallets'));

          for (const wallet of wallets) {
            if (wallet.public_key === owner && wallet.mnemonic_phrase != null) {
              const decryptedMnemonicPhrase = await this.decryptMnemonicPhrase(wallet.mnemonic_phrase);

              if (!decryptedMnemonicPhrase) {
                return reject("Decryption failed");
              }

              const keyring = new Keyring({ type: 'sr25519' });
              const signature = keyring.addFromUri(decryptedMnemonicPhrase);

              api.tx.assets
                .transfer(assetId, recipient, value)
                .signAndSend(signature, (transferResult) => {
                  if (transferResult.status.isFinalized) {
                    resolve("Transfer Successful!");
                  }
                });

              return;
            }
          }
        }
        reject("No valid wallet found");
      } catch (error) {
        reject(error);
      }
    });
  }
}

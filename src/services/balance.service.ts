import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { BalanceModel, SubstrateFeeModel } from '@/models/balance.model';
import { NetworkService } from './network.service';
import { TokenService } from './token.service';
import { WalletService } from './wallet.service';
import { EncryptionService } from './encryption.service';
import type { TokenModel } from '@/models/token.model';

export class BalanceServices {
  private networkService = new NetworkService()
  private walletService = new WalletService()
  private tokenService = new TokenService()
  private encryptionService = new EncryptionService()

  private api: ApiPromise = null

  async connect(): Promise<ApiPromise | any> {
    return new Promise(async (resolve, reject) => {
      this.networkService.getNetwork().then(async data => {
        let wsUrl = data.rpc

        if (!this.api) {
          const wsProvider = new WsProvider(wsUrl)
          const api = await ApiPromise.create({ provider: wsProvider })

          this.api = api
        }

        resolve(this.api)
      }).catch(error => {
        reject(error)
      })
    })
  }

  async getBalancePerToken(public_key: string, token: TokenModel): Promise<BalanceModel> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect()

        let balance: BalanceModel = new BalanceModel();

        let freeBalance = 0;
        let reservedBalance = 0;
        let is_frozen = false;

        if (token.type === "Native") {
          const accountInfo = await this.api.query.system.account(public_key);
          const { free, reserved } = (accountInfo.toJSON() as any).data;

          freeBalance = free;
          reservedBalance = reserved;
        }

        if (token.type === "Asset") {
          const assetAccount = await this.api.query.assets.account(token.network_id, public_key);
          const assetMetadata = await this.api.query.assets.metadata(token.network_id);

          const metadata = assetMetadata?.toHuman() as { [key: string]: any };
          is_frozen = metadata?.is_frozen || false;

          if (assetAccount && !assetAccount.isEmpty) {
            const humanData = (assetAccount.toHuman() as { [key: string]: any })?.balance;
            freeBalance = humanData ? parseInt(humanData.split(',').join('')) : 0;
          }
        }

        balance = {
          owner: public_key,
          token,
          freeBalance: freeBalance,
          reservedBalance: reservedBalance,
          is_frozen,
        };

        resolve(balance)
      } catch (error) {
        reject(error);
      }
    });
  }

  async getEstimateFee(owner: string, value: number, recipient: string, balance: BalanceModel): Promise<SubstrateFeeModel> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect()

        const info = await this.api.tx.balances['transfer'](recipient, value).paymentInfo(owner);

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

  async transfer(owner: string, value: number, recipient: string, password: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect()

        this.walletService.getWallets().then(async (data) => {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              let wallet = data[i]

              if (owner == wallet.public_key) {
                const decryptedMnemonicPhrase = this.encryptionService.decrypt(password, wallet.mnemonic_phrase);

                const keyring = new Keyring({ type: 'sr25519' });
                const signature = keyring.addFromUri(decryptedMnemonicPhrase);

                await this.api.tx.balances
                  .transferAllowDeath(recipient, value)
                  .signAndSend(signature, (result) => {
                    if (result.status.isFinalized) {
                      resolve(true);
                    }
                  })

                break;
              }
            }
          }
        })

        reject("No valid wallet found");
      } catch (error) {
        reject(error);
      }
    });
  }

  async transferAssets(owner: string, assetId: number, value: number, recipient: string, password: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect()

        this.walletService.getWallets().then(async (data) => {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              let wallet = data[i]

              if (owner == wallet.public_key) {
                const decryptedMnemonicPhrase = this.encryptionService.decrypt(password, wallet.mnemonic_phrase);

                const keyring = new Keyring({ type: 'sr25519' });
                const signature = keyring.addFromUri(decryptedMnemonicPhrase);

                await this.api.tx.assets
                  .transfer(assetId, recipient, value)
                  .signAndSend(signature, (transferResult) => {
                    if (transferResult.status.isFinalized) {
                      resolve("Transfer Successful!");
                    }
                  });

                break;
              }
            }
          }
        })

        reject("No valid wallet found");
      } catch (error) {
        reject(error);
      }
    });
  }
}

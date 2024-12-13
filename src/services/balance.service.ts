import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { BalanceModel, SubstrateFeeModel } from '@/models/balance.model';
import { NetworkService } from './network.service';
import { TokenService } from './token.service';
import { WalletService } from './wallet.service';
import { EncryptionService } from './encryption.service';

export class BalanceServices {
  private networkService = new NetworkService()
  private walletService = new WalletService()
  private tokenService = new TokenService()
  private encryptionService = new EncryptionService()

  private api: ApiPromise | null = null

  async connect(): Promise<ApiPromise | any> {
    return new Promise(async (resolve, reject) => {
      try {
        this.networkService.getNetwork().then(async data => {
          let wsUrl = data.rpc

          if (!this.api) {
            const wsProvider = new WsProvider(wsUrl)
            const api = await ApiPromise.create({ provider: wsProvider })

            this.api = api

            resolve(this.api)
          }
        }).catch(error => {
          reject(error)
        })
      } catch (error) {
        reject("Failed to connect to RPC")
      }
    })
  }

  async getBalances(publicKey: string): Promise<BalanceModel[]> {
    return new Promise(async (resolve, reject) => {
      try {
        let balances: BalanceModel[] = [];

        let api = this.api
        if (this.api == null) {
          api = await this.connect()
        }

        const tokens = await this.tokenService.getTokens();

        for (const token of tokens) {
          let freeBalance = 0;
          let reservedBalance = 0;
          let is_frozen = false;

          if (token.type === "Native") {
            const accountInfo = await api.query.system.account(publicKey);
            const { free, reserved } = (accountInfo.toJSON() as any).data;

            freeBalance = free;
            reservedBalance = reserved;
          }

          if (token.type === "Asset") {
            const assetAccount = await api.query.assets.account(token.network_id, publicKey);
            const assetMetadata = await api.query.assets.metadata(token.network_id);

            const metadata = assetMetadata?.toHuman() as { [key: string]: any };
            is_frozen = metadata?.is_frozen || false;

            if (assetAccount && !assetAccount.isEmpty) {
              const humanData = (assetAccount.toHuman() as { [key: string]: any })?.balance;
              freeBalance = humanData ? parseInt(humanData.split(',').join('')) : 0;
            }
          }

          balances.push({
            owner: publicKey,
            token,
            freeBalance: freeBalance,
            reservedBalance: reservedBalance,
            is_frozen,
          });
        }

        resolve(balances)
      } catch (error) {
        reject(error);
      }
    });
  }

  async getEstimateFee(owner: string, value: number, recipient: string, balance: BalanceModel): Promise<SubstrateFeeModel> {
    return new Promise(async (resolve, reject) => {
      try {
        let api = this.api
        if (this.api == null) {
          api = await this.connect()
        }

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

  async transfer(owner: string, value: number, recipient: string, password: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let api = this.api
        if (this.api == null) {
          api = await this.connect()
        }

        this.walletService.getWallets().then(async (data) => {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              let wallet = data[i]

              if (owner == wallet.public_key) {
                const decryptedMnemonicPhrase = this.encryptionService.decrypt(password, wallet.mnemonic_phrase);

                const keyring = new Keyring({ type: 'sr25519' });
                const signature = keyring.addFromUri(decryptedMnemonicPhrase);

                await api.tx.balances
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
        let api = this.api
        if (this.api == null) {
          api = await this.connect()
        }

        this.walletService.getWallets().then(async (data) => {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              let wallet = data[i]

              if (owner == wallet.public_key) {
                const decryptedMnemonicPhrase = this.encryptionService.decrypt(password, wallet.mnemonic_phrase);

                const keyring = new Keyring({ type: 'sr25519' });
                const signature = keyring.addFromUri(decryptedMnemonicPhrase);

                await api.tx.assets
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

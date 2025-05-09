export abstract class ChainAssetFiles {
  private static readonly networkMap: Record<
    string,
    () => Promise<{ TokenAssetFiles: new () => ChainAssetFiles }>
  > = {
    "Xode - Kusama": () => import("./xode-kusama/token-asset-files.data"),
    "Xode - Polkadot": () => import("./xode-polkadot/token-asset-files.data"),
    "Asset Hub - Polkadot": () => import("./polkadot-asset-hub/token-asset-files.data"),
    "Asset Hub - Kusama": () => import("./kusama-asset-hub/token-asset-files.data"),
    "Asset Hub - Paseo": () => import("./paseo-asset-hub/token-asset-files.data")
  }

  static async load(network: string): Promise<ChainAssetFiles> {
    const importer = this.networkMap[network]
    if (!importer) {
      throw new Error(`Unsupported network: ${network}`)
    }

    const { TokenAssetFiles } = await importer()
    return new TokenAssetFiles()
  }

  abstract getTokenLogo(symbol: string): string
  abstract getTokenCover(symbol: string): string
}

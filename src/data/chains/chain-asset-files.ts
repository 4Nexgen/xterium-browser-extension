export abstract class ChainAssetFiles {
  private static readonly networkMap: Record<
    string,
    () => Promise<{ TokenAssetFiles: new () => ChainAssetFiles }>
  > = {
    "Xode - Kusama": () => import("./xode/token-asset-files.data"),
    "Xode - Polkadot": () => import("./xode/token-asset-files.data"),
    "Polkadot - Asset Hub": () => import("./polkadot-asset-hub/token-asset-files.data"),
    "Kusama - Asset Hub": () => import("./kusama-asset-hub/token-asset-files.data"),
    "Paseo - Asset Hub": () => import("./paseo-asset-hub/token-asset-files.data")
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

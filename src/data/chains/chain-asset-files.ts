export abstract class ChainAssetFiles {
    static async load(network: string): Promise<ChainAssetFiles> {
        if (network === "Xode") {
            const { TokenAssetFiles } = await import("./xode/token-asset-files.data");
            return new TokenAssetFiles();
        }
        throw new Error(`Unsupported network: ${network}`);
    }

    abstract getTokenLogo(symbol: string): string;
    abstract getTokenCover(symbol: string): string;
}

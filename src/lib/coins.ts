/**
 * Supported cryptocurrency coins configuration.
 * Safe for client-side use (no server dependencies).
 */
export function getSupportedCoins(): Array<{ coin: string; ticker: string; label: string }> {
  return [
    { coin: "btc",        ticker: "BTC",        label: "Bitcoin" },
    { coin: "eth",        ticker: "ETH",        label: "Ethereum" },
    { coin: "ltc",        ticker: "LTC",        label: "Litecoin" },
    { coin: "usdt/erc20", ticker: "USDT-ERC20", label: "USDT (ERC-20)" },
    { coin: "usdt/trc20", ticker: "USDT-TRC20", label: "USDT (TRC-20)" },
    { coin: "usdt/bep20", ticker: "USDT-BEP20", label: "USDT (BEP-20)" },
  ];
}

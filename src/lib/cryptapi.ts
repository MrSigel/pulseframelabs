const CRYPTAPI_BASE = "https://api.cryptapi.io";

export interface CryptAPIAddressResponse {
  status: string;
  address_in: string;
  address_out: string;
  callback_url: string;
  minimum_transaction_coin: string;
  priority: string;
}

export interface CryptAPIQRCodeResponse {
  status: string;
  qr_code: string;
  payment_uri: string;
}

/**
 * Create a new payment address with CryptAPI.
 */
export async function createPaymentAddress(
  coin: string,
  addressOut: string,
  callbackUrl: string,
  params: Record<string, string> = {}
): Promise<CryptAPIAddressResponse> {
  const url = new URL(`${CRYPTAPI_BASE}/${coin}/create/`);
  url.searchParams.set("callback", callbackUrl);
  url.searchParams.set("address", addressOut);
  url.searchParams.set("pending", "1");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`CryptAPI error: ${res.status}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(`CryptAPI: ${data.error || "Unknown error"}`);
  return data;
}

/**
 * Get a QR code for a payment address.
 */
export async function getQRCode(
  coin: string,
  address: string,
  amount?: string
): Promise<CryptAPIQRCodeResponse> {
  const url = new URL(`${CRYPTAPI_BASE}/${coin}/qrcode/`);
  url.searchParams.set("address", address);
  if (amount) url.searchParams.set("value", amount);
  url.searchParams.set("size", "300");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`CryptAPI QR error: ${res.status}`);
  return await res.json();
}

/**
 * Convert EUR amount to crypto via CryptAPI convert endpoint.
 */
export async function convertToCrypto(
  coin: string,
  amountEur: number
): Promise<string> {
  const url = new URL(`${CRYPTAPI_BASE}/${coin}/convert/`);
  url.searchParams.set("value", amountEur.toString());
  url.searchParams.set("from", "eur");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`CryptAPI convert error: ${res.status}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(`CryptAPI convert: ${data.error || "Unknown error"}`);
  return data.value_coin;
}

/**
 * Supported coins config.
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

/**
 * Get our receiving address for a specific coin.
 * Environment variable naming: CRYPTAPI_ADDRESS_BTC, CRYPTAPI_ADDRESS_ETH, etc.
 */
export function getReceivingAddress(coin: string): string {
  const envKey = `CRYPTAPI_ADDRESS_${coin.replace("/", "_").toUpperCase()}`;
  const address = process.env[envKey];
  if (!address) throw new Error(`Missing env var ${envKey} for coin ${coin}`);
  return address;
}

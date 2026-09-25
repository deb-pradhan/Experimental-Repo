// Pull official token/network SVGs out of @web3icons/core (MIT) into assets/tokens/.
import fs from 'node:fs';
const B = '../video/node_modules/@web3icons/core/dist/svgs/';
const jobs = [
  ['btc-w3i-background.svg', 'tokens/background/BTC.svg.js'],
  ['btc-w3i-branded.svg', 'tokens/branded/BTC.svg.js'],
  ['eth-w3i-background.svg', 'tokens/background/ETH.svg.js'],
  ['sol-w3i-background.svg', 'tokens/background/SOL.svg.js'],
  ['usdc-w3i-background.svg', 'tokens/background/USDC.svg.js'],
  ['hyperliquid-hyperevm-branded.svg', 'networks/branded/hyper-evm.svg.js'],
  ['hyperliquid-hyperevm-background.svg', 'networks/background/hyper-evm.svg.js'],
  ['hyperliquid-hyperevm-mono.svg', 'networks/mono/hyper-evm.svg.js'],
  ['arbitrum-branded.svg', 'networks/branded/arbitrum-one.svg.js'],
];
for (const [out, p] of jobs) {
  const m = await import(new URL(B + p, import.meta.url));
  fs.writeFileSync(new URL('../assets/tokens/' + out, import.meta.url), m.default);
  console.log('ok', out);
}

import React from 'react';
import {Img, staticFile} from 'remotion';

// Official token/network marks, taken verbatim from icon libraries (never redrawn):
//  btc/eth/sol/usdc — cryptocurrency-icons (CC0), hyperliquid — @web3icons/core (MIT, HyperEVM network mark).
export type TokenId = 'btc' | 'eth' | 'sol' | 'usdc' | 'hyperliquid' | 'hyperliquid-mono';

export const Token: React.FC<{id: TokenId; size: number; style?: React.CSSProperties}> = ({id, size, style}) => (
  <Img src={staticFile(`tokens/${id}.svg`)} style={{width: size, height: size, display: 'block', ...style}} />
);

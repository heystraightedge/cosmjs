import { types } from "@cosmwasm/sdk";
import { Amount, Fee, FullSignature, PubkeyBundle, SignedTransaction, UnsignedTransaction } from "@iov/bcp";
import { Decimal } from "@iov/encoding";
import { BankTokens } from "./types";
export declare function encodePubkey(pubkey: PubkeyBundle): types.PubKey;
export declare function decimalToCoin(lookup: BankTokens, value: Decimal, ticker: string): types.Coin;
export declare function encodeAmount(amount: Amount, tokens: BankTokens): types.Coin;
export declare function encodeFee(fee: Fee, tokens: BankTokens): types.StdFee;
export declare function encodeFullSignature(fullSignature: FullSignature): types.StdSignature;
export declare function buildUnsignedTx(tx: UnsignedTransaction, tokens: BankTokens): types.AminoTx;
export declare function buildSignedTx(tx: SignedTransaction, tokens: BankTokens): types.AminoTx;
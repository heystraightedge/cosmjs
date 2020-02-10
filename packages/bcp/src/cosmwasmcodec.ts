/* eslint-disable @typescript-eslint/camelcase */
import {
  CosmosAddressBech32Prefix,
  isValidAddress,
  makeSignBytes,
  marshalTx,
  types,
  unmarshalTx,
} from "@cosmwasm/sdk";
import {
  Address,
  ChainId,
  Identity,
  Nonce,
  PostableBytes,
  PrehashType,
  SignableBytes,
  SignedTransaction,
  SigningJob,
  TransactionId,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";

import { pubkeyToAddress } from "./address";
import { Caip5 } from "./caip5";
import { parseTx } from "./decode";
import { buildSignedTx, buildUnsignedTx } from "./encode";
import { BankTokens, nonceToAccountNumber, nonceToSequence } from "./types";

export class CosmWasmCodec implements TxCodec {
  private readonly addressPrefix: CosmosAddressBech32Prefix;
  private readonly tokens: BankTokens;

  public constructor(addressPrefix: CosmosAddressBech32Prefix, tokens: BankTokens) {
    this.addressPrefix = addressPrefix;
    this.tokens = tokens;
  }

  public bytesToSign(unsigned: UnsignedTransaction, nonce: Nonce): SigningJob {
    const built = buildUnsignedTx(unsigned, this.tokens);

    const nonceInfo: types.NonceInfo = {
      account_number: nonceToAccountNumber(nonce),
      sequence: nonceToSequence(nonce),
    };
    const signBytes = makeSignBytes(
      built.value.msg,
      built.value.fee,
      Caip5.decode(unsigned.chainId),
      built.value.memo || "",
      nonceInfo,
    );

    return {
      bytes: signBytes as SignableBytes,
      prehashType: PrehashType.Sha256,
    };
  }

  // PostableBytes are JSON-encoded StdTx
  public bytesToPost(signed: SignedTransaction): PostableBytes {
    // TODO: change this as well (return StdTx, not AminoTx)?
    const built = buildSignedTx(signed, this.tokens);
    return marshalTx(built.value) as PostableBytes;
  }

  // TODO: this needs some marshalling going on...
  // Do we need to support this??
  public identifier(_signed: SignedTransaction): TransactionId {
    throw new Error("Not yet implemented, requires amino encoding- talk to Ethan");
    // const bytes = this.bytesToPost(signed);
    // const hash = new Sha256(bytes).digest();
    // return toHex(hash).toUpperCase() as TransactionId;
  }

  public parseBytes(bytes: PostableBytes, chainId: ChainId, nonce?: Nonce): SignedTransaction {
    if (nonce === undefined) {
      throw new Error("Nonce is required");
    }
    const parsed = unmarshalTx(bytes);
    return parseTx(parsed, chainId, nonce, this.tokens);
  }

  public identityToAddress(identity: Identity): Address {
    return pubkeyToAddress(identity.pubkey, this.addressPrefix);
  }

  public isValidAddress(address: string): boolean {
    return isValidAddress(address);
  }
}

const defaultPrefix = "cosmos" as CosmosAddressBech32Prefix;

const defaultTokens: BankTokens = [
  {
    fractionalDigits: 6,
    ticker: "ATOM",
    denom: "uatom",
  },
];

/** Unconfigured codec is useful for testing only */
export const cosmWasmCodec = new CosmWasmCodec(defaultPrefix, defaultTokens);
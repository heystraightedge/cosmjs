/* eslint-disable @typescript-eslint/naming-convention */
import { toUtf8 } from "@cosmjs/encoding";
import { Uint53 } from "@cosmjs/math";

import { Msg } from "./msgs";
import { StdFee } from "./types";

function sortJson(json: any): any {
  if (typeof json !== "object" || json === null) {
    return json;
  }
  if (Array.isArray(json)) {
    return json.map(sortJson);
  }
  const sortedKeys = Object.keys(json).sort();
  const result = sortedKeys.reduce(
    (accumulator, key) => ({
      ...accumulator,
      [key]: sortJson(json[key]),
    }),
    {},
  );
  return result;
}

/**
 * The document to be signed
 *
 * @see https://docs.cosmos.network/master/modules/auth/03_types.html#stdsigndoc
 */
export interface StdSignDoc {
  readonly chain_id: string;
  readonly account_number: string;
  readonly sequence: string;
  readonly fee: StdFee;
  readonly msgs: readonly Msg[];
  readonly memo: string;
}

export function makeSignDoc(
  msgs: readonly Msg[],
  fee: StdFee,
  chainId: string,
  memo: string,
  accountNumber: number | string,
  sequence: number | string,
): StdSignDoc {
  return {
    chain_id: chainId,
    account_number: Uint53.fromString(accountNumber.toString()).toString(),
    sequence: Uint53.fromString(sequence.toString()).toString(),
    fee: fee,
    msgs: msgs,
    memo: memo,
  };
}

export function serializeSignDoc(signDoc: StdSignDoc): Uint8Array {
  const sortedSignDoc = sortJson(signDoc);
  return toUtf8(JSON.stringify(sortedSignDoc));
}

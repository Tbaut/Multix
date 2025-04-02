import { TxStatus } from '../model'

export const getMultisigTxId = (
  pubKey: string,
  blockNumber: number,
  extrinsicIndex: number,
  chainId: string,
  status: TxStatus
) => {
  return `${chainId}-${pubKey}-${blockNumber}-${extrinsicIndex}-${status}`
}

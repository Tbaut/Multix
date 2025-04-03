import { Ctx, fields } from '../main'
import { Event } from '@subsquid/substrate-processor'
import { MultisigTx, TxStatus } from '../model'
import { getMultisigTxId } from './getMultisigTxId'
import { multisigCancelled, multisigExecuted } from '../types/multisig/events'

interface Params {
  event: Event<typeof fields>
  chainId: string
  ctx: Ctx
  blockNumber: number
}

export type MultisigTxInfo = Omit<MultisigTx, 'multisig'> & { multisigPubKey: string }

export const getMultisigTxfoFromArgs = async ({ event, chainId, ctx, blockNumber }: Params) => {
  let isSuccess = false
  let multisigPubKey = ''
  let originExtrinsicIndex = 0
  let originBlockNumber = 0

  if (
    multisigExecuted.v2005.is(event) ||
    multisigExecuted.v9111.is(event) ||
    multisigCancelled.v2005.is(event)
  ) {
    const [, { index, height }, pubkey, , result] = event.args as ReturnType<
      typeof multisigExecuted.v2005.decode
    >
    multisigPubKey = pubkey
    originBlockNumber = height
    originExtrinsicIndex = index
    isSuccess = result?.__kind === 'Ok'
  } else {
    const {
      multisig,
      timepoint: { index, height },
      result
    } = event.args as ReturnType<typeof multisigExecuted.v9130.decode>
    ctx.log.info(result)
    multisigPubKey = multisig
    originBlockNumber = height
    originExtrinsicIndex = index
    isSuccess = result?.__kind === 'Ok'
  }
  const isCancelled = event.name === 'Multisig.MultisigCancelled'
  const status = isSuccess ? TxStatus.Success : isCancelled ? TxStatus.Cancelled : TxStatus.Error

  return {
    id: getMultisigTxId(multisigPubKey, originBlockNumber, originExtrinsicIndex, chainId, status),
    blockNumber,
    originExtrinsicIndex,
    status,
    multisigPubKey,
    originBlockNumber,
    callData: undefined
  } as MultisigTxInfo
}

import { Ctx, fields } from '../main'
import { JsonLog } from './JsonLog'
import { Event } from '@subsquid/substrate-processor'
import { TxStatus, MultisigTx } from '../model'
import { getOrCreateAccounts } from './getOrCreateAccounts'
import { getMultisigTxId } from './getMultisigTxId'

interface Params {
  event: Event<typeof fields>
  chainId: string
  ctx: Ctx
  isCancelled: boolean
  blockNumber: number
}
export const getMultisigTxfoFromArgs = async ({
  event,
  chainId,
  ctx,
  isCancelled,
  blockNumber
}: Params) => {
  const isSuccess = event.args.result.__kind === 'Ok'
  const status = isSuccess ? TxStatus.Success : isCancelled ? TxStatus.Cancelled : TxStatus.Error
  const multisig = await getOrCreateAccounts(ctx, [event.args.multisig], chainId)

  if (!multisig || !multisig.length) {
    ctx.log.error(`The multisig could not be determined ${JsonLog(event)}`)
    return
  }

  return {
    id: getMultisigTxId(
      event.args.multisig,
      event.args.timepoint.height,
      event.args.timepoint.index,
      chainId,
      status
    ),
    blockNumber,
    originExtrinsicIndex: event.args.timepoint.index,
    status,
    multisig: multisig[0],
    originBlockNumber: event.args.timepoint.height,
    callData: undefined
  } as MultisigTx
}

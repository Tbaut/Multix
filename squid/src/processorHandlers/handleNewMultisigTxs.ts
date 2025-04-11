import { In } from 'typeorm'
import { Account, MultisigTx } from '../model'
import { Ctx } from '../main'
import { MultisigTxInfo } from '../util/getMultisigTxInfoFromArgs'
import { getAccountId } from '../util/getAccountId'

export const handleNewMultisigTxs = async (
  ctx: Ctx,
  newMultisigTxsInfo: MultisigTxInfo[],
  chainId: string
) => {
  const multisigIds = newMultisigTxsInfo.map((multi) => getAccountId(multi.multisigPubKey, chainId))
  const multisigTxs: Map<string, MultisigTx> = new Map()

  const multisigAccountsMap = await ctx.store
    .findBy(Account, { id: In([...multisigIds]) })
    .then((accounts) => new Map(accounts.map((account) => [account.pubKey, account])))

  for (const {
    id,
    multisigPubKey,
    blockNumber,
    callData,
    originBlockNumber,
    originExtrinsicIndex,
    status,
    extrinsicIndex
  } of newMultisigTxsInfo) {
    multisigTxs.set(
      id,
      new MultisigTx({
        id,
        multisig: multisigAccountsMap.get(multisigPubKey),
        blockNumber,
        extrinsicIndex,
        originBlockNumber,
        originExtrinsicIndex,
        callData,
        status
      })
    )
  }

  await ctx.store.save(Array.from(multisigTxs.values()))
}

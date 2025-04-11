import { CallDataInfoFromChain } from '../contexts/PendingTxContext'

export const sortByLatest = (a: CallDataInfoFromChain, b: CallDataInfoFromChain) => {
  if (!a.timestamp || !b.timestamp) return 0

  return b.timestamp.valueOf() - a.timestamp.valueOf()
}

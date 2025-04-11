import { useMultisigTxsByIdQuery } from '../../types-and-hooks'
import { useMemo } from 'react'
import { useNetwork } from '../contexts/NetworkContext'

const DEFAULT_REFETCH_INTERVAL = 5000

interface Args {
  multisigIds: string[]
}

export const useQueryTxHistory = ({ multisigIds }: Args) => {
  const { selectedNetwork } = useNetwork()
  const hasSomethingToQuery = useMemo(() => multisigIds.length > 0, [multisigIds])
  const { error, data, isLoading, refetch } = useMultisigTxsByIdQuery(
    { multisigIds },
    {
      enabled: hasSomethingToQuery,
      queryKey: [`KeyTxHistory-${multisigIds}-${selectedNetwork}`],
      refetchInterval: DEFAULT_REFETCH_INTERVAL
    }
  )

  return {
    data,
    isLoading: isLoading && hasSomethingToQuery,
    error,
    refetch
  }
}

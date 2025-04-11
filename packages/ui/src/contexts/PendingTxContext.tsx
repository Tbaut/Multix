import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { useMultiProxy } from './MultiProxyContext'
import { ApiDescriptors, MultisigStorageInfo, PplDescriptorKeys } from '../types'
import { isEmptyArray } from '../utils/arrayUtils'
import { isProxyCall } from '../utils/isProxyCall'
import { ChainInfoHuman, IApiContext, useApi } from './ApiContext'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { PolkadotClient, Transaction } from 'polkadot-api'
import { HexString } from '@polkadot-api/substrate-bindings'
import { useHasIdentityFeature } from '../hooks/useHasIdentityFeature'
import { IPplApiContext, usePplApi } from './PeopleChainApiContext'
import { getCallDataFromChainPromise } from '../utils/getCallDataFromChain'
import { sortByLatest } from '../utils/sortByLatest'

dayjs.extend(localizedFormat)

type PendingTxContextProps = {
  children: ReactNode | ReactNode[]
}

export interface IPendingTxContext {
  isLoading: boolean
  pendingTxs: AggGroupedByDate
  pendingPplTxs: AggGroupedByDate
  refresh: () => Promise<void>
  refreshPpl: () => Promise<void>
}

const PendingTxContext = createContext<IPendingTxContext | undefined>(undefined)

export interface PendingTx {
  from: string
  hash: string
  info: MultisigStorageInfo
}

export interface CallDataInfoFromChain {
  callData?: HexString
  decodedCall?: Transaction<any, any, any, any>['decodedCall']
  hash?: string
  name?: string
  info?: PendingTx['info']
  from: string
  timestamp?: Date
  multiProxyAddress?: string
}

export type AggGroupedByDate = { [index: string]: CallDataInfoFromChain[] }

interface getTxsByDateArgs {
  api: IApiContext<ApiDescriptors>['api'] | IPplApiContext<PplDescriptorKeys>['pplApi']
  client: PolkadotClient
  multisigAddresses: string[]
  chainInfo: ChainInfoHuman
  currentProxy?: string
}
const getTxsByDate = async ({
  api,
  client,
  multisigAddresses,
  chainInfo,
  currentProxy
}: getTxsByDateArgs) => {
  const timestampObj: AggGroupedByDate = {}

  if (!api?.query?.Multisig?.Multisigs) {
    console.error('usePendingTx: api?.query?.Multisig?.Multisigs is undefined')
    return timestampObj
  }

  const pendingMultisigTxs: PendingTx[] = []

  const callsPromises = multisigAddresses.map((address) =>
    api.query.Multisig.Multisigs.getEntries(address, { at: 'best' })
  )

  await Promise.all(callsPromises)
    .then((res1) => {
      res1.forEach((res, index) => {
        res.forEach(({ keyArgs, value }) => {
          // this is supposed to be the multisig address that we asked the storage for
          const multisigFromChain = keyArgs[0]
          const hash = keyArgs[1].asHex()
          const info = value as MultisigStorageInfo
          if (chainInfo?.isEthereum) {
            info.approvals = info.approvals.map((approval) => approval.toLowerCase())
          }

          // Fix for ghost proposals for https://github.com/polkadot-js/apps/issues/9103
          // These 2 should be the same
          if (multisigFromChain.toLowerCase() !== multisigAddresses[index].toLowerCase()) {
            console.error(
              'The multisig we requested the calls for and the one found in the block do not correspond. Requested:',
              multisigAddresses[index],
              'received: ',
              multisigFromChain
            )
            return
          }

          pendingMultisigTxs.push({
            hash,
            info,
            from: multisigAddresses[index]
          })
        })
      })
    })
    .catch(console.error)

  if (pendingMultisigTxs.length === 0) {
    return timestampObj
  }

  const callDataInfoFromChainPromises = getCallDataFromChainPromise(pendingMultisigTxs, api, client)

  await Promise.all(callDataInfoFromChainPromises)
    .then((res) => {
      const definedTxs = res.filter(Boolean) as CallDataInfoFromChain[]

      // remove the proxy transaction that aren't for the selected proxy
      const relevantTxs = definedTxs.filter((agg) => {
        if (
          !isProxyCall(agg.name) ||
          !agg?.decodedCall ||
          !agg.decodedCall.value.value.real.value
        ) {
          return true
        }

        const isForCurrentProxy = agg.decodedCall.value.value.real.value === currentProxy

        if (!isForCurrentProxy) {
          console.warn('call filtered, current proxy:', currentProxy, 'call:', agg)
        }

        return isForCurrentProxy
      })

      // sort by date, the newest first
      const sorted = relevantTxs.sort(sortByLatest)

      // populate the object and sort by date
      sorted.forEach((data) => {
        const date = dayjs(data.timestamp).format('LL')
        const previousData = timestampObj[date] || []
        timestampObj[date] = [...previousData, data]
      })
    })
    .catch(console.error)

  return timestampObj
}

const PendingTxsContextProvider = ({ children }: PendingTxContextProps) => {
  const { hasPplChain } = useHasIdentityFeature()
  const { selectedMultiProxy } = useMultiProxy()
  const multisigAddresses = useMemo(
    () => selectedMultiProxy?.multisigs.map(({ address }) => address) || [],
    [selectedMultiProxy?.multisigs]
  )

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPpl, setIsLoadingPpl] = useState(true)

  const { api, chainInfo, client } = useApi()
  const { pplApi, pplClient, pplChainInfo } = usePplApi()

  const [txByDate, setTxByDate] = useState<AggGroupedByDate>({})
  const [pplTxByDate, setPplTxByDate] = useState<AggGroupedByDate>({})

  const refresh = useCallback(
    async (forPplChain?: boolean) => {
      !forPplChain && setTxByDate({})
      forPplChain && setPplTxByDate({})

      const apiToUse = forPplChain ? pplApi : api
      const clientToUse = forPplChain ? pplClient : client
      const chainInfoToUse = forPplChain ? pplChainInfo : chainInfo

      if (!apiToUse || !clientToUse || !chainInfoToUse) {
        // !apiToUse && console.error('usePendingTx: no api found')
        // !clientToUse && console.error('usePendingTx: no client found')
        // !chainInfoToUse && console.error('usePendingTx: no chainInfo found')
        return
      }

      if (isEmptyArray(multisigAddresses)) {
        // console.error('usePendingTx: empty multisigAddresses found')
        return
      }

      !forPplChain && setIsLoading(true)
      forPplChain && setIsLoadingPpl(true)
      const newTxs = await getTxsByDate({
        api: apiToUse,
        client: clientToUse,
        multisigAddresses,
        chainInfo: chainInfoToUse,
        currentProxy: selectedMultiProxy?.proxy
      })
      !forPplChain && setIsLoading(false)
      forPplChain && setIsLoadingPpl(false)
      forPplChain ? setPplTxByDate(newTxs) : setTxByDate(newTxs)
    },
    [
      api,
      chainInfo,
      client,
      multisigAddresses,
      pplApi,
      pplChainInfo,
      pplClient,
      selectedMultiProxy?.proxy
    ]
  )

  useEffect(() => {
    if (hasPplChain) {
      refresh(true)
    }

    refresh(false)
  }, [refresh, hasPplChain])

  return (
    <PendingTxContext.Provider
      value={{
        isLoading: (hasPplChain && isLoadingPpl) || isLoading,
        pendingTxs: txByDate,
        pendingPplTxs: pplTxByDate,
        refresh: () => refresh(false),
        refreshPpl: () => refresh(true)
      }}
    >
      {children}
    </PendingTxContext.Provider>
  )
}
const usePendingTx = () => {
  const context = useContext(PendingTxContext)
  if (context === undefined) {
    throw new Error('usePendingTx must be used within a PendingTxContextProvider')
  }
  return context
}

export { usePendingTx, PendingTxsContextProvider }

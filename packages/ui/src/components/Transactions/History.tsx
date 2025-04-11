import { Box, CircularProgress, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useMultiProxy } from '../../contexts/MultiProxyContext'
import { MdOutlineFlare as FlareIcon } from 'react-icons/md'
import { useQueryTxHistory } from '../../hooks/useQueryTxHistory'
import { useMemo } from 'react'
import { getPubKeyFromAddress } from '../../utils/getPubKeyFromAddress'
import { useAccountId } from '../../hooks/useAccountId'
import { HistoricTransaction } from './HistoricTransaction'

interface Props {
  className?: string
}

export const History = ({ className }: Props) => {
  const { selectedMultiProxy } = useMultiProxy()
  const multisigAddresses = useMemo(
    () => selectedMultiProxy?.multisigs.map((m) => m.address) || [],
    [selectedMultiProxy]
  )
  const multisigPubKeys = useMemo(
    () => getPubKeyFromAddress(multisigAddresses),
    [multisigAddresses]
  )
  const multisigIds = useAccountId(multisigPubKeys)
  const { data, error, isLoading } = useQueryTxHistory({ multisigIds })

  // interface TxParams {
  //   groupedTxs: AggGroupedByDate
  //   refreshFn: () => Promise<void>
  //   isPplChainTxs: boolean
  // }

  // const Transactions = ({ groupedTxs, refreshFn, isPplChainTxs }: TxParams) => {
  //   return (
  //     Object.entries(groupedTxs).length !== 0 &&
  //     Object.entries(groupedTxs).map(([date, aggregatedData]) => {
  //       return (
  //         <TransactionWrapper key={`${date}-${isPplChainTxs}`}>
  //           <DateContainerStyled data-cy="label-date">{date}</DateContainerStyled>
  //           {aggregatedData.map((agg, index) => {
  //             const { callData, info, from } = agg
  //             const { threshold, signatories } =
  //               getMultisigByAddress(from) ||
  //               ({ threshold: undefined, signatories: undefined } as MultisigAggregated)

  //             // if the "from"  is not a multisig from the
  //             // currently selected multiProxy or we have no info
  //             if (!info || !threshold) {
  //               return null
  //             }

  //             const multisigSignatories = signatories || []
  //             // if the threshold is met, but the transaction is still not executed
  //             // it means we need one signtory to submit with asMulti
  //             // so any signatory should be able to approve (again)
  //             const neededSigners =
  //               info?.approvals.length >= threshold
  //                 ? multisigSignatories
  //                 : getDifference(multisigSignatories, info?.approvals)
  //             const possibleSigners = getIntersection(neededSigners, ownAddressList)
  //             const isProposer = !!info?.depositor && ownAddressList.includes(info.depositor)

  //             // if we have the proposer in the extension it can always reject the transaction
  //             if (isProposer) {
  //               possibleSigners.push(info.depositor)
  //             }

  //             return (
  //               <Transaction
  //                 key={`${index}-${callData}`}
  //                 aggregatedData={agg}
  //                 isProposer={isProposer}
  //                 onSuccess={refreshFn}
  //                 possibleSigners={possibleSigners}
  //                 multisigSignatories={multisigSignatories}
  //                 threshold={threshold}
  //                 isPplChainTx={isPplChainTxs}
  //               />
  //             )
  //           })}
  //         </TransactionWrapper>
  //       )
  //     })
  //   )
  // }
  return (
    <Box className={className}>
      {isLoading && (
        <LoaderStyled data-cy="loader-transaction-list">
          <CircularProgress />
        </LoaderStyled>
      )}
      {(!data || data.multisigTxes.length === 0) && !isLoading && (
        <NoCallWrapperStyled>
          <FlareIconStyled size={24} />
          <div>No past transaction found!</div>
        </NoCallWrapperStyled>
      )}
      {!!data &&
        data.multisigTxes.length > 0 &&
        !isLoading &&
        data.multisigTxes
          .sort((a, b) => b.blockNumber - a.blockNumber)
          .slice(0, 10)
          .map((tx) => {
            return (
              <HistoricTransaction
                key={tx.id}
                className={className}
                tx={tx}
              />
            )
          })}
      {!!error && <pre>{JSON.stringify(error, null, 2)}</pre>}
      {/* {Object.entries(tx).length === 0 &&
        Object.entries(pplTx).length === 0 &&
        !isLoading && (
          <NoCallWrapperStyled>
            <FlareIconStyled size={24} />
            <div>You&apos;re all set!</div>
          </NoCallWrapperStyled>
        )}
      <Transactions
        groupedTxs={tx}
        isPplChainTxs={false}
        refreshFn={refresh}
      />
      <Transactions
        groupedTxs={pplTx}
        isPplChainTxs={true}
        refreshFn={refreshPpl}
      /> */}
    </Box>
  )
}

const FlareIconStyled = styled(FlareIcon)`
  font-size: 3rem;
  margin-bottom: 1rem;
`

const NoCallWrapperStyled = styled(Paper)`
  background-color: ${({ theme }) => theme.custom.background.primary};
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  padding: 2rem;
`

const LoaderStyled = styled(Box)`
  display: flex;
  justify-content: center;
`

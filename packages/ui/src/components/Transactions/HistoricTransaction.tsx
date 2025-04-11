import Paper from '@mui/material/Paper'
import { MultisigTxsByIdQuery } from '../../../types-and-hooks'
import { Box, styled } from '@mui/material'
import { TxStatus } from '../../types'
import {
  HiOutlineCheckCircle as SuccessIncon,
  HiOutlineMinusCircle as CancelledIcon,
  HiOutlineXCircle as ErrorIcon
} from 'react-icons/hi2'
import { useEffect, useState } from 'react'
import { getCallDataFromChainPromise } from '../../utils/getCallDataFromChain'
import { useApi } from '../../contexts/ApiContext'
// import { JSONprint } from '../../utils/jsonPrint'
import CallInfo from '../CallInfo'
import { CallDataInfoFromChain } from '../../contexts/PendingTxContext'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import dayjs from 'dayjs'
dayjs.extend(localizedFormat)

interface Props {
  className?: string
  tx: MultisigTxsByIdQuery['multisigTxes'][0]
}

export const HistoricTransaction = ({ className, tx }: Props) => {
  const [res, setRes] = useState<CallDataInfoFromChain | undefined>()
  const { api, client } = useApi()

  useEffect(() => {
    if (!api || !client) return

    getCallDataFromChainPromise(
      [
        {
          from: '',
          hash: '',
          info: {
            approvals: [],
            deposit: 0n,
            depositor: '',
            when: {
              height: tx.blockNumber,
              index: tx.extrinsicIndex
            }
          }
        }
      ],
      api,
      client
    )[0]
      .then((res) => {
        setRes(res)
      })
      .catch(console.error)
  }, [api, client, tx.blockNumber, tx.extrinsicIndex])
  const Icon =
    tx.status === TxStatus.Cancelled
      ? CancelledIconStyled
      : tx.status === TxStatus.Error
        ? ErrorIconStyled
        : SuccessIconStyled

  return (
    <PaperStyled
      className={className}
      data-cy="container-pending-tx-item"
    >
      <StatusContainerStyled>
        <Icon />
        {/* {tx.status} */}
      </StatusContainerStyled>
      <StatusContainerStyled>
        {(res?.timestamp && dayjs(res.timestamp).format('LL')) || ''}
      </StatusContainerStyled>
      {/* <pre>{JSONprint(res)}</pre> */}
      {!!res && (
        <CallInfo
          aggregatedData={res}
          withLink
          isPplChainTx={false}
        />
      )}
    </PaperStyled>
  )
}

const StatusContainerStyled = styled(Box)`
  display: flex;
  align-items: center;
  margin-right: 1rem;
`

const PaperStyled = styled(Paper)`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  padding: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    flex-direction: row;
    margin-left: 0.5rem;
  }
`
const CancelledIconStyled = styled(CancelledIcon)`
  color: ${({ theme }) => theme.custom.identity.grey};
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
`

const SuccessIconStyled = styled(SuccessIncon)`
  color: ${({ theme }) => theme.custom.identity.green};
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
`

const ErrorIconStyled = styled(ErrorIcon)`
  color: ${({ theme }) => theme.custom.identity.red};
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
`

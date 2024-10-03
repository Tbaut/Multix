import { Alert, Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useCallback, useEffect, useState } from 'react'
import { useApi } from '../../contexts/ApiContext'
import { TextField } from '../library'
import CallInfo from '../CallInfo'
import { useCallInfoFromCallData } from '../../hooks/useCallInfoFromCallData'
import { getExtrinsicName } from '../../utils/getExtrinsicName'
import { usePjsLinks } from '../../hooks/usePjsLinks'
import { Binary, HexString, Transaction } from 'polkadot-api'

interface Props {
  className?: string
  onSetExtrinsic: (ext: Transaction<any, any, any, any>) => void
}

const FromCallData = ({ className, onSetExtrinsic }: Props) => {
  const { api } = useApi()
  const [pastedCallData, setPastedCallData] = useState<HexString | undefined>(undefined)
  const [callDataError, setCallDataError] = useState('')
  const [isProxyProxyRemoved, setIsProxyProxyRemoved] = useState(false)
  const [callDataToUse, setCallDataToUse] = useState<HexString | undefined>()

  const removeProxyProxyCall = useCallback(
    async (call: HexString) => {
      setIsProxyProxyRemoved(false)
      if (!api) return call

      const decodedCall = (await api.txFromCallData(Binary.fromHex(call))).decodedCall

      // check if this call is a proxy.proxy
      if (decodedCall.type === 'Proxy' && decodedCall.value.type === 'proxy') {
        // a proxy.proxy call is encoded with e.g
        // callIndex 1e00
        // real 00 eb53ed54b7f921a438923e6eb52c4d89afc5c0fed5d0d15fb78648c53da227a0
        // forceProxyType 00
        setIsProxyProxyRemoved(true)
        return `0x${call.substring(74)}` as HexString
      }

      return call
    },
    [api]
  )

  // users may erroneously paste callData from the multisig calldata
  // this may start by proxy.proxy although this will be
  // added by Multix too. For this reason we strip it.
  useEffect(() => {
    if (!pastedCallData) return
    removeProxyProxyCall(pastedCallData).then(setCallDataToUse).catch(console.error)
  }, [pastedCallData, removeProxyProxyCall])

  const { callInfo } = useCallInfoFromCallData(callDataToUse)
  const { callInfo: pastedCallInfo } = useCallInfoFromCallData(pastedCallData)
  const { extrinsicUrl } = usePjsLinks()

  useEffect(() => {
    if (!api) {
      return
    }

    if (!pastedCallData || !callInfo?.call) {
      return
    }

    onSetExtrinsic(callInfo.call)
  }, [api, pastedCallData, callInfo, onSetExtrinsic])

  const onCallDataChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCallDataError('')

    const pastedCallData = event.target.value.trim() as HexString

    setPastedCallData(pastedCallData)
  }, [])

  return (
    <Box className={className}>
      <AlertStyled severity="info">
        Paste below the &quot;encoded call data&quot; from a{' '}
        <a
          href={extrinsicUrl}
          target="_blank"
          rel="noreferrer"
        >
          manual extrinsic
        </a>
        .<br /> Multix will take care of wrapping it in a multisig/proxy call
      </AlertStyled>
      {isProxyProxyRemoved && (
        <AlertStyled severity="warning">
          Multix will override the proxy.proxy call with the proxy you have selected
        </AlertStyled>
      )}
      <TextField
        data-cy="input-from-call-data"
        label={`Call data`}
        onChange={onCallDataChange}
        value={pastedCallData || ''}
        helperText={callDataError}
        error={!!callDataError}
        fullWidth
      />
      {!!callInfo && !!pastedCallInfo && !callDataError && (
        <CallInfo
          aggregatedData={{
            args: callInfo.call?.decodedCall,
            callData: callDataToUse,
            name: getExtrinsicName(callInfo.section, callInfo.method)
          }}
          expanded
          withProxyFiltered={false}
        />
      )}
    </Box>
  )
}

const AlertStyled = styled(Alert)`
  margin: 0.5rem 0 0.5rem 0;
`
export default FromCallData

import { PolkadotClient, Transaction } from 'polkadot-api'
import { IApiContext } from '../contexts/ApiContext'
import { PendingTx, CallDataInfoFromChain } from '../contexts/PendingTxContext'
import { IPplApiContext } from '../contexts/PeopleChainApiContext'
import { ApiDescriptors, PplDescriptorKeys } from '../types'
import { Bin, Binary, compact, HexString, Tuple } from '@polkadot-api/substrate-bindings'
import { hashFromTx } from './txHash'
import { getEncodedCallFromDecodedTx } from './getEncodedCallFromDecodedTx'
import { getExtrinsicDecoder } from '@polkadot-api/tx-utils'

const opaqueMetadata = Tuple(compact, Bin(Infinity)).dec

const getExtDecoderAt = async (
  api: IApiContext<ApiDescriptors>['api'],
  client: PolkadotClient,
  blockHash?: string
) => {
  if (!api) return

  const rawMetadata = await (blockHash && !import.meta.env.DEV
    ? client
        ._request<{
          result: HexString
        }>('archive_unstable_call', [blockHash, 'Metadata_metadata', ''])
        .then((x) => opaqueMetadata(x.result)[1])
    : api.apis.Metadata.metadata())

  const decoder = await getExtrinsicDecoder(rawMetadata.asOpaqueBytes())

  return decoder
}

const getMultisigInfo = async (
  call: Transaction<any, any, any, any>['decodedCall'],
  api: IApiContext<ApiDescriptors>['api'] | IPplApiContext<PplDescriptorKeys>['pplApi']
): Promise<Partial<CallDataInfoFromChain>[]> => {
  if (!api) return []

  const compatibilityToken = await api.compatibilityToken
  const result: any[] = []

  // console.log('----for call', JSONprint(call));

  const getCallResults = (call: Transaction<any, any, any, any>['decodedCall']) => {
    if (call.type === 'Multisig') {
      if (call.value.type === 'as_multi') {
        const callDatawithout0x = getEncodedCallFromDecodedTx(
          api,
          call.value.value.call,
          compatibilityToken
        )
        const callData = `0x${callDatawithout0x}`
        const hash = hashFromTx(callData)
        // console.log('----- callData', callData);
        // console.log('----- hash', hash);
        result.push({
          name: `${call.value.value.call.type}.${call.value.value.call.value.type}`,
          hash,
          callData
        })
      } else if (call.value.type === 'approve_as_multi') {
        result.push({
          name: 'Unknown call',
          // the call_hash is of type FixedSizeBinary<32> which is
          // an instance of instance Binary and can be converted to a hex
          hash: call.value.value.call_hash.asHex(),
          callData: undefined
        })
      }
    } else {
      if (call.value.value.call) {
        getCallResults(call.value.value.call)
      }

      if (call.value.value.calls) {
        call.value.value.calls.forEach((c: any) => getCallResults(c))
      }
    }
  }

  getCallResults(call)
  return result
}

export const getCallDataFromChainPromise = (
  pendingTxData: PendingTx[],
  api: IApiContext<ApiDescriptors>['api'] | IPplApiContext<PplDescriptorKeys>['pplApi'],
  client: PolkadotClient
) =>
  pendingTxData.map(async (pendingTx) => {
    const blockNumber = pendingTx.info.when.height
    const blockHashes = await client._request('archive_unstable_hashByHeight', [blockNumber])
    const blockHash = (Array.isArray(blockHashes) ? blockHashes?.[0] : blockHashes) as
      | HexString
      | undefined

    if (!blockHash) {
      console.log('no hash found for height', blockNumber)
      return
    }

    const body: HexString[] = await client._request('archive_unstable_body', [blockHash])

    let date: Date | undefined

    const decoder = await getExtDecoderAt(api, client, blockHash)

    if (!decoder || !api) {
      !decoder && console.error('usePendingTx: no decoder found')
      !api && console.error('usePendingTx: no api found')

      return
    }

    const txPromises = body.map((extrinsics) => {
      const decodedExtrinsic = decoder(extrinsics)
      const toDecode = decodedExtrinsic.callData
      // console.log('-----------------------------')
      // console.log(decodedExtrinsic)
      return api.txFromCallData(toDecode)
    })

    const allDecodedTxs = await Promise.all(txPromises)

    // allDecodedTxs.forEach((txs) => {
    //   console.log('-------------decoded')
    //   console.log(txs)
    // })

    // get the timestamp which is an unsigned extrinsic set by the validator in each block
    // the information for each of the contained extrinsics
    allDecodedTxs.some(({ decodedCall: { type, value } }) => {
      if (type === 'Timestamp' && value.type === 'set') {
        const moment = value.value.now as string

        // convert to date (unix ms since epoch in Moment - exactly as per the Rust code)
        date = new Date(Number(moment))
        return true
      }

      return false
    })

    const ext = allDecodedTxs[pendingTx.info.when.index]
    const multisigTxs = (ext?.decodedCall && (await getMultisigInfo(ext.decodedCall, api))) || []

    const multisigTxInfo = multisigTxs.find((info) => {
      if (!pendingTx.hash) {
        return info
      }

      if (!!info.hash && info.hash === pendingTx.hash) {
        return info
      }

      return false
    })

    if (!multisigTxInfo) {
      console.log('oops we did not find the right extrinsic. Pending tx:', pendingTx)
      console.log('allDecodedTxs', allDecodedTxs)
      console.log('multisigTxs', multisigTxs)

      return
    }

    const { name, hash, callData } = multisigTxInfo

    return {
      callData,
      hash: hash || pendingTx.hash,
      name,
      decodedCall:
        (callData && (await api.txFromCallData(Binary.fromHex(callData))).decodedCall) || {},
      info: pendingTx.info,
      from: pendingTx.from,
      timestamp: date
    } as CallDataInfoFromChain
  })

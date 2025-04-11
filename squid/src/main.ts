import { DataHandlerContext, SubstrateBatchProcessor } from '@subsquid/substrate-processor'
import { Store, TypeormDatabase } from '@subsquid/typeorm-store'
import { handleMultisigCall } from './multisigCalls'
import {
  getMultisigPubKey,
  getMultisigCallId,
  getOriginAccount,
  getPureProxyInfoFromArgs,
  getProxyInfoFromArgs
} from './util'
import {
  handleNewMultisigCalls,
  handleNewMultisigs,
  handleNewProxies,
  handleNewPureProxies,
  handleProxyRemovals,
  MultisigCallInfo,
  NewMultisigsInfo,
  NewProxy,
  NewPureProxy
} from './processorHandlers'
import { Env } from './util/Env'
import { getAccountId } from './util/getAccountId'
import { getProxyAccountIByDelegatorIds } from './util/getProxyAccountIByDelegatorIds'
import { KillPureCallInfo, getProxyKillPureArgs } from './util/getProxyKillPureArgs'
import { handleProxyKillPure } from './processorHandlers/handleProxyKillPure'
import { getProxyAccountId } from './util/getProxyAccountId'
import { ProxyType } from './model'
import { decodeAddress } from '@polkadot/util-crypto'
import { u8aToHex } from '@polkadot/util'
import {
  PURE_PROXIEs_MIGRATION_BLOCK,
  PURE_PROXIEs_MIGRATION_CHAIN,
  PURE_PROXIES_MIGRATION_ARRAY
} from './constants'
import { getMultisigTxfoFromArgs, MultisigTxInfo } from './util/getMultisigTxInfoFromArgs'
import { handleNewMultisigTxs } from './processorHandlers/handleNewMultisigTxs'

const supportedMultisigCalls = [
  'Multisig.as_multi',
  'Multisig.approve_as_multi',
  'Multisig.cancel_as_multi',
  'Multisig.as_multi_threshold_1'
]

const supportedProxyCalls = ['Proxy.proxy', 'Proxy.remove_proxies', 'Proxy.kill_pure']
const supportedCalls = [...supportedProxyCalls, ...supportedMultisigCalls]

const supportedEvents = [
  'Proxy.PureCreated',
  'Proxy.AnonymousCreated',
  'Proxy.ProxyAdded',
  'Proxy.ProxyRemoved',
  'Multisig.MultisigCancelled',
  'Multisig.MultisigExecuted'
]

export const env = new Env().getEnv()
const chainId = env.chainId

export const fields = {
  call: {
    args: true,
    origin: true,
    success: true
  },
  event: {
    args: true
  },
  block: { timestamp: true }
}

const processor = new SubstrateBatchProcessor()
  .setRpcEndpoint({ url: env.rpcWs, maxBatchCallSize: 1 })
  .setBlockRange({
    from: Number(env.blockstart)
  })
  .setFields(fields)
  .addCall({
    name: supportedCalls
  })
  .addEvent({
    name: supportedEvents
  })

!!env.gatewayUrl && processor.setGateway(env.gatewayUrl)

export type Ctx = DataHandlerContext<Store, typeof fields>

processor.run(
  new TypeormDatabase({ stateSchema: chainId, isolationLevel: 'READ COMMITTED' }),
  async (ctx) => {
    const newMultisigsInfo: Map<string, NewMultisigsInfo> = new Map()
    const newPureProxies: Map<string, NewPureProxy> = new Map()
    const newMultisigCalls: MultisigCallInfo[] = []
    const newProxies: Map<string, NewProxy> = new Map()
    const proxyRemovalIds: Set<string> = new Set()
    const delegatorToRemoveIds: Set<string> = new Set()
    const pureToKill: KillPureCallInfo[] = []
    const multisigTxsInfo: MultisigTxInfo[] = []

    for (const block of ctx.blocks) {
      const { calls, events, header } = block
      const blockNumber = header.height

      const timestamp = new Date(header.timestamp || 0)
      for (const call of calls) {
        // we only care about the successful actions and the ones signed
        if (!call.success || !call.origin) continue

        if (supportedMultisigCalls.includes(call.name)) {
          const signer = getOriginAccount(call.origin)

          const { otherSignatories, threshold } = handleMultisigCall(call.args)
          const signatories = [signer, ...otherSignatories]

          const multisigPubkey = getMultisigPubKey(signatories, threshold)
          const newMulti = {
            pubKey: multisigPubkey,
            threshold,
            newSignatories: signatories,
            isMultisig: true,
            isPureProxy: false
          } as NewMultisigsInfo

          newMultisigsInfo.set(newMulti.pubKey, newMulti)
          const blockHash = block.header.hash

          newMultisigCalls.push({
            id: getMultisigCallId(
              newMulti.pubKey,
              blockNumber,
              call.extrinsicIndex,
              call.id,
              chainId
            ),
            blockHash,
            callIndex: call.extrinsicIndex,
            multisigPubKey: newMulti.pubKey,
            timestamp
          })
        }

        if (call.name === 'Proxy.remove_proxies') {
          const signer = getOriginAccount(call.origin)
          const signerAccountId = getAccountId(signer, chainId)

          // If a pure has just been created (in the queue, not persisted yet) and if the pure has called the removeProxies
          // effectively deleting all its delegations, we should remove it from the queue.
          const pureIdToRemove = Array.from(newPureProxies.values()).find(
            ({ pure }) => pure === signer
          )?.id
          pureIdToRemove && newPureProxies.delete(pureIdToRemove)
          // ctx.log.info(`toremove ${JsonLog(pureIdToRemove)}`)
          // ctx.log.info(`new Pure ${JsonLog(Array.from(newPureProxies.entries()))}`)

          // if a proxy has just been added and is in the queue (not persisted in the DB yet)
          // and the delegator has called removeProxies, we should remove it from the queue
          const proxyIdstoRemove = Array.from(newProxies.values())
            .filter(({ delegator }) => delegator === signer)
            .map(({ id }) => id)
          // ctx.log.info(`proxyIdsToRemove ${JsonLog(proxyIdstoRemove)}`)

          proxyIdstoRemove.forEach((id) => {
            newProxies.delete(id)
          })

          // We will check in the DB if this account is the delegator
          // for any other account, and remove the link
          delegatorToRemoveIds.add(signerAccountId)
        }

        if (call.name === 'Proxy.kill_pure') {
          const proxyToKillArgs = getProxyKillPureArgs(call.args)
          Array.from(newPureProxies.values()).forEach(
            ({ creationBlockNumber, extrinsicIndex, who, id }) => {
              if (
                creationBlockNumber === proxyToKillArgs.blockNumber &&
                extrinsicIndex === proxyToKillArgs.extrinsicIndex &&
                proxyToKillArgs.spawnerPubKey === who
              ) {
                newPureProxies.delete(id)
              }
            }
          )

          pureToKill.push(proxyToKillArgs)
        }
      }

      for (const event of events) {
        //   ------ Executed {
        //     "id": "0012432588-35dca-000024",
        //     "index": 24,
        //     "name": "Multisig.MultisigExecuted",
        //     "args": {
        //         "approving": "0xbf0e4f23da489d14165b2ba815d016785d7f19e54edd68ba947520e4e9842ccf",
        //         "timepoint": {
        //             "height": 12432570,
        //             "index": 3
        //         },
        //         "multisig": "0x3a8a2a6cf79946867c5cd684b31a74a95fd8fe27007ed070a9e2c40836c10838",
        //         "callHash": "0xdefd5e3a12d910a4430b5a18609da562c2842bd3ecb37b624a17d53f0fee4841",
        //         "result": {
        //             "__kind": "Err",
        //             "value": {
        //                 "__kind": "Module",
        //                 "value": {
        //                     "index": 5,
        //                     "error": "0x04000000"
        //                 }
        //             }
        //         }
        //     },
        //     "extrinsicIndex": 2,
        //     "callAddress": []
        // }

        //   --------- Cancelled {
        //     "id": "0012466539-4f582-000025",
        //     "index": 25,
        //     "name": "Multisig.MultisigCancelled",
        //     "args": {
        //         "cancelling": "0x44b950f440709a5ea45db212b3ccd97ded1b133fd3dbdde34d9268ccef1e1667",
        //         "timepoint": {
        //             "height": 11075280,
        //             "index": 2
        //         },
        //         "multisig": "0x443de9a1d912ed8c45f339444efe5e8715efeb41297580820c8fda842a2d9c6e",
        //         "callHash": "0x17ab0c8e392500b94a89ba59355deb1230fc8045b92b8265cc4be0541c08ca15"
        //     },
        //     "extrinsicIndex": 2,
        //     "callAddress": []
        // }

        if (
          event.name === 'Multisig.MultisigExecuted' ||
          event.name === 'Multisig.MultisigCancelled'
        ) {
          const newTx = await getMultisigTxfoFromArgs({
            event,
            chainId,
            ctx,
            blockNumber
          })

          !!newTx && multisigTxsInfo.push(newTx)
        }

        if (event.name === 'Proxy.PureCreated' || event.name === 'Proxy.AnonymousCreated') {
          const newPureProxy = getPureProxyInfoFromArgs({
            event,
            chainId,
            ctx,
            isAnonymous: event.name === 'Proxy.AnonymousCreated'
          })
          // ctx.log.info(`pure ${newPureProxy.pure}`)
          // ctx.log.info(`who ${newPureProxy.who}`)

          newPureProxy &&
            newPureProxies.set(newPureProxy.id, {
              ...newPureProxy,
              createdAt: timestamp,
              creationBlockNumber: blockNumber,
              extrinsicIndex: event.extrinsicIndex
            })
        }

        if (event.name === 'Proxy.ProxyAdded') {
          const newProxy = getProxyInfoFromArgs({ event, chainId, ctx })
          // ctx.log.info(`-----> delegator ${newProxy.delegator}`)
          // ctx.log.info(`-----> delegatee ${newProxy.delegatee}`)
          newProxy && newProxies.set(newProxy.id, { ...newProxy, createdAt: timestamp })
        }

        if (event.name === 'Proxy.ProxyRemoved') {
          const proxyRemoval = getProxyInfoFromArgs({ event, chainId, ctx })
          // ctx.log.info(`-----> to remove delegator ${proxyRemoval.delegator}`)
          // ctx.log.info(`-----> to remove delegatee ${proxyRemoval.delegatee}`)
          if (proxyRemoval && newProxies.has(proxyRemoval.id)) {
            newProxies.delete(proxyRemoval.id)
            // ctx.log.info(`<----- remove from set ${proxyRemoval.id}`)
          } else {
            proxyRemoval && proxyRemovalIds.add(proxyRemoval.id)
            // ctx.log.info(`<----- remove queue ${proxyRemoval.id}`)
          }
        }
      }

      if (
        blockNumber === PURE_PROXIEs_MIGRATION_BLOCK &&
        chainId === PURE_PROXIEs_MIGRATION_CHAIN
      ) {
        const delay = 0
        const type = ProxyType.Any

        PURE_PROXIES_MIGRATION_ARRAY.forEach(({ who, pure, entity, signatories, threshold }) => {
          ctx.log.info(`---> pure migration for ${entity}`)
          const whoPubKey = u8aToHex(decodeAddress(who))
          const purePubKey = u8aToHex(decodeAddress(pure))

          if (signatories) {
            ctx.log.info(`---> multisig migration for ${entity}`)
            const manualMultisig = {
              pubKey: whoPubKey,
              threshold,
              newSignatories: signatories.map((s) => u8aToHex(decodeAddress(s))),
              isMultisig: true,
              isPureProxy: false
            } as NewMultisigsInfo

            newMultisigsInfo.set(manualMultisig.pubKey, manualMultisig)
          }

          const id = getProxyAccountId(whoPubKey, purePubKey, type, delay, chainId)

          newPureProxies.set(id, {
            id,
            who: whoPubKey,
            pure: purePubKey,
            delay,
            type,
            createdAt: timestamp,
            creationBlockNumber: blockNumber,
            extrinsicIndex: 0
          })
        })
      }
    }

    // before adding any proxy we should remove the ones that were marked to be deleted
    // because removeProxies was called
    if (delegatorToRemoveIds.size) {
      // check if there are some delegation linked to bulk removal (removeProxies)
      const addToProxyRemoval = await getProxyAccountIByDelegatorIds(
        ctx,
        Array.from(delegatorToRemoveIds)
      )
      // ctx.log.info(`Removing: ${JsonLog(addToProxyRemoval)}`)
      // and add them to the list to remove
      addToProxyRemoval.forEach((id) => proxyRemovalIds.add(id))
    }

    proxyRemovalIds.size && (await handleProxyRemovals(ctx, Array.from(proxyRemovalIds.values())))
    newMultisigsInfo.size &&
      (await handleNewMultisigs(ctx, Array.from(newMultisigsInfo.values()), chainId))
    newMultisigCalls.length && (await handleNewMultisigCalls(ctx, newMultisigCalls, chainId))
    pureToKill.length && (await handleProxyKillPure(ctx, pureToKill))
    newPureProxies.size &&
      (await handleNewPureProxies(ctx, Array.from(newPureProxies.values()), chainId))
    newProxies.size && (await handleNewProxies(ctx, Array.from(newProxies.values()), chainId))
    multisigTxsInfo.length && (await handleNewMultisigTxs(ctx, multisigTxsInfo, chainId))
  }
)

import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v2005 from '../v2005'
import * as v9111 from '../v9111'
import * as v9130 from '../v9130'
import * as v9160 from '../v9160'
import * as v9170 from '../v9170'
import * as v9190 from '../v9190'
import * as v9320 from '../v9320'
import * as v9420 from '../v9420'
import * as v9430 from '../v9430'

export const multisigExecuted =  {
    name: 'Multisig.MultisigExecuted',
    /**
     *  A multisig operation has been executed. First param is the account that is
     *  approving, third is the multisig account, fourth is hash of the call to be executed.
     */
    v2005: new EventType(
        'Multisig.MultisigExecuted',
        sts.tuple([v2005.AccountId, v2005.Timepoint, v2005.AccountId, v2005.CallHash, v2005.DispatchResult])
    ),
    /**
     * A multisig operation has been executed. \[approving, timepoint, multisig, call_hash\]
     */
    v9111: new EventType(
        'Multisig.MultisigExecuted',
        sts.tuple([v9111.AccountId32, v9111.Timepoint, v9111.AccountId32, sts.bytes(), sts.result(() => sts.unit(), () => v9111.DispatchError)])
    ),
    /**
     * A multisig operation has been executed.
     */
    v9130: new EventType(
        'Multisig.MultisigExecuted',
        sts.struct({
            approving: v9130.AccountId32,
            timepoint: v9130.Timepoint,
            multisig: v9130.AccountId32,
            callHash: sts.bytes(),
            result: sts.result(() => sts.unit(), () => v9130.DispatchError),
        })
    ),
    /**
     * A multisig operation has been executed.
     */
    v9160: new EventType(
        'Multisig.MultisigExecuted',
        sts.struct({
            approving: v9160.AccountId32,
            timepoint: v9160.Timepoint,
            multisig: v9160.AccountId32,
            callHash: sts.bytes(),
            result: sts.result(() => sts.unit(), () => v9160.DispatchError),
        })
    ),
    /**
     * A multisig operation has been executed.
     */
    v9170: new EventType(
        'Multisig.MultisigExecuted',
        sts.struct({
            approving: v9170.AccountId32,
            timepoint: v9170.Timepoint,
            multisig: v9170.AccountId32,
            callHash: sts.bytes(),
            result: sts.result(() => sts.unit(), () => v9170.DispatchError),
        })
    ),
    /**
     * A multisig operation has been executed.
     */
    v9190: new EventType(
        'Multisig.MultisigExecuted',
        sts.struct({
            approving: v9190.AccountId32,
            timepoint: v9190.Timepoint,
            multisig: v9190.AccountId32,
            callHash: sts.bytes(),
            result: sts.result(() => sts.unit(), () => v9190.DispatchError),
        })
    ),
    /**
     * A multisig operation has been executed.
     */
    v9320: new EventType(
        'Multisig.MultisigExecuted',
        sts.struct({
            approving: v9320.AccountId32,
            timepoint: v9320.Timepoint,
            multisig: v9320.AccountId32,
            callHash: sts.bytes(),
            result: sts.result(() => sts.unit(), () => v9320.DispatchError),
        })
    ),
    /**
     * A multisig operation has been executed.
     */
    v9420: new EventType(
        'Multisig.MultisigExecuted',
        sts.struct({
            approving: v9420.AccountId32,
            timepoint: v9420.Timepoint,
            multisig: v9420.AccountId32,
            callHash: sts.bytes(),
            result: sts.result(() => sts.unit(), () => v9420.DispatchError),
        })
    ),
    /**
     * A multisig operation has been executed.
     */
    v9430: new EventType(
        'Multisig.MultisigExecuted',
        sts.struct({
            approving: v9430.AccountId32,
            timepoint: v9430.Timepoint,
            multisig: v9430.AccountId32,
            callHash: sts.bytes(),
            result: sts.result(() => sts.unit(), () => v9430.DispatchError),
        })
    ),
}

export const multisigCancelled =  {
    name: 'Multisig.MultisigCancelled',
    /**
     *  A multisig operation has been cancelled. First param is the account that is
     *  cancelling, third is the multisig account, fourth is hash of the call.
     */
    v2005: new EventType(
        'Multisig.MultisigCancelled',
        sts.tuple([v2005.AccountId, v2005.Timepoint, v2005.AccountId, v2005.CallHash])
    ),
    /**
     * A multisig operation has been cancelled.
     */
    v9130: new EventType(
        'Multisig.MultisigCancelled',
        sts.struct({
            cancelling: v9130.AccountId32,
            timepoint: v9130.Timepoint,
            multisig: v9130.AccountId32,
            callHash: sts.bytes(),
        })
    ),
}

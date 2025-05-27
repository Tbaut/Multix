import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v2005 from '../v2005'
import * as v9111 from '../v9111'
import * as v9130 from '../v9130'
import * as v9180 from '../v9180'
import * as v9190 from '../v9190'
import * as v9300 from '../v9300'
import * as v9420 from '../v9420'
import * as v1002006 from '../v1002006'
import * as v1003000 from '../v1003000'
import * as v1004000 from '../v1004000'

export const anonymousCreated =  {
    name: 'Proxy.AnonymousCreated',
    /**
     *  Anonymous account (first parameter) has been created by new proxy (second) with given
     *  disambiguation index and proxy type.
     */
    v2005: new EventType(
        'Proxy.AnonymousCreated',
        sts.tuple([v2005.AccountId, v2005.AccountId, v2005.ProxyType, sts.number()])
    ),
    /**
     * Anonymous account has been created by new proxy with given
     * disambiguation index and proxy type.
     */
    v9130: new EventType(
        'Proxy.AnonymousCreated',
        sts.struct({
            anonymous: v9130.AccountId32,
            who: v9130.AccountId32,
            proxyType: v9130.ProxyType,
            disambiguationIndex: sts.number(),
        })
    ),
    /**
     * Anonymous account has been created by new proxy with given
     * disambiguation index and proxy type.
     */
    v9180: new EventType(
        'Proxy.AnonymousCreated',
        sts.struct({
            anonymous: v9180.AccountId32,
            who: v9180.AccountId32,
            proxyType: v9180.ProxyType,
            disambiguationIndex: sts.number(),
        })
    ),
}

export const proxyAdded =  {
    name: 'Proxy.ProxyAdded',
    /**
     * A proxy was added. \[delegator, delegatee, proxy_type, delay\]
     */
    v9111: new EventType(
        'Proxy.ProxyAdded',
        sts.tuple([v9111.AccountId32, v9111.AccountId32, v9111.ProxyType, sts.number()])
    ),
    /**
     * A proxy was added.
     */
    v9130: new EventType(
        'Proxy.ProxyAdded',
        sts.struct({
            delegator: v9130.AccountId32,
            delegatee: v9130.AccountId32,
            proxyType: v9130.ProxyType,
            delay: sts.number(),
        })
    ),
    /**
     * A proxy was added.
     */
    v9180: new EventType(
        'Proxy.ProxyAdded',
        sts.struct({
            delegator: v9180.AccountId32,
            delegatee: v9180.AccountId32,
            proxyType: v9180.ProxyType,
            delay: sts.number(),
        })
    ),
    /**
     * A proxy was added.
     */
    v9420: new EventType(
        'Proxy.ProxyAdded',
        sts.struct({
            delegator: v9420.AccountId32,
            delegatee: v9420.AccountId32,
            proxyType: v9420.ProxyType,
            delay: sts.number(),
        })
    ),
    /**
     * A proxy was added.
     */
    v1002006: new EventType(
        'Proxy.ProxyAdded',
        sts.struct({
            delegator: v1002006.AccountId32,
            delegatee: v1002006.AccountId32,
            proxyType: v1002006.ProxyType,
            delay: sts.number(),
        })
    ),
    /**
     * A proxy was added.
     */
    v1003000: new EventType(
        'Proxy.ProxyAdded',
        sts.struct({
            delegator: v1003000.AccountId32,
            delegatee: v1003000.AccountId32,
            proxyType: v1003000.ProxyType,
            delay: sts.number(),
        })
    ),
    /**
     * A proxy was added.
     */
    v1004000: new EventType(
        'Proxy.ProxyAdded',
        sts.struct({
            delegator: v1004000.AccountId32,
            delegatee: v1004000.AccountId32,
            proxyType: v1004000.ProxyType,
            delay: sts.number(),
        })
    ),
}

export const proxyRemoved =  {
    name: 'Proxy.ProxyRemoved',
    /**
     * A proxy was removed.
     */
    v9190: new EventType(
        'Proxy.ProxyRemoved',
        sts.struct({
            delegator: v9190.AccountId32,
            delegatee: v9190.AccountId32,
            proxyType: v9190.ProxyType,
            delay: sts.number(),
        })
    ),
    /**
     * A proxy was removed.
     */
    v9420: new EventType(
        'Proxy.ProxyRemoved',
        sts.struct({
            delegator: v9420.AccountId32,
            delegatee: v9420.AccountId32,
            proxyType: v9420.ProxyType,
            delay: sts.number(),
        })
    ),
    /**
     * A proxy was removed.
     */
    v1002006: new EventType(
        'Proxy.ProxyRemoved',
        sts.struct({
            delegator: v1002006.AccountId32,
            delegatee: v1002006.AccountId32,
            proxyType: v1002006.ProxyType,
            delay: sts.number(),
        })
    ),
    /**
     * A proxy was removed.
     */
    v1003000: new EventType(
        'Proxy.ProxyRemoved',
        sts.struct({
            delegator: v1003000.AccountId32,
            delegatee: v1003000.AccountId32,
            proxyType: v1003000.ProxyType,
            delay: sts.number(),
        })
    ),
    /**
     * A proxy was removed.
     */
    v1004000: new EventType(
        'Proxy.ProxyRemoved',
        sts.struct({
            delegator: v1004000.AccountId32,
            delegatee: v1004000.AccountId32,
            proxyType: v1004000.ProxyType,
            delay: sts.number(),
        })
    ),
}

export const pureCreated =  {
    name: 'Proxy.PureCreated',
    /**
     * A pure account has been created by new proxy with given
     * disambiguation index and proxy type.
     */
    v9300: new EventType(
        'Proxy.PureCreated',
        sts.struct({
            pure: v9300.AccountId32,
            who: v9300.AccountId32,
            proxyType: v9300.ProxyType,
            disambiguationIndex: sts.number(),
        })
    ),
    /**
     * A pure account has been created by new proxy with given
     * disambiguation index and proxy type.
     */
    v9420: new EventType(
        'Proxy.PureCreated',
        sts.struct({
            pure: v9420.AccountId32,
            who: v9420.AccountId32,
            proxyType: v9420.ProxyType,
            disambiguationIndex: sts.number(),
        })
    ),
    /**
     * A pure account has been created by new proxy with given
     * disambiguation index and proxy type.
     */
    v1002006: new EventType(
        'Proxy.PureCreated',
        sts.struct({
            pure: v1002006.AccountId32,
            who: v1002006.AccountId32,
            proxyType: v1002006.ProxyType,
            disambiguationIndex: sts.number(),
        })
    ),
    /**
     * A pure account has been created by new proxy with given
     * disambiguation index and proxy type.
     */
    v1003000: new EventType(
        'Proxy.PureCreated',
        sts.struct({
            pure: v1003000.AccountId32,
            who: v1003000.AccountId32,
            proxyType: v1003000.ProxyType,
            disambiguationIndex: sts.number(),
        })
    ),
    /**
     * A pure account has been created by new proxy with given
     * disambiguation index and proxy type.
     */
    v1004000: new EventType(
        'Proxy.PureCreated',
        sts.struct({
            pure: v1004000.AccountId32,
            who: v1004000.AccountId32,
            proxyType: v1004000.ProxyType,
            disambiguationIndex: sts.number(),
        })
    ),
}

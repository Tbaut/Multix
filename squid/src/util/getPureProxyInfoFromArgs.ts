import { EventItem } from "@subsquid/substrate-processor/lib/interfaces/dataSelection"
import { encodeAddress } from '@polkadot/util-crypto';
import { config } from '../config'
import { getProxyAccountId } from "./getProxyAccountId";
import { dataEvent } from "../processor"
import { ProxyType } from "../model";

export const getPureProxyInfoFromArgs = (item: EventItem<"Proxy.PureCreated", typeof dataEvent['data']>) => {

    const { pure, who } = item.event.args
    const delay = 0
    const type = ProxyType.Any
    const _who = encodeAddress(who, config.prefix)
    const _pure = encodeAddress(pure, config.prefix)
    const id = getProxyAccountId(_who, _pure, type, delay)

    return ({
        id,
        who: encodeAddress(who, config.prefix),
        pure: encodeAddress(pure, config.prefix),
        delay,
        type
    })
}

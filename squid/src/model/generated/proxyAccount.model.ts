import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Account} from "./account.model"
import {ProxyType} from "./_proxyType"

@Entity_()
export class ProxyAccount {
    constructor(props?: Partial<ProxyAccount>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    delegator!: Account | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    delegatee!: Account | undefined | null

    @Column_("varchar", {length: 17, nullable: true})
    type!: ProxyType | undefined | null

    @Column_("int4", {nullable: true})
    delay!: number | undefined | null
}

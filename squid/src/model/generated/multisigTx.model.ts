import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, IntColumn as IntColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"
import {Account} from "./account.model"
import {TxStatus} from "./_txStatus"

@Entity_()
export class MultisigTx {
    constructor(props?: Partial<MultisigTx>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    multisig!: Account

    @IntColumn_({nullable: false})
    blockNumber!: number

    @IntColumn_({nullable: false})
    originBlockNumber!: number

    @IntColumn_({nullable: false})
    originExtrinsicIndex!: number

    @StringColumn_({nullable: true})
    callData!: string | undefined | null

    @Column_("varchar", {length: 9, nullable: false})
    status!: TxStatus
}

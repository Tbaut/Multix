import { Box, InputAdornment, TextField } from "@mui/material";
import styled from "styled-components";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
import GenericAccountSelection, { AccountBaseInfo } from "../GenericAccountSelection";
import { useCallback, useEffect, useState } from "react";
import { useAccountBaseFromAccountList } from "../../hooks/useAccountBaseFromAccountList";
import { useApi } from "../../contexts/ApiContext";
import { useCheckBalance } from "../../hooks/useCheckBalance";
import BN from "bn.js"

interface Props {
    className?: string
    from: string
    onSetExtrinsic: (ext: SubmittableExtrinsic<"promise", ISubmittableResult>) => void
    onSetErrorMessage: React.Dispatch<React.SetStateAction<string>>
}

const BalancesTransfer = ({ className, from, onSetExtrinsic, onSetErrorMessage }: Props) => {
    const acountBase = useAccountBaseFromAccountList()
    const [selected, setSelected] = useState<AccountBaseInfo | undefined>(acountBase[0])
    const [toAddress, setToAddress] = useState(acountBase[0].address)
    const { api, isApiReady, chainInfo } = useApi()
    const [amountString, setAmountString] = useState("")
    const [amount, setAmount] = useState(new BN(0))
    const [amountError, setAmountError] = useState("")
    const { isLoading, isValid } = useCheckBalance({ min: amount, address: from })

    useEffect(() => {
        if (isLoading) {
            setAmountError("")
            onSetErrorMessage("")
            return
        }

        if (!isValid) {
            onSetErrorMessage("Origin address balance too low")
        }
    }, [isLoading, isValid, onSetErrorMessage])

    useEffect(() => {
        if (!isApiReady) {
            return
        }

        if (!toAddress) {
            return
        }

        if (!amount || amount.isZero()) {
            return
        }

        onSetExtrinsic(api.tx.balances.transfer(toAddress, amount.toString()))
    }, [amount, api, chainInfo, isApiReady, onSetExtrinsic, toAddress])

    const onAddressDestChange = useCallback((account?: AccountBaseInfo | string) => {
        if (!account) {
            return
        }

        if (typeof account === "string") {
            setToAddress(account)
            setSelected({
                address: account
            })
        } else {
            setToAddress(account.address)
            setSelected(account)
        }

    }, [])

    const onAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const decimals = chainInfo?.tokenDecimals || 0

        if (!decimals) {
            setAmountError("Invalid network decimals")
            return
        }

        setAmountError("")
        onSetErrorMessage("")

        setAmountString(event.target.value)
        // FIXME handle number with BN and validate them https://github.com/ChainSafe/Multix/issues/49
        const value = Number(event.target.value) * Math.pow(10, decimals)
        setAmount(new BN(value))
    }, [chainInfo, onSetErrorMessage])

    if (!selected) return null

    return (
        <Box className={className}>
            <GenericAccountSelection
                className="to"
                accountList={acountBase}
                onChange={onAddressDestChange}
                value={selected}
                label="to"
                allowAnyAddressInput={true}
            />
            <TextField
                className="amount"
                label={`Amount`}
                onChange={onAmountChange}
                value={amountString}
                helperText={amountError}
                error={!!amountError}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">{chainInfo?.tokenSymbol || ""}</InputAdornment>
                    ),
                }}
            />
        </Box>
    )
}


export default styled(BalancesTransfer)(({ theme }) => `
  .to {
    margin-bottom: 1rem;
  }
`)
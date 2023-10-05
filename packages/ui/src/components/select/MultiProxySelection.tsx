import { Box, CircularProgress, InputAdornment } from '@mui/material'
import React, { useCallback, useMemo, useRef } from 'react'
import { styled } from '@mui/material/styles'
import { createFilterOptions } from '@mui/material/Autocomplete'
import { isMultiProxy, MultiProxy, useMultiProxy } from '../../contexts/MultiProxyContext'
import AccountDisplay from '../AccountDisplay'
import IdenticonBadge from '../IdenticonBadge'
import { useAccountNames } from '../../contexts/AccountNamesContext'
import { AccountBadge } from '../../types'
import { Autocomplete } from '../library'
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete/Autocomplete'
import TextFieldLargeStyled from '../library/TextFieldLargeStyled'

interface Props {
  className?: string
}

const getDisplayAddress = (option?: MultiProxy) =>
  option?.proxy ? option?.proxy : option?.multisigs[0].address

const isOptionEqualToValue = (option?: MultiProxy, value?: MultiProxy) => {
  if (!option || !value) return false

  if (!!option.proxy || !!value.proxy) {
    return option.proxy === value.proxy
  }
  return option.multisigs[0].address === value.multisigs[0].address
}

const MultiProxySelection = ({ className }: Props) => {
  const ref = useRef<HTMLInputElement>(null)
  const { multiProxyList, selectedMultiProxy, selectMultiProxy, isLoading } = useMultiProxy()
  const isSelectedProxy = useMemo(() => !!selectedMultiProxy?.proxy, [selectedMultiProxy])
  // We only support one multisigs if they have no proxy
  const addressToShow = useMemo(
    () => selectedMultiProxy?.proxy || selectedMultiProxy?.multisigs[0].address,
    [selectedMultiProxy]
  )
  const { accountNames } = useAccountNames()
  const filterOptions = createFilterOptions({
    ignoreCase: true,
    stringify: (option: typeof selectedMultiProxy) => {
      const displayAddress = getDisplayAddress(option) || ''
      return `${option?.proxy}${option?.multisigs[0].address}${accountNames[displayAddress]}` || ''
    }
  })

  const getOptionLabel = useCallback(
    (option?: NonNullable<MultiProxy | string>): string => {
      // We only support one multisigs if they have no proxy

      if (isMultiProxy(option)) {
        const addressToSearch = option?.proxy || option?.multisigs[0].address
        const name = !!addressToSearch && accountNames[addressToSearch]
        return name || (addressToSearch as string)
      }

      return ''
    },
    [accountNames]
  )

  const onChange = useCallback(
    (
      _: React.SyntheticEvent<Element, Event>,
      value: NonNullable<MultiProxy | string | undefined | (string | MultiProxy | undefined)[]>
    ) => {
      if (!value) return

      isMultiProxy(value) && selectMultiProxy(value)
    },
    [selectMultiProxy]
  )

  const handleSpecialKeys = useCallback((e: React.KeyboardEvent) => {
    if (['Enter', 'Escape'].includes(e.key)) {
      ref?.current?.blur()
    }
  }, [])

  const renderOptions = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: typeof selectedMultiProxy
  ): React.ReactNode => {
    const displayAddress = getDisplayAddress(option)
    return (
      <Box
        key={displayAddress}
        component="li"
        {...props}
      >
        <AccountDisplay
          address={displayAddress || ''}
          badge={option?.proxy ? AccountBadge.PURE : AccountBadge.MULTI}
        />
      </Box>
    )
  }

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextFieldLargeStyled
      {...params}
      inputRef={ref}
      label=""
      InputProps={{
        ...params.InputProps,
        startAdornment: (
          <InputAdornment position="start">
            <IdenticonBadge
              address={addressToShow}
              badge={isSelectedProxy ? AccountBadge.PURE : AccountBadge.MULTI}
            />
          </InputAdornment>
        )
      }}
      onKeyDown={handleSpecialKeys}
    />
  )

  if (multiProxyList.length === 0) {
    return null
  }

  if (isLoading) {
    return (
      <BoxStyled>
        <CircularProgress size={24} />
      </BoxStyled>
    )
  }

  return (
    <Autocomplete
      className={className}
      isOptionEqualToValue={isOptionEqualToValue}
      disableClearable
      filterOptions={filterOptions}
      options={multiProxyList}
      renderOption={renderOptions}
      renderInput={renderInput}
      getOptionLabel={getOptionLabel}
      onChange={onChange}
      value={selectedMultiProxy || multiProxyList[0]}
      data-cy="select-multiproxy"
    />
  )
}

const BoxStyled = styled(Box)`
  display: flex;

  .MuiCircularProgress-root {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`

export default styled(MultiProxySelection)`
  min-width: 12.5rem;
  text-align: right;
  width: 100%;

  .MuiTextField-root {
    @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
      min-width: 13.6875rem;
    }

    @media (min-width: ${(props) => props.theme.breakpoints.values.lg}px) {
      min-width: 18.6875rem;
    }
  }

  .MuiAutocomplete-endAdornment {
    right: 1rem !important;
  }

  .MuiAutocomplete-option {
    padding: 0.5rem 0.75rem 0.5rem 1rem;
    flex-shrink: 0;
    border-bottom: 1px solid ${({ theme }) => theme.custom.text.borderColor};

    .MuiBox-root {
      max-width: 12rem;
    }

    &:last-child {
      border-bottom: none;
    }
  }
`

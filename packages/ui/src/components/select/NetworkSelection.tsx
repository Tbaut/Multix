import { ListSubheader, MenuItem, Select as SelectMui, SelectChangeEvent } from '@mui/material'
import { useNetwork } from '../../contexts/NetworkContext'
import { styled } from '@mui/material/styles'
import React, { useCallback, useMemo } from 'react'
import {
  kusamaNetworksAndParachains,
  networkList,
  polkadotNetworksAndParachains,
  testChains
} from '../../constants'
import { theme } from '../../styles/theme'
import { HiOutlineChevronDown } from 'react-icons/hi2'

const NetworkSelection = () => {
  const { selectedNetwork, selectNetwork } = useNetwork()
  // if no ws endpoint is set (in the env) for local nodes, we filter it out
  const networksToShow = useMemo(() => {
    return networkList.local.wsGraphqlUrl
      ? Object.entries(networkList)
      : Object.entries(networkList).filter(([name]) => name !== 'local')
  }, [])

  const handleNetworkSelection = useCallback(
    (event: SelectChangeEvent, children: React.ReactNode | React.ReactNode[]) => {
      selectNetwork(event.target.value)
    },
    [selectNetwork]
  )

  if (!selectedNetwork) {
    return null
  }

  return (
    <SelectStyled
      IconComponent={HiOutlineChevronDown}
      value={selectedNetwork}
      autoWidth={true}
      onChange={(event, children) =>
        handleNetworkSelection(event as SelectChangeEvent<string>, children)
      }
      MenuProps={{
        sx: {
          marginTop: '.75rem',
          '.MuiPaper-root': {
            boxShadow: 'none'
          },

          '.MuiMenuItem-root': {
            maxWidth: '100%',
            padding: '0.75rem'
          },

          '.MuiList-root': {
            columns: '150px 2',
            padding: 0,
            border: `1px solid ${theme.custom.text.borderColor}`,
            borderRadius: '0.5rem'
          },

          '.MuiListSubheader-root': {
            columnSpan: 'all'
          }
        }
      }}
    >
      <ListSubheader>Polkadot & Parachains</ListSubheader>
      {networksToShow
        .filter(([networkName]) => polkadotNetworksAndParachains.includes(networkName))
        .map(([networkName, { logo }]) => (
          <MenuItemStyled
            key={networkName}
            value={networkName}
          >
            <ImgStyled
              alt={`network-logo-${networkName}`}
              src={logo}
            />
            <ItemNameStyled>{networkName}</ItemNameStyled>
          </MenuItemStyled>
        ))}
      <ListSubheader>Kusama & Parachains</ListSubheader>
      {networksToShow
        .filter(([networkName]) => kusamaNetworksAndParachains.includes(networkName))
        .map(([networkName, { logo }]) => (
          <MenuItemStyled
            key={networkName}
            value={networkName}
          >
            <ImgStyled
              alt={`network-logo-${networkName}`}
              src={logo}
            />
            <ItemNameStyled>{networkName}</ItemNameStyled>
          </MenuItemStyled>
        ))}
      <ListSubheader>Testnets</ListSubheader>
      {networksToShow
        .filter(([networkName]) => testChains.includes(networkName))
        .map(([networkName, { logo }]) => (
          <MenuItemStyled
            key={networkName}
            value={networkName}
          >
            <ImgStyled
              alt={`network-logo-${networkName}`}
              src={logo}
            />
            <ItemNameStyled>{networkName}</ItemNameStyled>
          </MenuItemStyled>
        ))}
    </SelectStyled>
  )
}

const SelectStyled = styled(SelectMui)`
  display: inline-flex;
  width: 100%;
  background: ${({ theme }) => theme.palette.primary.white};
  outline: 1.5px solid ${({ theme }) => theme.custom.text.borderColor};
  text-transform: capitalize;
  border-radius: ${({ theme }) => theme.custom.borderRadius};

  @media (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    margin-left: 1rem;
    max-width: fit-content;
  }

  .MuiSelect-select {
    display: flex;
    padding-right: 2.5rem !important;

    @media (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
      padding-right: 2rem !important;
    }

    div:last-child {
      @media (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
        display: none;
      }
    }
  }

  .MuiList-root {
    columns: 100vw 3;
    column-fill: balance;

    @media (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
      columns: 100px 2;
      column-fill: auto;
    }
  }

  svg {
    color: ${({ theme }) => theme.custom.text.black};
    width: 1.25rem;
    height: 1.25rem;
    top: calc(50% - 0.65em);
  }

  .MuiSelect-icon {
    right: 9px;
  }

  .MuiOutlinedInput-notchedOutline {
    border: none;
  }
`

const MenuItemStyled = styled(MenuItem)`
  text-transform: capitalize;
  padding: 0.75rem;
  max-width: 9.1875rem;
  box-sizing: content-box;
`

const ImgStyled = styled('img')`
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  max-height: 2rem;
`

const ItemNameStyled = styled('div')`
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: ${({ theme }) => theme.custom.text.black};
`

export default NetworkSelection

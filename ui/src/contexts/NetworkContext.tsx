import React, { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { NetworkInfo, SupportedNetworks, networkList } from "../constants"

const LOCALSTORAGE_SELECTED_NETWORK = "multix.selectedNetwork"

type NetworkContextProps = {
  children: React.ReactNode | React.ReactNode[]
}

export interface IToastContext {
  selectNetwork: (network: string) => void
  selectedNetworkInfo?: NetworkInfo
  selectedNetwork?: SupportedNetworks
}

const NetworkContext = React.createContext<IToastContext | undefined>(undefined)
const isSupportedNetwork = (network: string): network is SupportedNetworks => !!networkList[network as SupportedNetworks]

const NetworkContextProvider = ({ children }: NetworkContextProps) => {
  const [selectedNetworkInfo, setSelectedNetworkInfo] = useState<NetworkInfo | undefined>()
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetworks | undefined>()
  const [searchParams, setSearchParams] = useSearchParams({ network: "" });

  const selectNetwork = useCallback((network: string) => {
    const newSelectedNetwork = isSupportedNetwork(network)

    if (!newSelectedNetwork) {
      console.error('This network is not supported', network)
      return
    }

    setSelectedNetworkInfo(networkList[network])
    setSelectedNetwork(network)
    setSearchParams({ network })
    localStorage.setItem(LOCALSTORAGE_SELECTED_NETWORK, network)
  }, [setSearchParams])

  useEffect(() => {
    if (!selectedNetwork) {
      const networkParam = searchParams.get("network")

      // connect to the node set in the query string
      if (networkParam) {
        selectNetwork(networkParam)
        return
      }

      // connect the the previously selected network
      const previouslysSelectedNetwork = localStorage.getItem(LOCALSTORAGE_SELECTED_NETWORK)
      if (!!previouslysSelectedNetwork && previouslysSelectedNetwork.includes(networkParam as SupportedNetworks)) {
        selectNetwork(previouslysSelectedNetwork as SupportedNetworks)
        return
      }

      selectNetwork("rococo")
    }
  }, [searchParams, selectNetwork, selectedNetwork])


  return (
    <NetworkContext.Provider
      value={{
        selectNetwork,
        selectedNetwork,
        selectedNetworkInfo
      }}
    >
      {children}
    </NetworkContext.Provider>
  )
}

const useNetwork = () => {
  const context = React.useContext(NetworkContext)
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider")
  }
  return context
}

export { NetworkContextProvider, useNetwork }

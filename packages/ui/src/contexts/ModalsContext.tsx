import { useState, useContext, createContext, useCallback } from 'react'
import ChangeMultisig from '../components/modals/ChangeMultisig'
import EditNames from '../components/modals/EditNames'
import Send from '../components/modals/Send'
import { usePendingTx } from '../hooks/usePendingTx'
import { SignClientTypes } from '@walletconnect/types'
import WCSessionProposal from '../components/modals/WalletConnectSessionProposal'
import ProposalSigningModal, { SigningModalProps } from '../components/modals/ProposalSigning'

interface ModalsContextProps {
  setIsEditModalOpen: (isOpen: boolean) => void
  setIsChangeMultiModalOpen: (isOpen: boolean) => void
  setIsSendModalOpen: (isOpen: boolean) => void
  openWCModal: ({ sessionProposal }: OpenWCModalParams) => void
  onOpenSigningModal: (info: SigningInfo) => void
}

interface OpenWCModalParams {
  sessionProposal: SignClientTypes.EventArguments['session_proposal']
}

type SigningInfo = Omit<SigningModalProps, 'className' | 'onClose'>

const ModalsContext = createContext<ModalsContextProps | undefined>(undefined)

const ModalsContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isChangeMultiModalOpen, setIsChangeMultiModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isWCModalOpen, setIsWCModalOpen] = useState(false)
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false)
  const [signingModalInfo, setSigningModalInfo] = useState<SigningInfo | undefined>()

  const [wCSessionProposal, setWCSessionProposal] = useState<
    OpenWCModalParams['sessionProposal'] | undefined
  >()
  const { refresh } = usePendingTx()
  const onCloseSendModal = useCallback(() => setIsSendModalOpen(false), [setIsSendModalOpen])
  const onCloseEditModal = useCallback(() => setIsEditModalOpen(false), [setIsEditModalOpen])
  const onCloseChangeMultiModal = useCallback(
    () => setIsChangeMultiModalOpen(false),
    [setIsChangeMultiModalOpen]
  )
  const onCloseSigningModal = useCallback(() => {
    setIsSigningModalOpen(false)
    setSigningModalInfo(undefined)
  }, [])

  const onSuccessSendModal = useCallback(() => {
    onCloseSendModal()
    refresh()
  }, [onCloseSendModal, refresh])

  const onFinalizedSendModal = useCallback(() => {
    refresh()
  }, [refresh])

  const openWCModal = useCallback(({ sessionProposal }: OpenWCModalParams) => {
    setWCSessionProposal(sessionProposal)
    setIsWCModalOpen(true)
  }, [])

  const onCloseWCModal = useCallback(() => {
    setIsWCModalOpen(false)
  }, [])

  const onOpenSigningModal = useCallback((info: SigningInfo) => {
    setSigningModalInfo(info)
    setIsSigningModalOpen(true)
  }, [])

  return (
    <ModalsContext.Provider
      value={{
        setIsEditModalOpen,
        setIsChangeMultiModalOpen,
        setIsSendModalOpen,
        openWCModal,
        onOpenSigningModal
      }}
    >
      {children}
      {isSendModalOpen && (
        <Send
          onClose={onCloseSendModal}
          onSuccess={onSuccessSendModal}
          onFinalized={onFinalizedSendModal}
        />
      )}
      {isEditModalOpen && <EditNames onClose={onCloseEditModal} />}
      {isChangeMultiModalOpen && <ChangeMultisig onClose={onCloseChangeMultiModal} />}
      {isWCModalOpen && (
        <WCSessionProposal
          onClose={onCloseWCModal}
          sessionProposal={wCSessionProposal}
        />
      )}
      {isSigningModalOpen && signingModalInfo && (
        <ProposalSigningModal
          possibleSigners={signingModalInfo.possibleSigners}
          onClose={onCloseSigningModal}
          proposalData={signingModalInfo.proposalData}
          onSuccess={signingModalInfo.onSuccess}
        />
      )}
    </ModalsContext.Provider>
  )
}

const useModals = () => {
  const context = useContext(ModalsContext)
  if (context === undefined) {
    throw new Error('useModals must be used within a ModalsContextProvider')
  }
  return context
}

export { ModalsContextProvider, useModals }

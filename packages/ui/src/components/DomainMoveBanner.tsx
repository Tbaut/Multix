import { Alert, IconButton, styled } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { HiOutlineXMark as CloseIcon } from 'react-icons/hi2'
import { Button } from './library'
import { useImportExportLocalData } from '../hooks/useImportExportLocalData'
import { getImportUrl } from '../utils/getImportUrl'

interface Props {
  className?: string
}

const DISMISSED_BANNER_KEY = 'multix.dismissedDomainMoveBanner'

export const DomainMoveBanner = ({ className = '' }: Props) => {
  const [isVisible, setIsVisible] = useState(false)
  const doNotDisplay = localStorage.getItem(DISMISSED_BANNER_KEY) === 'true'
  const isOnMultixCloud = useMemo(() => window.location.hostname.includes('multix.cloud'), [])
  const { encodedData } = useImportExportLocalData()

  useEffect(() => {
    if (!doNotDisplay) {
      setIsVisible(true)
    }
  }, [doNotDisplay])

  const onClose = useCallback(() => {
    // always show it no matter what
    // localStorage.setItem(DISMISSED_BANNER_KEY, 'true')
    setIsVisible(false)
  }, [])

  const onMigrate = useCallback(() => {
    if (!encodedData) return

    window.open(getImportUrl(encodedData))
  }, [encodedData])

  if (!isVisible || isOnMultixCloud) return null

  return (
    <Alert
      severity="info"
      className={className}
    >
      <InfoTextStyled>
        Multix moved to a new domain: multix.cloud
        <Button
          variant="secondary"
          onClick={onMigrate}
        >
          Migrate now
        </Button>
        {/* <Linkstyled href="https://multix.cloud">
          Migrate your data!
          <LaunchIcon
            className="icon"
            size={20}
          />
        </Linkstyled> */}
      </InfoTextStyled>
      <IconButton
        className="closeButton"
        size="small"
        aria-label="close"
        color="inherit"
        onClick={onClose}
      >
        <CloseIcon size={20} />
      </IconButton>
    </Alert>
  )
}

const InfoTextStyled = styled('div')`
  flex: 1;

  & > button {
    margin-left: 1rem;
  }
`

export default styled(DomainMoveBanner)`
  width: 100%;
  margin-bottom: 1rem;

  .MuiAlert-message {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .MuiAlert-icon {
    align-items: center;
  }
`

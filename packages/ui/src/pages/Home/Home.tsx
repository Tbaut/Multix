import { PropsWithChildren, SyntheticEvent, useCallback, useEffect, useState } from 'react'
import { Box, Grid2 as Grid, Tabs, Tab } from '@mui/material'
import { useMultiProxy } from '../../contexts/MultiProxyContext'
import { useSearchParams } from 'react-router'
import SuccessCreation from '../../components/SuccessCreation'
import NewMulisigAlert from '../../components/NewMulisigAlert'
import { styled } from '@mui/material/styles'
import HeaderView from './HeaderView'
import MultisigView from './MultisigView'
import TransactionList from '../../components/Transactions/TransactionList'
import { History } from '../../components/Transactions/History'
import { ConnectOrWatch } from '../../components/ConnectCreateOrWatch'
import { useDisplayLoader } from '../../hooks/useDisplayLoader'
import { useDisplayError } from '../../hooks/useDisplayError'
// import CurrentReferendumBanner from '../../components/CurrentReferendumBanner'
import DomainMoveBanner from '../../components/DomainMoveBanner'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <TabPanelStyled
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </TabPanelStyled>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
    sx: { textTransform: 'none', fontSize: '1.2rem' }
  }
}

interface HomeProps {
  className?: string
}

const Home = ({ className }: HomeProps) => {
  const [searchParams, setSearchParams] = useSearchParams({
    creationInProgress: 'false'
  })
  const [tabValue, setTabValue] = useState(0)

  const handleChangeTab = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }
  const { multiProxyList } = useMultiProxy()
  const [showNewMultisigAlert, setShowNewMultisigAlert] = useState(false)
  const DisplayError = useDisplayError()
  const DisplayLoader = useDisplayLoader()

  const onClosenewMultisigAlert = useCallback(() => {
    setShowNewMultisigAlert(false)
    setSearchParams((prev) => {
      prev.set('creationInProgress', 'false')
      return prev
    })
  }, [setSearchParams])

  useEffect(() => {
    if (searchParams.get('creationInProgress') === 'true') {
      setShowNewMultisigAlert(true)
      setTimeout(() => {
        onClosenewMultisigAlert()
      }, 20000)
    }
  }, [onClosenewMultisigAlert, searchParams])

  if (DisplayLoader) {
    return DisplayLoader
  }

  if (DisplayError) {
    return DisplayError
  }

  if (multiProxyList.length === 0) {
    return (
      <MessageWrapper>
        {showNewMultisigAlert ? <SuccessCreation /> : <ConnectOrWatch />}
      </MessageWrapper>
    )
  }

  return (
    <Grid
      className={className}
      container
    >
      {showNewMultisigAlert && multiProxyList.length > 0 && showNewMultisigAlert && (
        <NewMulisigAlert onClose={onClosenewMultisigAlert} />
      )}
      {/* <CurrentReferendumBanner /> */}
      <DomainMoveBanner />
      <Grid
        alignItems="center"
        size={{ xs: 12 }}
      >
        <HeaderView />
      </Grid>
      <Grid
        alignItems="center"
        size={{ xs: 12, md: 5, lg: 4 }}
      >
        <MultisigView />
      </Grid>
      {multiProxyList.length > 0 && (
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ ml: 6 }}>
              <Tabs
                value={tabValue}
                onChange={handleChangeTab}
                aria-label="transaction tabs"
              >
                <Tab
                  label="Transactions"
                  {...a11yProps(0)}
                />
                <Tab
                  label="History"
                  {...a11yProps(1)}
                />
              </Tabs>
            </Box>
            <TabPanel
              value={tabValue}
              index={0}
              data-cy="container-transaction-list"
            >
              <TransactionList />
            </TabPanel>
            <TabPanel
              value={tabValue}
              index={1}
              data-cy="container-transaction-history"
            >
              <History />
            </TabPanel>
          </Box>
        </Grid>
      )}
    </Grid>
  )
}

const MessageWrapper = (props: PropsWithChildren) => {
  return (
    <Grid
      container
      spacing={2}
    >
      <LoaderBoxStyled>{props.children}</LoaderBoxStyled>
    </Grid>
  )
}

const LoaderBoxStyled = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
`

const TabPanelStyled = styled('div')`
  @media (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    margin-left: 1.5rem;
  }
`

export default Home

import {
  Container,
  Box,
  Button,
  Text,
  FormControl,
  Input,
  NumberInput,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { connect } from 'get-starknet'
import { Contract } from 'starknet'
import { toHex, hexToDecimalString } from 'starknet/dist/utils/number'
import { BigNumber } from 'ethers'

import { addressTruncator } from './utils'
import tokenABI from './tokenABI.json'
import { BN } from 'bn.js'

// Token ABI
const ABI = tokenABI
// Token Contract Address
const CONTRACT_ADDRESS =
  '0x066fa0db3a1072ad2b82400e7d7724956cf04280b99ccc4ce4b38dd0c4225db6'
// Token Decimal big number representaion using the BigNumber library from ethersjs
const DECIMAL = BigNumber.from('1000000000000000000')
// Token Decimal big number representaion using the BN.JS library
const DECIMAL_USING_BNJS = new BN('1000000000000000000')
// Zero as big number using the BN.JS library
const ZERO_MUL_DECIMAL_IN_BNJS = new BN(0).mul(DECIMAL_USING_BNJS)

function App() {
  // State variables starts here
  const [mintObject, setMintObject] = useState({
    isLoading: false,
    amount: 0,
    formIsValid: false,
  })
  const [transferObject, setTransferObject] = useState({
    isLoading: false,
    amount: 0,
    receiver: '',
    formIsValid: false,
  })
  const [approveObject, setApproveObject] = useState({
    isLoading: false,
    amount: 0,
    spender: '',
    formIsValid: false,
  })
  const [balance, setBalance] = useState(0)
  const [contract, setContract] = useState('')
  const [account, setAccount] = useState('')
  const [address, setAddress] = useState('')
  const [trimmedAddress, setTrimmedAddress] = useState('')
  const [connected, setConnected] = useState(false)
  // State variables ends here

  /**
   * Handles getting balance of the connected
   * user as soon as the contract is set, account
   * is changed or address is changed
   */
  useEffect(() => {
    const updateTokenInfo = async () => {
      if (contract !== '') {
        const balance = await getTokenBalance(contract, address)
        setBalance(balance)
      }
    }
    updateTokenInfo()
  }, [contract, account, address])

  /**
   * Handles setting contract when account is set or changed
   */
  useEffect(() => {
    if (account !== '') {
      const contract = new Contract(ABI, CONTRACT_ADDRESS, account)
      setContract(contract)
    }
  }, [account])

  /**
   * Sets `formIsValid` for the mint feature.
   */
  useEffect(() => {
    if (mintObject.amount > 0 && connected) {
      setMintObject({ ...mintObject, formIsValid: true })
    } else {
      setMintObject({ ...mintObject, formIsValid: false })
    }
  }, [mintObject.amount, connected])

  /**
   * Sets `formIsValid` for the transfer feature.
   */
  useEffect(() => {
    if (
      transferObject.amount > 0 &&
      transferObject.receiver !== '' &&
      connected
    ) {
      setTransferObject({ ...transferObject, formIsValid: true })
    } else {
      setTransferObject({ ...transferObject, formIsValid: false })
    }
  }, [transferObject.amount, transferObject.receiver, connected])

  /**
   * Sets `formIsValid` for the approve feature.
   */
  useEffect(() => {
    if (approveObject.amount > 0 && approveObject.spender !== '' && connected) {
      setApproveObject({ ...approveObject, formIsValid: true })
    } else {
      setApproveObject({ ...approveObject, formIsValid: false })
    }
  }, [approveObject.amount, approveObject.spender, connected])

  // ---- MINTING ----
  const handleMinting = async () => {
    setMintObject({ ...mintObject, isLoading: true })
    try {
      const _mintAmount = new BN(mintObject.amount)
      const res = await contract.mint(address, [
        _mintAmount.mul(DECIMAL_USING_BNJS),
        ZERO_MUL_DECIMAL_IN_BNJS,
      ])
      setMintObject({ ...mintObject, amount: 0 })
      alert(`Hash: ${res.transaction_hash}`)
      setMintObject({ ...mintObject, isLoading: false })
    } catch (err) {
      alert(err.message)
      setMintObject({ ...mintObject, isLoading: false })
    }
  }

  const handleMintAmount = (value) => {
    const amount = parseInt(value)
    if (amount > 0) {
      setMintObject({ ...mintObject, amount })
    } else {
      setMintObject({ ...mintObject, amount: 0 })
    }
  }

  // ---- TRANSFER ----
  const handleTransfer = async () => {
    setTransferObject({ ...transferObject, isLoading: true })
    try {
      const _transferAmount = new BN(transferObject.amount)
      const _receiver = transferObject.receiver
      const res = await contract.transfer(_receiver, [
        _transferAmount.mul(DECIMAL_USING_BNJS),
        ZERO_MUL_DECIMAL_IN_BNJS,
      ])
      setTransferObject({ ...transferObject, amount: 0 })
      alert(`Hash: ${res.transaction_hash}`)
      setTransferObject({ ...transferObject, isLoading: false })
    } catch (err) {
      alert(err.message)
      setTransferObject({ ...transferObject, isLoading: false })
    }
  }

  const handleReceiverAddress = (event) => {
    const receiver = event.target.value
    if (receiver.length === 66) {
      setTransferObject({ ...transferObject, receiver })
    } else {
      setTransferObject({ ...transferObject, receiver: '' })
    }
  }

  const handleTransferAmount = (value) => {
    console.log('Tets')
    const amount = parseInt(value)
    if (amount > 0) {
      setTransferObject({ ...transferObject, amount })
    } else {
      setTransferObject({ ...transferObject, amount: 0 })
    }
  }

  // ---- APPROVAL ----
  const handleApproval = async () => {
    setApproveObject({ ...approveObject, isLoading: true })
    try {
      const _approveAmount = new BN(approveObject.amount)
      const _spender = approveObject.spender
      const res = await contract.approve(_spender, [
        _approveAmount.mul(DECIMAL_USING_BNJS),
        ZERO_MUL_DECIMAL_IN_BNJS,
      ])
      setApproveObject({ ...approveObject, amount: 0 })
      alert(`Hash: ${res.transaction_hash}`)
      setApproveObject({ ...approveObject, isLoading: false })
    } catch (err) {
      alert(err.message)
      setApproveObject({ ...approveObject, isLoading: false })
    }
  }

  const handleSpenderAddress = (event) => {
    const spender = event.target.value
    if (spender.length === 66) {
      setApproveObject({ ...approveObject, spender })
    } else {
      setApproveObject({ ...approveObject, spender: '' })
    }
  }

  const handleApproveAmount = (value) => {
    const amount = parseInt(value)
    if (amount > 0) {
      setApproveObject({ ...approveObject, amount })
    } else {
      setApproveObject({ ...approveObject, amount: 0 })
    }
  }

  /**
   * Handles wallet connection
   */
  const connectWallet = async () => {
    try {
      const starknet = await connect()
      if (!starknet.isConnected) {
        await starknet.enable({ starknetVersion: 'v4' })
        setAccount(starknet.account)
        setAddress(starknet.account.address)
        setConnected(true)
        const truncatedAddress = addressTruncator(starknet.account.address)
        setTrimmedAddress(truncatedAddress)
      } else {
        setAccount(starknet.account)
        setAddress(starknet.account.address)
        setConnected(true)
        const truncatedAddress = addressTruncator(starknet.account.address)
        setTrimmedAddress(truncatedAddress)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="App">
      <Container maxW="1200px" bg="white">
        <Box height={100}>
          <Text fontSize="5xl" float="left" marginTop="3" marginLeft="7">
            Godspower Eze Token
          </Text>
          {!connected ? (
            <Button
              onClick={() => connectWallet()}
              padding={5}
              marginTop="6"
              float="right"
            >
              Connect Wallet
            </Button>
          ) : (
            <Button padding={5} marginTop="6" float="right">
              <Text as="b">Streamify Token:</Text>
              <Text>{balance} </Text>
              <Text>---{trimmedAddress}</Text>
            </Button>
          )}
        </Box>
        <Box margin="6">
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Mint
          </Text>
          <FormControl isRequired>
            <NumberInput
              min={0}
              marginRight="3"
              marginLeft="3"
              onChange={handleMintAmount}
            >
              <NumberInputField placeholder="Enter Amount" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          {!mintObject.formIsValid ? (
            <Button mt={4} ml={2} colorScheme="teal" type="submit" isDisabled>
              Mint
            </Button>
          ) : mintObject.isLoading ? (
            <Button
              isLoading
              loadingText="Minting..."
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
            ></Button>
          ) : (
            <Button
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
              onClick={handleMinting}
            >
              Mint
            </Button>
          )}
        </Box>
        <Box margin="6">
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Transfer
          </Text>
          <FormControl isRequired>
            <Input
              type="email"
              placeholder="Enter Address"
              marginRight="3"
              marginLeft="3"
              marginTop="3"
              marginBottom="3"
              onChange={handleReceiverAddress}
            />
          </FormControl>
          <FormControl isRequired>
            <NumberInput
              min={0}
              max={balance}
              marginRight="3"
              marginLeft="3"
              onChange={handleTransferAmount}
            >
              <NumberInputField placeholder="Enter Amount" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          {!transferObject.formIsValid ? (
            <Button mt={4} ml={2} colorScheme="teal" type="submit" isDisabled>
              Transfer
            </Button>
          ) : transferObject.isLoading ? (
            <Button
              isLoading
              loadingText="Transferring..."
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
            ></Button>
          ) : (
            <Button
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
              onClick={handleTransfer}
            >
              Transfer
            </Button>
          )}
        </Box>
        <Box margin="6">
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Approve
          </Text>
          <FormControl isRequired>
            <Input
              type="email"
              placeholder="Enter Spender Address"
              marginRight="3"
              marginLeft="3"
              marginTop="3"
              marginBottom="3"
              onChange={handleSpenderAddress}
            />
          </FormControl>
          <FormControl isRequired>
            <NumberInput
              min={0}
              max={balance}
              marginRight="3"
              marginLeft="3"
              onChange={handleApproveAmount}
            >
              <NumberInputField placeholder="Enter Amount" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          {!approveObject.formIsValid ? (
            <Button mt={4} ml={2} colorScheme="teal" type="submit" isDisabled>
              Approve
            </Button>
          ) : approveObject.isLoading ? (
            <Button
              isLoading
              loadingText="Approving..."
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
            ></Button>
          ) : (
            <Button
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
              onClick={handleApproval}
            >
              Approve
            </Button>
          )}
        </Box>
      </Container>
    </div>
  )
}

const getTokenBalance = async (_contract, _account) => {
  try {
    const balanceAsUINT256_Struct = await _contract.balanceOf(_account)
    const balance = balanceAsUINT256_Struct.balance.low
    const balanceAsHex = toHex(balance)
    const balanceAsString = hexToDecimalString(balanceAsHex)
    const balanceAsBigNumber = BigNumber.from(balanceAsString)
    const balanceAsInt = balanceAsBigNumber.div(DECIMAL).toNumber()
    return balanceAsInt
  } catch (err) {
    console.error(err)
    return 0
  }
}

export default App

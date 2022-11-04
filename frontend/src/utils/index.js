import { Buffer } from 'buffer'

export const addressTruncator = (address) => {
  let _address = address.substring(0, 10)
  return _address
}

export function feltToString(felt) {
  const newStrB = Buffer.from(felt.toString(16), 'hex')
  return newStrB.toString()
}

export function stringToFelt(str) {
  return '0x' + Buffer.from(str).toString('hex')
}

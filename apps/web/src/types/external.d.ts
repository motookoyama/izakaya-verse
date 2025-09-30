declare module 'qrcode' {
  type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
  interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: QRErrorCorrectionLevel
    margin?: number
    width?: number
  }
  const QRCode: {
    toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>
  }
  export default QRCode
}

declare module 'pako' {
  interface DeflateOptions {
    to?: 'string' | 'uint8array'
    level?: number
  }
  function deflate(data: string | Uint8Array, options?: DeflateOptions): any
  const pako: {
    deflate: typeof deflate
  }
  export { deflate }
  export default pako
}

let requestId = -1

/**
 * Create a 16bit request id.
 */
export const createRequestId = () => {
  requestId++
  if (requestId > 65535) requestId = 0
  return requestId
}

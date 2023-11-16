/* eslint-disable turbo/no-undeclared-env-vars */
import log from './log'

const basePath: string = process.env.NEXT_PUBLIC_BASE_PATH ?? '/'
const isProduction: boolean = process.env.NEXT_PUBLIC_PRODUCTION === 'true'
const isDebug: boolean = process.env.NEXT_PUBLIC_DEBUG === 'true'

const config = {
  basePath,
  isProduction,
  isDebug,
}

log.debug('config=', config)
export default config

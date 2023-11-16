import minilog, { enable } from 'minilog'
import { HW_ID } from './constant'

enable()

export default minilog(HW_ID)

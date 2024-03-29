import type { ConnectionState } from '@ktaicoder/hw-pet'
import type { EventEmitter } from 'eventemitter3'

export type MartyConnectionState = ConnectionState | 'verifying'

type UiEventMap = {
  sample: (some: any) => void
}

export type CustomUiEvents = EventEmitter<UiEventMap>

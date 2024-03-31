'use client'

import martyConnector from '@/hw/marty/MartyConnector'
import { RICConnEvent } from '@robotical/ricjs'
import { useEffect, useMemo, useState } from 'react'

/**
 * connection verifying random colours hook
 * @returns random colours array
 */
export function useConnectionVerifyingCorrectRIC(): {
  randomColours: string[]
} {
  const [randomColours, setRandomColours] = useState<string[]>([])

  // Create subscription to the marty connector state
  useEffect(() => {
    const martyConnectorSubscriptionHelper = {
      notify(
        eventType: string,
        eventEnum: RICConnEvent,
        eventName: string,
        eventData: string | object | null | undefined,
      ) {
        switch (eventType) {
          case 'conn':
            switch (eventEnum) {
              case RICConnEvent.CONN_VERIFYING_CORRECT_RIC:
                setRandomColours(eventData as string[])
                break
              default:
                break
            }
            break
        }
      },
    }

    // Subscribe
    martyConnector.subscribe(martyConnectorSubscriptionHelper, ['conn'])
    // Return unsubscribe function
    return () => {
      martyConnector.unsubscribe(martyConnectorSubscriptionHelper)
    }
  }, [])

  return useMemo(
    () => ({
      randomColours,
    }),
    [randomColours],
  )
}

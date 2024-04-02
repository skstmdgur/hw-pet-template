'use client';

import type {
  ConnectionState,
  HPetCommandRunnerClassType,
  IHPetCommandRunner,
} from '@ktaicoder/hw-pet';
import { HPet, HPetNotifyEventKeys } from '@ktaicoder/hw-pet';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Result<T> {
  pet: HPet | undefined;
  commandRunner: T | undefined;
  connectionState: ConnectionState;
}

export function usePet<T extends IHPetCommandRunner, C extends HPetCommandRunnerClassType<T>>(
  hwId: string,
  commandRunnerClass: C,
): Result<InstanceType<C>> {
  const searchParams = useSearchParams();
  const iframeToken = useMemo(
    () => getIframeToken(searchParams.get('iframeToken')),
    [searchParams],
  );
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [commandRunner, setCommandRunner] = useState<InstanceType<C>>();
  const [petInstance, setPetInstance] = useState<HPet>();

  useEffect(() => {
    const pet = new HPet({
      iframeToken,
      hwId,
      commandRunnerClass,
    });
    pet.notifyEvents.on(HPetNotifyEventKeys.CommandRunner.stateChanged, (data) => {
      const { state, commandRunner } = data;
      if (state === 'started') {
        setCommandRunner(commandRunner as InstanceType<C>);
      } else {
        setCommandRunner(undefined);
      }
    });
    pet.notifyEvents.on(HPetNotifyEventKeys.connectionStateChanged, setConnectionState);

    pet.start();
    setPetInstance(pet);
    return () => {
      // all event listeners will be automatically removed
      pet.stop();
      setCommandRunner(undefined);
    };
  }, [hwId, iframeToken, commandRunnerClass]);

  return useMemo(
    () => ({ pet: petInstance, commandRunner, connectionState }),
    [petInstance, commandRunner, connectionState],
  );
}

export function getIframeToken(iframeToken: string | null): string {
  if (iframeToken) {
    console.log(' iframeToken:', iframeToken);
    return iframeToken;
  }

  console.log('invalid iframeToken:', iframeToken);
  return 'unknown';
}

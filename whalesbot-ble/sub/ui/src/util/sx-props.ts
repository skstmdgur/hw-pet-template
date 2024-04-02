import type { SxProps, Theme } from '@mui/material';

/**
 * Creates an array by flattening SxProps
 * @param sxArray - array of SxProps
 * @returns SxProps
 */
export function flatSx<T extends Theme = Theme>(
  ...sxArray: (SxProps<T> | undefined | false | null)[]
): SxProps<T> {
  return sxArray
    .filter(Boolean) // filter undefined
    .flatMap((sx) => (Array.isArray(sx) ? sx : [sx ?? false]))
    .filter((it) => it !== false);
}

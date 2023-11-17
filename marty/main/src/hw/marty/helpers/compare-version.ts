import semverGt from "semver/functions/gt";

export default function isVersionGreater(v1: string, v2: string) {
  try {
    return semverGt(v1, v2);
  } catch (e) {
    console.log(e, v1, v2);
    return false;
  }
}

export function isVersionGreater_errorCatching(v1: string, v2: string): boolean | null {
  try {
    return semverGt(v1, v2);
  } catch (e) {
    console.log(e, v1, v2);
    return null;
  }
}
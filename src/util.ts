import { parsePath } from 'history';

const paramRe = /^:\w+$/;
const dynamicSegmentValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;
const isSplat = (s: string) => s === '*';

function computeScore(path: string) {
  let segments = path.split('/');
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }

  return segments
    .filter(s => !isSplat(s))
    .reduce(
      (score, segment) =>
        score +
        (paramRe.test(segment)
          ? dynamicSegmentValue
          : segment === ''
          ? emptySegmentValue
          : staticSegmentValue),
      initialScore
    );
}

function compilePath(path: string, end: boolean, caseSensitive: boolean) {
  let keys: string[] = [];
  let pattern =
    '^(' +
    path
      .replace(/^\/+/, '') // Ignore leading /
      .replace(/\*\//g, '') // Ignore */ (from paths nested under a *)
      .replace(/\/?\*?$/, '') // Ignore trailing /*, we'll handle it below
      .replace(/[\\.*+^$?{}|()[\]]/g, '\\$&') // Escape special regex chars
      .replace(/:(\w+)/g, (_, key) => {
        keys.push(key);
        return '([^\\/]+)';
      }) +
    ')';

  if (path.endsWith('*')) {
    if (path.endsWith('/*')) {
      pattern += '\\/?'; // Don't include the / in params['*']
    }
    keys.push('*');
    pattern += '(.*)';
  } else if (end) {
    pattern += '\\/?';
  }

  if (end) pattern += '$';

  let flags = caseSensitive ? undefined : 'i';
  let matcher = new RegExp(pattern, flags);

  return [matcher, keys];
}

function createParams(keys: string[], values: any) {
  return keys.reduce((params, key, index) => {
    // TODO: Use decodeURIComponent here to decode values?
    // @ts-ignore
    params[key] = values[index];
    return params;
  }, {});
}

const trimTrailingSlashes = (path: string) => path.replace(/\/+$/, '');
const normalizeSlashes = (path: string) => path.replace(/\/\/+/g, '/');
const joinPaths = (paths: string[]) => normalizeSlashes(paths.join('/'));
const splitPath = (path: string) => normalizeSlashes(path).split('/');

function resolvePathname(toPathname: string, fromPathname: string) {
  let segments = splitPath(trimTrailingSlashes(fromPathname));
  let relativeSegments = splitPath(toPathname);

  relativeSegments.forEach(segment => {
    if (segment === '..') {
      // Keep the root "" segment so the pathname starts at /
      if (segments.length > 1) segments.pop();
    } else if (segment !== '.') {
      segments.push(segment);
    }
  });

  return segments.length > 1 ? joinPaths(segments) : '/';
}

/**
 * Returns a fully resolve location object relative to the given pathname.
 */
function resolveLocation(to: string, fromPathname = '/') {
  let { pathname: toPathname, search = '', hash = '' } =
    typeof to === 'string' ? parsePath(to) : to;

  let pathname = toPathname
    ? toPathname.startsWith('/')
      ? resolvePathname(toPathname, '/')
      : resolvePathname(toPathname, fromPathname)
    : fromPathname;

  return { pathname, search, hash };
}

/**
 * Creates a path with params interpolated.
 */
function generatePath(pathname: string, params = {}) {
  return (
    pathname
      // @ts-ignore
      .replace(/:(\w+)/g, (_, key) => params[key] || `:${key}`)
      // @ts-ignore
      .replace(/\*$/, splat => params[splat] || splat)
  );
}

export {
  computeScore,
  compilePath,
  createParams,
  trimTrailingSlashes,
  normalizeSlashes,
  joinPaths,
  splitPath,
  resolvePathname,
  resolveLocation,
  generatePath,
};

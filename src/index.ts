import * as _utils from './utils';
import { defaultOptions } from './options';
import cwlog from 'chowa-log';

cwlog.setProject('cwfont');

export { default as generator } from './generator';
export const utils = _utils;
export const config = defaultOptions;

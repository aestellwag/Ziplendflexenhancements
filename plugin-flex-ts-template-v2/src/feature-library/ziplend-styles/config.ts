import { getFeatureFlags } from '../../utils/configuration';
import ZiplendStylesConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.ziplend_styles as ZiplendStylesConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

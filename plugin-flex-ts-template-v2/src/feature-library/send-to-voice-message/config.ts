import { getFeatureFlags } from '../../utils/configuration';
import SendToVoiceMessageConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.send_to_voice_message as SendToVoiceMessageConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

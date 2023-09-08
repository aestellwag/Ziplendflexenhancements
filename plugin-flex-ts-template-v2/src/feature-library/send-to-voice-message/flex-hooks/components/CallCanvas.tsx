import * as Flex from '@twilio/flex-ui';

import SendToVoiceMessageButton from '../../custom-components/SendToVoiceMessageButton';
import { isFeatureEnabled } from '../../config';
import { FlexComponent } from '../../../../types/feature-loader';

export const componentName = FlexComponent.CallCanvas;
export const componentHook = function addSupervisorCoachingPanelToAgent(flex: typeof Flex, _manager: Flex.Manager) {
  if (!isFeatureEnabled()) return;
  // Add the Send to Voice Message to the CallCanvas
  flex.CallCanvas.Content.add(<SendToVoiceMessageButton key="send-to-voice-message"> </SendToVoiceMessageButton>, {
    sortOrder: 1,
  });
};

import * as Flex from '@twilio/flex-ui';

import { isFeatureEnabled } from '../../config';
import { FlexComponent } from '../../../../types/feature-loader';

export const componentName = FlexComponent.MainHeader;
export const componentHook = function removeComponents() {
  if (!isFeatureEnabled()) return;
  Flex.MainHeader.Content.remove('logo');
};

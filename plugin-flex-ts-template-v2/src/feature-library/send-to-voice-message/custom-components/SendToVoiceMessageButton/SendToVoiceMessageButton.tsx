import React, { useEffect, useState } from 'react';
import { TaskHelper, useFlexSelector, ITask, IconButton } from '@twilio/flex-ui';
import { Menu, MenuItem, MenuButton, useMenuState } from '@twilio-paste/core/menu';
import { SkeletonLoader } from '@twilio-paste/core/skeleton-loader';
import { Flex } from '@twilio-paste/core';

import SendVoiceMessageService from '../../utils/serverless/SendVoiceMessageService';

type SendToVoiceMessageButtonProps = {
  task: ITask;
};

export const SendToVoiceMessageButton = ({ task }: SendToVoiceMessageButtonProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [prompts, setPrompts] = useState<any | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  let fullName: string = useFlexSelector((state) => state?.flex?.worker?.worker?.fullName) || '';
  fullName = fullName.replace(/\s+/g, '').toLowerCase();
  const menu = useMenuState({
    placement: 'top-start',
    wrap: 'horizontal',
  });

  const sendToVoiceMessageClick = (voicePrompt: string) => {
    const conferenceObject = task && task.conference;
    const customerConferenceObject = conferenceObject?.source.channelParticipants.find((p) => p.type === 'customer');
    const customerParticipant: string = customerConferenceObject?.mediaProperties.callSid || '';
    const voiceMessage: string = `${voiceUrl}${fullName}/${voicePrompt}`;
    SendVoiceMessageService.sendVoiceMessageAndUpdateParticipant(customerParticipant, voiceMessage);
  };
  // Fetching the Voice Prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const voiceMessageList = await SendVoiceMessageService.queryAssets(fullName);
        if (voiceMessageList && voiceMessageList.people && voiceMessageList.people.length > 0) {
          setPrompts(voiceMessageList.people[0].prompts);
          setVoiceUrl(voiceMessageList.url);
        }
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPrompts();
  }, []);

  // Return the send to voice message button, disable if the call isn't live
  const isLiveCall = TaskHelper.isLiveCall(task);
  return (
    <Flex hAlignContent="center" vertical padding="space100">
      {isLoading && <SkeletonLoader />}
      {(!prompts || prompts.length === 0) && !isLoading && <p>No Voice Prompts Loaded</p>}
      {prompts && prompts.length > 0 && !isLoading && (
        <div>
          <MenuButton {...menu} variant="reset" disabled={!isLiveCall} element="SEND_TO_VOICE_MESSAGE_BUTTON">
            <IconButton icon={'VoiceBold'} variant="secondary"></IconButton>
            <Menu {...menu} aria-label="send-to-voice-message-prompts">
              {prompts?.map((prompt: string, index: number) => (
                <MenuItem {...menu} key={index} onClick={() => sendToVoiceMessageClick(prompt)}>
                  {prompt}
                </MenuItem>
              ))}
            </Menu>
          </MenuButton>
        </div>
      )}
    </Flex>
  );
};

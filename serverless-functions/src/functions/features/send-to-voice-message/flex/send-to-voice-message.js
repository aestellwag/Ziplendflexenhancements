const { prepareFlexFunction, extractStandardResponse } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);
const ConferenceOperations = require(Runtime.getFunctions()['common/twilio-wrappers/conference-participant'].path);

const requiredParameters = [
  {
    key: 'conference',
    purpose: 'conference sid to target for changes',
  },
  {
    key: 'agentParticipant',
    purpose: 'agents participant sid to target for conference changes',
  },
  {
    key: 'customerParticipant',
    purpose: 'customers participant sid to target for conference changes',
  },
  {
    key: 'voiceMessage',
    purpose: 'Voice URL to leverage in the announceURL',
  },
];
exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const { conference, agentParticipant, customerParticipant, voiceMessage } = event;
    // Play the TwiML message to the participant
    const client = context.getTwilioClient();
    const voiceURL = voiceMessage;
    await client.conferences(conference).participants(customerParticipant).update({
      announceUrl: voiceURL,
    });
    // Need to update endConferenceOnExit Flag to false for the agent so it doesn't end the conference when we remove them
    await client.conferences(conference).participants(agentParticipant).update({
      endConferenceOnExit: `false`,
    });
    const participant = agentParticipant;
    const result = await ConferenceOperations.removeParticipant({
      context,
      conference,
      participant,
    });
    response.setStatusCode(result.status);
    response.setBody({
      conference: result.conference,
      ...extractStandardResponse(result),
    });
    return callback(null, response);
  } catch (error) {
    return handleError(error);
  }
});

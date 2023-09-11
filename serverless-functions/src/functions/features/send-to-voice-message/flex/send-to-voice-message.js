const { prepareFlexFunction, extractStandardResponse } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);
const ConferenceOperations = require(Runtime.getFunctions()['common/twilio-wrappers/conference-participant'].path);
const axios = require('axios');

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
    const client = context.getTwilioClient();
    const voiceURL = voiceMessage;

    // Since we are testing asset audio paths it will return 200 if the asset is public or 403 if it's private.  Let's also treat 403s as a success
    const modifiedAxios = axios.create({
      validateStatus(status) {
        return status === 200 || status === 403;
      },
    });

    // Let's ensure the URL provide is valid, if it isn't, we return the error and keep the agent connects
    const urlResponse = await modifiedAxios.get(voiceURL);
    if (urlResponse.status === 403 || urlResponse.status === 200) {
      console.log('URL is valid');
    } else {
      console.log('URL is not valid');
      return handleError(
        `The asset ${voiceURL} - is returning a ${urlResponse}, please check you have the prompts.json asset configured properly`,
      );
    }
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
    return handleError(
      `The asset ${voiceURL} - is returning a ${error}, please check you have the prompts.json asset configured properly`,
    );
  }
});

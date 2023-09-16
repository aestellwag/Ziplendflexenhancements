const { prepareFlexFunction, extractStandardResponse } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);
const VoiceOperations = require(Runtime.getFunctions()['common/twilio-wrappers/programmable-voice'].path);
const axios = require('axios');

const requiredParameters = [
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
    const { customerParticipant, voiceMessage } = event;
    const voiceURL = voiceMessage;
    const domain = `https://${context.DOMAIN_NAME}`;

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
        `The asset is returning a ${urlResponse}, please check you have the prompts.json asset configured properly`,
      );
    }

    const callSid = customerParticipant;
    const result = await VoiceOperations.updateCall({
      context,
      callSid,
      params: {
        method: 'POST',
        url: `https://custom-flex-extensions-serverless-9083-dev.twil.io/features/send-to-voice-message/flex/build-twiml?audioUrl=${encodeURIComponent(
          voiceURL,
        )}`,
      },
    });

    console.log('Result = ', result);

    response.setStatusCode(result.status);
    response.setBody({
      conference: result.conference,
      ...extractStandardResponse(result),
    });
    return callback(null, response);
  } catch (error) {
    return handleError(
      `The asset is returning a ${error}, please check you have the prompts.json asset configured properly`,
    );
  }
});

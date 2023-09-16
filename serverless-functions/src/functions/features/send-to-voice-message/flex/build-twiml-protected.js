// eslint-disable-next-line func-names
exports.handler = function (context, event, callback) {
  const { audioUrl } = event;
  try {
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.play({}, audioUrl);
    return callback(null, twiml);
  } catch (error) {
    return handleError(error);
  }
};

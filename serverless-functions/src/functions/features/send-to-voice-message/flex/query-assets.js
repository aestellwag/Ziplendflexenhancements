const { prepareFlexFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [
  {
    key: 'fullName',
    purpose: 'Full Name of the agent required to pull back any prompts from the json asset',
  },
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  const assetPath = '/features/send-to-voice-message/prompts.json';
  const { fullName } = event;
  try {
    // load data
    const openData = Runtime.getAssets()[assetPath].open;
    const data = JSON.parse(openData());
    const filteredData = { ...data };
    // Adding a replace for spaces and capital letters to normalize the fullNames, just incase they are not typed correctly in the prompst.json asset
    filteredData.people = data.people.filter((person) => person.name.replace(/\s+/g, '').toLowerCase() === fullName);
    response.setBody(filteredData);
    return callback(null, response);
  } catch (error) {
    return handleError(error);
  }
});

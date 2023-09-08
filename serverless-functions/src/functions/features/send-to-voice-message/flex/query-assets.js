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
    const filteredData = { ...data }; // create the copy of original data
    filteredData.people = data.people.filter((person) => person.name === fullName);
    console.warn('Original');
    console.warn(data);
    console.warn('Filtered');
    console.warn(filteredData);
    response.setBody(filteredData);
    return callback(null, response);
  } catch (error) {
    return handleError(error);
  }
});

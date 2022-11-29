const axios = require('axios');

exports.main = async (event, callback) => {
  // Set this to the quote ID
  const quoteID = event.inputFields['quoteID'];

  // SET THIS TO THE TEMPLATE ID OF YOUR CUSTOM QUOTE TEMPLATE
  // The ID can be retrieved from the URL when you're editing you custom quote template
  const templateID = undefined;

  await axios({
    method: 'put',
    url: `https://api.hubapi.com/crm/v3/objects/quote/${quoteID}/associations/quote_template/${templateID}/quote_to_quote_template`,
    headers: { 'Authorization': `Bearer ${process.env.secretName}`, 'Content-Type': 'application/json' },
  }).then((response) => {
    console.log(`Succesfully associated custom quote template ${templateID} to quote ${quoteID}`)
  }).catch((error) => {
    console.log(error.response.data)
    throw new Error(error.response.data)
  })
}


const axios = require('axios');

exports.main = async (event, callback) => {

  // Make sure to include the record ID of your deal in this deal based workflow
  const dealId = event.inputFields['hs_object_id'];
  
  const lineItemIds = await axios({
    method: 'get',
    url: `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?archived=false&associations=line_items`,
    headers: {
      'Authorization': `Bearer ${process.env.SECRET_TOKEN}`, // Update this with a private app token stored in your workflow secrets
      'Content-Type': 'application/json'
    }
  }).then(async (response) => {
    console.log(`Succesfully retrieved deal ${dealId} and it's associated lineitem IDs`)
    if (response.data.associations && response.data.associations['line items'] && response.data.associations['line items'].results) {
      return response.data.associations['line items'].results.map((lineItem) => {
        return {
          id: lineItem.id
        }
      })
    } else {
      return []
    }
  }).catch((error) => {
    console.log(`Error while getting deal ${dealId} and it's associated lineitem IDs: ${error}`)
    return null
  })
  
  if (lineItemIds.length) {
    console.log(`Deleting ${lineItemIds.length} lineitems from deal ${dealId}`)
    const data = {
      inputs: lineItemIds
    }
    
    await axios({
      method: 'post',
      url: `https://api.hubapi.com/crm/v3/objects/line_items/batch/archive`,
      headers: {
        'Authorization': `Bearer ${process.env.SECRET_TOKEN}`, // Update this with a private app token stored in your workflow secrets
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(data)
    }).then(async (response) => {
      if (response) {
        console.log(`Succesfully deleted ${lineItemIds.length} lineitems for deal ${dealId}`)
      }
    }).catch((error) => {
      console.log(`Error while deleting lineitems for deal ${dealId}: ${error}`)
      return null
    })
  }
  
  callback({
    outputFields: {
      lineItemIds: lineItemIds
    }
  });
}
const axios = require('axios');

exports.main = async (event, callback) => {
  let date = ''
  let time = ''

  // MAKE SURE TO SET THE RECORD ID AS INCLUDED PROPERTY
  const contactID = event.inputFields['hs_object_id'];

  // We will first retrieve the last 10 meetings of the contact and return the ID of each meeting
  const associatedMeetings = await axios({
    method: 'get',
    url: `https://api.hubapi.com/crm/v3/objects/contacts/${contactID}/associations/meetings/?limit=10`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.secretName}`
    }
  }).then((response) => {
	  if (response.data.results.length > 0) {
      console.log(`Found ${response.data.results.length} meetings for contact ${contactID}`)
      return response.data.results.map((result) => { 
      	return {
          id: result.id
        }
      })
    } else {
      return false
    }
  }).catch((error) => {
    console.log(error)
  })
  
  if (associatedMeetings) {
    const data = {
     properties: [
        "hs_timestamp",
        "hs_meeting_start_time"
      ],
      inputs: associatedMeetings
    }
    
    // We will get the above properties for the last 10 meetings
    const latestMeeting = await axios({
      method: 'post',
      url: `https://api.hubapi.com/crm/v3/objects/meetings/batch/read?archived=false`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.secretName}`
      },
      data: JSON.stringify(data)
    }).then((response) => {
      if (response.data.results) { 
        // We will use the reduce function to get the last meeting based on the createdAt property
      	return response.data.results.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
      }
    }).catch((error) => {
      console.log(error.response.data)
    })
    
    // If we have an meeting available, we will format the date and time so we can use it in a copy to property action
    if (latestMeeting) {
      const dateObject = new Date(latestMeeting.properties.hs_meeting_start_time)
      date = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate())
      time = latestMeeting.properties.hs_meeting_start_time ? `${String(dateObject.getHours()).padStart(2, '0')}:${String(dateObject.getMinutes()).padStart(2, '0')}` : '';
    }
  }

  // Give the new values back to the workflow to use in a copy property action
  callback({
    outputFields: {
      date: date,
      time: time,
    }
  });
}
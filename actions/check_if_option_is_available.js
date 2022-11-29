/**
 * This code is used to check if a select property has an option available for the value included in the coded action
 * This can be used to add the option if it does not exist
 * You can then set the value as an outputField (enumeration) and use it in a copy to property action to set the enumeration field
 */

const axios = require('axios');

exports.main = async (event, callback) => {
  // Make sure to include the property you want to check for
  const valueToCheck = event.inputFields['property'];

  // REPLACE WITH THE DESIRED PROPERTY YOU WANT TO CHECK FOR AND THE OBJECT TYPE
  const propertyName = undefined;
  const object = undefined;
  
  try {
	  if (valueToCheck) {
      const currentData = await axios({
        method: 'get',
        url: `https://api.hubapi.com/crm/v3/properties/${object}/${propertyName}?archived=false`,
        headers: {
          'Authorization': `Bearer ${process.env.secretName}`,
          'Content-Type': 'application/json'
        }
      }).then(async (response) => {
        // We use a find function to check if the value is already an option
        const exists = await response.data.options.find((option) => option.value === valueToCheck) ? true : false
        if (!exists) {
          console.log(`${valueToCheck} is not an option for the ${object} property ${propertyName}, trying to add ${valueToCheck} as option`)
          return response.data
        } else {
          console.log(`${valueToCheck} is already an option for the ${object} property ${propertyName}`)
          return false
        }
      }).catch((error) => {
        console.log(`Error while getting options for the ${object} property ${propertyName}: ${error.response.data.message}`)
        return null
      })

      // If currentData has a value, we know that the current value in this coded action is not available as an option, so we will try to add it.
      if (currentData) {
        const data = {
          label: currentData.label,
          type: currentData.type,
          fieldType: currentData.fieldType,
          description: currentData.description,
          groupName: currentData.groupName,
          hidden: currentData.hidden,
          displayOrder: currentData.displayOrder,
          formField: currentData.formField,
          options: currentData.options
        }

        data.options.push({
          label: valueToCheck,
          value: valueToCheck,
          hidden: false,
          displayOrder: currentData.options.length + 1
        })

        await axios({
          method: 'patch',
          url: `https://api.hubapi.com/crm/v3/properties/${object}/${propertyName}`,
          headers: {
            'Authorization': `Bearer ${process.env.secrentName}`,
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(data)
        }).then((response) => {
          if (response) {
            console.log(`Added option ${valueToCheck} to ${propertyName}`)
            return true
          } else {
            return null
          }
        }).catch((error) => {
          console.log(`Error adding ${valueToCheck} to ${propertyName}: ${error}`)
          return null
        })
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }

  // Make sure to set the output to the type 'enumeration' to be able to use it in a copy to property action
  callback({
    outputFields: {
      outputValue: valueToCheck
    }
  });
}

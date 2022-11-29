exports.main = async (event, callback) => {
  callback({
    outputFields: {
      newNumberValue: Number(event.inputFields['your_property'])
    }
  });
}
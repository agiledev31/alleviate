const axios = require('axios');

const getAddressAutoPlaces = async (req, res) => {
  try {
   const response = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete`, {
      params: {
        text: req.query.text,
        format: 'json',
        apiKey: 'd548c5ed24604be6a9dd0d989631f783',
      },
    });
    const data = response.data;
    res.json(data);
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

};

module.exports = {
  getAddressAutoPlaces
};

const axios = require('axios');

async function getFlightsByAirport({ iata, fromLocal, toLocal }) {

  if (!iata || !fromLocal || !toLocal) {
    throw new Error('Missing required parameters: iata, fromLocal, or toLocal');
  }

  const url = `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${iata}/${fromLocal}/${toLocal}`;
  const headers = {
    'X-RapidAPI-Key': process.env.rapid_api_key,
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

async function getFlightsById({ id,date }) {
  if (!id||!date) {
    throw new Error('Missing required parameter: id or date');
  }

  const url = `https://aerodatabox.p.rapidapi.com/flights/number/${id}/${date}`;
  const headers = {
    'X-RapidAPI-Key': process.env.rapid_api_key,
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

module.exports = { getFlightsByAirport , getFlightsById };

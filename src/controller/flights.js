const { getFlightsByAirport,getFlightsById } = require('../services/flights');

const searchallflights = async (req, res) => {
    try {
        // Extract parameters from request body
        const { from, fromLocal, toLocal,to  } = req.body;

        // Validate required parameter
        if (!from|| !fromLocal || !to || !toLocal) {
            return res.status(400).json({ error: 'Missing required parameter' });
        }


        // Call AeroDataBox API via your service
        const apiResponse = await getFlightsByAirport({
            iata: from,
            fromLocal,
            toLocal
        });

        const filteredFlights = apiResponse.departures?.filter(flight => {
            const destinationIata = flight.movement?.airport?.iata;
            return destinationIata === to;
        }).map(flight => {
            return {
                // Basic Flight Info
                flightNumber: flight.number || 'N/A',
                airline: {
                    name: flight.airline?.name || 'Unknown',
                    code: flight.airline?.iata || flight.airline?.icao || 'N/A'
                },

                // Route Information
                departure: {
                    airport: from,
                },

                arrival: {
                    airport: flight.movement?.airport?.iata || 'N/A',
                    airportName: flight.movement?.airport?.name || 'N/A',
                },

                // Aircraft Information
                aircraft: {
                    model: flight.aircraft?.model || 'N/A',
                    registration: flight.aircraft?.reg || 'N/A'
                },

                // Flight Status & Details
                status: flight.status || 'Scheduled',
                duration: flight.duration || 'N/A',
            };
        }) || [];

        // Return the complete response
        res.json({filteredFlights});

    } catch (error) {
        console.error('Flight search error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const searchoneflight = async (req, res) => {
    try {
        const { id, date } = req.body;
        if (!id || !date) {
            return res.status(400).json({ error: 'Missing required parameter: id or date' });
        }

        // Call your service to get flight details
        const apiResponse = await getFlightsById({ id, date });

        // Ensure we always have an array to work with
        const flightsArray = Array.isArray(apiResponse) ? apiResponse : [apiResponse];

        // Extract and format only the useful fields
        const flights = flightsArray.map(flight => {
            // Duration calculation in-place
            let duration = null;
            if (flight.departure?.scheduledTime?.utc && flight.arrival?.scheduledTime?.utc) {
                const dep = new Date(flight.departure.scheduledTime.utc);
                const arr = new Date(flight.arrival.scheduledTime.utc);
                const diffMs = arr - dep;
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                duration = `${hours}h ${minutes}m`;
            }

            const flightDetail = {
                flightNumber: flight.number,
                airline: flight.airline?.name,
                status: flight.status,
                from: {
                    airport: flight.departure?.airport?.iata,
                    city: flight.departure?.airport?.shortName,
                    time: flight.departure?.scheduledTime?.local,
                    terminal: flight.departure?.terminal
                },
                to: {
                    airport: flight.arrival?.airport?.iata,
                    city: flight.arrival?.airport?.shortName,
                    time: flight.arrival?.scheduledTime?.local,
                    actualTime: flight.arrival?.revisedTime?.local || flight.arrival?.actualTime?.local,
                    terminal: flight.arrival?.terminal,
                    gate: flight.arrival?.gate
                },
                aircraft: flight.aircraft?.model,
                distance: flight.greatCircleDistance?.km
                    ? `${flight.greatCircleDistance.km} km`
                    : undefined,
                duration: duration
            };

            return flightDetail;
        });

        res.json({flights});
    } catch (error) {
        console.error('Flight search error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};



module.exports = { searchallflights ,searchoneflight};

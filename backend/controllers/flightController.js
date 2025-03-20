const Vol = require('../models/volModel');
const Agency = require('../models/agenceModel');
const Destination = require('../models/destinationModel');
const flightApiService = require('../services/flightApiService');
const Company=require('../models/company')
const Reservation=require('../models/booking')
const { Op } = require('sequelize');
const AgencyFlight=require('../models/flightAgency')
const AgencyClass=require('../models/agencyClass')

// exports.searchFlights = async (req, res) => {

//   try {
//     const {
//       originPlace,
//       destinationPlace,
//       startDate,
//       endDate,
//       passengers,
//       class: cabinClass,
//       maxPrice
//     } = req.query;

//     // 1. Search local flights
//     const localWhereClause = {
//       status: 'active'
//     };
 
//     if (maxPrice) localWhereClause.prix = { [Op.lte]: maxPrice };
//     if (startDate) {
//       localWhereClause.startAt = {
//         [Op.gte]: new Date(startDate)
//       };
//     }
//     if (endDate) {
//       localWhereClause.endAt = {
//         [Op.lte]: new Date(endDate)
//       };
//     }

//     // 2. Fetch data in parallel
//     const [localFlights, externalFlights] = await Promise.all([
//       Vol.findAndCountAll({
//         where: localWhereClause,
//         include: [
//           { model: Agency, as: 'volAgency', attributes: ['id', 'name', 'rating', 'logo'] },
//           // { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }
//         ],
//         order: [['prix', 'ASC']]
//       }),
//       flightApiService.searchFlights({
//         originPlace,
//         destinationPlace,
//         startDate,
//         endDate,
//         passengers,
//         class: cabinClass
//       }).catch(err => {
//         console.error("Erreur API externe:", err);
//         return { Itineraries: [] }; // Retourner un tableau vide pour éviter que la requête échoue
//       })
//     ]);
    

//     // 3. Process external flights
//    // Ajoute une vérification pour éviter l'erreur sur "map"
// const processedExternalFlights = Array.isArray(externalFlights?.Itineraries) ? 
// externalFlights.Itineraries.map(itinerary => ({
//   id: `ext-${itinerary.OutboundLegId}`,
//   name: `${itinerary.OutboundLeg.Carriers?.[0]?.Name || "Unknown Airline"} ${itinerary.OutboundLeg.FlightNumbers?.[0] || "Unknown Flight"}`,
//   prix: itinerary.PricingOptions?.[0]?.Price || 0,
//   startAt: itinerary.OutboundLeg.DepartureDateTime || null,
//   endAt: itinerary.OutboundLeg.ArrivalDateTime || null,
//   status: 'active',
//   external: true,
//   agency: {
//     name: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Name || "Unknown Agent",
//     rating: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Rating || 0
//   }
// })) : [];


//     // 4. Find relevant local agencies for external flights
//     const destinationIds = new Set(localFlights.rows.map(f => f.destinationId));
//     const agencyIds = localFlights.rows.map(f => f.agencyId).filter(id => id);
// const relevantAgencies = agencyIds.length
//   ? await Agency.findAll({
//       where: { status: 'active', id: { [Op.in]: agencyIds } },
//       attributes: ['id', 'name', 'rating', 'logo']
//     })
//   : [];


//     // 5. Combine and enrich results
//     const combinedFlights = [
//       ...localFlights.rows,
//       ...processedExternalFlights.map(flight => ({
//         ...flight,
//         localAgencies: relevantAgencies.filter(agency => 
//           agency.rating >= 4.0 && flight.prix <= agency.maxFlightPrice
//         )
//       }))
//     ];

//     // 6. Get aggregated data for filters
//     const [minFlightPrice, maxFlightPrice] = await Promise.all([
//       Vol.min('prix', { where: localWhereClause }),
//       Vol.max('prix', { where: localWhereClause })
//     ]);
    

//     const destinations = await Destination.findAll({
//       attributes: ['id', 'name', 'city', 'country'],
//       where: {
//         id: { [Op.in]: Array.from(destinationIds) }
//       }
//     });
// const localFlight = await Vol.findAndCountAll({ where: localWhereClause});
// console.log('LocalFlight',localFlight)

//     res.json({
//       flights: combinedFlights,
//       totalCount: combinedFlights.length,
//       page: 1,
//       pageSize: combinedFlights.length,
//      filters: {
//   minPrice: Math.min(minFlightPrice, ...processedExternalFlights.map(f => f.prix)),
//   maxPrice: Math.max(maxFlightPrice, ...processedExternalFlights.map(f => f.prix)),
//   destinations,
//   agencies: relevantAgencies
// }
// ,
//       meta: {
//         localFlights: localFlights.count,
//         externalFlights: processedExternalFlights.length,
//         timestamp: new Date()
//       }
        
//     });
//     console.log('externalFlight',externalFlights);
//   } catch (error) {
//     console.error('Flight search error:', error);
//     res.status(500).json({
//       error: 'Failed to search flights',
//       details: error.message
//     });
//   }
// };
// exports.searchFlights = async (req, res) => {
//   try {
//     const {
//       originPlace,
//       destinationPlace,
//       startDate,
//       endDate,
//       passengers,
//       class: cabinClass,
//       maxPrice,
//       page = 1,
//       pageSize = 10
//     } = req.query;
//  console.log('originPlace',originPlace)
//     // 1. Recherche des vols locaux avec les conditions
//     const localWhereClause = { status: 'active' };
//     // if (maxPrice) localWhereClause.prix = { [Op.lte]: maxPrice };
//     // if (startDate) localWhereClause.startAt = { [Op.gte]: new Date(startDate) };
//     // if (endDate) localWhereClause.endAt = { [Op.lte]: new Date(endDate) }; 

//     // 2. Requête des vols locaux avec pagination
//     const localFlights = await Vol.findAndCountAll({
//       where: localWhereClause,
//       include: [
//         { model: Agency, as: 'volAgency', attributes: ['id', 'name', 'rating', 'logo'] },
//         { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }
//       ],
//       order: [['prix', 'ASC']],
//       limit: pageSize,
//       offset: (page - 1) * pageSize,
//     });

//     console.log('LocalFlight', localFlights);

//     // 3. Requête de l'API externe (sans bloquer le processus)
//     let externalFlights = [];
//     try {
//       const apiResponse = await flightApiService.searchFlights({
//         originPlace,
//         destinationPlace,
//         startDate,
//         endDate,
//         passengers,
//         class: cabinClass
//       });
//       externalFlights = Array.isArray(apiResponse?.Itineraries) ? apiResponse.Itineraries.map(itinerary => ({
//         id: `ext-${itinerary.OutboundLegId}`,
//         name: `${itinerary.OutboundLeg.Carriers?.[0]?.Name || "Unknown Airline"} ${itinerary.OutboundLeg.FlightNumbers?.[0] || "Unknown Flight"}`,
//         prix: itinerary.PricingOptions?.[0]?.Price || 0,
//         startAt: itinerary.OutboundLeg.DepartureDateTime || null,
//         endAt: itinerary.OutboundLeg.ArrivalDateTime || null,
//         status: 'active',
//         external: true,
//         agency: {
//           name: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Name || "Unknown Agent",
//           rating: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Rating || 0
//         }
//       })) : [];
//     } catch (error) {
//       console.error("Erreur API externe:", error.message);
//     }

//     console.log("externalFlight", externalFlights);

//     // 4. Regroupement des résultats
//     const combinedFlights = [...localFlights.rows, ...externalFlights];

//     // 5. Récupération des agences locales associées
//     const agencyIds = [...new Set(localFlights.rows.map(f => f.agencyId))];
//     const relevantAgencies = agencyIds.length
//       ? await Agency.findAll({
//           where: { status: 'active', id: { [Op.in]: agencyIds } },
//           attributes: ['id', 'name', 'rating', 'logo']
//         })
//       : [];

//     // 6. Calcul des filtres
//     const [minFlightPrice, maxFlightPrice] = await Promise.all([
//       Vol.min('prix', { where: localWhereClause }),
//       Vol.max('prix', { where: localWhereClause })
//     ]);

//     const destinations = await Destination.findAll({
//       attributes: ['id', 'name', 'city', 'country'],
//       where: {
//         id: { [Op.in]: localFlights.rows.map(f => f.destinationId) }
//       }
//     });

//     // 7. Envoi de la réponse
//     res.json({
//       flights: combinedFlights,
//       totalCount: combinedFlights.length,
//       page: parseInt(page),
//       pageSize: parseInt(pageSize),
//       filters: {
//         minPrice: Math.min(minFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         maxPrice: Math.max(maxFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         destinations,
//         agencies: relevantAgencies
//       },
//       meta: {
//         localFlights: localFlights.count,
//         externalFlights: externalFlights.length,
//         timestamp: new Date()
//       }
//     });

//   } catch (error) {
//     console.error('Flight search error:', error);
//     res.status(500).json({
//       error: 'Failed to search flights',
//       details: error.message
//     });
//   }
// };
 // vrai code search Flight
// exports.searchFlights = async (req, res) => {
//   try {
//     const {
//       originPlace,
//       destinationPlace,
//       startDate,
//       endDate,
//       passengers,
//       class: cabinClass,
//       maxPrice,
//       page = 1,
//       pageSize = 10
//     } = req.query;

//     // console.log('originPlace:', originPlace);

//     // 1. Recherche des vols locaux avec les conditions
//     const localWhereClause = { status: 'active' };

//     // 2. Requête des vols locaux avec pagination et inclusion des agences
//     const localFlights = await Vol.findAndCountAll({
//       where: localWhereClause,
//       include: [
//         { model: Agency, as: 'volAgency', attributes: ['id', 'name', 'rating', 'logo'] },
//         { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] },
//          { model: Reservation,as:'volReservations',attributes:['id','tripType'] }
//       ],
//       order: [['prix', 'ASC']], 
//       limit: pageSize,
//       offset: (page - 1) * pageSize,
//     });
//     // console.log('Local Flights:', JSON.stringify(localFlights.rows, null, 2));

//     // console.log('Local Flights:', localFlights.rows);

//     // 3. Requête de l'API externe (sans bloquer le processus)
//     let externalFlights = [];
//     try {
//       const apiResponse = await flightApiService.searchFlights({
//         originPlace,
//         destinationPlace,
//         startDate,
//         endDate,
//         passengers,
//         class: cabinClass
//       });

//       externalFlights = Array.isArray(apiResponse?.Itineraries) ? apiResponse.Itineraries.map(itinerary => ({
//         id: `ext-${itinerary.OutboundLegId}`,
//         name: `${itinerary.OutboundLeg.Carriers?.[0]?.Name || "Unknown Airline"} ${itinerary.OutboundLeg.FlightNumbers?.[0] || "Unknown Flight"}`,
//         prix: itinerary.PricingOptions?.[0]?.Price || 0,
//         startAt: itinerary.OutboundLeg.DepartureDateTime || null,
//         endAt: itinerary.OutboundLeg.ArrivalDateTime || null,
//         status: 'active',
//         external: true,
//         agency: {
//           name: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Name || "Unknown Agent",
//           rating: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Rating || 0
//         }
//       })) : [];
//     } catch (error) {
//       console.error("Erreur API externe:", error.message);
//     }

//     // console.log("External Flights:", externalFlights);

//     // 4. Regroupement des résultats en associant correctement les agences aux vols locaux
//     // const localFlightsWithAgencies = localFlights.rows.map(flight => ({
//     //   ...flight.get({ plain: true }),
//     //   agency: flight.volAgency ? {
//     //     id: flight.volAgency.id,
//     //     name: flight.volAgency.name,
//     //     rating: flight.volAgency.rating,
//     //     logo: flight.volAgency.logo
//     //   } : null,
//     //    volReservations: flight.volReservations || []
//     // }));
// const localFlightsWithAgencies = localFlights.rows.map(flight => {
//     const flightData = flight.get({ plain: true });
//     // console.log('Flight Data After Transformation:', JSON.stringify(flightData, null, 2));
//     return {
//         ...flightData,
//         agency: flight.volAgency ? {
//             id: flight.volAgency.id,
//             name: flight.volAgency.name,
//             rating: flight.volAgency.rating,
//             logo: flight.volAgency.logo
//         } : null,
//          volReservations: flightData.volReservations ||  []
//     };
// });

//     const combinedFlights = [...localFlightsWithAgencies, ...externalFlights];

//     // 5. Récupération des agences locales associées
//     const relevantAgencies = await Agency.findAll({
//       where: { status: 'active', id: { [Op.in]: localFlights.rows.map(f => f.volAgency?.id).filter(Boolean) } },
//       attributes: ['id', 'name', 'rating', 'logo']
//     });

//     // 6. Calcul des filtres
//     const [minFlightPrice, maxFlightPrice] = await Promise.all([
//       Vol.min('prix', { where: localWhereClause }),
//       Vol.max('prix', { where: localWhereClause })
//     ]);

//     const destinations = await Destination.findAll({
//       attributes: ['id', 'name', 'city', 'country'],
//       where: {
//         id: { [Op.in]: localFlights.rows.map(f => f.destinationId) }
//       }
//     });
// //     console.log('Final Response:', JSON.stringify({
// //   flights: localFlightsWithAgencies, // C'est ce qu'on envoie au frontend
// //   totalCount: localFlightsWithAgencies.length,
// // }, null, 2));

//     // 7. Envoi de la réponse
//     res.json({
//       flights: combinedFlights,
//       totalCount: combinedFlights.length,
//       page: parseInt(page),
//       pageSize: parseInt(pageSize),
//       filters: {
//         minPrice: Math.min(minFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         maxPrice: Math.max(maxFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         destinations,
//         agencies: relevantAgencies
//       },
//       meta: {
//         localFlights: localFlights.count,
//         externalFlights: externalFlights.length,
//         timestamp: new Date()
//       }
//     });

//   } catch (error) {
//     console.error('Flight search error:', error);
//     res.status(500).json({
//       error: 'Failed to search flights',
//       details: error.message
//     });
//   }
// };
// exports.searchFlights = async (req, res) => {
//   try {
//     const {
//       originPlace,
//       destinationPlace,
//       startDate,
//       endDate,
//       passengers,
//       class: cabinClass,
//       maxPrice,
//       page = 1,
//       pageSize = 10
//     } = req.query;

//     // 1. Conditions de recherche pour les vols locaux
//     const localWhereClause = {
//       status: 'active',
//       ...(originPlace && { originPlace }),
//       ...(destinationPlace && { destinationPlace }),
//       ...(startDate && { startAt: { [Op.gte]: startDate } }),
//       ...(endDate && { endAt: { [Op.lte]: endDate } }),
//       ...(maxPrice && { prix: { [Op.lte]: maxPrice } })
//     };

//     // 2. Recherche des vols locaux avec pagination et relations
//     const localFlights = await AgencyFlight.findAndCountAll({
//       where: localWhereClause,
//       include: [
//         { model: Agency, as: 'agency', attributes: ['id', 'name', 'rating', 'logo'] },
//         { model: Reservation, as: 'reservation', attributes: ['id', 'tripType'] },
//         {
//           model: Vol,
//           as: 'flight',
//           include: { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }
//         }
//       ],
//       order: [['prix', 'ASC']],
//       limit: pageSize,
//       offset: (page - 1) * pageSize,
//       distinct: true
//     });

//     // 3. Requête de l'API externe (sans bloquer l'exécution)
//     let externalFlights = [];
//     try {
//       const apiResponse = await flightApiService.searchFlights({
//         originPlace,
//         destinationPlace,
//         startDate,
//         endDate,
//         passengers,
//         class: cabinClass
//       });

//       externalFlights = Array.isArray(apiResponse?.Itineraries)
//         ? apiResponse.Itineraries.map(itinerary => ({
//             id: `ext-${itinerary.OutboundLegId}`,
//             name: `${itinerary.OutboundLeg.Carriers?.[0]?.Name || "Unknown Airline"} ${itinerary.OutboundLeg.FlightNumbers?.[0] || "Unknown Flight"}`,
//             prix: itinerary.PricingOptions?.[0]?.Price || 0,
//             startAt: itinerary.OutboundLeg.DepartureDateTime || null,
//             endAt: itinerary.OutboundLeg.ArrivalDateTime || null,
//             status: 'active',
//             external: true,
//             agency: {
//               name: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Name || "Unknown Agent",
//               rating: itinerary.PricingOptions?.[0]?.Agents?.[0]?.Rating || 0
//             }
//           }))
//         : [];
//     } catch (error) {
//       console.error("Erreur API externe:", error.message);
//     }

//     // 4. Traitement des vols locaux pour extraire les agences et destinations
//     const localFlightsWithDetails = localFlights.rows.map(flight => {
//       const flightData = flight.get({ plain: true });
//       return {
//         ...flightData,
//         agency: flight.agency ? {
//           id: flight.agency.id,
//           name: flight.agency.name,
//           rating: flight.agency.rating,
//           logo: flight.agency.logo
//         } : null,
//         reservations: flightData.reservation || [],
//         destination: flight.flight?.destination || null
//       };
//     });

//     const combinedFlights = [...localFlightsWithDetails, ...externalFlights];

//     // 5. Récupération des agences locales associées
//     const relevantAgencies = await Agency.findAll({
//       where: { status: 'active', id: { [Op.in]: localFlights.rows.map(f => f.agency?.id).filter(Boolean) } },
//       attributes: ['id', 'name', 'rating', 'logo']
//     });

//     // 6. Calcul des filtres
//     const [minFlightPrice, maxFlightPrice] = await Promise.all([
//       AgencyFlight.min('prix', { where: localWhereClause }),
//       AgencyFlight.max('prix', { where: localWhereClause })
//     ]);

//     const destinations = await Destination.findAll({
//       attributes: ['id', 'name', 'city', 'country'],
//       where: {
//         id: { [Op.in]: localFlights.rows.flatMap(f => f.flight?.destination?.id).filter(Boolean) }
//       }
//     });

//     // 7. Réponse JSON
//     res.json({
//       flights: combinedFlights,
//       totalCount: combinedFlights.length,
//       page: parseInt(page),
//       pageSize: parseInt(pageSize),
//       filters: {
//         minPrice: Math.min(minFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         maxPrice: Math.max(maxFlightPrice || 0, ...externalFlights.map(f => f.prix)),
//         destinations,
//         agencies: relevantAgencies
//       },
//       meta: {
//         localFlights: localFlights.count,
//         externalFlights: externalFlights.length,
//         timestamp: new Date()
//       }
//     });

//   } catch (error) {
//     console.error('Flight search error:', error);
//     res.status(500).json({
//       error: 'Failed to search flights',
//       details: error.message
//     });
//   }
// };
exports.searchFlights = async (req, res) => {
  try {
    const {
      originPlace,
      destinationPlace,
      startDate,
      endDate,
      passengers,
      class: cabinClass,
      maxPrice,
      page = 1,
      pageSize = 10
    } = req.query;
 console.log('req.query',req.query)
 const start = startDate ? new Date(startDate) : null;
    // Filtrage basé sur le vol, et non sur AgencyFlight
    const localWhereClause = {
      status: 'active',
      
      ...(start && { departureTime: { [Op.gte]: start } }) 
      // ...(maxPrice && { price: { [Op.lte]: maxPrice } })
    };

    // Construction de la requête principale avec l'inclusion de Vol
    const localFlights = await AgencyFlight.findAndCountAll({
      where: localWhereClause,
      include: [
        {
          model: Vol,
          as: 'flight',
          // where: {localWhereClause
          //   // ...(originPlace && { originId: originPlace }),
          //   // ...(destinationPlace && { destinationId: destinationPlace }),
          //   // ...(startDate && { startAt: { [Op.gte]: startDate } }),
          //   // ...(endDate && { endAt: { [Op.lte]: endDate } })
          // },
          include: [
    
  { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }  
]

        },
        { model: Agency, as: 'agency', attributes: ['id', 'name', 'rating', 'logo','location','address'] },
        { model: Reservation, as: 'reservation', attributes: ['id', 'tripType'] }
      ],
      order: [['price', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true
    });
 console.log('LocalFlights',localFlights)
    // 2. Récupération des agences associées aux vols trouvés
    const relevantAgencies = await Agency.findAll({
      where: { status: 'active', id: { [Op.in]: localFlights.rows.map(f => f.agency?.id).filter(Boolean) } },
      attributes: ['id', 'name', 'rating', 'logo']
    });

    // 3. Calcul des filtres
    const [minFlightPrice, maxFlightPrice] = await Promise.all([
      AgencyFlight.min('price', { where: localWhereClause }),
      AgencyFlight.max('price', { where: localWhereClause })
    ]);

    const destinations = await Destination.findAll({
      attributes: ['id', 'name', 'city', 'country'],
      where: {
        id: { [Op.in]: localFlights.rows.map(f => f.flight?.destinationId).filter(Boolean) }
      }
    });

    // 4. Formater les résultats
    const localFlightsFormatted = localFlights.rows.map(flight => {
      const flightData = flight.get({ plain: true });
      return {
        ...flightData,
        vol: flightData.flight ? {
          id: flightData.flight.id,
          origin: flightData.flight.origin || null,
          destination: flightData.flight.destination || null,
          startAt: flightData.flight.startAt,
          endAt: flightData.flight.endAt
        } : null,
        agency: flight.agency ? {
          id: flight.agency.id,
          name: flight.agency.name,
          rating: flight.agency.rating,
          logo: flight.agency.logo,
          address:flight.agency.address,
          location:flight.agency.location
        } : null,
        reservations: flightData.reservation || []
      };
    });

    // 5. Envoi de la réponse
    res.json({
      flights: localFlightsFormatted,
      totalCount: localFlights.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      filters: {
        minPrice: minFlightPrice || 0,
        maxPrice: maxFlightPrice || 0,
        destinations,
        agencies: relevantAgencies
      },
      meta: {
        localFlights: localFlights.count,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Flight search error:', error);
    console.log(error.response?.data || error.message)
    res.status(500).json({
      error: 'Failed to search flights',
      details: error.message
    });
  }
};
// exports.searchFlights = async (req, res) => {
//   try {
//     const {
//       originPlace,
//       destinationPlace,
//       startDate,
//       endDate,
//       passengers,
//       class: cabinClass,
//       maxPrice,
//       page = 1,
//       pageSize = 10
//     } = req.query;

//     console.log('req.query', req.query);

//     const start = startDate ? new Date(startDate) : null;

//     // Filtrage basé sur le vol, et non sur AgencyFlight
//     const localWhereClause = {
//       status: 'active',
//       ...(start && { departureTime: { [Op.gte]: start } })
//     };

//     // Fetching local flights
//     const localFlights = await AgencyFlight.findAndCountAll({
//       where: localWhereClause,
//       include: [
//         {
//           model: Vol,
//           as: 'flight',
//           include: [
//             { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }
//           ]
//         },
//         { model: Agency, as: 'agency', attributes: ['id', 'name', 'rating', 'logo', 'location', 'address'] },
//         { model: Reservation, as: 'reservation', attributes: ['id', 'tripType'] }
//       ],
//       order: [['price', 'ASC']],
//       limit: pageSize,
//       offset: (page - 1) * pageSize,
//       distinct: true
//     });

//     console.log('LocalFlights', localFlights);

//     // Fetching flight suggestions for places from the external API
//     const suggestions = await flightApiService.getPlaces(req.query.query || "").catch(err => {
//       console.error('Error fetching suggestions from external API:', err);
//       return [];
//     });

//     // Formatting the flight results
//     const localFlightsFormatted = localFlights.rows.map(flight => {
//       const flightData = flight.get({ plain: true });
//       return {
//         ...flightData,
//         vol: flightData.flight ? {
//           id: flightData.flight.id,
//           origin: flightData.flight.origin || null,
//           destination: flightData.flight.destination || null,
//           startAt: flightData.flight.startAt,
//           endAt: flightData.flight.endAt
//         } : null,
//         agency: flight.agency ? {
//           id: flight.agency.id,
//           name: flight.agency.name,
//           rating: flight.agency.rating,
//           logo: flight.agency.logo,
//           address: flight.agency.address,
//           location: flight.agency.location
//         } : null,
//         reservations: flightData.reservation || []
//       };
//     });

//     // 2. Returning the response with the local flights and suggestions
//     res.json({
//       flights: localFlightsFormatted,
//       totalCount: localFlights.count,
//       page: parseInt(page),
//       pageSize: parseInt(pageSize),
//       suggestions: suggestions,  // Adding suggestions to the response
//       meta: {
//         localFlights: localFlights.count,
//         timestamp: new Date()
//       }
//     });

//   } catch (error) {
//     console.error('Flight search error:', error);
//     console.log(error.response?.data || error.message);
//     res.status(500).json({
//       error: 'Failed to search flights',
//       details: error.message
//     });
//   }
// };

exports.getFlightDetails = async (req, res) => {
  try {
    const flightId = req.params.id;
    let flight;

    // Check if it's an external flight
    if (flightId.startsWith('ext-')) {
      // Fetch from external API
      const externalId = flightId.replace('ext-', '');
      const externalFlight = await flightApiService.getFlightDetails(externalId);
      
      flight = {
        ...externalFlight,
        external: true,
        // Add any additional processing for external flights
      };
    } else {
      // Fetch from local database
      flight = await AgencyFlight.findByPk(flightId, {
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'rating', 'logo', 'description']
          },{model:Vol,as:'flight',include: 
    
  { model: Destination, as: 'destination', attributes: ['id', 'name', 'city', 'country'] }  
,include:{
            model: Company,
            as: 'companyVol',
            attributes: ['id', 'name']
          }}
          ,{ model:Reservation,as:'reservation',attributes:['id','tripType']}
        ]
      });
    }

    if (!flight) {
      return res.status(404).json({
        error: 'Flight not found'
      });
    }

    // If it's a local flight, check for similar external offers
    if (!flight.external) {
      const similarExternalFlights = await flightApiService.searchFlights({
        originPlace: flight.originId,
        destinationPlace: flight.destinationId,
        startDate: flight.startAt,
        maxPrice: flight.prix * 1.2 // 20% margin
      });

      flight.similarOffers = similarExternalFlights.slice(0, 3);
    }

    res.json(flight);
  } catch (error) {
    console.error('Flight details error:', error); 
    res.status(500).json({
      error: 'Failed to get flight details',
      details: error.message
    });
  }
};

exports.searchPlaces = async (req, res) => {
  try {
    const { query } = req.query;

    // Vérifie si l'API externe renvoie des résultats valides
    const [localPlaces, externalPlaces = []] = await Promise.all([
      Destination.findAll({
        where: {
          [Op.or]: [ 
            { name: { [Op.iLike]: `%${query}%` } },
            { city: { [Op.iLike]: `%${query}%` } }, 
            { country: { [Op.iLike]: `%${query}%` } }
          ]
        },
        attributes: ['id', 'name', 'city', 'country'],
        limit: 5
      }),
      flightApiService.getPlaces(query).catch(err => {
        console.error("Erreur API externe (getPlaces) :", err);
        return { error: 'L’API externe ne répond pas', places: [] }; // Retourne un tableau vide en cas d'erreur
      })
    ]);

    res.json({
      places: [
        ...localPlaces.map(place => ({
          ...place.toJSON(),
          source: 'local'
        })),
        ...(Array.isArray(externalPlaces) ? externalPlaces.map(place => ({
          id: place.PlaceId,
          name: place.PlaceName,
          city: place.CityName,
          country: place.CountryName,
          source: 'external'
        })) : [])
      ]
    });
  } catch (error) {
    console.error('Place search error:', error);
    res.status(500).json({
      error: 'Failed to search places',
      details: error.message
    });
  }
};

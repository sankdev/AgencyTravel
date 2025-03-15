const DestinationAgency = require("../models/destinationAgency");
const FlightAgency = require("../models/flightAgency");
const ClassAgency = require("../models/agencyClass");
const Agency=require('../models/agenceModel')
const { Op } = require("sequelize");
const { Vol } = require("../models");
/**
 * 🚀 CRUD DestinationAgency
 */
// exports.createDestinationAgency = async (req, res) => {
//   try {
//     const { destinationId, agencyId, status } = req.body;
//     const newEntry = await DestinationAgency.create({ destinationId, agencyId, status });
//     res.status(201).json(newEntry);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getAllDestinationAgencies = async (req, res) => {
//   try {
//     const data = await DestinationAgency.findAll({ include: ["destination", "agency"] });
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.updateDestinationAgency = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updated = await DestinationAgency.update(req.body, { where: { id } });
//     res.json({ message: "Mise à jour réussie", updated });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.deleteDestinationAgency = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await DestinationAgency.destroy({ where: { id } });
//     res.json({ message: "Suppression réussie" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

/**
 * 🚀 CRUD FlightAgency
 */
exports.createFlightAgency = async (req, res) => {
  try {
    const { volId, agencyId, price, status, departureTime, arrivalTime } = req.body;

    // Vérification des formats de date
    const parsedDeparture = departureTime ? new Date(departureTime) : null;
    const parsedArrival = arrivalTime ? new Date(arrivalTime) : null;

    const newEntry = await FlightAgency.create({ 
      volId, 
      agencyId, 
      price, 
      status, 
      departureTime: parsedDeparture, 
      arrivalTime: parsedArrival 
    });

    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// exports.getAllFlightAgencies = async (req, res) => {
//   try {
//     const data = await FlightAgency.findAll({
//       where: {
        
//         status: "active",
//         departureTime: { [Op.gt]: new Date() } // Exclure les vols dont departureTime est aujourd'hui ou passé
//       },
//       include: ["flight", "agency"],
//       attributes: ["id", "price", "status", "departureTime", "arrivalTime"],
//     });

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// exports.getUserFlightAgencies = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Vérifier si l'utilisateur appartient à une agence
//     const userAgency = await Agency.findOne({ where: { userId } });
//     if (!userAgency) {
//       return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//     }

//     console.log("userAgency", userAgency);

//     // Récupérer les vols de l'agence avec les horaires
//     const flightAgencies = await FlightAgency.findAll({
//       where: { agencyId: userAgency.id },
//       include: ["flight", "agency"],
//       attributes: ["id", "price", "status", "departureTime", "arrivalTime"],
//     });

//     res.json(flightAgencies);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const addDays = (date, days) => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};
// exports.getAllFlightAgencies = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;
//     const search = req.query.search || '';
//     const status = req.query.status;
//     const now = new Date();
//     const minDate = addDays(now, 1); // Vols dont departureTime est >= maintenant + 2 jours


//     const whereClause = {
//       [Op.and]: [
//         search ? {
//           [Op.or]: [
//             { '$flight.name$': { [Op.like]: `%${search}%` } },
//             { '$agency.name$': { [Op.like]: `%${search}%` } }
//           ]
//         } : {},
//         status ? { status } : {},
//         // { departureTime: { [Op.gt]: new Date() } }
//         // {departureTime: { 
//         //   [Op.between]: [new Date(), addDays(new Date(), 2)] // Filtrer les vols dans les 2 prochains jours
//         // }} // Exclure les vols 
//          { departureTime: { [Op.gte]: minDate } } // Afficher les vols avec departureTime >= minDate
//       ]
//     };

//     const { count, rows } = await FlightAgency.findAndCountAll({
//       where: whereClause,
//       include: [
//         { model: Vol, as: 'flight' ,where: { endAt: { [Op.gt]: now } }, // vols actives uniquement
//         required: false, },
//         { model: Agency, as: 'agency' }
//       ],
//       attributes: ['id', 'price', 'status', 'departureTime', 'arrivalTime'],
//       limit,
//       offset,
//       order: [['departureTime', 'ASC']]
//     });

//     res.status(200).json({
//       success: true,
//       data: rows,
//       pagination: {
//         total: count,
//         page,
//         pages: Math.ceil(count / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching flights:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
exports.getAllFlightAgencies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    const now = new Date();

    // Définir la date minimale (début de la journée actuelle)
    const todayStart = addDays(new Date(now.setHours(0, 0, 0, 0)), 0); 

    const whereClause = {
      [Op.and]: [
        search ? {
          [Op.or]: [
            { '$flight.name$': { [Op.like]: `%${search}%` } },
            { '$agency.name$': { [Op.like]: `%${search}%` } }
          ]
        } : {},
        status ? { status } : {},
      ]
    };

    const { count, rows } = await FlightAgency.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Vol, 
          as: 'flight',
          where: { 
            endAt: { [Op.gte]: todayStart } // endAt >= aujourd'hui à 00:00:00
          }, 
          required: true, // Assurer que l'on récupère uniquement les vols correspondants
        },
        { model: Agency, as: 'agency' }
      ],
      attributes: ['id', 'price', 'status', 'departureTime', 'arrivalTime'],
      limit,
      offset,
      order: [['departureTime', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// exports.getUserFlightAgencies = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assurez-vous que l'ID de l'utilisateur est récupéré depuis le token ou la session

//     // Vérifier si l'utilisateur est lié à une agence
//     const userAgency = await Agency.findOne({ where: { userId } });
//     if (!userAgency) {
//       return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//     }
//  console.log('userAgency',userAgency)
//     // Récupérer les FlightAgency liés à l'agence de l'utilisateur
//     const flightAgencies = await FlightAgency.findAll({
//       where: { agencyId: userAgency.id },
//       include: ["flight", "agency"],
//     });

//     res.json(flightAgencies);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.getUserFlightAgencies = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;

    // Vérifier si l'utilisateur est admin ou s'il a la permission "view_flight_agencies"
    const hasPermission = req.isAdmin || req.hasPermission;

    let userAgency = null;
    if (!hasPermission) {
      userAgency = await Agency.findOne({ where: { userId } });

      if (!userAgency) {
        return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
      }
    }

    console.log("🔍 userAgency:", userAgency);

    // Définir la condition pour récupérer les FlightAgencies
    let whereCondition = hasPermission ? {} : { agencyId: userAgency.id };

    const flightAgencies = await FlightAgency.findAll({
      where: whereCondition,
      include: ["flight", "agency"],
    });

    res.status(200).json(flightAgencies );
  } catch (error) {
    console.error("❌ Error fetching flight agencies:", error);
    res.status(500).json({ error: "Failed to fetch flight agencies" });
  }
};


exports.deleteFlightAgency = async (req, res) => {
  try {
    const { id } = req.params;
    await FlightAgency.destroy({ where: { id } });
    res.json({ message: "Suppression réussie" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateFlightAgency = async (req, res) => {
  try {
    const { id } = req.params;
     const { departureTime, arrivalTime } = req.body;

    // Conversion des dates
    const parsedDeparture = departureTime ? new Date(departureTime) : null;
    const parsedArrival = arrivalTime ? new Date(arrivalTime) : null;

    const updated = await FlightAgency.update(
      { ...req.body, departureTime: parsedDeparture, arrivalTime: parsedArrival },
      { where: { id } }
    );

    res.json({ message: "Mise à jour réussie", updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🚀 CRUD ClassAgency
 */
exports.createClassAgency = async (req, res) => {
  try {
    const { classId, agencyId, priceMultiplier, status } = req.body;
    const newEntry = await ClassAgency.create({ classId, agencyId, priceMultiplier, status });
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllClassAgencies = async (req, res) => {
  try {
    const data = await ClassAgency.findAll({ include: ["class", "agency"] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// exports.getAllClassAgencies = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;
//     const search = req.query.search || '';
//     const status = req.query.status;

//     const whereClause = {
//       [Op.and]: [
//         search ? {
//           [Op.or]: [
//             { '$class.name$': { [Op.like]: `%${search}%` } },
//             { '$agency.name$': { [Op.like]: `%${search}%` } }
//           ]
//         } : {},
//         status ? { status } : {}
//       ]
//     };

//     const { count, rows } = await ClassAgency.findAndCountAll({
//       where: whereClause,
//       include: [
//         { model: Class, as: 'class' },
//         { model: Agency, as: 'agency' }
//       ],
//       attributes: ['id', 'price', 'status'],
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']]
//     });

//     res.status(200).json({
//       success: true,
//       data: rows,
//       pagination: {
//         total: count,
//         page,
//         pages: Math.ceil(count / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching classes:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

exports.updateClassAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ClassAgency.update(req.body, { where: { id } });
    res.json({ message: "Mise à jour réussie", updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.getUserClassAgencies = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assurez-vous que l'ID de l'utilisateur est disponible via l'authentification

//     // Vérifier si l'utilisateur est lié à une agence
//     const userAgency = await Agency.findOne({ where: { userId } });
//     if (!userAgency) {
//       return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//     }

//     // Récupérer les ClassAgency liées à l'agence de l'utilisateur
//     const classAgencies = await ClassAgency.findAll({
//       where: { agencyId: userAgency.id },
//       include: ["class", "agency"],
//     });

//     res.json(classAgencies);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.getUserClassAgencies = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;

    // Vérifier si l'utilisateur est admin ou s'il a la permission "view_class_agencies"
    const hasPermission = req.isAdmin || req.hasPermission;

    let userAgency = null;
    if (!hasPermission) {
      userAgency = await Agency.findOne({ where: { userId } });

      if (!userAgency) {
        return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
      }
    }

    console.log("🔍 userAgency:", userAgency);

    // Définir la condition pour récupérer les ClassAgencies
    let whereCondition = hasPermission ? {} : { agencyId: userAgency.id };

    const classAgencies = await ClassAgency.findAll({
      where: whereCondition,
      include: ["class", "agency"],
    });

    res.status(200).json( classAgencies );
  } catch (error) {
    console.error("❌ Error fetching class agencies:", error);
    res.status(500).json({ error: "Failed to fetch class agencies" });
  }
};

exports.deleteClassAgency = async (req, res) => {
  try {
    const { id } = req.params;
    await ClassAgency.destroy({ where: { id } });
    res.json({ message: "Suppression réussie" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

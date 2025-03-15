const Agency = require('../models/agenceModel');
const Image = require('../models/image');
const { Op } = require('sequelize');
const path = require('path');
const checkPermission =require('../middleware/servicePermission.js')
const UserAgency=require('../models/userAgencies.js')
// Créer une nouvelle agence
exports.createAgency = async (req, res) => {
  try {
    const { name, description, location, status, address, phone1, phone2, phone3, manager, secretary } = req.body;
    const logo = req.files && req.files.logo ? req.files.logo[0].path : null;

    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const newAgency = await Agency.create({
      name,
      userId: req.user.id,
      description,
      logo,
      location,
      status,
      address,
      phone1,phone2,
      manager,
      secretary,
    });
console.log('newAgency',newAgency)
    // Gérer les nouvelles images si elles sont fournies
    if (req.files) {
      
      const newImages = await Promise.all(
        Object.values(req.files).flat().map(async (file) => {
          if (!file.path || !file.mimetype) {
            throw new Error('File path or mimetype is missing.');
          }

          return await Image.create({
            url: file.path, 
            type: file.mimetype,
            agencyId: newAgency.id,       
            createdBy: req.user.id,
          });
        })
      );
      newAgency.images = newImages;
    }

    res.status(201).json(newAgency);
    
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Obtenir toutes les agences avec pagination et filtres
exports.getAgencies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    const location = req.query.location;

    const whereClause = {
      [Op.and]: [
        search ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
          ]
        } : {},
        status ? { status } : {},
        location ? { location } : {}
      ]
    };

    const { count, rows } = await Agency.findAndCountAll({
      where: whereClause,
      include: [{
        model: Image,
        as: 'agencyImages', // Use the correct alias
        required: false
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
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
    console.error('Error fetching agencies:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAgenciesProfile = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    const location = req.query.location;

    const whereClause = {
      [Op.and]: [
        search ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
          ]
        } : {},
        status ? { status } : {},
        location ? { location } : {}
      ]
    };

    const { count, rows } = await Agency.findAndCountAll({
      where: whereClause,
      include: [{
        model: Image,
        as: 'agencyImages', // Use the correct alias
        required: false
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
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
    console.error('Error fetching agencies:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir une agence spécifique
exports.getAgency = async (req, res) => {
  try {
    const agency = await Agency.findByPk(req.params.id, {
      include: [{
        model: Image,
        as: 'agencyImages', // Use the correct alias
        required: false
      }]
    });

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// exports.getUserAgencies = async (req, res) => { 

//   console.log("✅ getUserAgencies appelé !");
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(400).json({ error: "User ID is missing" });
//     }

//     let whereCondition = {};
    
//     // Si l'utilisateur N'EST PAS admin, filtrer par userId
//     if (!req.admin) {
//       whereCondition.userId = req.user.id;
//     }

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{
//         model: Image,
//         as: "agencyImages",
//         required: false
//       }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies || userAgencies.length === 0) {
//       return res.status(404).json({ error: "No agencies found for this user" });
//     }

//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("Error fetching user agencies:", error);
//     res.status(500).json({ error: "Failed to fetch agencies" });
//   }
// };

// exports.getUserAgencies = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(400).json({ error: "User ID is missing" });
//     }

//     const userAgencies = await Agency.findAll({
//       where: { userId: req.user.id },
//       include: [{
//         model: Image,
//         as: 'agencyImages',
//         required: false
//       }], 
//       order: [['createdAt', 'DESC']],
//     });

//     if (!userAgencies || userAgencies.length === 0) {
//       return res.status(404).json({ error: "No agencies found for this user" });
//     }

//     // Transformer les chemins des logos
//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("Error fetching user agencies:", error);
//     res.status(500).json({ error: "Failed to fetch agencies" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   try {
//     const connectedUserId = req.user.id;
//     const { userId } = req.query; // Permet d'afficher les agences d'un autre utilisateur si l'on a la permission

//     // Vérifier si l'utilisateur connecté a la permission "view_all_agencies"
//     const canViewAll = await checkPermission(connectedUserId, "view_all_agencies");

//     let agencies;
    
//     if (canViewAll && userId) {
//       // Si l'utilisateur a la permission spéciale et veut voir les agences d'un autre utilisateur
//       agencies = await Agency.findAll({
//         where: { userId },
//         include: [{ model: Image, as: "agencyImages", required: false }],
//         order: [["createdAt", "DESC"]],
//       });
//     } else {
//       // Sinon, il ne peut voir que ses propres agences
//       agencies = await Agency.findAll({
//         where: { userId: connectedUserId },
//         include: [{ model: Image, as: "agencyImages", required: false }],
//         order: [["createdAt", "DESC"]],
//       });
//     }

//     if (!agencies || agencies.length === 0) {
//       return res.status(404).json({ error: "Aucune agence trouvée." });
//     }

//     // Transformer les chemins des logos
//     const formattedAgencies = agencies.map((agency) => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null,
//     }));

//     return res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("Erreur lors de la récupération des agences:", error);
//     return res.status(500).json({ error: "Erreur interne du serveur." });
//   }
// };
// Mettre à jour une agence
// exports.getUserAgencies = async (req, res) => {
//   console.log("✅ getUserAgencies appelé !");
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "User ID is missing" });
//     }

//     const userId = req.params.userId || req.user.id;  

//     // Vérifier si l'utilisateur est admin ou s'il accède à ses propres données
//     if (userId !== req.user.id && !req.isAdmin) {
//       return res.status(403).json({ error: "Access denied: User does not have permission" });
//     }

//     // Condition de filtrage : Si admin, il peut voir toutes les agences
//     let whereCondition = req.isAdmin ? {} : { userId }; 

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{
//         model: Image,
//         as: "agencyImages",
//         required: false
//       }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies || userAgencies.length === 0) {
//       return res.status(404).json({ error: "No agencies found" });
//     }

//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("Error fetching user agencies:", error);
//     res.status(500).json({ error: "Failed to fetch agencies" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   console.log("✅ getUserAgencies appelé !");
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "User not authenticated" });
//     }

//     const userId = req.user.id;

//     // Vérifier si l'utilisateur est admin ou s'il a la permission "view_user_agencies"
//     const hasPermission = req.isAdmin || req.hasPermission;

//     let userAgency = null;
//     if (!hasPermission) {
//       userAgency = await Agency.findOne({ where: { userId } });

//       if (!userAgency) {
//         return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//       }
//     }

//     console.log("🔍 userAgency:", userAgency);

//     // Condition pour récupérer les agences
//     let whereCondition = hasPermission ? {} : { id: userAgency.id };

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{
//         model: Image,
//         as: "agencyImages",
//         required: false
//       }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies || userAgencies.length === 0) {
//       return res.status(404).json({ error: "No agencies found" });
//     }

//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedAgencies,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user agencies:", error);
//     res.status(500).json({ error: "Failed to fetch agencies" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "User not authenticated" });
//     }

//     const userId = req.user.id;
//     const hasPermission = req.isAdmin || req.hasPermission;

//     let agencyIds = [];

//     if (!hasPermission) {
//       const userAgencies = await UserAgency.findAll({ 
//         where: { userId },
//         attributes: ["agencyId"]
//       });

//       agencyIds = userAgencies.map(ua => ua.agencyId);
      
//       if (agencyIds.length === 0) {
//         return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//       }
//     }  

//     const whereCondition = hasPermission ? {} : { id: agencyIds };

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{ model: Image, as: "agencyImages", required: false }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies.length) {
//       return res.status(404).json({ error: "Aucune agence trouvée" });
//     }

//     const formattedAgencies = userAgencies.map(agency => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null
//     }));

//     res.status(200).json({ success: true, data: formattedAgencies });

//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération des agences:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "Utilisateur non authentifié" });
//     }

//     const userId = req.user.id;
//     const hasPermission = req.isAdmin || req.hasPermission;
//     let agencyIds = [];

//     if (!hasPermission) {
//       const userAgencies = await UserAgency.findAll({
//         where: { userId },
//         attributes: ["agencyId"],
//       });

//       agencyIds = userAgencies.map((ua) => ua.agencyId);

//       if (agencyIds.length === 0) {
//         return res
//           .status(403)
//           .json({ error: "Vous n'êtes pas associé à une agence." });
//       }
//     }

//     const whereCondition = hasPermission ? {} : { id: agencyIds };

//     const userAgencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{ model: Image, as: "agencyImages", required: false }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!userAgencies.length) {
//       return res.status(404).json({ error: "Aucune agence trouvée." });
//     }

//     const formattedAgencies = userAgencies.map((agency) => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null,
//     }));

//     res.status(200).json({ success: true, data: formattedAgencies });
//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération des agences:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };
// exports.getUserAgencies = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ error: "Utilisateur non authentifié" });
//     }

//     const userId = req.user.id;
//     const isAdmin = req.isAdmin;
//     let agencyIds = [];

//     if (isAdmin) {
//       // ✅ L'admin a accès à toutes les agences
//       agencyIds = [];
//     } else {
//       // ✅ Récupérer les agences créées par l'utilisateur
//       const createdAgencies = await Agency.findAll({
//         where: { userId },
//         attributes: ["id"],
//       });

//       // ✅ Récupérer les agences où l'utilisateur est affecté via UserAgency
//       const userAgencies = await UserAgency.findAll({
//         where: { userId },
//         attributes: ["agencyId"],
//       });
//       console.log('userAgencies',userAgencies)

//       agencyIds = [
//         ...new Set([
//           ...createdAgencies.map((a) => a.id),
//           ...userAgencies.map((ua) => ua.agencyId),
//         ]),
//       ];
//  console.log('agencyIds',agencyIds)
//       if (agencyIds.length === 0) {
//         return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
//       }
//     }

//     // ✅ Filtrer les agences auxquelles l'utilisateur a accès
//     const whereCondition = isAdmin ? {} : { id: agencyIds };

//     const agencies = await Agency.findAll({
//       where: whereCondition,
//       include: [{ model: Image, as: "agencyImages", required: false }],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!agencies.length) {
//       return res.status(404).json({ error: "Aucune agence trouvée." });
//     }

//     const formattedAgencies = agencies.map((agency) => ({
//       ...agency.toJSON(),
//       logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null,
//     }));

//     res.status(200).json({ success: true, data: formattedAgencies });
//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération des agences:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };
exports.getUserAgencies = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: "Utilisateur non authentifié" });
    }

    const isAdmin = req.isAdmin;
    const agencyIds = isAdmin ? [] : req.accessibleAgencyIds;

    if (!isAdmin && (!agencyIds || agencyIds.length === 0)) {
      return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
    }

    const whereCondition = isAdmin ? {} : { id: agencyIds };

    const agencies = await Agency.findAll({
      where: whereCondition,
      include: [{ model: Image, as: "agencyImages", required: false }],
      order: [["createdAt", "DESC"]],
    });

    if (!agencies.length) {
      return res.status(404).json({ error: "Aucune agence trouvée." });
    }

    const formattedAgencies = agencies.map((agency) => ({
      ...agency.toJSON(),
      logo: agency.logo ? `/uploads/${path.basename(agency.logo)}` : null,
    }));

    res.status(200).json({ success: true, data: formattedAgencies });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des agences:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.updateAgency = async (req, res) => {
  try {
    const { userId } = req.user;
    const agency = await Agency.findByPk(req.params.id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Vérifier les permissions (propriétaire ou admin ou agency)
    // if (agency.userId !== userId ) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to update this agency'
    //   });
    // }

    const updateData = {
      ...req.body,
      updatedBy: userId,
      updatedAt: new Date()
    };

    await agency.update(updateData);

    // Gérer les nouvelles images si elles sont fournies
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni pour les images.',
      });
  }
  
  if (req.files) {
    const newImages = await Promise.all(
        Object.values(req.files).flat().map(async (file) => {
            if (!file.path || !file.mimetype) {
                throw new Error('Fichier manquant ou invalide. Vérifiez les champs path et mimetype.');
            }

            return await Image.create({
                url: file.path,
                type: file.mimetype,
                agencyId: agency.id, // Assurez-vous que agency.id est valide ici
                createdBy: userId,
            });
        })
    );
    agency.images = [...(agency.images || []), ...newImages];
}


    res.status(200).json({
      success: true,
      message: 'Agency updated successfully',
      data: agency
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Supprimer une agence (soft delete)
exports.deleteAgency = async (req, res) => {
  try {
    const { userId } = req.user;
    const agency = await Agency.findByPk(req.params.id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Vérifier les permissions (propriétaire ou admin)
    if (agency.userId !== req.user.id ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this agency'
      });
    }

    // Soft delete
    await agency.update({
      status: 'deleted',
      updatedBy: userId,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Agency deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Statistiques des agences
exports.getAgencyStats = async (req, res) => {
  try {
    const totalAgencies = await Agency.count();
    const activeAgencies = await Agency.count({ where: { status: 'active' } });
    const recentAgencies = await Agency.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
        }
      },
      attributes: ['createdAt'],
      order: [['createdAt', 'DESC']]
    });

    const stats = {
      total: totalAgencies,
      active: activeAgencies,
      recent: recentAgencies.length,
      growthRate: ((recentAgencies.length / totalAgencies) * 100).toFixed(2)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Recherche avancée d'agences
exports.searchAgencies = async (req, res) => {
  try {
    const {
      name,
      location,
      rating,
      status,
      startDate,
      endDate
    } = req.query;

    const whereClause = {
      [Op.and]: [
        name ? { name: { [Op.like]: `%${name}%` } } : {},
        location ? { location: { [Op.like]: `%${location}%` } } : {},
        rating ? { rating: { [Op.gte]: parseFloat(rating) } } : {},
        status ? { status } : {},
        startDate && endDate ? {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        } : {}
      ]
    };

    const agencies = await Agency.findAll({
      where: whereClause,
      include: [{
        model: Image,
        as: 'agencyImages', // Use the correct alias
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: agencies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

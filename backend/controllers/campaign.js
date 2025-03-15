const Campaign = require("../models/compaign"); 
const Vol = require("../models/volModel");
const Image = require("../models/image");
const Company = require("../models/Company");
const Destination = require("../models/destinationModel");
const  Agency  = require("../models/agenceModel");
const sequelize=require('../config/bd')
const { Op } = require("sequelize");
exports.createCampaign = async (req, res) => {
  const { title, type, description, condition, startAt, endAt, price, status, volId, agencyId } = req.body;

  if (!agencyId) {
    return res.status(400).json({ error: "Agency ID is required" });
  }

  try {
    console.log('Request Body:', req.body); // Log request body for debugging
    console.log('Agency ID:', agencyId); // Log agencyId for debugging
    console.log('Files:', req.files); // Log files for debugging
    const campaign = await Campaign.create({
      title,
      type,
      description,
      condition,
      startAt,
      endAt,
      price,
      status,
      volId,
      agencyId, // Include agencyId
      createdBy: req.user.id, 
    });

    // Handle new images if provided
    if (req.files) {
      const newImages = await Promise.all(
        Object.values(req.files).flat().map(async (file) => {
          if (!file.path || !file.mimetype) {
            throw new Error('File path or mimetype is missing.');
          }

          return await Image.create({
            url: file.path,
            type: file.mimetype,
            campaignId: campaign.id,
            createdBy: req.user.id,
          });
        })
      );
      campaign.images = newImages;
    }

    return res.status(201).json({ message: "Campaign created successfully", campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: "Failed to create campaign" });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [
        {
          model: Vol,
          as: "vol",
          include: [
            { model: Company, as: "companyVol" }, // Use the correct alias
            { model: Destination, as: "destination" }
          ]
        },
        { model: Image, as: "images" },
        { model: Agency, as: "associatedAgency" },

      ]
    });
    return res.status(200).json(campaigns);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};
// exports.getCampaignsByUser = async (req, res) => {
//   try {
//     const userId = req.user.id; // Supposons que req.user contient l'utilisateur connecté après authentification

//     // Vérifier si l'utilisateur appartient à une agence
//     const agency = await Agency.findOne({ where: { userId } });

//     if (!agency) {
//       return res.status(403).json({ message: "Vous n'avez pas accès aux campagnes d'agence." });
//     }

//     // Récupérer uniquement les campagnes associées à cette agence
//     const campaigns = await Campaign.findAll({
//       where: { agencyId: agency.id }, 
//       include: [
//         {
//           model: Vol,
//           as: "vol",
//           include: [
//             { model: Company, as: "companyVol" },
//             { model: Destination, as: "destination" }
//           ]
//         },
//         { model: Image, as: "images" },
//         { model: Agency, as: "associatedAgency" },
//       ]
//     });

//     return res.status(200).json(campaigns);
//   } catch (error) {
//     console.error("Error fetching campaigns:", error);
//     return res.status(500).json({ error: "Failed to fetch campaigns" });
//   }
// };
exports.getCampaignsByUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "User ID is missing" });
    }

    // Si admin, il peut voir toutes les campagnes
    if (req.isAdmin) {
      const campaigns = await Campaign.findAll({
        include: [
          {
            model: Vol,
            as: "vol",
            include: [
              { model: Company, as: "companyVol" },
              { model: Destination, as: "destination" }
            ]
          },
          { model: Image, as: "images" },
          { model: Agency, as: "associatedAgency" },
        ]
      });

      return res.status(200).json(campaigns);
    }

    // Si utilisateur normal, récupérer l'agence associée
    const agency = await Agency.findOne({ where: { userId: req.user.id } });

    if (!agency) {
      return res.status(403).json({ message: "Vous n'avez pas accès aux campagnes d'agence." });
    }

    // Récupérer uniquement les campagnes associées à cette agence
    const campaigns = await Campaign.findAll({
      where: { agencyId: agency.id },
      include: [
        {
          model: Vol,
          as: "vol",
          include: [
            { model: Company, as: "companyVol" },
            { model: Destination, as: "destination" }
          ]
        },
        { model: Image, as: "images" },
        { model: Agency, as: "associatedAgency" },
      ]
    });

    return res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

exports.getCampaignById = async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await Campaign.findByPk(id, {
      include: [
        {
          model: Vol,
          as: "vol",
          include: [
            { model: Company, as: "companyVol" }, // Use the correct alias
            { model: Destination, as: "destination" }
          ]
        },
        { model: Image, as: "images" }
      ]
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    return res.status(200).json(campaign);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch campaign" });
  }
};

exports.updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { title, type, description, condition, startAt, endAt, price, status, volId } = req.body;

  try {
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await campaign.update({
      title,
      type,
      description,
      condition,
      startAt,
      endAt,
      price,
      status,
      volId,
      updatedBy: req.user.id,
    });

    // Handle new images if provided
    if (req.files) {
      const newImages = await Promise.all(
        Object.values(req.files).flat().map(async (file) => {
          if (!file.path || !file.mimetype) {
            throw new Error('File path or mimetype is missing.');
          }

          return await Image.create({
            url: file.path,
            type: file.mimetype,
            campaignId: campaign.id,
            createdBy: req.user.id,
          });
        })
      );
      campaign.images = [...(campaign.images || []), ...newImages];
    }

    return res.status(200).json({ message: "Campaign updated successfully", campaign });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update campaign" });
  }
};

exports.deleteCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await campaign.destroy();
    return res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete campaign" });
  } 
};
  
exports.getActiveCampaigns = async (req, res) => {
  try {
    // Récupérer les campagnes où `endAt` est supérieur à la date du jour
    const activeCampaigns = await Campaign.findAll({
      where: {
        endAt: {
          [Op.gt]: new Date(), // Récupère les campagnes avec une date de fin future
        },
      },
      include: [
        {
          model: Vol,
          as: "vol",
          include: [
            { model: Company, as: "companyVol" }, 
            { model: Destination, as: "destination" },
          ],
        },
        { model: Image, as: "images" },
        { model: Agency, as: "associatedAgency" },
      ],
      order: [["endAt", "ASC"]], // Trie les campagnes par date de fin la plus proche
    });

    return res.status(200).json(activeCampaigns);
  } catch (error) {
    console.error("Error fetching active campaigns:", error);
    return res.status(500).json({ error: "Failed to fetch active campaigns" });
  }
};

// exports.getActiveCampaigns = async (req, res) => { 
//   try {
//     const today = new Date();

//     const activeCampaigns = await Campaign.findAll({
//       where: {
//         endAt: { [Op.gte]: today } // Récupère les campagnes dont endAt est >= à aujourd'hui
//       },
//       include: [
//         {
//           model: Vol,
//           as: "vol",
//           include: [
//             { model: Company, as: "companyVol" },
//             { model: Destination, as: "destination" }
//           ]
//         },
//         { model: Image, as: "images" },
//         { model: Agency, as: "associatedAgency" },
//       ],
//       order: [['endAt', 'ASC']] // Trie les campagnes par date de fin croissante
//     });

//     return res.status(200).json(activeCampaigns);
//   } catch (error) {
//     console.error("Error fetching active campaigns:", error);
//     return res.status(500).json({ error: "Failed to fetch active campaigns" });
//   }
// };
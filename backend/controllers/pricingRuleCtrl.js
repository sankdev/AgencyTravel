const PricingRule = require("../models/pricingRule");
const Agency = require("../models/agenceModel");
const Company = require("../models/Company");
const AgencyVol = require("../models/flightAgency");
const AgencyClass = require("../models/agencyClass");
const  Vol  = require("../models/volModel");
const Class=require('../models/classModel')

// 📌 Créer une règle tarifaire
exports.createPricingRule = async (req, res) => {
    try {
        const { agencyId,  agencyVolId, agencyClassId, typePassenger, price } = req.body;

        const newPricingRule = await PricingRule.create({
            agencyId,  agencyVolId, agencyClassId, typePassenger, price
        });

        res.status(201).json(newPricingRule);
    } catch (error) {
        console.error("Erreur lors de la création de la règle tarifaire :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// 📌 Obtenir toutes les règles tarifaires avec les modèles associés
exports.getAllPricingRules = async (req, res) => {
    try {
        const pricingRules = await PricingRule.findAll({
            include: [
                { model: Agency, as: "agency" },
               
                { model: AgencyVol, as: "vol",include:[{model:Vol,as:'flight'}] },
                { model: AgencyClass, as: "class",include:[{model:Class,as:'class'}] }
            ]
        });

        res.json(pricingRules);
    } catch (error) {
        console.error("Erreur lors de la récupération des règles tarifaires :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
exports.getUserPricingRules = async (req, res) => {
    try {
        const userId = req.user.id;

        // Vérifier si l'utilisateur est lié à une agence
        const userAgency = await Agency.findOne({ where: { userId } });

        if (!userAgency) {
            return res.status(403).json({ error: "Vous n'êtes pas associé à une agence." });
        }

        // Récupérer les règles tarifaires de l'agence de l'utilisateur
        const pricingRules = await PricingRule.findAll({
            where: { agencyId: userAgency.id }, // Filtrer par agence
            include: [
                { model: Agency, as: "agency" },
                { model: AgencyVol, as: "vol", include: [{ model: Vol, as: "flight" }] },
                { model: AgencyClass, as: "class", include: [{ model: Class, as: "class" }] }
            ]
        });

        res.json(pricingRules);
    } catch (error) {
        console.error("Erreur lors de la récupération des règles tarifaires :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};


// 📌 Obtenir une règle par ID avec les modèles associés
exports.getPricingRuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const pricingRuleId = parseInt(id, 10); 

        if (isNaN(pricingRuleId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        const pricingRule = await PricingRule.findByPk(pricingRuleId, {
            include: [
                { model: Agency, as: "agency" },
                
                { model: AgencyVol, as: "vol" },
                { model: AgencyClass, as: "class" }
            ]
        });

        if (!pricingRule) {
            return res.status(404).json({ error: "Règle tarifaire non trouvée" });
        }

        res.json(pricingRule);
    } catch (error) {
        console.error("Erreur lors de la récupération de la règle tarifaire :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// 📌 Mettre à jour une règle tarifaire
exports.updatePricingRule = async (req, res) => {
    try {
        const { id } = req.params;
        const pricingRuleId = parseInt(id, 10);

        if (isNaN(pricingRuleId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        const { agencyId, companyId, agencyVolId, agencyClassId, typePassenger, price } = req.body;

        const pricingRule = await PricingRule.findByPk(pricingRuleId);
        if (!pricingRule) {
            return res.status(404).json({ error: "Règle tarifaire non trouvée" });
        }

        await pricingRule.update({ agencyId, companyId, agencyVolId, agencyClassId, typePassenger, price });

        res.json(pricingRule);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la règle tarifaire :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// 📌 Supprimer une règle tarifaire
exports.deletePricingRule = async (req, res) => {
    try {
        const { id } = req.params;
        const pricingRuleId = parseInt(id, 10);

        if (isNaN(pricingRuleId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        const pricingRule = await PricingRule.findByPk(pricingRuleId);

        if (!pricingRule) {
            return res.status(404).json({ error: "Règle tarifaire non trouvée" });
        }

        await pricingRule.destroy();
        res.json({ message: "Règle tarifaire supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la règle tarifaire :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

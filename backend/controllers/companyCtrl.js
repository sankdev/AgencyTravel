const Company = require("../models/Company");
const Image = require('../models/image');
const { Op } = require('sequelize');

exports.createCompany = async (req, res) => {
  const { name, status } = req.body;
  //const logo = req.files && req.files.logo ? req.files.logo[0].path : null;

  if (!name) {
    return res.status(400).json({ error: "Company name is required" });
  }

  try {
    const company = await Company.create({
      name,
      status,
      createdBy: req.user.id,
    });

    console.log('Company created with ID:', company.id);

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
            companyId: company.id, // Ensure companyId is correctly assigned
            createdBy: req.user.id,
          });
        })
      );
      company.images = newImages;
    }

    return res.status(201).json({ message: "Company created successfully", company });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      include: [{
        model: Image,
        as: 'companyImages', // Use the correct alias
        required: false
      }]
    });
    return res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch companies" });
  }
};

exports.getCompanyById = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(id, {
      include: [{
        model: Image,
        as: 'companyImages', // Use the correct alias
        required: false
      }]
    });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    return res.status(200).json(company);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch company" });
  }
};

exports.updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  try {
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    company.name = name || company.name;
    company.status = status || company.status;
    company.updatedBy = req.user.id;

    await company.save();

    console.log('Company updated with ID:', company.id);

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
            companyId: company.id, // Ensure companyId is correctly assigned
            createdBy: req.user.id,
          });
        })
      );
      company.images = [...(company.images || []), ...newImages];
    }

    return res.status(200).json({ message: "Company updated successfully", company });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    await company.update({
      status: 'deleted',
      updatedBy: req.user.id,
      updatedAt: new Date()
    });

    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete company" });
  }
};

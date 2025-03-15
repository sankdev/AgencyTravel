const Image  = require("../models/image");

const imageController = {
  // CREATE - Ajouter une nouvelle image
  createImage: async (req, res) => {
    try {
      const { image, type, size, status, campaignId, companyId, agencyId, destinationId, createdBy } = req.body;

      // Validation : au moins une référence doit être spécifiée
      if (!campaignId && !companyId && !agencyId && !destinationId) {
        return res.status(400).json({ message: 'Image must be linked to at least one entity (campaign, company, agency, or destination).' });
      }

      const newImage = await Image.create({
        image,
        type,
        size,
        status,
        campaignId,
        companyId,
        agencyId,
        destinationId,
        createdBy
      });

      res.status(201).json(newImage);
    } catch (error) {
      res.status(500).json({ message: 'Error creating image', error });
    }
  },

  // CREATE - Ajouter des images pour une agence
  createImageForAgency: async (req, res) => {
    try {
      const { agencyId } = req.body;
      const imageFiles = req.files;

      if (!agencyId) {
        return res.status(400).json({ message: 'Agency ID is required' });
      }

      const images = await Promise.all(
        imageFiles.map(async (file) => {
          return await Image.create({
            url: file.path,
            type: file.mimetype,
            imageable_type: 'Agency',
            imageable_id: agencyId,
            createdBy: req.user.id,
          });
        })
      );

      res.status(201).json({ message: 'Images uploaded successfully', images });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  },

  // CREATE - Ajouter des images pour une entité
  createImageForEntity: async (req, res) => {
    try {
      const { entityId, entityType } = req.body;
      const imageFiles = req.files;

      if (!entityId || !entityType) {
        return res.status(400).json({ message: 'Entity ID and type are required' });
      }

      const columnMapping = {
        campaign: 'campaignId',
        company: 'companyId',
        agency: 'agencyId',
        destination: 'destinationId'
      };

      const column = columnMapping[entityType];
      if (!column) {
        return res.status(400).json({ message: 'Invalid entity type' });
      }

      console.log('Creating images for entity:', entityType, 'with ID:', entityId);

      const images = await Promise.all(
         imageFiles.map(async (file) => {
          return await Image.create({
            url: file.path,
            type: file.mimetype,
            [column]: parseInt(entityId, 10), // Ensure entityId is an integer
            createdBy: req.user.id,
          });
        })
      );

      res.status(201).json({ message: 'Images uploaded successfully', images });
    } catch (error) {
      console.error('Error creating images:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }, 

  // READ - Récupérer une image par son ID 
  getImageById: async (req, res) => {
    try {
      const { id } = req.params;
      const image = await Image.findByPk(id);

      if (!image) {
        return res.status(404).json({ message: 'Image not found.' });
      }

      res.status(200).json(image);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving image', error });
    }
  },

  // READ - Récupérer toutes les images associées à une entité spécifique
  getImagesByEntity: async (req, res) => {
    try {
      const { entityType, entityId } = req.params;

      const columnMapping = {
        campaign: 'campaignId',
        company: 'companyId',
        agency: 'agencyId',
        destination: 'destinationId'
      };

      const column = columnMapping[entityType];
      if (!column) {
        return res.status(400).json({ message: 'Invalid entity type.' });
      }

      const images = await Image.findAll({
        where: { [column]: entityId }
      });

      res.status(200).json(images);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving images', error });
    }
  },

  // UPDATE - Mettre à jour une image
  updateImage: async (req, res) => {
    try {
      const { id } = req.params;
      const { image, type, size, status, campaignId, companyId, agencyId, destinationId, updatedBy } = req.body;

      const existingImage = await Image.findByPk(id);

      if (!existingImage) {
        return res.status(404).json({ message: 'Image not found.' });
      }

      // Mise à jour des champs
      await existingImage.update({
        image,
        type,
        size,
        status,
        campaignId,
        companyId,
        agencyId,
        destinationId,
        updatedBy
      });

      res.status(200).json(existingImage);
    } catch (error) {
      res.status(500).json({ message: 'Error updating image', error });
    }
  },
  updateImagesByEntity: async (req, res) => {
    console.log('updating images by entity',req.params)
    try {
        const { entityType, entityId } = req.params;
        const imageFiles = req.files;

        const columnMapping = {
            campaign: 'campaignId',
            company: 'companyId',
            agency: 'agencyId',
            destination: 'destinationId'
        };

        const column = columnMapping[entityType];
        if (!column) {
            return res.status(400).json({ message: 'Invalid entity type.' });
        }

        // Delete existing images for the entity
        await Image.destroy({ where: { [column]: entityId } });

        // Upload new images
        const images = await Promise.all(
            imageFiles.map(async (file) => {
                return await Image.create({
                    url: file.path,
                    type: file.mimetype,
                    [column]: entityId,
                    createdBy: req.user.id,
                });
            })
        );

        res.status(200).json({ message: 'Images updated successfully', images });
    } catch (error) {
        console.error('Error updating images:', error);
        res.status(500).json({ message: 'Error updating images', error });
    }
},
  

  // DELETE - Supprimer une image
  deleteImage: async (req, res) => {
    try {
      const { id } = req.params;

      const image = await Image.findByPk(id);

      if (!image) {
        return res.status(404).json({ message: 'Image not found.' });
      }

      await image.destroy();

      res.status(200).json({ message: 'Image deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting image', error });
    }
  } 
}; 

module.exports = imageController;

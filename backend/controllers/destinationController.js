const { Destination, Reservation } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Image = require('../models/image');

exports.createDestination = catchAsync(async (req, res) => {
    const { name, location, address, city, country, continent, status } = req.body;
    if (!name || !location || !address || !continent) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const destination = await Destination.create({
        name,
        location,
        address,
        city,
        country,
        continent,
        status: status || 'active',
        createdBy: req.user.id
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
                    destinationId: destination.id,
                    createdBy: req.user.id,
                });
            })
        );
        destination.images = newImages;
    }

    res.status(201).json({
        status: 'success',
        data: destination
    });
});

exports.getDestinationsRecherche = catchAsync(async (req, res) => {
    const { country, city, minPrice, maxPrice, search } = req.query;
    
    // Construire les conditions de recherche
    const where = { status: 'active' };
    if (country) where.country = country;
    if (city) where.city = city;
    if (minPrice) where.price = { [Op.gte]: minPrice };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };
    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
        ];
    }

    const destinations = await Destination.findAll({
        where,
        include: [
            {
                model: Reservation,
                as: 'reservations',
                attributes: ['id', 'status']
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        results: destinations.length,
        data: destinations
    });
});
// all Destination
exports.getDestinations = async (req, res) => {
    try {
      const destinations = await Destination.findAll();
      return res.status(200).json(destinations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch destinations" });
    }
  };

exports.getDestination = catchAsync(async (req, res) => {
    const destination = await Destination.findByPk(req.params.id, {
        include: [
            {
                model: Reservation,
                as: 'reservations',
                attributes: ['id', 'status', 'startAt', 'endAt']
            }
        ]
    });

    if (!destination) {
        throw new AppError('Destination not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: destination
    });
});

exports.updateDestination = catchAsync(async (req, res) => {
    const { name, location, address, city, country, continent, status } = req.body;
    
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) {
        throw new AppError('Destination not found', 404);
    }

    // Mise à jour des champs
    if (name) destination.name = name;
    if (location) destination.location = location;
    if (address) destination.address = address;
    if (city) destination.city = city;
    if (country) destination.country = country;
    if (continent) destination.continent = continent;
    if (status) destination.status = status;
    
    destination.updatedBy = req.user.id;
    await destination.save();

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
                    destinationId: destination.id,
                    createdBy: req.user.id,
                });
            })
        );
        destination.images = [...(destination.images || []), ...newImages];
    }

    res.status(200).json({
        status: 'success',
        data: destination
    });
});

exports.deleteDestination = catchAsync(async (req, res) => {
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) {
        throw new AppError('Destination not found', 404);
    }

    // Soft delete - changer le statut plutôt que de supprimer
    destination.status = 'inactive';
    destination.updatedBy = req.user.id;
    await destination.save();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getDestinationStats = catchAsync(async (req, res) => {
    const stats = await Reservation.findAll({
        where: { destinationId: req.params.id },
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
    });

    res.status(200).json({
        status: 'success',
        data: stats
    });
});

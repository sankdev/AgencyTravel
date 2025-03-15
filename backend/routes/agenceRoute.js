const express = require('express');
const router = express.Router();
const {
    createAgency,
    getAgencies,
    getAgency,
    updateAgency,
    deleteAgency,getUserAgencies,getAgenciesProfile,
    searchAgencies,getAgencyStats}
 = require('../controllers/agencyController');
const { upload} = require('../middleware/uploadMiddleware');
const {authenticate,checkPermission,checkAgencyAccess} = require("../middleware/authMiddleware");
//const agencyController = require('../controllers/agencyController');
// console.log(agencyController);
//console.log("getUserAgencies:", getUserAgencies);
 

// Routes publiques 
// router.get('/userAgency', authenticate, checkPermission('view_agencies'), getUserAgencies);
// Route publique pour récupérer les agences d'un utilisateur spécifique
router.get('/userAgency/:userId', authenticate, checkAgencyAccess, getUserAgencies);


router.get('/',  getAgencies);
router.get('/profile', authenticate, getAgenciesProfile);
router.get('/:id',  getAgency);
 router.get('/stats', getAgencyStats);
router.delete('/:id', authenticate, deleteAgency);
router.get('/search/:query',searchAgencies)
// Routes protégées (nécessitent une authentification)
router.post('/', authenticate, 
    upload.fields([ 
        { name: 'logo', maxCount: 1 },
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 }, 
        { name: 'image3', maxCount: 1 }
    ]),
    (req, res) => {
        createAgency(req, res).catch(err => {
            console.error(err);
            res.status(400).json({ error: err.message });
        });
    }
);

router.put('/:id', authenticate,
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 }
    ]),
    (req, res) => { 
        updateAgency(req, res).catch(err => {
            console.error(err);
            res.status(400).json({ error: err.message });
        });
    }
);


// Export du router
module.exports = router;

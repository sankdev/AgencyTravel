require('dotenv').config(); // Chargement des variables d'environnement
const express = require('express');
const db = require('./config/bd');
const cors = require('cors');
const path = require('path');
const app = express();
const sequelize = require('./config/bd');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const bodyParser=require('body-parser')
const multer=require('./middleware/uploadMiddleware')

// Routes
const agency = require('./routes/agenceRoute');
const customer = require('./routes/customerRoute');
const userRole = require('./routes/userRoleRoute');
const user = require('./routes/userRoute');
const permission = require('./routes/permissionRoute');
const destination = require('./routes/destinationRoutes');
const visa = require('./routes/visasRoute');
const company = require('./routes/companyRoute');
const campaign = require('./routes/campaignRoute');
const vol = require('./routes/volRoute');
const routeClass = require('./routes/routesClass');
const role = require('./routes/roleRoute');
const payment = require('./routes/paymentRoutes');
const paymentMode = require('./routes/paymentModeRoute');
const passenger = require('./routes/passengerRoute');
const invoice = require('./routes/invoiceRoutes');
const image = require('./routes/ImageRoute');
const reservation = require('./routes/reservationRoutes');
const flight = require('./routes/flightRoute'); // Import the flight route
const Flights=require('./routes/flightRoutesApi')
const agencyClass=require('./routes/agencyAssociationsRoutes')
const pricinRule=require('./routes/pricingRuleRoute')
const rolePermission = require('./routes/rolePermissionRoute'); // Import the role permission route
// Middlewares globaux
const userAgencyRoute=require('./routes/userAgencyRoute')
const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

// Configuration des middlewares
app.use(express.json()); // Pour parser les requêtes JSON
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true })); // Pour form-urlencoded
// Pour les fichiers
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
// app.use(helmet({
//   contentSecurityPolicy: false, // ✅ Désactive temporairement la CSP
// }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // 🔥 Autoriser toutes les origines
  next();
});

//app.use(helmet.crossOriginOpenerPolicy({policy:'same-origin'})); // Sécurisation des en-têtes HTTP
app.use(xss()); // Protection contre les attaques XSS
app.use(hpp()); // Protection contre les attaques par pollution des paramètres
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Logging en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limitation des requêtes pour éviter les abus
// const limiter = rateLimit({
//   max: 100, // Nombre maximum de requêtes par IP
//   windowMs: 60 * 60 * 1000, // Intervalle d'une heure
//   message: 'Too many requests from this IP, please try again in an hour!',
// });
//app.use('/api', limiter);

// Déclaration des routes
app.use('/api/reservations', reservation);
app.use('/api/agency', agency);
app.use('/api/customer', customer);
app.use('/api/user', user);
app.use('/api/destinations', destination);
app.use('/api/roleUser', userRole);
app.use('/api/visa', visa);
app.use('/api/role', role);
app.use('/api/permissions', permission);
app.use('/api/company', company);
app.use('/api/campaign', campaign);
app.use('/api/vols', vol);
app.use('/api/classes', routeClass);
app.use('/api/invoice', invoice);
app.use('/api/payment', payment);
app.use('/api/paymentMode', paymentMode);
app.use('/api/passenger', passenger);
app.use('/uploads', express.static('uploads'));
app.use('/api/image', image);
app.use('/api/flights', flight); // Use the flight route
app.use('/apis/flights', Flights); // Use the flight route 
app.use('/api', agencyClass);
app.use('/api/pricing-rules',pricinRule)
app.use('/api/role-permissions', rolePermission); // Use the role permission route
app.use('/api/userAgency',userAgencyRoute)
// Gestion des routes non trouvées
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Gestionnaire d'erreurs global
app.use(globalErrorHandler);

// Synchronisation avec la base de données et démarrage du serveur
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter:true}).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
  console.error(err.stack);
});

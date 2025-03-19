const User = require("./userModel");
const Agency = require("./agenceModel");
const Destination = require("./destinationModel");
const Company = require("./company");
const Vol = require("./volModel");
const Campaign = require("./compaign");
const Reservation = require("./booking");
const Payment = require("./payment");
const Invoice = require("./invoice");
const PaymentMode = require("./paymentMode");
const Customer = require("./customer");
const Passenger = require("./Passenger");
const UserRole = require("./userRoleModel");
const Permission = require("./permissionModel");
const Role = require("./roleModel");
const Image = require("./image");
const RolePermission=require('./rolepermissionModel')
const UserAgency=require('./userAgencies')
// Define associations
User.hasMany(Reservation, { foreignKey: "userId", as: "reservations" });
Reservation.belongsTo(User, { foreignKey: "userId", as: "customer" });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoicePayment' });
Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments' });

// Si tu as déjà ces lignes, supprime toute duplication ailleurs !
User.belongsToMany(Agency, { through: UserAgency, foreignKey: "userId", as: "assignedAgencies" });
Agency.belongsToMany(User, { through: UserAgency, foreignKey: "agencyId", as: "assignedUsers" });

UserAgency.belongsTo(User, { foreignKey: "userId", as: "user" });
UserAgency.belongsTo(Agency, { foreignKey: "agencyId", as: "agency" });

Reservation.belongsTo(Customer, { foreignKey: 'customerId',as:'customerReservation' });
Customer.hasMany(Reservation, { foreignKey: 'customerId' });

User.hasMany(Agency, { foreignKey: 'userId', as: 'userAgencies' });
Agency.belongsTo(User, { foreignKey: 'userId', as: 'User' });
  Agency.hasMany(Vol, { foreignKey: 'agencyId', as: 'volsAgencies' });
Agency.hasMany(Invoice,{foreignKey:'agencyId',as:'agencyInvoices'});
Invoice.belongsTo(Agency,{foreignKey:'agencyId',as:'agencyIvoice'
})

// Destination.hasMany(Reservation, { foreignKey: "destinationId", as: "reservations" });
// Reservation.belongsTo(Destination, { foreignKey: "destinationId", as: "destination" });
// Vol.belongsTo(Destination, { as: 'origin', foreignKey: 'originId' });
// Vol.belongsTo(Destination, { as: 'destination', foreignKey: 'destinationId' });
// Reservation.belongsTo(Destination, { as: 'startDestination', foreignKey: 'startDestinationId' });
// Reservation.belongsTo(Destination, { as: 'endDestination', foreignKey: 'endDestinationId' });


Destination.hasMany(Vol, { as: 'volsAsOrigin', foreignKey: 'originId' });
Destination.hasMany(Vol, { as: 'volsAsDestination', foreignKey: 'destinationId' });
// Company.hasMany(Reservation, { foreignKey: "companyId", as: "companyReservations" });
// Reservation.belongsTo(Company, { foreignKey: "companyId", as: "companyReservation" });

Passenger.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation'});
Reservation.hasMany(Passenger, { foreignKey: 'reservationId', as: 'passengers' });

// Vol.hasMany(Reservation, { foreignKey: "volId", as: "volReservations" });
// Reservation.belongsTo(Vol, { foreignKey: "volId", as: "vol" });

Vol.belongsTo(Company, { foreignKey: "companyId", as: "companyVol" });
Vol.belongsTo(Destination, { foreignKey: "destinationId", as: "destination" });

Campaign.hasMany(Reservation, { foreignKey: "campaignId", as: "campaignReservations" });
Reservation.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign" });

Customer.hasMany(Invoice, { foreignKey: "customerId", as: "invoices" });
Invoice.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

Reservation.hasMany(Invoice, { foreignKey: "reservationId", as: "reservationInvoices" });
Invoice.belongsTo(Reservation, { foreignKey: "reservationId", as: "reservation" });

// Invoice.hasMany(Payment, { foreignKey: "invoiceId", as: "invoicePayments" });
// Payment.belongsTo(Invoice, { foreignKey: "invoiceId", as: "invoice" });

PaymentMode.hasMany(Payment, { foreignKey: "paymentModeId", as: "paymentModePayments" });
Payment.belongsTo(PaymentMode, { foreignKey: "paymentModeId", as: "paymentMode" });

User.hasMany(UserRole, { foreignKey: "userId", as: "userRoles" });
UserRole.belongsTo(User, { foreignKey: "userId", as: "userRole" });

Role.hasMany(UserRole, { foreignKey: "roleId", as: "roleUsers" });
UserRole.belongsTo(Role, { foreignKey: "roleId", as: "role" });

RolePermission.belongsTo(Permission, { foreignKey: "permissionId", as: "permission" });
Permission.hasMany(RolePermission, { foreignKey: "permissionId", as: "rolePermissions" });
// Association entre UserRole et RolePermission
// UserRole.hasMany(RolePermission, { foreignKey: "userRoleId", as: "rolePermissions" });
// RolePermission.belongsTo(UserRole, { foreignKey: "userRoleId", as: "userRole" });
RolePermission.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(RolePermission, { foreignKey: "roleId", as: "rolePermissions" });
Role.belongsToMany(Permission, { through: 'RolePermission' });
Permission.belongsToMany(Role, { through: 'RolePermission' });

// Campaign.hasMany(Image, { foreignKey: "campaignId", as: "campaignImages" });
// Image.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign" });

Company.hasMany(Image, { foreignKey: "companyId", as: "companyImages" });
Image.belongsTo(Company, { foreignKey: "companyId", as: "companyImage" });

Agency.hasMany(Image, { foreignKey: "agencyId", as: "agencyImages" });
Image.belongsTo(Agency, { foreignKey: "agencyId", as: "agencyImage" });

Destination.hasMany(Image, { foreignKey: "destinationId", as: "destinationImages" });
Image.belongsTo(Destination, { foreignKey: "destinationId", as: "destinationImage" });
 Vol.belongsTo (Agency,{foreignKey:'agencyId',as:'volAgency'})
Agency.hasMany(Campaign, { foreignKey: "agencyId", as: "agencyCampaigns" });
Campaign.belongsTo(Agency, { foreignKey: "agencyId", as: "associatedAgency" });
Agency.hasMany(Reservation,{foreignKey:'agencyId',as:'agecencyReservations'})
Reservation.belongsTo(Agency,{foreignKey:'agencyId',as:'agencyReservations'})
// Image.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });
Campaign.hasMany(Image, {
  foreignKey: "campaignId",
  as: "images",
});
module.exports = {
  User,
  Agency,
  Destination,
  Company,
  Vol,
  Campaign,
  Reservation,
  Customer,
  Passenger,
  Invoice,
  Payment,
  PaymentMode,
  Role,
  Permission,
  UserRole,
  Image,UserAgency,RolePermission
};

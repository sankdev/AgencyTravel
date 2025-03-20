//const { Invoice, Reservation, Customer, Payment } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Invoice=require('../models/invoice')
const Reservation=require('../models/booking')
const Customer=require('../models/customer')
const Payment=require('../models/payment');
const  Passenger  = require('../models/passenger');
const Agency=require('../models/agenceModel')
const Destination=require('../models/destinationModel')
const Class=require('../models/classModel');
const Company = require('../models/company');
const Vol=require('../models/volModel')
const NotificationService = require('../services/notification.service');
const  User  = require('../models/userModel');
const FlightAgency=require('../models/flightAgency')
const paymentMode=require('../models/paymentMode')
const UserAgency=require('../models/userAgencies')

exports.createInvoice = catchAsync(async (req, res) => {
    const { reservationId, amount, dueDate } = req.body;
    
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
        throw new AppError('Reservation not found', 404);
    }

    const invoice = await Invoice.create({
        reservationId,
        customerId: reservation.customerId,
        amount:reservation.TotalPrice,
        dueDate,
        status: 'unpaid',
        createdBy: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: invoice
    });
});

// exports.getInvoices = async (req, res) => {
//     const invoices = await Invoice.findAll({
      
//         where:  { customerId: req.user.id } 
//     });

//     res.status(200).json({
//         status: 'success',
//         results: invoices.length,
//         data: invoices
//     });
// };
exports.getInvoices = async (req, res) => {
    let whereCondition = {};

    // Vérifier si l'utilisateur est un Customer
    const customer = await Customer.findOne({ where: { userId: req.user.id } });

    if (customer) {
        whereCondition.customerId = customer.id;
    } else {
        // Vérifier si l'utilisateur est une Agency
        const agency = await Agency.findOne({ where: { userId: req.user.id } });
        if (agency) {
            whereCondition['$reservation.agencyId$'] = agency.id;
        } else {
            throw new AppError('No associated Customer or Agency found for this user', 404);
        }
    }

    const invoices = await Invoice.findAll({
        include: [
            {
                model: Reservation,
                as: 'reservation', // ✅ Correct
                include: [
                    { model: Destination, as: 'startDestination' },
                    { model: Destination, as: 'endDestination' }
                ]
            },
            {
                model: Customer,
                as: 'customer' // ✅ Correct
            },
           
           
        ],
        where: whereCondition
    });

    res.status(200).json({
        status: 'success',
        results: invoices.length,
        data: invoices
    });
};

const getUserAgency = async (userId) => {
    // Vérifier si l'utilisateur est le créateur d'une agence
    let agency = await Agency.findOne({ where: { userId } });

    if (!agency) {
        // Vérifier s'il est assigné à une agence
        const userAgency = await UserAgency.findOne({ where: { userId } });
        if (userAgency) {
            agency = await Agency.findOne({ where: { id: userAgency.agencyId } });
        }
    }

    return agency;
};

exports.getInvoicesForAgency = async (req, res) => {
    try {
        const userId = req.user.id;
        const agency = await getUserAgency(userId);

        if (!agency) {
            return res.status(404).json({ message: "No associated Agency found for this user" });
        }

        const invoices = await Invoice.findAll({
            include: [
                {
                    model: Reservation,
                    as: "reservation",
                    where: { agencyId: agency.id },
                    include: [
                        { model: Destination, as: "startDestination" },
                        { model: Destination, as: "endDestination" }
                    ]
                },
                { model: Customer, as: "customer" }
            ]
        });

        res.status(200).json({
            status: "success",
            results: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error("❌ Error in getInvoicesForAgency:", error);
        res.status(500).json({ message: "Failed to retrieve agency invoices" });
    }
};

//     try {
//         const userId = req.user.id;

//         // Vérifier si l'utilisateur est créateur d'une agence
//         let agency = await Agency.findOne({ where: { userId } });

//         if (!agency) {
//             // Vérifier si l'utilisateur est assigné à une agence
//             const userAgency = await UserAgency.findOne({ where: { userId } });
//             if (!userAgency) {
//                 return res.status(404).json({ message: "No associated Agency found for this user" });
//             }
//             agency = await Agency.findOne({ where: { id: userAgency.agencyId } });
//         }

//         if (!agency) {
//             return res.status(404).json({ message: "No associated Agency found" });
//         }

//         // Récupérer les factures liées à l'agence
//         const invoices = await Invoice.findAll({
//             include: [
//                 {
//                     model: Reservation,
//                     as: "reservation",
//                     where: { agencyId: agency.id }, // Filtrer par l'ID de l'agence
//                     include: [
//                         { model: Destination, as: "startDestination" },
//                         { model: Destination, as: "endDestination" }
//                     ]
//                 },
//                 { model: Customer, as: "customer" }
//             ]
//         });

//         res.status(200).json({
//             status: "success",
//             results: invoices.length,
//             data: invoices
//         });
//     } catch (error) {
//         console.error("❌ Error in getInvoicesForAgency:", error);
//         res.status(500).json({ message: "Failed to retrieve agency invoices" });
//     }
// };
exports.getInvoicesForCustomer = async (req, res) => {
    try {
        const userId = req.user.id;
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            return res.status(404).json({ message: "No associated Customer found for this user" });
        }

        const invoices = await Invoice.findAll({
            include: [
                {
                    model: Reservation,
                    as: "reservation",
                    include: [
                        { model: Destination, as: "startDestination" },
                        { model: Destination, as: "endDestination" }
                    ]
                },
                { model: Customer, as: "customer" }
            ],
            where: { customerId: customer.id }
        });

        res.status(200).json({
            status: "success",
            results: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error("❌ Error in getInvoicesForCustomer:", error);
        res.status(500).json({ message: "Failed to retrieve customer invoices" });
    }
};

// exports.getInvoice = async (req, res) => {
//     const invoice = await Invoice.findByPk(req.params.id, {
//         include: [
//             {
//                 model: Reservation,
//                 as: 'reservation',
//                 include: [
//                     { model: Destination, as: 'startDestination' },
//                     { model: Destination, as: 'endDestination' }
//                 ]
//             },
//             {
//                 model: Customer,
//                 as: 'customer'
//             },
//             {
//                 model: Payment,
//                 as: 'payments'
//             }
//         ]
//     });

//     if (!invoice) {
//         throw new AppError('Invoice not found', 404);
//     }

//     // Vérifier que l'utilisateur a le droit d'accéder à cette facture
//     // if (req.user.role === 'customer' && invoice.customerId !== req.user.id) {
//     //     throw new AppError('You are not authorized to view this invoice', 403);
//     // }

//     res.status(200).json({
//         status: 'success',
//         data: invoice
//     });
// };
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Reservation,
                    as: 'reservation',
                    include: [
                        { model: Destination, as: 'startDestination' },
                        { model: Destination, as: 'endDestination' },
                        { model: Passenger ,as:'passengers' }, // Inclure les passagers liés à la réservation
                         { model: Agency,as:'agencyReservations' ,include:[{model:FlightAgency,as:'agencyFlights'}]} // Inclure l'agence liée à la réservation,
                         ,
                    ]
                },
                {
                    model: Customer,
                    as: 'customer'
                },
                
                {
                    model: Payment,
                    as: 'payments'
                }
            ]
        });

        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.updateInvoice = catchAsync(async (req, res) => {
    const { status, dueDate } = req.body;
    
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
        throw new AppError('Invoice not found', 404);
    }

    // Mise à jour des champs autorisés
    if (status) invoice.status = status;
    if (dueDate) invoice.dueDate = dueDate;
    
    invoice.updatedBy = req.user.id;
    await invoice.save();

    res.status(200).json({
        status: 'success',
        data: invoice
    });
});

exports.deleteInvoice = catchAsync(async (req, res) => {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
        throw new AppError('Invoice not found', 404);
    }

    await invoice.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// exports.downloadInvoice = catchAsync(async (req, res) => {
//     const invoice = await Invoice.findByPk(req.params.id, {
//         include: [
//             {
//                 model: Reservation,
//                 as: 'reservation',
//                 include: ['destination']
//             },
//             {
//                 model: Customer,
//                 as: 'customer'
//             }
//         ]
//     });

//     if (!invoice) {
//         throw new AppError('Invoice not found', 404);
//     }

//     // Vérifier l'autorisation
//     if (req.user.role === 'customer' && invoice.customerId !== req.user.id) {
//         throw new AppError('You are not authorized to download this invoice', 403);
//     }

//     // Ici, vous pouvez implémenter la logique pour générer le PDF de la facture
//     // Pour l'exemple, nous renvoyons juste les données
//     res.status(200).json({
//         status: 'success',
//         data: invoice
//     });
// });

const PRIVATE_KEY = 'my_super_secure_private_key'; // À stocker en environnement sécurisé

// exports.downloadInvoice = async (req, res) => {
//     try {
//         console.log('customerId', req.params.id);

//         const invoice = await Invoice.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Reservation,
//                     as: 'reservation',
//                     include: [{model:FlightAgency,as:'vols',include: [{ model: Vol, as: 'flight', include: { model: Company, as: 'companyVol' } }]}
//                        ,
//                         { model: Passenger, as: 'passengers' },
//                         { model: Agency, as: 'agencyReservations' },
//                         { model: Destination, as: 'startDestination' },
//                         { model: Destination, as: 'endDestination' }
//                     ],
//                 },
//                 { model: Customer, as: 'customer', include: { model: User, as: 'user' } },
//                 { model: Payment, as: 'payments' }
//             ]
//         });

//         if (!invoice) {
//             return res.status(404).json({ message: 'Invoice not found' });
//         }

//         const invoicesDir = path.join(__dirname, '../secure_invoices');
//         if (!fs.existsSync(invoicesDir)) {
//             fs.mkdirSync(invoicesDir, { recursive: true });
//         }

//         const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
//         const doc = new PDFDocument({ margin: 50 });
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         const agency = invoice.reservation?.agencyReservations;
//         const logoPath = agency?.logo ? path.join(__dirname, '/uploads', agency.logo) : null;

//         // En-tête avec logo et informations de l'agence
//         if (logoPath && fs.existsSync(logoPath)) {
//             doc.image(logoPath, 50, 30, { width: 100 });
//         }

//         //doc.fontSize(20).fillColor('black').font('Helvetica-Bold').text(`FACTURE PROFORMA`, { align: 'center' }).moveDown();

//         if (agency) {
//             doc.fontSize(20).fillColor('blue').font('Helvetica-Bold').text(agency.name, { align: 'center' });
//             doc.fontSize(10).fillColor('black').text(`${agency.address || 'N/A'} - ${agency.phone || 'N/A'}`, { align: 'center' }).moveDown();
//             doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text(`AGENCE DE VOYAGE`, { align: 'center' }).moveDown();
//         }

//         doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
//         doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
//         doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();

//         // Détails de la réservation
//         doc.fontSize(14).fillColor('black').text(`Détails de la Réservation`, { underline: true }).moveDown(0.5);

//         const reservation = invoice.reservation;
//         console.log('reservation',reservation.vols)
//         if (reservation) {
//             doc.fontSize(12);
           
//             doc.text(`Vol: ${reservation.vols?.name || 'N/A'} - ${reservation.vol?.flightNumber || 'N/A'}`);
//             doc.text(`Départ: ${reservation.startDestination?.country || 'N/A'}`);
//             doc.text(`Arrivée: ${reservation.endDestination?.country || 'N/A'}`);
//             doc.text(`Date de vol: ${reservation.vol?.endDate || 'N/A'}`).moveDown();
//         }

//         // Détails des paiements
//         doc.fontSize(14).fillColor('black').text(`Détails des Paiements`, { underline: true }).moveDown(0.5);

//         if (invoice.payments.length > 0) {
//             doc.fontSize(12);
//             invoice.payments.forEach((payment, index) => {
//                 doc.text(
//                     `${index + 1}. Mode: ${payment.modePaymentId} | Montant: ${payment.amount.toFixed(2)} Fcfa | Réf: ${payment.reference} | Date: ${new Date(payment.paymentDate).toLocaleDateString()}`
//                 );
//             });
//         } else {
//             doc.text(`Aucun paiement enregistré.`);
//         }
//         doc.moveDown();

//         // Détails de la facture
//         doc.fontSize(14).fillColor('black').text(`Détails de la Facture`, { underline: true }).moveDown(0.5);

//         const tableTop = doc.y;
//         const columnWidths = [200, 80, 100, 100];
//         const headers = ["Nom du Passager", "Quantité", "Montant Unitaire TTC", "Montant TTC"];
//         let startX = 50;
//         let rowHeight = 30;
//         let startY = tableTop + 10;

//         // En-tête du tableau
//         doc.fillColor('white').rect(startX, startY - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('blue');
//         doc.fillColor('white').fontSize(12).font('Helvetica-Bold');

//         headers.forEach((header, i) => {
//             doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, startY, { width: columnWidths[i], align: 'center' });
//         });

//         doc.strokeColor('black').lineWidth(1).rect(startX, startY - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
//         doc.moveDown();

//         let currentY = startY + rowHeight;
//         doc.font('Helvetica').fontSize(12);

//         invoice.reservation.passengers.forEach((passenger, index) => {
//             doc.fillColor(index % 2 === 0 ? 'lightgray' : 'white').rect(startX, currentY - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill();
//             doc.fillColor('black');

//             const row = [
//                 `${passenger.firstName} ${passenger.lastName}`,
//                 `1`,
//                 `${invoice.amount.toFixed(2)} Fcfa`,
//                 `${invoice.totalWithTax.toFixed(2)} Fcfa`
//             ];

//             row.forEach((text, i) => {
//                 doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, currentY, { width: columnWidths[i], align: 'center' });
//             });

//             doc.strokeColor('black').rect(startX, currentY - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
//             currentY += rowHeight;
//         });

//         doc.moveDown();

//         // Résumé du montant
//         doc.fontSize(12).font('Helvetica-Bold');
//         doc.text(`Total TTC: ${invoice.totalWithTax.toFixed(2)} Fcfa`, 375, doc.y);
//         doc.text(`Reliquat: ${invoice.balance.toFixed(2)} Fcfa`, 375, doc.y + 10);
//         doc.text(`Net à Payer: ${invoice.totalWithTax.toFixed(2)} Fcfa`, 375, doc.y + 10);
//         doc.moveDown();

//         doc.end();

//         stream.on('finish', () => {
//             res.download(filePath, `Invoice-${invoice.reference}.pdf`);
//         });

//     } catch (error) {
//         console.error("Erreur lors de la génération de la facture :", error);
//         res.status(500).json({ message: 'Erreur interne du serveur' });
//     }
// };


// exports.downloadInvoice = async (req, res) => {
//     try {
//         console.log('customerId', req.params.id);

//         const invoice = await Invoice.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Reservation,
//                     as: 'reservation',
//                     include: [
//                         { model: FlightAgency, as: 'vols', include: [{ model: Vol, as: 'flight', include: { model: Company, as: 'companyVol' } }] },
//                         { model: Passenger, as: 'passengers' },
//                         { model: Agency, as: 'agencyReservations' },
//                         { model: Destination, as: 'startDestination' },
//                         { model: Destination, as: 'endDestination' }
//                     ],
//                 },
//                 { model: Customer, as: 'customer', include: { model: User, as: 'user' } },
//                 { model: Payment, as: 'payments' }
//             ]
//         });

//         if (!invoice) {
//             return res.status(404).json({ message: 'Invoice not found' });
//         }

//         const invoicesDir = path.join(__dirname, '../secure_invoices');
//         if (!fs.existsSync(invoicesDir)) {
//             fs.mkdirSync(invoicesDir, { recursive: true });
//         }

//         const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
//         const doc = new PDFDocument({ margin: 50 });
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         const agency = invoice.reservation?.agencyReservations;
//         const logoPath = agency?.logo ? path.join(__dirname, '../uploads', agency.logo) : null;

//         if (logoPath && fs.existsSync(logoPath)) {
//             doc.image(logoPath, 50, 30, { width: 100 });
//         }

//         if (agency) {
//             doc.fontSize(20).fillColor('blue').font('Helvetica-Bold').text(agency.name, { align: 'center' });
//             doc.fontSize(10).fillColor('black').text(`${agency.address || 'N/A'} - ${agency.phone || 'N/A'}`, { align: 'center' }).moveDown();
//             doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text("AGENCE DE VOYAGE", { align: 'center' }).moveDown();
//         }

//         doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
//         doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
//         doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();

//         doc.fontSize(14).fillColor('black').text("Détails de la Réservation", { underline: true }).moveDown(0.5);
//         const reservation = invoice.reservation;

//         if (reservation) {
//             doc.fontSize(12);
//             doc.text(`Vol: ${reservation.vols?.flight?.name || 'N/A'} - ${reservation.vols?.flight?.flightNumber || 'N/A'}`);
//             doc.text(`Départ: ${reservation.startDestination?.country || 'N/A'}`);
//             doc.text(`Arrivée: ${reservation.endDestination?.country || 'N/A'}`);
//             doc.text(`Date de vol: ${reservation.vols?.flight?.endDate || 'N/A'}`).moveDown();
//         }

//         doc.fontSize(14).fillColor('black').text("Détails de la Facture", { underline: true }).moveDown(0.5);

//         const tableTop = doc.y + 10;
//         const startX = 50;
//         const columnWidths = [250, 100, 100];
//         const rowHeight = 30;
//         const headers = ["Nom du Passager", "Montant Unitaire TTC", "Montant TTC"];

//         // Dessiner les en-têtes du tableau avec un fond bleu
//         doc.fillColor('blue')
//             .rect(startX, tableTop, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//             .fill();
        
//         doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
//         headers.forEach((header, i) => {
//             doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, tableTop + 10, { width: columnWidths[i], align: 'center' });
//         });

//         // Bordure de l'en-tête
//         doc.strokeColor('black').lineWidth(1)
//             .rect(startX, tableTop, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//             .stroke();

//         let currentY = tableTop + rowHeight;

//         // Afficher les passagers
//         invoice.reservation.passengers.forEach((passenger, index) => {
//             const bgColor = index % 2 === 0 ? 'lightgray' : 'white';
//             doc.fillColor(bgColor)
//                 .rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//                 .fill();
            
//             doc.fillColor('black').font('Helvetica').fontSize(12);
//             const row = [
//                 `${passenger.firstName} ${passenger.lastName}`,
//                 `${invoice.amount.toFixed(2)} Fcfa`,
//                 `${invoice.totalWithTax.toFixed(2)} Fcfa`
//             ];

//             row.forEach((text, i) => {
//                 doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, currentY + 10, { width: columnWidths[i], align: 'center' });
//             });

//             // Bordure de chaque ligne
//             doc.strokeColor('black')
//                 .rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//                 .stroke();

//             currentY += rowHeight;
//         });

//         doc.moveDown();

//         // Résumé du montant
//         doc.fontSize(12).font('Helvetica-Bold');
//         doc.text(`Total TTC: ${invoice.totalWithTax.toFixed(2)} Fcfa`, 375, doc.y);
//         doc.text(`Reliquat: ${invoice.balance.toFixed(2)} Fcfa`, 375, doc.y + 10);
//         doc.text(`Net à Payer: ${invoice.totalWithTax.toFixed(2)} Fcfa`, 375, doc.y + 10);
//         doc.moveDown();

//         doc.end();

//         stream.on('finish', () => {
//             res.download(filePath, `Invoice-${invoice.reference}.pdf`);
//         });

//     } catch (error) {
//         console.error("Erreur lors de la génération de la facture :", error);
//         res.status(500).json({ message: 'Erreur interne du serveur' });
//     }
// };

// exports.downloadInvoice = async (req, res) => {
//     try {
//         console.log('Invoice ID:', req.params.id);
        
//         const invoice = await Invoice.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Reservation,
//                     as: 'reservation',
//                     include: [
//                         { model: FlightAgency, as: 'vols', include: [{ model: Vol, as: 'flight', include: { model: Company, as: 'companyVol' } }] },
//                         { model: Passenger, as: 'passengers' },
//                         { model: Agency, as: 'agencyReservations' },
//                         { model: Destination, as: 'startDestination' },
//                         { model: Destination, as: 'endDestination' }
//                     ],
//                 },
//                 { model: Customer, as: 'customer', include: { model: User, as: 'user' } },
//                 { model: Payment, as: 'payments' }
//             ]
//         });

//         if (!invoice) {
//             return res.status(404).json({ message: 'Facture introuvable' });
//         }

//         const invoicesDir = path.join(__dirname, '../secure_invoices');
//         if (!fs.existsSync(invoicesDir)) {
//             fs.mkdirSync(invoicesDir, { recursive: true });
//         }

//         const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
//         const doc = new PDFDocument({ margin: 50 });
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         const agency = invoice.reservation?.agencyReservations;
//         const logoPath = agency?.logo ? path.join(__dirname, '../uploads', agency.logo) : null;

//         if (logoPath && fs.existsSync(logoPath)) {
//             doc.image(logoPath, 50, 30, { width: 100 });
//         }

//         if (agency) {
//             doc.fontSize(20).fillColor('blue').font('Helvetica-Bold').text(agency.name, { align: 'center' });
//             doc.fontSize(10).fillColor('black').text(`${agency.address || 'N/A'} - ${agency.phone || 'N/A'}`, { align: 'center' }).moveDown();
//             doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text("AGENCE DE VOYAGE", { align: 'center' }).moveDown();
//         }

//         doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
//         doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
//         doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();

//         doc.fontSize(14).fillColor('black').text("Détails de la Réservation", { underline: true }).moveDown(0.5);
//         const reservation = invoice.reservation;

//         if (reservation) {
//             doc.fontSize(12);
//             doc.text(`Vol: ${reservation.vols?.flight?.name || 'N/A'} - ${reservation.vols?.flight?.flightNumber || 'N/A'}`);
//             doc.text(`Départ: ${reservation.startDestination?.country || 'N/A'}`);
//             doc.text(`Arrivée: ${reservation.endDestination?.country || 'N/A'}`);
//             doc.text(`Date de vol: ${reservation.vols?.flight?.endDate || 'N/A'}`).moveDown();
//         }

//         doc.fontSize(14).fillColor('black').text("Détails de la Facture", { underline: true }).moveDown(0.5);

//         const startX = 50;
//         const columnWidths = [250, 100, 100];
//         const rowHeight = 30;
//         let currentY = doc.y + 10;

//         invoice.reservation.passengers.forEach((passenger, index) => {
//             doc.fillColor(index % 2 === 0 ? 'lightgray' : 'white')
//                 .rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//                 .fill()
//                 .fillColor('black');
//             doc.text(`${passenger.firstName} ${passenger.lastName}`, startX + 10, currentY + 10, { width: columnWidths[0], align: 'center' });
//             doc.text(`${invoice.amount.toFixed(2)} Fcfa`, startX + columnWidths[0] + 10, currentY + 10, { width: columnWidths[1], align: 'center' });
//             doc.text(`${invoice.totalWithTax.toFixed(2)} Fcfa`, startX + columnWidths[0] + columnWidths[1] + 10, currentY + 10, { width: columnWidths[2], align: 'center' });
//             doc.strokeColor('black').rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
//             currentY += rowHeight;
//         });

//         doc.moveDown(2);
//         doc.fontSize(14).fillColor('black').text("Détails des Paiements", { underline: true }).moveDown(0.5);
//         const paymentColumnWidths = [150, 150, 150];
//         doc.fontSize(12).fillColor('black');
//         doc.text("Montant Payé", startX + 10, doc.y, { width: paymentColumnWidths[0], align: 'center' });
//         doc.text("Date de Paiement", startX + paymentColumnWidths[0] + 10, doc.y, { width: paymentColumnWidths[1], align: 'center' });
//         doc.text("Mode de Paiement", startX + paymentColumnWidths[0] + paymentColumnWidths[1] + 10, doc.y, { width: paymentColumnWidths[2], align: 'center' });
//         doc.moveDown(0.5);

//         invoice.payments.forEach((payment) => {
//             doc.text(`${payment.amount.toFixed(2)} Fcfa`, startX + 10, doc.y, { width: paymentColumnWidths[0], align: 'center' });
//             doc.text(`${new Date(payment.paymentDate).toLocaleDateString()}`, startX + paymentColumnWidths[0] + 10, doc.y, { width: paymentColumnWidths[1], align: 'center' });
//             doc.text(`${payment.paymentMethod || 'N/A'}`, startX + paymentColumnWidths[0] + paymentColumnWidths[1] + 10, doc.y, { width: paymentColumnWidths[2], align: 'center' });
//             doc.moveDown(0.5);
//         });

//         doc.end();
//         stream.on('finish', () => res.download(filePath, `Invoice-${invoice.reference}.pdf`));
//     } catch (error) {
//         console.error("Erreur lors de la génération de la facture :", error);
//         res.status(500).json({ message: 'Erreur interne du serveur' });
//     }
// };

exports.downloadInvoice = async (req, res) => {
    try {
        console.log('Invoice ID:', req.params.id);

        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Reservation,
                    as: 'reservation',
                    include: [
                        { model: FlightAgency, as: 'vols', include: [{ model: Vol, as: 'flight', include: { model: Company, as: 'companyVol' } }] },
                        { model: Passenger, as: 'passengers' },
                        { model: Agency, as: 'agencyReservations' },
                        { model: Destination, as: 'startDestination' },
                        { model: Destination, as: 'endDestination' }
                    ],
                },
                { model: Customer, as: 'customer', include: { model: User, as: 'user' } },
                { model: Payment, as: 'payments',include:{model:paymentMode,as:'paymentMode'} }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Facture introuvable' });
        }
// console.log('paymentMode',invoice.payments)
// console.log('paymentMode',invoice.payments.paymentMode)

        const invoicesDir = path.join(__dirname, '../secure_invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // En-tête de l'agence
        const agency = invoice.reservation?.agencyReservations;
        if (agency) {
            doc.fontSize(20).fillColor('blue').font('Helvetica-Bold').text(agency.name, { align: 'center' });
            doc.fontSize(10).fillColor('black').text(`${agency.address || 'N/A'} - ${agency.phone || 'N/A'}`, { align: 'center' }).moveDown();
        }

        // Informations facture
        doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
        doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
        doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();

        // Détails de la réservation
        doc.fontSize(14).fillColor('black').text("Détails de la Réservation", { underline: true }).moveDown(0.5);
        const reservation = invoice.reservation;
        // console.log('invoicesFlight',reservation.vols)
        // console.log('invoicesvol',reservation.vols.flight)
        if (reservation) {
            doc.fontSize(12);
            doc.text(`Vol: ${reservation.vols?.flight?.companyVol.name || 'N/A'} - ${reservation.vols?.flight?.flightNumber || 'N/A'}`);
            doc.text(`Departure: ${reservation.startDestination?.country || 'N/A'}`);
            doc.text(`Arrival: ${reservation.endDestination?.country || 'N/A'}`);
            const departureTime = reservation.vols?.departureTime;
const formattedDateTime = departureTime 
    ? new Date(departureTime).toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) 
    : "N/A";

doc.text(`Date de vol: ${formattedDateTime}`).moveDown();

        }

        // Table des passagers
        doc.fontSize(14).fillColor('black').text("Détails de la Facture", { underline: true }).moveDown(0.5);
        
        const startX = 50;
        const columnWidths = [200, 150, 150];
        const rowHeight = 25;
        let y = doc.y;

        // En-tête du tableau
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('blue');
        doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
        const headers = ["Nom du Passager", "Montant Unitaire ", "Montant Total"];
        headers.forEach((header, i) => {
            doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { width: columnWidths[i], align: 'center' });
        });

        // Lignes des passagers
        y += rowHeight;
        doc.fillColor('black').font('Helvetica').fontSize(12);
        invoice.reservation.passengers.forEach((passenger, index) => {
            const bgColor = index % 2 === 0 ? 'lightgray' : 'white';
            doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
            doc.fillColor('black');

            const row = [
                `${passenger.firstName} ${passenger.lastName}`,
                `${invoice.amount.toFixed(2)} Fcfa`,
                `${invoice.amount.toFixed(2)} Fcfa`
            ];
            row.forEach((text, i) => {
                doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { width: columnWidths[i], align: 'center' });
            });

            y += rowHeight;
        });

        // Totaux
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total Montant: ${invoice.amount.toFixed(2)} Fcfa`, 375, doc.y);
        doc.text(`Reliquat: ${invoice.balance.toFixed(2)} Fcfa`, 375, doc.y + 10);
        doc.text(`Net à Payer: ${invoice.amount.toFixed(2)} Fcfa`, 375, doc.y + 10);
        doc.moveDown();

        // Détails des paiements
        doc.fontSize(14).fillColor('black').text("Détails des Paiements", { underline: true }).moveDown(0.5);

        const paymentsTableHeaders = ["Montant Payé", "Date de Paiement", "Reference Pay"];
        const paymentColumnWidths = [200, 150, 150];
        y = doc.y;

        // En-tête du tableau des paiements
        doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('blue');
        doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
        paymentsTableHeaders.forEach((header, i) => {
            doc.text(header, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { width: paymentColumnWidths[i], align: 'center' });
        });

        // Lignes des paiements
        y += rowHeight;
        doc.fillColor('black').font('Helvetica').fontSize(12);
        invoice.payments.forEach((payment, index) => {
            const bgColor = index % 2 === 0 ? 'lightgray' : 'white';
            doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
            doc.fillColor('black');

            const row = [
                `${payment.amount.toFixed(2)} Fcfa`,
                new Date(payment.paymentDate).toLocaleDateString(),
                payment.reference || 'N/A'
            ];
            row.forEach((text, i) => {
                doc.text(text, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { width: paymentColumnWidths[i], align: 'center' });
            });

            y += rowHeight;
        });

        doc.end();
        stream.on('finish', () => {
            res.download(filePath, `Invoice-${invoice.reference}.pdf`);
        });
    } catch (error) {
        console.error("Erreur lors de la génération de la facture :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// exports.downloadInvoice = async (req, res) => {

//     try {
//         console.log('customerId', req.params.id);

//         const invoice = await Invoice.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Reservation,
//                     as: 'reservation',
//                     include: [
//                         { model: Vol, as: 'vol', include: { model: Company, as: 'companyVol' } },
//                         { model: Passenger, as: 'passengers' },
//                         { model: Agency, as: 'agencyReservations' },
//                         { model: Destination, as: 'startDestination' },
//                         { model: Destination, as: 'endDestination' }
//                     ],
                  
//                 },{
//                      model:Customer,as:'customer',include:{model:User,as:'user'}

//                 } ,{model:Payment,as:'payments'} 
//             ]
//         });

//         if (!invoice) {
//             return res.status(404).json({ message: 'Invoice not found' });
//         }

//         const invoicesDir = path.join(__dirname, '../secure_invoices');
//         if (!fs.existsSync(invoicesDir)) {
//             fs.mkdirSync(invoicesDir, { recursive: true });
//         }

//         const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
//         const doc = new PDFDocument({ margin: 50 });
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         const agency = invoice.reservation?.agencyReservations;
//         const logoPath = agency && agency.logo ? path.join(__dirname, '../uploads', agency.logo) : null;

//         if (logoPath && fs.existsSync(logoPath)) {
//             doc.image(logoPath, 50, 30, { width: 100 }).moveDown(2);
//         }

//         doc.fontSize(20).font('Helvetica-Bold').text(`FACTURE PROFORMA`, { align: 'center' }).moveDown();
//         doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
//         doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
//         doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();
//    console.log('destinatination',invoice.reservation.endDestination)
//         if (agency) {
//             doc.fontSize(14).font('Helvetica-Bold').text(`Informations de l'Agence`, { underline: true }).moveDown(0.5);
//             doc.fontSize(12).font('Helvetica').text(`Nom: ${agency.name}`);
//             doc.text(`Adresse: ${agency.address || 'N/A'}`);
//             doc.text(`Téléphone: ${agency.phone || 'N/A'}`).moveDown();
//         }

//         if (invoice.customer) {
//             doc.fontSize(14).font('Helvetica-Bold').text(`Informations du Client`, { underline: true }).moveDown(0.5);
//             doc.fontSize(12).font('Helvetica').text(`Nom: ${invoice.customer.user.name}`);
//             doc.text(`Email: ${invoice.customer.user.email}`).moveDown();
//         }

//         doc.fontSize(14).font('Helvetica-Bold').text(`Détails de la Réservation`, { underline: true }).moveDown(0.5);
        // if (invoice.reservation) {
        //     doc.fontSize(12).font('Helvetica').text(`Vol: ${invoice.reservation.vol?.name || 'N/A'}`);
        //     doc.fontSize(12).font('Helvetica').text(`Destination: ${invoice.reservation.endDestination?.country || 'N/A'}`);
        //     doc.fontSize(12).font('Helvetica').text(`Type de vol: ${invoice.reservation.tripType || 'N/A'}`);
            
        //     doc.text(`Passager(s):`);
        //     invoice.reservation.passengers.forEach((passenger, index) => {
        //         doc.text(`  ${index + 1}. ${passenger.firstName} ${passenger.lastName}`);
        //     });
        //     doc.moveDown();
        // }

//         doc.fontSize(14).font('Helvetica-Bold').text(`Détails Financiers`, { underline: true }).moveDown(0.5);
//         doc.fontSize(12).font('Helvetica').text(`Montant HT: ${invoice.amount.toFixed(2)} Fcfa`);
//         doc.text(`TVA (${invoice.tva}%): ${(invoice.amount * (invoice.tva / 100)).toFixed(2)} Fcfa`);
//         doc.text(`Total TTC: ${invoice.totalWithTax.toFixed(2)} Fcfa`);
//         doc.text(`Balance restante: ${invoice.balance.toFixed(2)} Fcfa`).moveDown();
         
//       doc.fontSize(14).font('Helvetica-Bold').text(`Paiements effectués`, { underline: true }).moveDown(0.5);

// if (invoice.payments.length > 0) {
//     invoice.payments.forEach((payment, index) => {
//         doc.fontSize(12).font('Helvetica').text(
//             `${index + 1}. Mode: ${payment.modePaymentId} | Montant: ${payment.amount.toFixed(2)} Fcfa | Réf: ${payment.reference} | Date: ${new Date(payment.paymentDate).toLocaleDateString()}`
//         );
//     });
// } else {
//     doc.fontSize(12).font('Helvetica').text(`Aucun paiement enregistré.`);
// }
// doc.moveDown();


//         doc.fontSize(12).font('Helvetica-Oblique').text(`Cette facture est un document proforma et ne constitue pas une preuve de paiement.`, { align: 'center' }).moveDown();

//         const signature = crypto.createHmac('sha256', process.env.PRIVATE_KEY || 'default_secret')
//             .update(invoice.reference + invoice.amount)
//             .digest('hex');
//         doc.text(`Signature électronique: ${signature}`).moveDown();

//         doc.end();

//         stream.on('finish', async () => {
//             console.log("Facture générée avec succès :", filePath);
//           console.log(invoice.customer.user?.email)
//           if (!fs.existsSync(filePath)) {
//     console.error("Fichier PDF introuvable !");
//     return res.status(500).json({ message: "Facture non trouvée pour l'email." });
// }

//             if (invoice.customer && invoice.customer.user?.email) {
//                 const emailSubject = 'Votre facture de réservation';
//                 const emailBody = `
//                     <p>Bonjour,</p>
//                     <p>Veuillez trouver ci-joint votre facture pour la réservation.</p>
//                     <p>Référence de la facture: <strong>${invoice.reference}</strong></p>
//                     <p>Merci pour votre confiance.</p>
//                 `;

//                 try {
//                     await NotificationService.sendEmail(
//                         invoice.customer.user.email,
//                         emailSubject,
//                         emailBody,
//                         {
//         html: true,
//         attachments: [
//             { 
//                 filename: `Invoice-${invoice.reference}.pdf`, 
//                 path: filePath, 
//                 contentType: 'application/pdf' 
//             }
//         ]
//     }
//                     );
//                     console.log(`Facture envoyée avec succès à ${invoice.customer.user.email}`);
//                 } catch (error) {
//                     console.error("Erreur lors de l'envoi de l'email :", error);
//                 }
//             }

//             res.download(filePath, `Invoice-${invoice.reference}.pdf`, (err) => {
//                 if (err) {
//                     console.error("Erreur lors du téléchargement du fichier :", err);
//                     res.status(500).json({ message: "Erreur lors du téléchargement du fichier" });
//                 }
//             });
//         });

//     } catch (error) {
//         console.error("Erreur lors de la génération de la facture :", error);
//         res.status(500).json({ message: 'Erreur interne du serveur' });
//     }
// };
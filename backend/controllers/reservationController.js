const Reservation = require('../models/booking');
const User = require('../models/userModel');
const Vol = require('../models/volModel');
const Campaign = require('../models/compaign');
const Passenger = require('../models/Passenger');
const Agency = require('../models/agenceModel');
const Customer = require('../models/customer');
const Invoice = require('../models/invoice');
const NotificationService = require('../services/notification.service');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Class=require(('../models/classModel'))
const Document=require('../models/document')
const sequelize=require('../config/bd');
const Destination = require('../models/destinationModel');
const AgencyClass=require('../models/agencyClass')
const AgencyFlights=require('../models/flightAgency');
const Company = require('../models/company.js');
const PricingRule=require('../models/pricingRule')
const { Op } = require('sequelize');
// notification et email create Reservation
// exports.createReservation = async (req, res) => {
//     const t = await sequelize.transaction();
//     try {
//         const {
//             customerId,
//             agencyId,
//             volId,
//             startAt,
//             endAt,
//             returnVolId, startDestinationId, endDestinationId,
//             classId,
//             tripType,
//         } = req.body;

//         console.log('req.body:', req.body);

//         const totalPrice = await calculateTotalPriceWithClass(volId, classId, returnVolId, tripType);

//         // Création de la réservation
//         const newReservation = await Reservation.create({
//             customerId,
//             agencyId,
//             startDestinationId,
//             endDestinationId,
//             volId,
//             startAt,
//             endAt,
//             returnVolId: returnVolId || null,
//             description: req.body.description,
//             status: "Pending",
//             classId,
//             tripType,
//             totalPrice,
//             createdBy: req.user.id,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//         }, { transaction: t });

//         await t.commit();

//         // Récupérer les emails des utilisateurs liés à l'agence et au customer
//         const agency = await Agency.findByPk(agencyId, { include: { model: User, as: 'user' } });
//         const customer = await Customer.findByPk(customerId, { include: { model: User, as: 'User' } });

//         const agencyEmail = agency?.user?.email;
//         const customerEmail = customer?.User?.email;

//         // Notifier l'agence
//         if (agencyEmail) {
//             await NotificationService.notify(
//                 agency.userId,
//                 "Nouvelle réservation",
//                 `Une nouvelle réservation a été effectuée pour votre agence.`,
//                 agencyEmail
//             );
//         }

//         // Notifier le client
//         if (customerEmail) {
//             await NotificationService.notify(
//                 customer.userId,
//                 "Confirmation de réservation",
//                 `Votre réservation a bien été prise en compte. En attente de confirmation.`,
//                 customerEmail
//             );
//         }

//         res.status(201).json(newReservation);
//     } catch (err) {
//         console.error('Erreur lors de la création de la réservation :', err);
//         await t.rollback();
//         res.status(500).json({ status: 'fail', error: err.message });
//     }
// };
// exports.createReservation = async (req, res) => {
//     try {
//         const {
//             customerId,
//             agencyId,
//             volId,
//             startAt,
//             endAt,
//             returnVolId,
//             classId,
//             tripType,
//         } = req.body;
//     console.log('req.body',req.body)
//         const totalPrice = await calculateTotalPriceWithClass(volId, classId, returnVolId, tripType);

//         // Création de la réservation
//         const newReservation= await Reservation.create({
//             customerId,
//             agencyId,
//             volId,
//             startAt,
//             endAt,
//             returnVolId: returnVolId || null,
//             classId,
//             tripType,
//             totalPrice,
//             createdBy: req.user.id,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//         });

//         // Traitement des passagers
//         const parsedPassengers = JSON.parse(req.body.passengers || '[]');

//          for (const passenger of parsedPassengers) {
//             const newPassenger = await Passenger.create({
//                 reservationId: newReservation.id,
//                 ...passenger, // Sauvegarder les autres champs du passager
//             }, { transaction: t });

//             if (req.files) {
//                 for (const [fieldname, files] of Object.entries(req.files)) {
//                     if (fieldname.startsWith(`passengers[${parsedPassengers.indexOf(passenger)}][documents]`)) {
//                         for (const file of files) {
//                             const docData = {
//                                 passengerId: newPassenger.id,
//                                 documentType: passenger.documentType, // Extrait des données passager
//                                 documentNumber: passenger.documentNumber, // Extrait des données passager
//                                 documentPath: file.path,
//                                 fileType: file.mimetype,
//                             };
//                             await Document.create(docData, { transaction: t });
//                         }
//                     }
//                 }
//             }
//         }
//     await t.commit()
//     res.status(201).json(newReservation);
//         res.status(201).json({ status: 'success', data: reservation });
//     } catch (err) {
//         console.error('Erreur lors de la création de la réservation :', err);
//         res.status(500).json({ status: 'fail', error: err.message });
//     }
// };
// BON CODE CREATE RESERVATION 
// exports.createReservation = async (req, res) => {
//     const t = await sequelize.transaction();
//     try {
//         const {
//             customerId, agencyId, campaignId,
//             agencyVolId, startAt, endAt, returnVolId,
//             startDestinationId, endDestinationId, agencyClassId,
//             tripType
//         } = req.body;

//         console.log('📩 Données reçues du Front:', JSON.stringify(req.body, null, 2));
        
//         let parsedPassengers = [];
//         try {
//             parsedPassengers = Array.isArray(req.body.passengers)
//                 ? req.body.passengers
//                 : JSON.parse(req.body.passengers || '[]');
//         } catch (error) {
//             throw new Error('❌ Invalid passengers data format');
//         }

//         const totalPrice = await calculateTotalPriceWithClass(
//             agencyVolId, agencyClassId, returnVolId, tripType,
//             parsedPassengers, agencyId
//         );

//         const newReservation = await Reservation.create({
//             customerId, agencyId, campaignId: campaignId || null,
//             startDestinationId, endDestinationId, agencyVolId,
//             startAt, endAt, returnVolId: returnVolId || null,
//             description: req.body.description, status: "Pending",
//             agencyClassId, tripType, totalPrice,
//             createdBy: req.user.id, createdAt: new Date(), updatedAt: new Date(),
//         }, { transaction: t });

//         console.log('📋 Parsed passengers:', JSON.stringify(parsedPassengers, null, 2));
        
//         for (const [passengerIndex, passenger] of parsedPassengers.entries()) {
//             console.log(`👤 Vérification du passager ${passengerIndex}:`, JSON.stringify(passenger, null, 2));

//             const newPassenger = await Passenger.create({
//                 reservationId: newReservation.id, ...passenger,
//             }, { transaction: t });

//             if (!passenger.documents || !Array.isArray(passenger.documents)) {
//                 console.warn(`⚠️ Aucun document trouvé pour le passager ${passengerIndex}:`, passenger);
//                 continue;
//             }

//             for (const [docIndex, doc] of passenger.documents.entries()) {
//                 console.log(`📄 Document ${docIndex} →`, JSON.stringify(doc, null, 2));

//                 if (!doc.issueDate || !doc.expirationDate) {
//                     console.warn(`⚠️ Missing issueDate or expirationDate for document ${docIndex} of passenger ${passengerIndex}`);
//                 }

//                 const fileKey = `passengers-${passengerIndex}-documents-${docIndex}-file`;
//                 const file = req.files.find((f) => f.fieldname === fileKey);

//                 const parseDate = (dateString) => {
//                     if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') return null;
//                     const parsedDate = new Date(`${dateString}T00:00:00.000Z`);
//                     return isNaN(parsedDate.getTime()) ? null : parsedDate;
//                 };

//                 const docData = {
//                     relatedEntity: 'Passenger',
//                     relatedEntityId: newPassenger.id,
//                     typeDocument: doc.documentType || 'unknown',
//                     documentNumber: doc.documentNumber || 'N/A',
//                     documentPath: file ? file.path : null,
//                     issueDate: parseDate(doc.issueDate),
//                     expirationDate: parseDate(doc.expirationDate),
//                     fileType: file ? file.mimetype : null,
//                     createdBy: req.user.id,
//                 };

//                 console.log('🔍 Vérification des dates:', {
//                     issueDateOriginal: doc.issueDate,
//                     issueDateParsed: docData.issueDate,
//                     expirationDateOriginal: doc.expirationDate,
//                     expirationDateParsed: docData.expirationDate,
//                 });

//                 await Document.create(docData, { transaction: t });
//             }
//         }

//         await t.commit();
//         res.status(201).json(newReservation);
//     } catch (err) {
//         console.error('❌ Erreur lors de la création de la réservation :', err);
//         await t.rollback();
//         res.status(500).json({ status: 'fail', error: err.message });
//     }
// };
exports.createReservation = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            customerId, agencyId, campaignId,
            agencyVolId,  endAt, returnVolId,
            startDestinationId, endDestinationId, agencyClassId,
            tripType
        } = req.body;
        // Transforme startAt en objet Date

        // Vérifier si la conversion a échoué (ex: date invalide)
        const startAt = new Date(req.body.startAt);
if (isNaN(startAt.getTime())) {
    throw new Error('❌ Date de départ invalide.');
}

        
        console.log('📩 Données reçues du Front:', JSON.stringify(req.body, null, 2));

        // 🔍 1️⃣ Vérifier si le vol aller est disponible
        const departureVol = await AgencyFlights.findOne({
            where: {
                id: agencyVolId,
                [Op.and]: [
                    sequelize.where(sequelize.fn('DATE', sequelize.col('departureTime')), '=', startAt)
                ] // Vérifier la date exacte
            }
        });

        if (!departureVol) {
            throw new Error('❌ Aucun vol disponible pour la date de départ sélectionnée .Verifie le vol Selectionner');
        }

        // 🔍 2️⃣ Vérifier si le vol retour est disponible (si applicable)
        // let returnFlight = null;
        // if (tripType === 'round-trip' && returnVolId) {
        //     returnFlight = await Vol.findOne({
        //         where: {
        //             id: returnVolId,
        //             departureTime: { [Op.eq]: new Date(endAt) } // Vérifier la date exacte
        //         }
        //     });

        //     if (!returnFlight) {
        //         throw new Error('❌ Aucun vol retour disponible pour la date sélectionnée.');
        //     }
        // }

        let parsedPassengers = [];
        try {
            parsedPassengers = Array.isArray(req.body.passengers)
                ? req.body.passengers
                : JSON.parse(req.body.passengers || '[]');
        } catch (error) {
            throw new Error('❌ Format incorrect des passagers');
        }

        const totalPrice = await calculateTotalPriceWithClass(
            agencyVolId, agencyClassId, returnVolId, tripType,
            parsedPassengers, agencyId
        );

        // ✅ Création de la réservation après vérification des vols
        const newReservation = await Reservation.create({
            customerId, agencyId, campaignId: campaignId || null,
            startDestinationId, endDestinationId, agencyVolId,
            startAt, endAt, returnVolId: returnVolId || null,
            description: req.body.description, status: "Pending",
            agencyClassId, tripType, totalPrice,
            createdBy: req.user.id, createdAt: new Date(), updatedAt: new Date(),
        }, { transaction: t });

        console.log('📋 Passagers traités:', JSON.stringify(parsedPassengers, null, 2));

        for (const [passengerIndex, passenger] of parsedPassengers.entries()) {
            const newPassenger = await Passenger.create({
                reservationId: newReservation.id, ...passenger,
            }, { transaction: t });

            if (!passenger.documents || !Array.isArray(passenger.documents)) continue;

            for (const [docIndex, doc] of passenger.documents.entries()) {
                const fileKey = `passengers-${passengerIndex}-documents-${docIndex}-file`;
                const file = req.files.find((f) => f.fieldname === fileKey);

                const parseDate = (dateString) => {
                    if (!dateString) return null;
                    const parsedDate = new Date(`${dateString}T00:00:00.000Z`);
                    return isNaN(parsedDate.getTime()) ? null : parsedDate;
                };

                await Document.create({
                    relatedEntity: 'Passenger',
                    relatedEntityId: newPassenger.id,
                    typeDocument: doc.documentType || 'unknown',
                    documentNumber: doc.documentNumber || 'N/A',
                    documentPath: file ? file.path : null,
                    issueDate: parseDate(doc.issueDate),
                    expirationDate: parseDate(doc.expirationDate),
                    fileType: file ? file.mimetype : null,
                    createdBy: req.user.id,
                }, { transaction: t });
            }
        }

        await t.commit();
        res.status(201).json(newReservation);
    } catch (err) {
        console.error('❌ Erreur lors de la création de la réservation :', err);
        await t.rollback();
        res.status(400).json({ status: 'fail', error: err.message });
    }
};


// //     const { reservationId } = req.body;
// //     console.log('req.body de reservationId',req.body)

// //     // Vérifier si la réservation existe
// //     const reservation = await Reservation.findByPk(reservationId, {
// //         include: [
// //             { model: Customer, as: "customerReservation" ,attributes:['id']},
// //             { model: Passenger, as: "passengers" }, // Inclure les passagers
// //         ],
// //     });
// // console.log(reservation)
// //     if (!reservation) { 
// //         throw new AppError('Reservation not found', 404);
// //     }

// //     if (reservation.status !== "Pending") {
// //         throw new AppError('Reservation already processed', 400);
// //     }

// //     // Calculer la quantité (nombre de passagers) et le montant total
// //     const quantity = reservation.passengers ? reservation.passengers.length : 0;
// // if (quantity === 0) {
// //     throw new AppError('No passengers associated with this reservation', 400);
// // }

// // const amount = reservation.totalPrice * quantity; 
// // const tva = 18;
// // const totalWithTax = amount * (1 + tva / 100);

// // const transaction = await sequelize.transaction();
// // try {
// //     reservation.status = "Confirmed";
// //     await reservation.save({ transaction });

// //     console.log("Customer ID:", reservation.customerReservation?.id);
// //     console.log("Passengers:", reservation.passengers.map(p => p.id)); // Vérification

// //     // Créer une facture pour **chaque passager**
// //     const invoices = await Promise.all(
// //         reservation.passengers.map(passenger => 
// //             Invoice.create({
// //                 reservationId: reservation.id,
// //                 customerId: reservation.customerReservation.id,
// //                 agencyId: reservation.agencyId,
// //                passengerId: reservation.passengers.length > 0 ? reservation.passengers[0].id : null, // Correctement défini
// //                 amount,
// //                 quantity,
// //                 tva,
// //                 totalWithTax,
// //                 emissionAt: new Date(),
// //                 balance: totalWithTax,
// //                 status: 'unpaid',
// //             }, { transaction })
// //         )
// //     );

// //     await transaction.commit();

// //     res.status(200).json({
// //         status: "success",
// //         message: "Reservation confirmed, invoices created",
// //         data: { reservation, invoices },
// //     });
// // } catch (error) {
// //     await transaction.rollback();
// //     throw error;
// // }
// // }); 
// exports.confirmReservation = catchAsync(async (req, res) => {
//     const { reservationId } = req.body;

//     // Validation: Vérifier que reservationId est valide
//     if (!reservationId || isNaN(reservationId)) {
//         throw new AppError('Invalid reservationId', 400);
//     }

//     console.log('req.body de reservationId', req.body);

//     // Récupérer la réservation avec les passagers
//     const reservation = await Reservation.findByPk(reservationId, {
//         include: [
//             { model: Customer, as: "customerReservation", attributes: ['id'] },
//             { model: Passenger, as: "passengers" }, // Inclure les passagers
//         ],
//     });

//     console.log(reservation);

//     if (!reservation) {
//         throw new AppError('Reservation not found', 404);
//     }

//     if (reservation.status !== "Pending") {
//         throw new AppError('Reservation already processed', 400);
//     }

//     // Vérifier qu'il y a au moins un passager
//     const quantity = reservation.passengers ? reservation.passengers.length : 0;
//     if (quantity === 0) {
//         throw new AppError('No passengers associated with this reservation', 400);
//     }

//     // Calcul du montant total avec TVA
//     const amount = reservation.totalPrice * quantity;
//     const tva = 18;
//     const totalWithTax = amount * (1 + tva / 100);

//     // Générer une référence unique pour la facture
//     const generateInvoiceReference = () => {
//         return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//     };
    
//     const transaction = await sequelize.transaction();
//     try {
//         // Mettre à jour le statut de la réservation
//         reservation.status = "Confirmed";
//         await reservation.save({ transaction });

//         console.log("Customer ID:", reservation.customerReservation?.id);

//         // Créer une seule facture pour la réservation
//         const invoice = await Invoice.create({
//             reservationId: reservation.id,
//             customerId: reservation.customerReservation.id,
//             agencyId: reservation.agencyId,
//             passengerId: null, // Aucune association spécifique avec un passager
//             amount,
//             quantity,
//             tva,
//             totalWithTax,
//             reference: generateInvoiceReference(),
//             emissionAt: new Date(),
//             balance: totalWithTax,
//             status: 'unpaid',createdBy:req.user.id
//         }, { transaction });

//         await transaction.commit();

//         res.status(200).json({
//             status: "success",
//             message: "Reservation confirmed, invoice created",
//             data: { reservation, invoice },
//         });
//     } catch (error) {
//         await transaction.rollback();
//         console.error("Transaction rollback due to error:", error);
//         res.status(500).json({
//             status: "error",
//             message: "An error occurred while confirming the reservation",
//             error: error.message,
//         });
//     }
// });

// confirmation de reservation par agence send email et notifier customer
// exports.confirmReservation = catchAsync(async (req, res) => {
//     const { reservationId } = req.body;

//     if (!reservationId || isNaN(reservationId)) {
//         throw new AppError('Invalid reservationId', 400);
//     }

//     const reservation = await Reservation.findByPk(reservationId, {
//         include: [
//              { model: Customer, as: "customerReservation", include: { model: User, as: "user" } },
//              { model: Agency, as: "agencyReservations", include: { model: User, as: "User" } },
//             { model: Passenger, as: "passengers" },
//         ],
//     });

//     if (!reservation) {
//         throw new AppError('Reservation not found', 404);
//     }

//     if (reservation.status !== "Pending") {
//         throw new AppError('Reservation already processed', 400);
//     }

//     const quantity = reservation.passengers ? reservation.passengers.length : 0;
//     if (quantity === 0) {
//         throw new AppError('No passengers associated with this reservation', 400);
//     }

//     const amount = reservation.totalPrice * quantity;
//     const tva = 18;
//     const totalWithTax = amount * (1 + tva / 100);

//     const generateInvoiceReference = () => {
//         return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//     };

//     const transaction = await sequelize.transaction();
//     try {
//         reservation.status = "Confirmed";
//         await reservation.save({ transaction });

//         const invoice = await Invoice.create({
//             reservationId: reservation.id,
//             customerId: reservation.customerReservation.id,
//             agencyId: reservation.agencyId,
//             passengerId: null,
//             amount,
//             quantity,
//             tva,
//             totalWithTax,
//             reference: generateInvoiceReference(),
//             emissionAt: new Date(),
//             balance: totalWithTax,
//             status: 'unpaid',
//             createdBy: req.user.id
//         }, { transaction });

//         await transaction.commit();

//         // Récupérer les emails des utilisateurs liés à l'agence et au customer
//         const agency = await Agency.findByPk(reservation.agencyId, { include: { model: User, as: 'User' } });
//         const customer = await Customer.findByPk(reservation.customerReservation.id, { include: { model: User, as: 'user' } });

//         // const agencyEmail = agency?.user?.email;
//         // const customerEmail = customer?.User?.email;
// const agencyEmail = reservation.agencyReservations?.User?.email;
// const customerEmail = reservation.customerReservation?.user?.email;
// console.log('agencuEmail',agencyEmail)
// console.log('customerEmail',customerEmail)

//         // Notifier l'agence
//         // if (agencyEmail) {
//         //     await NotificationService.notify(
//         //         agency.userId,
//         //         "Réservation confirmée",
//         //         `La réservation ID ${reservation.id} a été confirmée.`,
//         //         agencyEmail
//         //     );
//         // }

//         // Notifier le client avec la facture en pièce jointe
//         if (customerEmail) {
//             const invoiceHtml = `
//             <!DOCTYPE html>
//             <html lang="fr">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Facture</title>
//             </head>
//             <body style="font-family: Arial, sans-serif; line-height: 1.6;">
//                 <h2 style="color: #007BFF;">Facture</h2>
//                 <p><strong>Référence:</strong> ${invoice.reference}</p>
//                 <p><strong>Montant:</strong> ${invoice.totalWithTax} XF</p>
//                 <p><strong>Status:</strong> ${invoice.status}</p>
//                 <hr>
//                 <p>Merci de procéder au paiement dès que possible.</p>
//             </body>
//             </html>
//         `;
        

//             await NotificationService.sendEmail(
//                 customerEmail,
//                 "Votre facture de réservation ! veillez proceder aux paiements dans le plus bref delais ",
//                 invoiceHtml,
//                 { html: true }
//             );
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Reservation confirmed, invoice created",
//             data: { reservation, invoice },
//         });
//     } catch (error) {
//         await transaction.rollback();
//         console.error("Transaction rollback due to error:", error);
//         res.status(500).json({
//             status: "error",
//             message: "An error occurred while confirming the reservation",
//             error: error.message,
//         });
//     }
// });

exports.confirmReservation = catchAsync(async (req, res) => {
    const { reservationId } = req.body;
  console.log('reservationId',req.body)
    if (!reservationId || isNaN(reservationId)) {
        throw new AppError('Invalid reservationId', 400);
    }

    const reservation = await Reservation.findByPk(reservationId, {
        include: [
            { model: Customer, as: "customerReservation", include: { model: User, as: "user" } },
            { model: Agency, as: "agencyReservations", include: { model: User, as: "User" } },
            { model: Passenger, as: "passengers" },
            // { model:Destination,as:'startDestination'},
            // { model:Destination,as:'endDestiantion'}
        ],
    });

    if (!reservation) {
        throw new AppError('Reservation not found', 404);
    }

    if (reservation.status !== "Pending") {
        throw new AppError('Reservation already processed', 400);
    }

    const quantity = reservation.passengers ? reservation.passengers.length : 0;
    if (quantity === 0) {
        throw new AppError('No passengers associated with this reservation', 400);
    }

    const amount = reservation.totalPrice * quantity;
    // const tva = 18;
    // const totalWithTax = amount * (1 + tva / 100);

    const generateInvoiceReference = () => {
        return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    };

    const transaction = await sequelize.transaction();
    try {
        reservation.status = "Confirmed";
        await reservation.save({ transaction });

        const invoice = await Invoice.create({
            reservationId: reservation.id,
            customerId: reservation.customerReservation.id,
            agencyId: reservation.agencyId,
            passengerId: null,
            amount,
            quantity,
          
            reference: generateInvoiceReference(),
            emissionAt: new Date(),
            balance: amount,
            status: 'unpaid',
            createdBy: req.user.id
        }, { transaction });

        await transaction.commit();

        // Récupérer les emails des utilisateurs liés à l'agence et au customer
        const agencyEmail = reservation.agencyReservations?.User?.email;
        const customerEmail = reservation.customerReservation?.user?.email;
        const customerFirstName = reservation.customerReservation?.firstName || "N/A";
        const customerLastName = reservation.customerReservation?.lastName || "N/A";

        
        const agencyName = reservation.agencyReservations?.name || "N/A";
        const agencyAddress = reservation.agencyReservations?.address || "N/A";


        console.log('agencyEmail:', agencyEmail);
        console.log('customerEmail:', customerEmail);
        console.log('customerFirstName',customerFirstName)
        console.log('customerFirstName',customerLastName)

        
        console.log('agencyName',agencyName)




        // Notifier l'agence
        // if (agencyEmail) {
        //     await NotificationService.notify(
        //         reservation.agencyReservations?.User?.id,
        //         "Réservation confirmée",
        //         `La réservation ID ${reservation.id} a été confirmée.`,
        //         agencyEmail
        //     );
        // }

        // Notifier le client avec la facture en pièce jointe
        if (customerEmail) {
            const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; background: #fff; padding: 20px; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); }
            h2 { color: #007BFF; text-align: center; }
            .header { text-align: left; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #007BFF; color: white; }
            .footer { margin-top: 20px; font-size: 14px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Facture de réservation</h2>

            <!-- En-tête de la facture -->
            <div class="header">
                <p><strong>Client:</strong> ${customerFirstName} ${customerLastName} </p>
                <p><strong>Agence:</strong> ${agencyName} ,${agencyAddress}</p>
                <p><strong>Date d'emission:</strong>${new Date().toLocaleDateString()}
            </div>

            <!-- Tableau des détails de la facture -->
            <table>
                <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Nombre de passagers</th>
                        <th>Total avec TVA (XF)</th>
                        <th>Balance (XF)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${invoice.reference}</td>
                        <td>${invoice.quantity}</td>
                        <td>${invoice.amount}</td>
                        <td>${invoice.balance}</td>
                    </tr>
                </tbody>
            </table>

            <p class="footer">Merci de procéder au paiement dès que possible sur la platforme TravelApp.</p>
        </div>
    </body>
    </html>
`;

            await NotificationService.sendEmail(
                customerEmail,
                "Votre facture de réservation ! Veuillez procéder au paiement dans le plus brefs délais",
                invoiceHtml,
                { html: true }
            );
        }

        res.status(200).json({
            status: "success",
            message: "Reservation confirmed, invoice created",
            data: { reservation, invoice },
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Transaction rollback due to error:", error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while confirming the reservation",
            error: error.message,
        });
    }
});

        

// const calculateTotalPriceWithClass = async (agencyVolId, agencyClassId, returnVolId, tripType) => {
//     // Trouver le vol
//     const vol = await AgencyFlights.findByPk(agencyVolId);
//     if (!vol) throw new Error(`Vol avec l'ID ${agencyVolId} non trouvé`);

//     // Trouver la classe
//     const volClass = await AgencyClass.findByPk(agencyClassId);
//     if (!volClass) throw new Error(`Classe avec l'ID ${agencyClassId} non trouvée`);

//     let totalPrice = vol.price * volClass.priceMultiplier; // Prix aller simple

//     // Ajouter le prix retour si aller-retour
//     if (tripType === "round-trip") {
//         const returnVol = await AgencyFlights.findByPk(returnVolId);
//         if (!returnVol) throw new Error(`Vol retour avec l'ID ${returnVolId} non trouvé`);
//         totalPrice += returnVol.price * volClass.priceMultiplier;
//     }

//     return totalPrice;
// };

const calculateTotalPriceWithClass = async (agencyVolId, agencyClassId, returnVolId, tripType, passengers, agencyId) => {
    const vol = await AgencyFlights.findByPk(agencyVolId);
    if (!vol) throw new Error(`Vol avec l'ID ${agencyVolId} non trouvé`);

    const volClass = await AgencyClass.findByPk(agencyClassId);
    if (!volClass) throw new Error(`Classe avec l'ID ${agencyClassId} non trouvée`);

    let totalPrice = vol.price * volClass.priceMultiplier; // Prix aller simple

    if (tripType === "round-trip") {
        const returnVol = await AgencyFlights.findByPk(returnVolId);
        if (!returnVol) throw new Error(`Vol retour avec l'ID ${returnVolId} non trouvé`);
        totalPrice += returnVol.price * volClass.priceMultiplier;
    }

    // Vérifier si passengers est bien un tableau
    if (!Array.isArray(passengers)) {
        try {
            passengers = JSON.parse(passengers || '[]');
        } catch (error) {
            throw new Error("Impossible de parser passengers : " + error.message);
        }
    }

    console.log("Passagers après vérification:", passengers);

    if (!Array.isArray(passengers)) {
        throw new Error("passengers doit être un tableau");
    }

    for (const passenger of passengers) {
        if (passenger.typePassenger !== "ADLT") {
            const pricingRule = await PricingRule.findOne({
                where: {
                    agencyId,
                    agencyVolId,
                    agencyClassId,
                    typePassenger: passenger.typePassenger
                }
            });

            if (pricingRule) {
                totalPrice += pricingRule.price;
            } else {
                console.warn(`Aucune règle tarifaire trouvée pour ${passenger.typePassenger}, utilisation du prix standard.`);
            }
        }
    }

    return totalPrice;
};




// exports.getReservations = catchAsync(async (req, res) => {
//     const where = {};
    
//     // Filtrer selon le rôle de l'utilisateur
//     // if (req.user.role === 'customer') {
//     //     where.customerId = req.user.id;
//     // } else if (req.user.role === 'agency') {
//     //     where.agencyId = req.user.agencyId;
//     // }

//     // Filtres supplémentaires
//     if (req.query.status) where.status = req.query.status;
//     if (req.query.startDate) where.startAt = { [Op.gte]: new Date(req.query.startDate) };
//     if (req.query.endDate) where.endAt = { [Op.lte]: new Date(req.query.endDate) };

//     const reservations = await Reservation.findAll({
//         where,
//         include: [
//             { model: User, as: 'customer' },
            
//             { model: Vol, as: 'vol' },
//             { model: Campaign, as: 'campaign' },
//             { model: Passenger, as: 'passengers' }
//         ],
//         order: [['createdAt', 'DESC']]
//     });

//     res.status(200).json({
//         status: 'success',
//         results: reservations.length,
//         data: reservations
//     });
// });
exports.getReservations = catchAsync(async (req, res) => {
    let whereCondition = {};

    // Vérifier si l'utilisateur est un Customer
    const customer = await Customer.findOne({ where: { userId: req.user.id } });

    if (customer) {
        // L'utilisateur est un Customer → récupérer ses réservations
        whereCondition.customerId = customer.id;
    } else {
        // Vérifier si l'utilisateur est une Agency
        const agency = await Agency.findOne({ where: { userId: req.user.id } });
        
        if (agency) {
            // L'utilisateur est une Agency → récupérer les réservations liées à cette agence
            whereCondition.agencyId = agency.id;
        } else {
            return res.status(404).json({
                status: 'fail',
                message: "Aucun Customer ou Agency associé à cet utilisateur."
            });
        }
    }

    // Ajouter les filtres optionnels
    if (req.query.status) whereCondition.status = req.query.status;
    if (req.query.startDate) whereCondition.startAt = { [Op.gte]: new Date(req.query.startDate) };
    if (req.query.endDate) whereCondition.endAt = { [Op.lte]: new Date(req.query.endDate) };

    // Récupérer les réservations
    const reservations = await Reservation.findAll({
        where: whereCondition,
        include: [
            { model: User, as: 'customer' },
            { model: AgencyFlights, as: 'vols' ,include:{model:Vol,as:'flight'}},
            { model: Campaign, as: 'campaign' },
            { model: Passenger, as: 'passengers' },
            
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        results: reservations.length,
        data: reservations
    });
});

exports.getReservation = catchAsync(async (req, res) => {
    const reservation = await Reservation.findByPk(req.params.id, {
        include: [
            { model: User, as: 'customer' },
            
            { model: AgencyFlights, as: 'vols',include:{model:Vol,as:'flight',include:{model:Company,as:'companyVol'}} },
            { model: Campaign, as: 'campaign' },
            { model: Passenger, as: 'passengers',include:{model:Document } },
            {model:AgencyClass,as:'class',include:{model:Class,as:'class'}}
            
        ]
    });
 
    if (!reservation) {
        throw new AppError('Reservation not found', 404);
    }

    // Vérifier l'autorisation
    if (req.user.role === 'customer' && reservation.customerId !== req.user.id) {
        throw new AppError('You are not authorized to view this reservation', 403);
    }

    if (req.user.role === 'agency' && reservation.agencyId !== req.user.agencyId) {
        throw new AppError('You are not authorized to view this reservation', 403);
    }

    res.status(200).json({
        status: 'success',
        data: reservation
    });
});

exports.updateReservation = catchAsync(async (req, res) => {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
        throw new AppError('Reservation not found', 404);
    }

    // Vérifier l'autorisation
    if (req.user.role === 'customer' && reservation.customerId !== req.user.id) {
        throw new AppError('You are not authorized to update this reservation', 403);
    }

    if (req.user.role === 'agency' && reservation.agencyId !== req.user.agencyId) {
        throw new AppError('You are not authorized to update this reservation', 403);
    }

    // Mettre à jour les champs autorisés
    const allowedFields = [
        'status',
        'description',
        'startAt',
        'endAt',
        'typeDocument',
        'numDocument'
    ];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            reservation[field] = req.body[field];
        }
    });

    reservation.updatedBy = req.user.id;
    await reservation.save();

    // Mettre à jour les passagers si fournis
    if (req.body.passengers && Array.isArray(req.body.passengers)) {
        await Passenger.destroy({ where: { reservationId: reservation.id } });
        const passengerRecords = req.body.passengers.map(passenger => ({
            ...passenger,
            reservationId: reservation.id
        }));
        await Passenger.bulkCreate(passengerRecords);
    }

    // Récupérer la réservation mise à jour avec toutes ses relations
    const updatedReservation = await Reservation.findByPk(reservation.id, {
        include: [
            { model: User, as: 'customer' },
            
            { model: Vol, as: 'vol' },
            { model: Campaign, as: 'campaign' },
            { model: Passenger, as: 'passengers' }
        ]
    });

    res.status(200).json({
        status: 'success',
        data: updatedReservation
    });
});

exports.cancelReservation = catchAsync(async (req, res) => {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
        throw new AppError('Reservation not found', 404);
    }

    // Vérifier l'autorisation
    if ( reservation.customerId !== req.user.id) {
        throw new AppError('You are not authorized to cancel this reservation', 403);
    }

    if ( reservation.agencyId !== req.user.agencyId) {
        throw new AppError('You are not authorized to cancel this reservation', 403);
    }

    reservation.status = 'Cancelled';
    reservation.updatedBy = req.user.id;
    await reservation.save();

    res.status(200).json({
        status: 'success',
        data: reservation
    });
});

exports.getReservationStats = catchAsync(async (req, res) => {
    const where = {};
    
    if (req.user.role === 'customer') {
        where.customerId = req.user.id;
    } else if (req.user.role === 'agency') {
        where.agencyId = req.user.agencyId;
    }

    const stats = await Reservation.findAll({
        where,
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
        ],
        group: ['status']
    });

    res.status(200).json({
        status: 'success',
        data: stats
    });
});
exports.listReservations = async (req, res) => {
    const { userId } = req.user.id;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const reservations = await Reservation.findAll({
            include: [
                {
                    model: Customer,
                    as: "customer",
                    where: { userId }, // Filtrer uniquement les customers appartenant à l'utilisateur connecté
                    attributes: ["id", "name"], // Ajouter les champs nécessaires
                },
                {
                    model: Passenger,
                    as: "passengers", // Inclure les passagers (optionnel)
                    attributes: ["id", "firstName", "lastName"],
                },
                { model: AgencyFlights, as: 'vols',include:{model:Vol,as:'flight'} },
            { model: Campaign, as: 'campaign' },
            ],
        });

        res.status(200).json({ reservations });
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({ message: "Failed to fetch reservations" });
    }
  };

exports.getReservationsByAgency = catchAsync(async (req, res) => {
    const { agencyId } = req.params;
    const reservations = await Reservation.findAll({
        where: { agencyId },
        include: [
            { model: User, as: 'customer' },
            { model: AgencyFlights, as: 'vols',include:{model:Vol,as:'flight'} },
            { model: Campaign, as: 'campaign' },
            { model: Passenger, as: 'passengers' }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        results: reservations.length,
        data: reservations
    });
});

exports.getReservationsByCustomer = catchAsync(async (req, res) => {
    const { customerId } = req.params;
    const reservations = await Reservation.findAll({
        where: { customerId },
        include: [
            { model: User, as: 'customer' },
            { model: AgencyFlights, as: 'vols',include:{model:Vol,as:'flight',include:{model:Company,as:'companyVol'}} },
            { model: Campaign, as: 'campaign' },
            { model: Passenger, as: 'passengers' },
            {model:AgencyClass,as:'class',include:{model:Class,as:'class'}},
            
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        results: reservations.length,
        data: reservations 
    });
});
exports.getReservationsByAgencyUser = catchAsync(async (req, res) => {
    // ID de l'utilisateur connecté (agence liée à ce user)
    const userId = req.user.id; // Assurez-vous que l'authentification injecte `req.user`

    // Vérifier si l'agence existe pour cet utilisateur
    const agency = await Agency.findOne({
        where: { userId },
        include: [{ model: User, as: 'User' }] // Vérifie si l'agence appartient à l'utilisateur
    });

    if (!agency) {
        return res.status(404).json({
            status: 'fail',
            message: "Aucune agence trouvée pour cet utilisateur."
        });
    }

    // Récupérer les réservations pour cette agence
    const reservations = await Reservation.findAll({
        where: { agencyId: agency.id },
        include: [
            { model: User, as: 'customer' }, // Client
            { 
                model: AgencyFlights, 
                as: 'vols',include:{model:Vol,as:'flight'} 
                // Champs pertinents du vol
                
            },
            { model: Campaign, as: 'campaign',  }, // Campagne
            { model: Passenger, as: 'passengers', } // Passagers
        ],
        order: [['createdAt', 'DESC']] // Trier par ordre décroissant
    });

    // Réponse
    res.status(200).json({
        status: 'success',
        results: reservations.length,
        data: reservations
    });
});



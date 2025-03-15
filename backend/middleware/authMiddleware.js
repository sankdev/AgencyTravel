const jwt = require("jsonwebtoken");


const UserRole = require("../models/userRoleModel");
const RolePermission=require('../models/RolepermissionModel.js')
const Role = require("../models/roleModel");
const User = require("../models/userModel");

const Customer = require("../models/customer.js"); 
//const { checkPermission }=require('./servicePermission.js')
const Permission = require("../models/PermissionModel");
const UserAgency =require('../models/userAgencies.js')
require("dotenv").config();

// Ensure Role is associated with User
// UserRole.belongsTo(Role, { foreignKey: 'roleId' });
// User.hasMany(UserRole, { foreignKey: 'userId' });
// Association entre UserRole et RolePermission
// UserRole.hasMany(RolePermission, { foreignKey: "roleId", as: "rolePermissions" });
// RolePermission.belongsTo(UserRole, { foreignKey: "roleId", as: "userRole" });

// Middleware pour vérifier le token JWT
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extraction du token après "Bearer"
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decoded; // Ajouter les informations utilisateur décodées à req
    next();
  });
};

// Middleware pour vérifier si l'utilisateur a un rôle spécifique
exports.requireRole = (roleName) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "User information is missing" });
    }

    const userRoles = await UserRole.findAll({
      where: { userId: req.user.id },
      include: [{ model: Role, where: { name: roleName } }],
    });

    if (userRoles.length === 0) {
      return res
        .status(403)
        .json({ error: `Access denied. ${roleName} role is required.` });
    }

    next();
  } catch (error) {
    console.error("Role verification error:", error);
    return res.status(500).json({ error: "Failed to verify role." });
  }
};

// Middleware d'authentification pour extraire l'utilisateur du token
module.exports.authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id); // Recherchez l'utilisateur dans la base de données
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // Ajoutez l'utilisateur au `req`
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
// module.exports.checkPermission = (permissionId) => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.user.id; // Récupère l'utilisateur depuis req (supposons que l'auth est déjà faite)

//       // Vérifie si l'utilisateur a un rôle lié à la permission demandée
//       const userRoles = await UserRole.findAll({
//         where: { userId },
//         include: [
//           {
//             model: RolePermission,
//             as: "rolePermissions",
//             where: { permissionId, status: "active" },
//           },
//         ],
//       });

//       if (userRoles.length === 0) {
//         return res.status(403).json({ error: "Accès refusé : Permission non accordée" });
//       }

//       next(); // L'utilisateur a la permission, on passe à la suite
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: "Erreur serveur" });
//     }
//   };
// };


// Middleware pour protéger une route
// module.exports.checkPermissionMiddleware = (permissionName) => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.user.id; // Récupérer l'ID de l'utilisateur de la requête (après authentification)

//       // Vérifier si l'utilisateur a la permission demandée
//       const hasPermission = await checkPermission(userId, permissionName);

//       if (!hasPermission) {
//         return res.status(403).json({
//           message: "Accès interdit. Permission insuffisante.",
//         });
//       }

//       // L'utilisateur a la permission, passer à la suite
//       next();
//     } catch (error) {
//       console.error("Erreur dans le middleware de permission:", error);
//       return res.status(500).json({
//         message: "Une erreur est survenue lors de la vérification des permissions.",
//       });
//     }
//   };
// };

 
exports.protect = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decoded; // Ajout des informations utilisateur décodées dans req.user
    next();
  });
};

// Middleware pour restreindre l'accès à certains rôles
exports.restrictTo = (...roles) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "User information is missing" });
    }

    const userRoles = await UserRole.findAll({
      where: { userId: req.user.id },
      include: [{ model: Role ,as:'role'}],
    });

    // Vérifiez si l'utilisateur possède au moins un des rôles requis
    const hasRole = userRoles.some((userRole) =>
      roles.includes(userRole.role?.name)
    );

    if (!hasRole) {
      return res
        .status(403)
        .json({ message: `Access denied. Role required: ${roles.join(", ")}` });
    }

    next();
  } catch (error) {
    console.error("Role verification error:", error);
    res.status(500).json({ message: "Failed to verify role." });
  }
};


// exports.checkPermission = (permissionName) => async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: "User not authenticated" });
//     }

//     // Récupérer les rôles de l'utilisateur
//     const userRoles = await UserRole.findAll({
//       where: { userId: req.user.id },
//       include: [{ model: Role, as: "role" }],
//     });

//     if (!userRoles || userRoles.length === 0) {
//       return res.status(403).json({ message: "Access denied: No roles assigned" });
//     }

//     // Extraire les IDs des rôles
//     const roleIds = userRoles.map((userRole) => userRole.roleId);

//     // Vérifier si l'un des rôles a la permission demandée
//     const hasPermission = await RolePermission.findOne({
//       where: { roleId: roleIds },
//       include: [{ 
//         model: Permission, 
//         as: "permission",
//         where: { name: permissionName }
//       }],
//     });

//     if (!hasPermission) {
//       return res.status(403).json({ message: "Access denied: Missing permission" });
//     }

//     next();
//   } catch (error) {
//     console.error("Permission check error:", error);
//     res.status(500).json({ message: "Failed to check permissions" });
//   }
// };
// exports.checkPermission = (permissionName, allowAdmin = false) => async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: "User not authenticated" });
//     }

//     // Récupérer les rôles de l'utilisateur
//     const userRoles = await UserRole.findAll({
//       where: { userId: req.user.id },
//       include: [{ model: Role, as: "role" }],
//     });

//     if (!userRoles || userRoles.length === 0) {
//       return res.status(403).json({ message: "Access denied: No roles assigned" });
//     }

//     // Vérifier si l'utilisateur est admin
//     const isAdmin = userRoles.some(userRole => userRole.role?.name?.toLowerCase() === "admin");

//     if (allowAdmin && isAdmin) {
//       req.isAdmin = true;
//       return next();
//     }

//     // Récupérer les IDs des rôles (sans doublons)
//     const roleIds = userRoles
//       .map(userRole => userRole.role?.id)
//       .filter(id => id !== undefined)
//       .filter((id, index, self) => self.indexOf(id) === index); // ✅ Supprime les doublons

//     console.log("🚀 Role IDs après suppression des doublons:", roleIds);
//     console.log("🔍 Vérification de la permission pour:", permissionName);
//     console.log("👤 Utilisateur:", req.user);
    
//     // Vérifier la permission demandée
//     const hasPermission = await RolePermission.findOne({
//       where: { roleId: roleIds },
//       include: [{ 
//         model: Permission, 
//         as:'permission',
//         where: { name:permissionName }
//       }],
//     });
//     console.log("🔍 Résultat de la recherche de permission:", hasPermission);
//     if (!hasPermission) {
//       return res.status(403).json({ message: "Access denied: Missing permission" });
//     }

//     next();
//   } catch (error) {
//     console.error("Permission check error:", error);
//     res.status(500).json({ message: "Failed to check permissions" });
//   }
// };

// module.exports.checkPermission = (permissionName, allowAdmin = false) => async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: "User not authenticated" });
//     }

//     // Récupérer les rôles de l'utilisateur
//     const userRoles = await UserRole.findAll({
//       where: { userId: req.user.id },
//       include: [{ model: Role, as: "role" }],
//     });

//     if (!userRoles || userRoles.length === 0) {
//       return res.status(403).json({ message: "Access denied: No roles assigned" });
//     }

//     // Vérifier si l'utilisateur est admin
//     const isAdmin = userRoles.some(userRole => userRole.role?.name?.toLowerCase() === "admin");

//     if (allowAdmin && isAdmin) {
//       req.isAdmin = true;
//       return next();
//     }

//     // Récupérer les IDs des rôles (sans doublons)
//     const roleIds = [...new Set(userRoles.map(userRole => userRole.role?.id).filter(id => id !== undefined))];

//     console.log("🚀 Role IDs après suppression des doublons:", roleIds);
//     console.log("🔍 Vérification de la permission pour:", permissionName);
    
//     // Vérifier si l'un des rôles a la permission demandée
//     const hasPermission = await RolePermission.findOne({
//       where: { roleId: roleIds },
//       include: [{ 
//         model: Permission, 
//         as: 'permission',
//         where: { name: permissionName }
//       }],
//     });

//     console.log("🔍 Résultat de la recherche de permission:", hasPermission);

//     if (!hasPermission) {
//       return res.status(403).json({ message: "Access denied: Missing permission" });
//     }

//     req.hasPermission = true; // Ajouter un flag pour une éventuelle utilisation ultérieure

//     next();
//   } catch (error) {
//     console.error("❌ Permission check error:", error);
//     res.status(500).json({ message: "Failed to check permissions" });
//   }
// };
// exports.checkAgencyAccess = async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: "User not authenticated" });
//     }

//     // Vérifie si la requête concerne les agences d'un utilisateur
//     const userId = req.params.userId;
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     // Vérifie si l'utilisateur connecté a accès aux agences du `userId`
//     const userAgencies = await UserAgency.findAll({
//       where: { userId },
//     });

//     if (!userAgencies.length && !req.isAdmin) {
//       return res.status(403).json({ message: "Access denied: No associated agencies" });
//     }

//     // Stocker les agences trouvées dans `req` pour éviter de refaire la requête en aval
//     req.userAgencies = userAgencies.map((ua) => ua.agencyId);

//     next();
//   } catch (error) {
//     console.error("❌ Agency access check error:", error);
//     res.status(500).json({ message: "Failed to check agency access" });
//   }
// };
module.exports.checkPermission = (permissionName, allowAdmin = false) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "User not authenticated" });
    }

    const userRoles = await UserRole.findAll({
      where: { userId: req.user.id },
      include: [{ model: Role, as: "role" }],
    });

    if (!userRoles || userRoles.length === 0) {
      console.log("⛔ Aucun rôle trouvé, on continue avec `checkAgencyAccess`...");
      return next(); // On laisse l'autre middleware gérer l'accès
    }

    const isAdmin = userRoles.some(userRole => userRole.role?.name?.toLowerCase() === "admin");
    
    if (allowAdmin && isAdmin) {
      console.log("✅ L'utilisateur est admin, accès accordé");
      req.isAdmin = true;
      return next();
    }

    const roleIds = [...new Set(userRoles.map(userRole => userRole.role?.id).filter(id => id !== undefined))];

    const hasPermission = await RolePermission.findOne({
      where: { roleId: roleIds },
      include: [{ model: Permission, as: "permission", where: { name: permissionName } }],
    });

    if (!hasPermission) {
      console.log("⛔ Permission refusée, on continue avec `checkAgencyAccess`...");
      return next(); // On laisse `checkAgencyAccess` essayer
    }

    console.log("✅ Permission accordée !");
    req.hasPermission = true;
    next();
  } catch (error) {
    console.error("❌ Erreur dans `checkPermission`:", error);
    res.status(500).json({ message: "Failed to check permissions" });
  }
};


const Agency = require("../models/agenceModel.js")
// const RolePermission = require("../models/RolepermissionModel.js");
// const Role = require("../models/roleModel");
// const UserRole = require("../models/userRoleModel");
// const Agency = require("../models/agencyModel");
// const UserAgency = require("../models/userAgencies.js");
// const Permission = require("../models/PermissionModel");
// require("dotenv").config();

module.exports.checkAgencyAccess = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    const targetUserId = req.params.userId || req.body.userId; // L'utilisateur dont on veut voir les agences

    if (!targetUserId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    console.log("🔍 Vérification d'accès aux agences pour:", userId);

    // ✅ Vérification si l'utilisateur est admin
    const userRoles = await UserRole.findAll({
      where: { userId: req.user.id },
      include: [{ model: Role, as: "role" }],
    });

    if (!userRoles || userRoles.length === 0) {
      return res.status(403).json({ message: "Access denied: No roles assigned" });
    }

    const isAdmin = userRoles.some(userRole => userRole.role?.name?.toLowerCase() === "admin");

    if (isAdmin) {
      console.log("✅ L'utilisateur est admin, accès accordé");
      req.isAdmin = true;
      return next();
    }

    // ✅ Vérifier si l'utilisateur est le créateur d'une agence
    const createdAgencies = await Agency.findAll({
      where: { userId: targetUserId },
      attributes: ["id"],
    });

    let agencyIds = createdAgencies.map((a) => a.id);

    // ✅ Vérifier si l'utilisateur est affecté à une agence via `UserAgency`
    const userAgencies = await UserAgency.findAll({
      where: { userId: targetUserId },
      attributes: ["agencyId"],
    });

    agencyIds.push(...userAgencies.map((ua) => ua.agencyId));

    agencyIds = [...new Set(agencyIds)]; // Éviter les doublons

    if (agencyIds.length > 0) {
      console.log("✅ Accès accordé aux agences:", agencyIds);
      req.accessibleAgencyIds = agencyIds;
      return next();
    }

    console.log("⛔ Accès refusé : L'utilisateur n'a pas les permissions nécessaires.");
    return res.status(403).json({ message: "Access denied: Not authorized for this agency" });

  } catch (error) {
    console.error("❌ Erreur dans `checkAgencyAccess`:", error);
    res.status(500).json({ message: "Failed to check agency access" });
  }
};


// module.exports.checkAgencyAccess = async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: "User not authenticated" });
//     }

//     const userId = req.user.id;
//     const targetUserId = req.params.userId; // L'utilisateur dont on veut voir les agences

//     if (!targetUserId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     console.log("🔍 Vérification d'accès à l'agence pour l'utilisateur:", userId);

//     // ✅ Cas 1 : Vérifier si l'utilisateur est admin via `checkPermission`
//     await checkPermission("admin_access", true)(req, res, async (err) => {
//       if (!err && req.isAdmin) {
//         console.log("✅ L'utilisateur est admin, accès accordé");
//         return next();
//       }

//       // ✅ Cas 2 : Vérifier si l'utilisateur est le créateur d'une agence
//       const createdAgencies = await Agency.findAll({
//         where: { userId: targetUserId },
//         attributes: ["id"],
//       });

//       let agencyIds = createdAgencies.map((a) => a.id);

//       // ✅ Cas 3 : Vérifier si l'utilisateur est affecté à une agence via `UserAgency`
//       const userAgencies = await UserAgency.findAll({
//         where: { userId: targetUserId },
//         attributes: ["agencyId"],
//       });

//       agencyIds.push(...userAgencies.map((ua) => ua.agencyId));

//       agencyIds = [...new Set(agencyIds)]; // Éviter les doublons

//       if (agencyIds.length > 0) {
//         console.log("✅ L'utilisateur a accès aux agences:", agencyIds);
//         req.accessibleAgencyIds = agencyIds;
//         return next();
//       }

//       // ✅ Cas 4 : Vérifier si l'utilisateur a une permission pour accéder à une agence
//       // const hasPermission = await RolePermission.findOne({
//       //   where: { roleId: req.user.roleIds },
//       //   include: [
//       //     {
//       //       model: Permission,
//       //       as: "permission",
//       //       where: { name: "access_specific_agency" },
//       //     },
//       //   ],
//       // });

//       // if (hasPermission) {
//       //   console.log("✅ L'utilisateur a la permission spéciale d'accès");
//       //   return next();
//       // }

//       // console.log("⛔ Accès refusé : L'utilisateur n'a pas de permissions pour cette agence.");
//       // return res.status(403).json({ message: "Access denied: Not authorized for this agency" });
//     });
//   } catch (error) {
//     console.error("❌ Erreur dans `checkAgencyAccess`:", error);
//     res.status(500).json({ message: "Failed to check agency access" });
//   }
// };
// exports.checkAgencyAccess = async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: "User not authenticated" });
//     }

//     const userId = req.user.id; // L'utilisateur qui fait la requête
//     const targetUserId = req.params.userId || req.body.userId; // L'utilisateur dont on veut voir les agences

//     if (!targetUserId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     // ✅ Cas 1 : L'admin a accès à tout
//     if (req.isAdmin) {
//       return next();
//     }

//     let agencyIds = [];

//     // ✅ Cas 2 : Vérifier si l'utilisateur est le créateur d'une ou plusieurs agences
//     const createdAgencies = await Agency.findAll({
//       where: { userId: targetUserId },
//       attributes: ["id"],
//     });

//     agencyIds.push(...createdAgencies.map((a) => a.id));

//     // ✅ Cas 3 : Vérifier les agences où `targetUserId` est affecté via `UserAgency`
//     const userAgencies = await UserAgency.findAll({
//       where: { userId: targetUserId },
//       attributes: ["agencyId"],
//     });

//     agencyIds.push(...userAgencies.map((ua) => ua.agencyId));

//     // ✅ Cas 4 : Vérifier si l'utilisateur a des permissions d'accès à des agences spécifiques
//     // const permissions = await RolePermission.findAll({
//     //   where: { roleId: req.user.roleIds },
//     //   include: [{
//     //     model: Permission,
//     //     as: 'permission',
//     //     where: { name: "access_specific_agency" }
//     //   }],
//     // });

//     // if (permissions.length > 0) {
//     //   agencyIds = []; // Autorisation d'accès illimitée
//     // }

//     // ✅ Supprimer les doublons des `agencyIds`
//     agencyIds = [...new Set(agencyIds)];

//     if (!agencyIds.length) {
//       return res.status(403).json({ message: "Access denied: No agencies found for this user" });
//     }

//     req.accessibleAgencyIds = agencyIds; // Stocker les agences accessibles

//     return next();
//   } catch (error) {
//     console.error("❌ Error in checkAgencyAccess middleware:", error);
//     res.status(500).json({ message: "Failed to check agency access" });
//   }
// };


// exports.checkAgencyAccess = async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: "User not authenticated" });
//     }

//     const userId = req.user.id;
//     const agencyUserId = req.params.userId || req.body.userId; // L'agence appartient à ce userId

//     if (!agencyUserId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     // ✅ Cas 1 : L'admin a accès à tout
//     if (req.isAdmin) {
//       return next();
//     }

//     // ✅ Cas 2 : Vérifier si l'utilisateur est le créateur de l'agence
//     const agency = await Agency.findOne({ where: { userId: agencyUserId } });

//     if (!agency) {
//       return res.status(404).json({ message: "Agency not found" });
//     }

//     if (agency.userId === userId) {
//       return next();
//     }

//     // ✅ Cas 3 : Vérifier si l'utilisateur est affecté à l'agence via `UserAgency`
//     const userAgency = await UserAgency.findOne({
//       where: { userId, agencyId: agency.id },
//     });

//     if (userAgency) {
//       return next();
//     }

//     // ✅ Cas 4 : Vérifier si l'utilisateur a une permission pour accéder à cette agence
//     const hasPermission = await RolePermission.findOne({
//       where: { roleId: req.user.roleIds },
//       include: [{ 
//         model: Permission, 
//         as: 'permission', 
//         where: { name: "access_specific_agency" }
//       }],
//     });

//     if (hasPermission) {
//       return next();
//     }

//     return res.status(403).json({ message: "Access denied: Not authorized for this agency" });
//   } catch (error) {
//     console.error("❌ Agency access check error:", error);
//     res.status(500).json({ message: "Failed to check agency access" });
//   }
// };
 
// exports.verifyUserAgency = async (req, res, next) => {
//   try {
//     const userId = req.user.id; // Supposons que l'ID de l'utilisateur authentifié est stocké dans req.user
//     const { agencyId } = req.body; // Supposons que l'ID de l'agence est fourni dans le corps de la requête
//     console.log("Agency model:", Agency);
//     if (!agencyId) {
//       return res.status(400).json({ message: "Agency ID is required" });
//     }

//     // Vérifiez si l'utilisateur est associé à l'agence spécifiée
//     const agency = await Agency.findOne({
//       where: {
//         id: agencyId,
//         userId: userId, // Vérifie que l'agence appartient à l'utilisateur
//       },
//     });

//     if (!agency) {
//       return res.status(403).json({ message: "Vous n'êtes pas autorisé à créer une campagne pour cette agence." });
//     }

//     // L'utilisateur est autorisé à créer une campagne pour cette agence
//     next();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Erreur serveur." });
//   }
// };
// sans agency
//  module.exports.checkAgencyAccess = async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: "User not authenticated" });
//     }

//     // Vérifie si la requête concerne les agences d'un utilisateur
//     const userId = req.params.userId;
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }
 
//     // Vérifie si l'utilisateur connecté a accès aux agences du `userId`
//     const userAgencies = await UserAgency.findAll({
//       where: { userId },
//     });

//     if (!userAgencies.length && !req.isAdmin) {
//       return res.status(403).json({ message: "Access denied: No associated agencies" });
//     }

//     // Stocker les agences trouvées dans `req` pour éviter de refaire la requête en aval
//     req.userAgencies = userAgencies.map((ua) => ua.agencyId);

//     next();
//   } catch (error) {
//     console.error("❌ Agency access check error:", error);
//     res.status(500).json({ message: "Failed to check agency access" });
//   }
// };

// module.exports.checkAgencyAccess = async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: "User not authenticated" });
//     }

//     const userId = req.user.id;
//     const targetUserId = req.params.userId || req.body.userId;

//     if (!targetUserId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     // ✅ Cas 1 : Un administrateur a accès à tout
//     if (req.isAdmin) {
//       return next();
//     }

//     // ✅ Cas 2 : Vérifier si l'utilisateur est le créateur de l'agence
//     const agency = await Agency.findOne({ where: { userId: targetUserId } });

//     if (agency && agency.userId === userId) {
//       return next();
//     }

//     // ✅ Cas 3 : Vérifier si l'utilisateur est affecté à une agence via `UserAgency`
//     const userAgencies = await UserAgency.findAll({
//       where: { userId },
//       attributes: ["agencyId"],
//     });

//     const agencyIds = userAgencies.map((ua) => ua.agencyId);

//     if (agencyIds.includes(targetUserId)) {
//       return next();
//     }

//     return res.status(403).json({ message: "Access denied: Not authorized for this agency" });
//   } catch (error) {
//     console.error("❌ Agency access check error:", error);
//     res.status(500).json({ message: "Failed to check agency access" });
//   }
// };

exports.authorizeCustomer = async (req, res, next) => {
  const { userId } = req.user;
  const { customerId } = req.body;

  try {
    // Vérifiez que le customer appartient bien à l'utilisateur connecté
    const customer = await Customer.findOne({
      where: { id: customerId, userId },
    });

    if (!customer) {
      return res.status(403).json({ message: "Unauthorized: This customer does not belong to you" });
    }

    next(); // Passe au prochain middleware ou contrôleur
  } catch (error) {
    console.error("Error authorizing customer:", error);
    res.status(500).json({ message: "Authorization failed" });
  }
};



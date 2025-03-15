const  PaymentMode  = require("../models/paymentMode");

const paymentModeController = {
  async create(req, res) {
    try {
      const paymentMode = await PaymentMode.create(req.body);
      return res.status(201).json(paymentMode);
    } catch (error) {
      console.error("Error creating payment mode:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const paymentModes = await PaymentMode.findAll();
      return res.status(200).json(paymentModes);
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      return res.status(500).json({ message: error.message });
    }
  },
  async getPaymentModes (req, res)  {
    const paymentModes = await PaymentMode.findAll({
        where: { status: 'active' }
    });
  
    res.status(200).json({
        status: 'success',
        data: paymentModes
    });
  }
};

module.exports = paymentModeController;

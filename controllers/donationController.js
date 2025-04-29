const Donation = require('../models/Donation');
const { z } = require('zod');

const donationSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  amount: z.number().positive(),
  causeId: z.string().optional().nullable(),
  message: z.string().min(5),
  paymentId: z.string().min(3),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  receipt: z.string().optional(),
  userId: z.string().optional().nullable(),
  aadharNumber: z.string().length(12, "Aadhar must be 12 digits").optional(),
  panCardNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number").optional()
});


// Create Donation
exports.createDonation = async (req, res) => {
  const result = donationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, errors: result.error.errors });
  }

  try {
    const donation = await Donation.create(result.data);
    res.status(201).json({
      message: "Donation successful",
      donation
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to process donation", error: err.message });
  }
};

// Get all Donations
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch donations" });
  }
};

// Get single donation
exports.getSingleDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });
    res.status(200).json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch donation" });
  }
};

// Delete donation
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });
    res.status(200).json({ success: true, message: "Donation deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete donation" });
  }
};

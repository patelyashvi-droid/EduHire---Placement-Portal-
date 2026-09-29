const express = require("express");
const mongoose = require("mongoose");
const Company = require("../models/company");
const Drive = require("../models/drives");
const Application = require("../models/application");
const Report = require("../models/report");

const router = express.Router();

// Helper to find company by either Mongo _id or custom companyId
async function findCompanyById(id) {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byObjId = await Company.findOne({
      $or: [{ _id: id }, { companyId: id }],
    });
    if (byObjId) return byObjId;
  }
  return await Company.findOne({ companyId: id });
}

// ============================================
// ADD COMPANY (POST /api/companies)
// ============================================
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      website,
      location,
      email,
      contact,
      mobile,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: "Error",
        message: "Company name is required",
      });
    }

    const companyId =
      "COMP" +
      Date.now() +
      Math.floor(Math.random() * 1000);

    const company = new Company({
      companyId: companyId,
      name: name.trim(),
      description: description || "",
      website: website || "",
      location: location || "",
      email: email || "",
      contact: contact || "",
      mobile: mobile || "",
    });

    await company.save();

    console.log("================================");
    console.log("COMPANY ADDED");
    console.log("Company ID:", companyId);
    console.log("Company:", company.name);
    console.log("================================");

    return res.status(201).json({
      status: "Success",
      message: "Company added successfully",
      company: {
        _id: company._id,
        companyId: company.companyId,
        name: company.name,
        description: company.description,
        website: company.website,
        location: company.location,
        email: company.email,
        contact: company.contact,
        mobile: company.mobile,
      },
    });
  } catch (error) {
    console.error("ADD COMPANY ERROR:", error);
    return res.status(500).json({
      status: "Error",
      message: "Server error while adding company",
    });
  }
});

// ============================================
// GET ALL COMPANIES (GET /api/companies)
// ============================================
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    return res.status(200).json(companies);
  } catch (error) {
    console.error("GET COMPANIES ERROR:", error);
    return res.status(500).json({
      message: "Unable to fetch companies",
      error: error.message,
    });
  }
});

// ============================================
// GET SINGLE COMPANY (GET /api/companies/:id)
// ============================================
router.get("/:id", async (req, res) => {
  try {
    const company = await findCompanyById(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: "Error",
        message: "Company not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      company,
    });
  } catch (error) {
    console.error("GET COMPANY ERROR:", error);
    return res.status(500).json({
      status: "Error",
      message: "Unable to fetch company details",
      error: error.message,
    });
  }
});

// ============================================
// UPDATE COMPANY (PUT /api/companies/:id)
// ============================================
router.put("/:id", async (req, res) => {
  try {
    const company = await findCompanyById(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: "Error",
        message: "Company not found",
      });
    }

    const {
      name,
      description,
      website,
      location,
      email,
      contact,
      mobile,
    } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        status: "Error",
        message: "Company name cannot be empty",
      });
    }

    const oldName = company.name;
    const newName = name !== undefined ? name.trim() : oldName;

    if (name !== undefined) company.name = newName;
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (location !== undefined) company.location = location;
    if (email !== undefined) company.email = email;
    if (contact !== undefined) company.contact = contact;
    if (mobile !== undefined) company.mobile = mobile;

    await company.save();

    // If company name changed, update drives and applications to maintain integrity
    if (oldName && newName && oldName !== newName) {
      await Drive.updateMany(
        { company: oldName },
        { $set: { company: newName } }
      );
      await Application.updateMany(
        { companyName: oldName },
        { $set: { companyName: newName } }
      );
    }

    console.log("================================");
    console.log("COMPANY UPDATED");
    console.log("Company ID:", company.companyId);
    console.log("Company Name:", company.name);
    console.log("================================");

    return res.status(200).json({
      status: "Success",
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    console.error("UPDATE COMPANY ERROR:", error);
    return res.status(500).json({
      status: "Error",
      message: "Server error while updating company",
      error: error.message,
    });
  }
});

// ============================================
// DELETE COMPANY AND ALL ASSOCIATED DATA (DELETE /api/companies/:id)
// ============================================
router.delete("/:id", async (req, res) => {
  try {
    const company = await findCompanyById(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: "Error",
        message: "Company not found",
      });
    }

    const companyName = company.name;
    const companyCustomId = company.companyId;
    const companyObjectId = company._id;

    // Escaped regex for safe matching of company name
    const escapedName = companyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1. Find all drives related to this company
    const drives = await Drive.find({
      $or: [
        { company: companyName },
        { company: companyCustomId },
        { company: { $regex: new RegExp(`^${escapedName}$`, "i") } },
      ],
    });

    const driveIds = drives.map((d) => d._id.toString());
    const driveObjectIds = drives.map((d) => d._id);

    // 2. Delete reports linked to any of these drives
    if (driveIds.length > 0) {
      await Report.deleteMany({
        driveId: { $in: driveIds },
      });
    }

    // 3. Delete applications associated with drives or company
    const appDeleteCriteria = [
      { companyName: companyName },
      { companyName: { $regex: new RegExp(`^${escapedName}$`, "i") } },
    ];
    if (driveIds.length > 0) {
      appDeleteCriteria.push({ driveId: { $in: driveIds } });
    }

    await Application.deleteMany({
      $or: appDeleteCriteria,
    });

    // 4. Delete the drives
    if (driveObjectIds.length > 0) {
      await Drive.deleteMany({
        _id: { $in: driveObjectIds },
      });
    }

    // 5. Delete the company itself
    await Company.findByIdAndDelete(companyObjectId);

    console.log("================================");
    console.log("COMPANY AND ALL ASSOCIATED DATA DELETED");
    console.log("Company:", companyName);
    console.log("Deleted Drives Count:", drives.length);
    console.log("================================");

    return res.status(200).json({
      status: "Success",
      message: "Company and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("DELETE COMPANY ERROR:", error);
    return res.status(500).json({
      status: "Error",
      message: "Server error while deleting company",
      error: error.message,
    });
  }
});

module.exports = router;
import { Company } from '../models/Company.js';
import { Drive } from '../models/Drive.js';
import { User } from '../models/User.js';

export const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, location, isActive } = req.query;

    const query = {};
    if (industry) query.industry = new RegExp(industry, 'i');
    if (location) query.location = new RegExp(location, 'i');
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { industry: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { hrName: new RegExp(search, 'i') },
      ];
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const drives = await Drive.find({ companyId: company._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        company,
        drives,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const { name, industry, website, location, hrName, hrEmail } = req.body;

    if (!name || !industry || !website || !location || !hrName || !hrEmail) {
      return res.status(400).json({
        success: false,
        message: 'All company fields (name, industry, website, location, hrName, hrEmail) are required.',
      });
    }

    const normalizedHrEmail = hrEmail.toLowerCase().trim();

    // Check if hrEmail is already used by student or admin
    const existingUser = await User.findOne({ email: normalizedHrEmail });
    if (existingUser && existingUser.role !== 'recruiter') {
      return res.status(400).json({
        success: false,
        message: `Email "${normalizedHrEmail}" is already registered as a ${existingUser.role.toUpperCase()}. An email cannot be used across multiple roles.`,
      });
    }

    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A company with this name already exists.' });
    }

    const company = await Company.create({
      name: name.trim(),
      industry: industry.trim(),
      website: website.trim(),
      location: location.trim(),
      hrName: hrName.trim(),
      hrEmail: normalizedHrEmail,
      isActive: true,
    });

    // Auto-create or link recruiter user account
    if (!existingUser) {
      await User.create({
        name: hrName.trim(),
        email: normalizedHrEmail,
        role: 'recruiter',
        companyId: company._id,
        isActive: true,
      });
    } else if (existingUser.role === 'recruiter' && !existingUser.companyId) {
      existingUser.companyId = company._id;
      await existingUser.save();
    }

    res.status(201).json({
      success: true,
      message: 'Company added successfully and recruiter access provisioned.',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { name, industry, website, location, hrName, hrEmail, isActive } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    if (name) company.name = name.trim();
    if (industry) company.industry = industry.trim();
    if (website) company.website = website.trim();
    if (location) company.location = location.trim();
    if (hrName) company.hrName = hrName.trim();
    if (hrEmail) company.hrEmail = hrEmail.toLowerCase().trim();
    if (isActive !== undefined) company.isActive = isActive;

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company updated successfully.',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Toggle active or delete
    company.isActive = false;
    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company marked inactive.',
    });
  } catch (error) {
    next(error);
  }
};

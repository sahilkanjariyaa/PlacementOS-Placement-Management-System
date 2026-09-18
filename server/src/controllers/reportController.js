import { Application } from '../models/Application.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';
import { Drive } from '../models/Drive.js';
import { Parser } from 'json2csv';

export const getAnalytics = async (req, res, next) => {
  try {
    // 1. Applications by Status
    const statusAgg = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap = {
      applied: 0,
      shortlisted: 0,
      test: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    };
    statusAgg.forEach((item) => {
      if (statusMap[item._id] !== undefined) statusMap[item._id] = item.count;
    });

    const applicationsByStatus = Object.keys(statusMap).map((k) => ({
      status: k.charAt(0).toUpperCase() + k.slice(1),
      count: statusMap[k],
    }));

    // 2. Department-wise Placed vs Unplaced
    const deptAgg = await StudentProfile.aggregate([
      {
        $group: {
          _id: { department: '$department', placementStatus: '$placementStatus' },
          count: { $sum: 1 },
        },
      },
    ]);

    const deptMap = {};
    deptAgg.forEach((item) => {
      const dept = item._id.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, placed: 0, unplaced: 0 };
      }
      if (item._id.placementStatus === 'placed') {
        deptMap[dept].placed += item.count;
      } else {
        deptMap[dept].unplaced += item.count;
      }
    });

    const departmentPlacements = Object.values(deptMap);

    // 3. Company-wise Selections
    const companyAgg = await Application.aggregate([
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'drives',
          localField: 'driveId',
          foreignField: '_id',
          as: 'drive',
        },
      },
      { $unwind: '$drive' },
      {
        $lookup: {
          from: 'companies',
          localField: 'drive.companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: '$company.name',
          selectedCount: { $sum: 1 },
          avgPackage: { $avg: '$drive.package' },
        },
      },
      { $sort: { selectedCount: -1 } },
      { $limit: 8 },
    ]);

    const companySelections = companyAgg.map((c) => ({
      company: c._id,
      selected: c.selectedCount,
      avgPackage: Number(c.avgPackage.toFixed(1)),
    }));

    // 4. CTC Package Brackets
    const drives = await Drive.find().select('package');
    const salaryDistribution = [
      { tier: '3 - 6 LPA', count: drives.filter((d) => d.package >= 3 && d.package < 6).length },
      { tier: '6 - 10 LPA', count: drives.filter((d) => d.package >= 6 && d.package < 10).length },
      { tier: '10 - 15 LPA', count: drives.filter((d) => d.package >= 10 && d.package < 15).length },
      { tier: '15+ LPA', count: drives.filter((d) => d.package >= 15).length },
    ];

    res.status(200).json({
      success: true,
      data: {
        applicationsByStatus,
        departmentPlacements,
        companySelections,
        salaryDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const exportPlacementReport = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name' },
      })
      .sort({ appliedAt: -1 });

    const csvData = applications.map((app, index) => ({
      'S.No': index + 1,
      'Student Name': app.studentId?.userId?.name || 'N/A',
      'Student Email': app.studentId?.userId?.email || 'N/A',
      'Roll Number': app.studentId?.enrollmentNo || 'N/A',
      'Department': app.studentId?.department || 'N/A',
      'CGPA': app.studentId?.cgpa || 'N/A',
      'Backlogs': app.studentId?.backlogs || 0,
      'Company Name': app.driveId?.companyId?.name || 'N/A',
      'Drive Role': app.driveId?.title || 'N/A',
      'Package (LPA)': app.driveId?.package || 'N/A',
      'Status': app.status.toUpperCase(),
      'Applied Date': app.appliedAt ? new Date(app.appliedAt).toISOString().split('T')[0] : 'N/A',
      'Remarks': app.remarks || '',
    }));

    const fields = [
      'S.No',
      'Student Name',
      'Student Email',
      'Roll Number',
      'Department',
      'CGPA',
      'Backlogs',
      'Company Name',
      'Drive Role',
      'Package (LPA)',
      'Status',
      'Applied Date',
      'Remarks',
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`Placement_Report_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

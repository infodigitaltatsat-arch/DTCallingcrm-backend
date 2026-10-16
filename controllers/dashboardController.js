const Lead = require("../models/Lead");
const Contact = require("../models/Contact");
const Call = require("../models/Call");
const FollowUp = require("../models/FollowUp");

const getDashboardSummary = async (req, res) => {
  try {
    // Calculate the date range: today and the previous 6 days.
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      totalLeads,
      totalContacts,
      totalCalls,
      totalFollowUps,
      pendingFollowUps,
      leadsByStatus,
      callsByStatus,
      callsThisWeek,
      followUpsByStatus,
    ] = await Promise.all([
      Lead.countDocuments(),
      Contact.countDocuments(),
      Call.countDocuments(),
      FollowUp.countDocuments(),
      FollowUp.countDocuments({ status: "Pending" }),

      Lead.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Call.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Call.aggregate([
        {
          $match: {
            calledAt: { $gte: sevenDaysAgo, $lte: now },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$calledAt",
                timezone: "Asia/Kolkata",
              },
            },
            totalCalls: { $sum: 1 },
            totalDuration: { $sum: "$duration" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      FollowUp.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const callsToday = await Call.countDocuments({
      calledAt: { $gte: today, $lte: now },
    });

    res.status(200).json({
      success: true,
      summary: {
        totalLeads,
        totalContacts,
        totalCalls,
        callsToday,
        totalFollowUps,
        pendingFollowUps,
      },
      leadsByStatus,
      callsByStatus,
      followUpsByStatus,
      callsPerformance: callsThisWeek.map((item) => ({
        date: item._id,
        totalCalls: item.totalCalls,
        totalDuration: item.totalDuration,
      })),
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
};

module.exports = { getDashboardSummary };
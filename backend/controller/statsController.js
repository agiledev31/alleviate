const { Program, Suite, ProgramSubmission, User } = require("../models");

const getSurveys = async (req, res) => {
  try {
    const suiteId = req.query.suiteId;

    const assessments = suiteId
      ? await Program.find({ suite: suiteId })
      : await Program.find({ user_id: req.user._id });

    if (!assessments.length) {
      return res.json([]);
    }

    const baseQuery = suiteId
      ? { programId: { $in: assessments.map((a) => a._id) } }
      : { user_id: req.user._id };

    const submissions = await ProgramSubmission.find({ ...baseQuery });

    // Extract all KPIs from submissions
    const allKPIs = submissions.flatMap((submission) => submission.KPIs);
    const numberKPIs = allKPIs.filter(
      (kpi) => kpi.kpiType === "inputNumber" || kpi.kpiType === "rate"
    );
    // Group KPIs by their 'key' property
    const groupedKPIs = numberKPIs.reduce((acc, kpi) => {
      if (!acc[kpi.key]) {
        acc[kpi.key] = [];
      }
      acc[kpi.key].push(parseInt(kpi.submittedValue));
      return acc;
    }, {});

    // Calculate average, min, max, and median for each unique KPI
    const KPIs = Object.keys(groupedKPIs).map((key) => {
      const values = groupedKPIs[key];
      const average =
        values.reduce((sum, value) => sum + value, 0) / values.length;
      const count = values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      // Calculate median
      const sortedValues = [...values].sort((a, b) => a - b);
      const median =
        values.length % 2 === 0
          ? (sortedValues[values.length / 2 - 1] +
              sortedValues[values.length / 2]) /
            2
          : sortedValues[Math.floor(values.length / 2)];

      return {
        key,
        count,
        average,
        min,
        max,
        median,
      };
    });

    const selectKPIs = allKPIs.filter(
      (kpi) =>
        (kpi.kpiType === "select" ||
          kpi.kpiType === "radio" ||
          kpi.kpiType === "quiz") &&
        kpi.key
    );
    const chartKPIs = Object.entries(
      selectKPIs.reduce((acc, kpi) => {
        const submittedValue = kpi.submittedValue;
        const label =
          kpi.options.find((option) => option.value === submittedValue)
            ?.label || "";
        if (submittedValue) {
          acc[kpi.key] = acc[kpi.key] || {};
          acc[kpi.key][submittedValue] = acc[kpi.key][submittedValue] || {
            label,
            count: 0,
          };
          acc[kpi.key][submittedValue].count += 1;
        }

        return acc;
      }, {})
    ).map(([key, value]) => {
      const totalKPIs = selectKPIs.filter(
        (kpi) => kpi.key === key && kpi.submittedValue
      ).length;
      const submittedValues = Object.values(value);

      return {
        key,
        value: submittedValues.map(({ label, count }) => ({
          label,
          ratio: parseFloat(((count / totalKPIs) * 100).toFixed(2)),
        })),
      };
    });

    res.json({ KPIs, chartKPIs });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

const getAssessmentSurveys = async (req, res) => {
  try {
    const id = req.query.id;

    const baseQuery = id ? { programId: id } : { user_id: req.user._id };

    const submissions = await ProgramSubmission.find({ ...baseQuery });

    // Extract all KPIs from submissions
    const allKPIs = submissions.flatMap((submission) => submission.KPIs);
    const numberKPIs = allKPIs.filter(
      (kpi) => kpi.kpiType === "inputNumber" || kpi.kpiType === "rate"
    );
    // Group KPIs by their 'key' property
    const groupedKPIs = numberKPIs.reduce((acc, kpi) => {
      if (!acc[kpi.key]) {
        acc[kpi.key] = [];
      }
      acc[kpi.key].push(parseInt(kpi.submittedValue));
      return acc;
    }, {});

    // Calculate average, min, max, and median for each unique KPI
    const KPIs = Object.keys(groupedKPIs).map((key) => {
      const values = groupedKPIs[key];
      const average =
        values.reduce((sum, value) => sum + value, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      // Calculate median
      const sortedValues = [...values].sort((a, b) => a - b);
      const median =
        values.length % 2 === 0
          ? (sortedValues[values.length / 2 - 1] +
              sortedValues[values.length / 2]) /
            2
          : sortedValues[Math.floor(values.length / 2)];

      return {
        key,
        average,
        min,
        max,
        median,
      };
    });

    const selectKPIs = allKPIs.filter(
      (kpi) =>
        kpi.kpiType === "select" ||
        kpi.kpiType === "radio" ||
        kpi.kpiType === "quiz"
    );
    const chartKPIs = Object.entries(
      selectKPIs.reduce((acc, kpi) => {
        const submittedValue = kpi.submittedValue;
        const label =
          kpi.options.find((option) => option.value === submittedValue)
            ?.label || "";
        if (submittedValue) {
          acc[kpi.key] = acc[kpi.key] || {};
          acc[kpi.key][submittedValue] = acc[kpi.key][submittedValue] || {
            label,
            count: 0,
          };
          acc[kpi.key][submittedValue].count += 1;
        }

        return acc;
      }, {})
    ).map(([key, value]) => {
      const totalKPIs = selectKPIs.filter(
        (kpi) => kpi.key === key && kpi.submittedValue
      ).length;
      const submittedValues = Object.values(value);

      return {
        key,
        value: submittedValues.map(({ label, count }) => ({
          label,
          ratio: parseFloat(((count / totalKPIs) * 100).toFixed(2)),
        })),
      };
    });

    res.json({ KPIs, chartKPIs });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};
const getDataSummary = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) throw new Error("id is not specified");

    const baseQuery = { programId: id };

    const submissions = await ProgramSubmission.find({ ...baseQuery });

    // Extract all KPIs from submissions
    const formData = {};

    // Calculate average, min, max, and median for each unique KPI
    submissions.forEach((submission) => {
      const form =
        submission?.formData?.submittedData ?? submission?.formData?.fileData;
      if (!form) return;

      for (const key of Object.keys(form)) {
        if (!formData[key]) formData[key] = [form[key]];
        else formData[key].push(form[key]);
      }
    });

    for (const key of Object.keys(formData)) {
      const values = formData[key];
      if (typeof values?.[0] === "number") {
        const average =
          values.reduce((sum, value) => sum + value, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Calculate median
        const sortedValues = [...values].sort((a, b) => a - b);
        const median =
          values.length % 2 === 0
            ? (sortedValues[values.length / 2 - 1] +
                sortedValues[values.length / 2]) /
              2
            : sortedValues[Math.floor(values.length / 2)];

        formData[key] = {
          average,
          min,
          max,
          median,
        };
      }
    }

    res.json({ formData });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") throw new Error("No access");

    const activeUsersCount = await User.countDocuments({
      /* your condition for active users */
    });

    // Daily Active Users: Assuming you have a updatedAt field to check activity in the last 24h
    const dailyActiveUsersCount = await User.countDocuments({
      updatedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    const totalUsersCount = await User.countDocuments({});
    const dailyActiveUsersPercentage =
      (dailyActiveUsersCount / totalUsersCount) * 100;

    // Weekly and Monthly Active Users: Similar to Daily, but with 7 days and 30 days
    const weeklyActiveUsersCount = await User.countDocuments({
      updatedAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    const weeklyActiveUsersPercentage =
      (weeklyActiveUsersCount / totalUsersCount) * 100;

    const monthlyActiveUsersCount = await User.countDocuments({
      updatedAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    const monthlyActiveUsersPercentage =
      (monthlyActiveUsersCount / totalUsersCount) * 100;

    const ngoOrganizationCount = await User.countDocuments({
      role: "ngo-company",
    });
    const programCount = await Suite.countDocuments({
      isGrantOpportunity: false,
    });

    res.json({
      activeUsersCount,
      dailyActiveUsersPercentage,
      weeklyActiveUsersPercentage,
      monthlyActiveUsersPercentage,
      ngoOrganizationCount,
      programCount,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

module.exports = {
  getSurveys,
  getAssessmentSurveys,
  getDataSummary,
  getAdminStats,
};

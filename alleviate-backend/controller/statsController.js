const { Program, ProgramSubmission } = require("../models");

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
    const numberKPIs = allKPIs.filter((kpi) => kpi.kpiType === 'inputNumber' || kpi.kpiType === 'rate');
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

    const selectKPIs = allKPIs.filter((kpi) => (kpi.kpiType === 'select' || kpi.kpiType === 'radio' || kpi.kpiType === 'quiz') && kpi.key);
    const chartKPIs = Object.entries(
        selectKPIs.reduce((acc, kpi) => {
          const submittedValue = kpi.submittedValue;
          const label = kpi.options.find((option) => option.value === submittedValue)?.label || '';
          if (submittedValue) {
            acc[kpi.key] = acc[kpi.key] || {};
            acc[kpi.key][submittedValue] = acc[kpi.key][submittedValue] || { label, count: 0 };
            acc[kpi.key][submittedValue].count += 1;
          }

          return acc;
        }, {})
    ).map(([key, value]) => {
      const totalKPIs = selectKPIs.filter((kpi) => (kpi.key === key && kpi.submittedValue)).length;
      const submittedValues = Object.values(value);

      return {
        key,
        value: submittedValues.map(({ label, count }) => ({ label, ratio: parseFloat(((count / totalKPIs) * 100).toFixed(2)) }))
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

    const baseQuery = id
        ? { programId: id}
        : { user_id: req.user._id };

    console.log('baseQuery', baseQuery)
    const submissions = await ProgramSubmission.find({ ...baseQuery });

    // Extract all KPIs from submissions
    const allKPIs = submissions.flatMap((submission) => submission.KPIs);
    const numberKPIs = allKPIs.filter((kpi) => kpi.kpiType === 'inputNumber' || kpi.kpiType === 'rate');
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

    const selectKPIs = allKPIs.filter((kpi) => kpi.kpiType === 'select' || kpi.kpiType === 'radio' || kpi.kpiType === 'quiz');
    const chartKPIs = Object.entries(
        selectKPIs.reduce((acc, kpi) => {
          const submittedValue = kpi.submittedValue;
          const label = kpi.options.find((option) => option.value === submittedValue)?.label || '';
          if (submittedValue) {
            acc[kpi.key] = acc[kpi.key] || {};
            acc[kpi.key][submittedValue] = acc[kpi.key][submittedValue] || { label, count: 0 };
            acc[kpi.key][submittedValue].count += 1;
          }

          return acc;
        }, {})
    ).map(([key, value]) => {
      const totalKPIs = selectKPIs.filter((kpi) => (kpi.key === key && kpi.submittedValue)).length;
      const submittedValues = Object.values(value);

      return {
        key,
        value: submittedValues.map(({ label, count }) => ({ label, ratio: parseFloat(((count / totalKPIs) * 100).toFixed(2)) }))
      };
    });


    res.json({ KPIs, chartKPIs });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

module.exports = {
  getSurveys,
  getAssessmentSurveys
};

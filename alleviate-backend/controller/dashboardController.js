const { Program, ProgramSubmission, Suite } = require("../models");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

const uri = process.env.STRAPI_MONGO_CONNECTION_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to the database");
    } catch (error) {
        console.error("Error connecting to the database", error);
    }
}
connectToDatabase();
const db = client.db("strapi");

const getDashboardDetails = async (req, res) => {
    try {
        const data = {
            KPIs: [],
            segmentKPIs: [],
            submissions: [],
            pendingPrograms: [],
            sdgs: [],
        };
        const userSuite = await Suite.find({user_id: req.user._id});
        const userSuiteIds = userSuite.map(item => item._id)
        const suitWiseProgram = await Program.find({suite: {$in: userSuiteIds}})

        // KPIs (Pie chart)
        const suitWiseProgramIds = suitWiseProgram.map(item => item._id);
        const programSubmissions = await ProgramSubmission.find({programId: {$in: suitWiseProgramIds}});
        const allKPIs = programSubmissions.flatMap((submission) => submission.KPIs);

        const selectKPIs = allKPIs.filter((kpi) => (kpi.kpiType === 'select' || kpi.kpiType === 'radio' || kpi.kpiType === 'quiz') && kpi.key && kpi.submittedValue);
        const totalKPIs = selectKPIs.length;

        const sortedKPIs = selectKPIs.reduce((acc, kpi) => {
            const key = kpi.key;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const topKPIs = Object.entries(sortedKPIs)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([key]) => key);

        const topKPIsData = topKPIs.map(key => {
            const count = sortedKPIs[key];
            const ratio = totalKPIs > 0 ? ((count / totalKPIs) * 100).toFixed(2) : 0;
            return {
                label: key,
                ratio: parseFloat(ratio),
            };
        });

        if (topKPIsData && topKPIsData.length > 0){
            data.KPIs = topKPIsData;
        }

        // SDGs (Bar Chart)
        const pipeline = [
            {
                $match: {
                    published_at: { $ne: null },
                },
            },
            {
                $lookup: {
                    from: "sustainable_development_goals",
                    localField: "sustainable_development_goals",
                    foreignField: "_id",
                    as: "sustainable_development_goals",
                },
            }
        ];

        const list = await db
            .collection("core_program_metrics")
            .aggregate(pipeline)
            .toArray();


        const countMap = {
            'No Poverty': 0,
            'Quality Education': 0,
            'Reduced Inequalities': 0
        };

        list.forEach(obj => {
            obj.sustainable_development_goals.forEach(innerObj => {
                const key = innerObj.Name;
                if (countMap.hasOwnProperty(key)) {
                    countMap[key]++;
                }
            });
        });

        const topSdgs = Object.keys(countMap)
            .map(key => ({ label: key, count: countMap[key] }))

        if (topSdgs) {
            data.sdgs = topSdgs;
        }

        // Recent submissions
        const submissions = await ProgramSubmission.find({programId: {$in: suitWiseProgramIds}}).sort({createdAt: -1}).limit(5).populate('user_id programId');
        if (submissions && submissions.length > 0) {
            data.submissions = submissions
        }

        // Pending programs with incomplete steps
        const suites = await Suite.find({user_id: req.user._id, published: false}).sort({ createdAt: -1 }).limit(10).lean();
        const suiteData = [];

        for (const suite of suites) {
            if (suite.category) {
                suite.categoryDetails = await db.collection("impact_categories").findOne({_id: new ObjectId(suite.category)});
            }
            suite.hasKPIs = suite.KPIs.length > 0;
            const hasAssessment = await Program.find({suite: suite._id, isDefaultAssessment: false});
            const hasPublishAssessment = await Program.find({suite: suite._id, isDefaultAssessment: false, published: true});
            suite.hasAssessment = hasAssessment.length > 0;
            suite.hasPublishAssessment = hasPublishAssessment.length > 0;
            suiteData.push(suite);
        }

        const filteredSuites = suiteData.filter(item => {
            return !item.hasKPIs || !item.hasAssessment || !item.hasPublishAssessment;
        });

        const firstFiveSuites = filteredSuites.slice(0, 5);
        if (firstFiveSuites && firstFiveSuites.length > 0) {
            data.pendingPrograms = firstFiveSuites
        }

        res.json(data);
    } catch (err) {
        res.status(400).send({
          message: err.message,
        });
    }
};

module.exports = {
  getDashboardDetails,
};

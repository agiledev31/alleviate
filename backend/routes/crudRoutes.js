const express = require("express");
const { sendMail } = require("../utils/mailer");
const router = express.Router();
const {
  checkUser,
  checkWritePermission,
  checkReadPermission,
} = require("../controller/crudController");
const {
  search,
  createItem,
  deleteBulk,
  updateItem,
  deleteItem,
} = require("../utils/crud");
const { models } = require("../models");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
const { User } = require("../models");
const { sendSMS } = require("../utils/sms");

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

const checkModel = async (req, res, next) => {
  const modelName = req.query.ModelName;

  if (!modelName || !models[modelName]) {
    return res.status(400).json({ message: "Wrong model" });
  }

  next();
};

router.use("/", checkUser, checkModel);

router
  .route("/single")
  .get(checkUser, checkReadPermission, async (req, res) => {
    try {
      // const result = await models[req.query.ModelName].findById(req.query.id);
      let result;
      let KpiList = [];

      if (req.query.ModelName === "Program") {
        result = await models[req.query.ModelName]
          .findById(req.query.id)
          .populate("suite");
        if (
          result.suite &&
          result.suite.KPIs &&
          result.suite.KPIs.length &&
          result.suite.KPIs.length > 0
        ) {
          let item = result.suite.KPIs.map((t) => new ObjectId(t));
          KpiList = await db
            .collection("core_program_metrics")
            .find({
              _id: {
                $in: Array.isArray(item) ? item : [item],
              },
            })
            .toArray();
        }
      } else {
        result = await models[req.query.ModelName].findById(req.query.id);
      }

      let dataToSend = {
        ...JSON.parse(JSON.stringify(result)),
        ...(KpiList && KpiList.length > 0 ? { KpiDetails: KpiList } : {}),
      };

      if (req.query.ModelName === "Suite") {
        let invitedPeoples = [];
        if (result?.invitedEmails && result?.invitedEmails.length > 0) {
          const assessments = await models["Program"].find({
            suite: { $in: result._id },
          });
          const invitedEmails = result?.invitedEmails;
          for (const email of invitedEmails) {
            const user = await User.findOne({ email });
            if (user) {
              const invitedPeoplesForAssessment = assessments
                .filter(
                  (assessment) =>
                    assessment &&
                    assessment?.invitedEmails &&
                    assessment?.invitedEmails.includes(email)
                )
                .map((assessment) => ({
                  user: { email },
                  assessment,
                  status: "registered",
                }));

              if (invitedPeoplesForAssessment.length > 0) {
                invitedPeoples.push(invitedPeoplesForAssessment[0]);
              } else if (invitedPeoplesForAssessment.length === 0) {
                invitedPeoples.push({ user: user, status: "registered" });
              }
            } else {
              const invitedPeoplesForAssessment = assessments
                .filter(
                  (assessment) =>
                    assessment &&
                    assessment?.invitedEmails &&
                    assessment?.invitedEmails.includes(email)
                )
                .map((assessment) => ({
                  user: { email: email },
                  assessment: assessment,
                  status: "pending",
                }));

              if (invitedPeoplesForAssessment.length > 0) {
                invitedPeoples.push(invitedPeoplesForAssessment[0]);
              } else if (invitedPeoplesForAssessment.length === 0) {
                invitedPeoples.push({
                  user: { email: email },
                  status: "pending",
                });
              }
            }
          }
        }
        if (invitedPeoples && invitedPeoples.length > 0) {
          dataToSend.invitedPeoples = invitedPeoples;
        }
      }

      if (req.query.ModelName === "Template") {
        const {
          impactThemes,
          category,
          strategicGoals,
          products,
          deliveryModel,
        } = result;

        if (impactThemes && impactThemes.length > 0) {
          let item = impactThemes.map((t) => new ObjectId(t));
          const impactThemeDetails = await db
            .collection("themes")
            .find({ _id: { $in: Array.isArray(item) ? item : [item] } })
            .toArray();

          if (impactThemeDetails && impactThemeDetails.length > 0) {
            dataToSend["impactThemeDetails"] = impactThemeDetails;
          }
        }

        if (category) {
          const categoryDetail = await db
            .collection("impact_categories")
            .findOne({ _id: new ObjectId(category) });
          if (categoryDetail) {
            dataToSend["categoryDetail"] = categoryDetail;
          }
        }

        if (strategicGoals && strategicGoals.length > 0) {
          let item = strategicGoals.map((t) => new ObjectId(t));
          const strategicGoalDetails = await db
            .collection("strategic_goals")
            .find({ _id: { $in: Array.isArray(item) ? item : [item] } })
            .toArray();

          if (strategicGoalDetails && strategicGoalDetails.length > 0) {
            dataToSend["strategicGoalDetails"] = strategicGoalDetails;
          }
        }

        if (deliveryModel && deliveryModel.length > 0) {
          let item = deliveryModel.map((t) => new ObjectId(t));
          const deliveryModelDetails = await db
            .collection("delivery_models")
            .find({ _id: { $in: Array.isArray(item) ? item : [item] } })
            .toArray();

          if (deliveryModelDetails && deliveryModelDetails.length > 0) {
            dataToSend["deliveryModelDetails"] = deliveryModelDetails;
          }
        }

        if (products && products.length > 0) {
          let item = products.map((t) => new ObjectId(t));
          const productDetails = await db
            .collection("products_and_services")
            .find({ _id: { $in: Array.isArray(item) ? item : [item] } })
            .toArray();

          if (productDetails && productDetails.length > 0) {
            dataToSend["productDetails"] = productDetails;
          }
        }
      }

      res.json(dataToSend);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  })
  .put(checkUser, checkWritePermission, async (req, res) => {
    try {
      const result = await updateItem(req, models[req.query.ModelName]);
      const populateFields =
        req.query.ModelName === "Template" ||
        req.query.ModelName === "DefaultAssessment" ||
        req.query.ModelName === "ProgramSubmission"
          ? "user_id"
          : req.query.ModelName === "Program"
          ? "user_id suite"
          : "programType user_id";

      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  })
  .delete(checkUser, checkWritePermission, async (req, res) => {
    try {
      const result = await deleteItem(req, models[req.query.ModelName]);
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

router
  .route("/create")
  .post(checkUser, checkWritePermission, async (req, res) => {
    try {
      const result = await createItem(req, models[req.query.ModelName], {
        user_id: req.user._id,
      });
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

router
  .route("/deleteBulk")
  .post(checkUser, checkWritePermission, async (req, res) => {
    try {
      const result = await deleteBulk(
        req,
        models[req.query.ModelName],
        req.body
      );
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

router
  .route("/search")
  .post(checkUser, checkReadPermission, async (req, res) => {
    try {
      let result = await search(req, models[req.query.ModelName]);

      if (req.query.ModelName === "ProgramSubmission") {
        result.items = await models[req.query.ModelName].populate(
          result.items,
          { path: "user_id programId" }
        );
      }

      if (req.query.ModelName === "Program") {
        result.items = await models[req.query.ModelName].populate(
          result.items,
          { path: "user_id" }
        );
      }

      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

module.exports = router;

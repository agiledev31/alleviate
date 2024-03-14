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

  console.log(modelName);
  console.log(models);
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

      if ( req.query.ModelName === "Template" ) {
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

      const data = await models[req.query.ModelName]
        .findById(result._id)
        .populate(populateFields);
      let KpiList = [];
      if (req.query.ModelName === "Program") {
        if (
          data.suite.KPIs &&
          data.suite.KPIs.length &&
          data.suite.KPIs.length > 0
        ) {
          let item = data.suite.KPIs.map((t) => new ObjectId(t));
          KpiList = await db
            .collection("core_program_metrics")
            .find({
              _id: {
                $in: Array.isArray(item) ? item : [item],
              },
            })
            .toArray();
        }
      }
      let category = [];
      let impactThemeDetails = [];
      let productDetails = [];
      let strategicGoalDetails = [];
      let deliveryModelDetails = [];
      if (data.category) {
        category = await db
          .collection("impact_categories")
          .find({ _id: new ObjectId(data.category) })
          .toArray();
      }

      if (
        data?.impactThemes &&
        data?.impactThemes.length &&
        data?.impactThemes.length > 0
      ) {
        let item = data?.impactThemes.map((t) => new ObjectId(t));
        impactThemeDetails = await db
          .collection("themes")
          .find({
            _id: {
              $in: Array.isArray(item) ? item : [item],
            },
          })
          .toArray();
      }

      if(req.query.ModelName === "Template") {
        if (data.products) {
          let item = data.products.map((t) => new ObjectId(t));
          productDetails = await db
            .collection("products_and_services")
            .find({ _id: { $in: Array.isArray(item) ? item : [item] } })
            .toArray();
        }
  
        if (data.strategicGoals) {
          let item = data.strategicGoals.map((t) => new ObjectId(t));
          strategicGoalDetails = await db
            .collection("strategic_goals")
            .find({ _id: { $in: Array.isArray(item) ? item : [item] } })
            .toArray();
        }
  
        if (data.deliveryModel) {
          let item = data.deliveryModel.map((t) => new ObjectId(t));
          deliveryModelDetails = await db
            .collection("delivery_models")
            .find({ _id: { $in: Array.isArray(item) ? item : [item] } })
            .toArray();
        }
      } else {
        if (data.products) {
          productDetails = await db
            .collection("products_and_services")
            .find({ _id: new ObjectId(data.products) })
            .toArray();
        }

        if (data.strategicGoals) {
          strategicGoalDetails = await db
            .collection("strategic_goals")
            .find({ _id: new ObjectId(data.strategicGoals) })
            .toArray();
        }

        if (data.deliveryModel) {
          deliveryModelDetails = await db
            .collection("delivery_models")
            .find({ _id: new ObjectId(data.deliveryModel) })
            .toArray();
        }
      }

      let dataToSend = {
        data: JSON.parse(JSON.stringify(data)),
      };

      if (category && category.length > 0) {
        dataToSend.data["categoryDetail"] = category[0];
      } else {
        dataToSend.data["categoryDetail"] = {};
      }

      if (impactThemeDetails && impactThemeDetails.length > 0) {
        dataToSend.data["impactThemeDetails"] = impactThemeDetails;
      } else {
        dataToSend.data["impactThemeDetails"] = [];
      }

      if (productDetails && productDetails.length > 0) {
        dataToSend.data["productDetails"] = productDetails[0];
      } else {
        dataToSend.data["productDetails"] = {};
      }

      if (strategicGoalDetails && strategicGoalDetails.length > 0) {
        dataToSend.data["strategicGoalDetails"] = strategicGoalDetails[0];
      } else {
        dataToSend.data["strategicGoalDetails"] = {};
      }

      if (deliveryModelDetails && deliveryModelDetails.length > 0) {
        dataToSend.data["deliveryModelDetails"] = deliveryModelDetails[0];
      } else {
        dataToSend.data["deliveryModelDetails"] = {};
      }

      if (KpiList && KpiList.length > 0) {
        dataToSend.data["KpiDetails"] = KpiList;
      } else {
        dataToSend.data["KpiDetails"] = [];
      }

      // Send application confirmation mail
      if (
        req.query.ModelName === "ProgramSubmission" &&
        req.user.role === "ngo-beneficiary"
      ) {
        if (
          dataToSend.data &&
          dataToSend.data.formData &&
          dataToSend.data.formData.isFinishClicked
        ) {
          const program = await models["Program"]
            .findOne({ _id: dataToSend.data.programId })
            .populate("user_id");
          if (program) {
            const mailOption = {
              to: dataToSend.data.user_id.email,
              subject: "Application Confirmation",
              message: `Dear ${
                dataToSend.data.user_id.firstName +
                " " +
                dataToSend.data.user_id.lastName
              },\n
                  Your application for the assessment "${
                    program.name
                  }" has been sent to the program owner successfully. \n
                  Thank you for applying and choosing Alleviate!`,
            };
            await sendMail(mailOption);
          }
        }
      }

      // Category wise send emails and notifications
      if (
        req.user &&
        req.user.hasOwnProperty("categoryNotifications") &&
        req.user.categoryNotifications.length > 0
      ) {
        if (req.query.ModelName === "Suite" && dataToSend.data.category) {
          const category = req.user.categoryNotifications.find(
            (item) => item.category === dataToSend.data.category
          );
          if (req.body.isAdded) {
            if (category.notifications.programCreate) {
              await sendMail({
                to: req.user.email,
                subject: "Program Creation",
                message: `Hello,\n\nThis is to inform you that a new program has been created in the category "${dataToSend.data.categoryDetail.Name}".\n\nProgram Name: "${dataToSend.data.name}"\n\nThank you for choosing Alleviate!`,
              });
            }
            if (category.notifications.programCreateAlert) {
              await sendSMS({
                to: req.user.phone,
                text: `Hello,\n\nA new program has been created in the category "${dataToSend.data.categoryDetail.Name}".\n\nProgram Name: "${dataToSend.data.name}"\n\nThank you for choosing Alleviate!`,
              });
            }
          }
          if (req.body.isPublished) {
            if (category.notifications.programPublish) {
              await sendMail({
                to: req.user.email,
                subject: "Program Publish",
                message: `Hello,\n\nThis is to inform you that a program has been published for the category "${dataToSend.data.categoryDetail.Name}".\n\nProgram Name: "${dataToSend.data.name}"\n\nThank you for choosing Alleviate!`,
              });
            }
            if (category.notifications.programPublishAlert) {
              await sendSMS({
                to: req.user.phone,
                text: `Hello,\n\nA program has been published for the category "${dataToSend.data.categoryDetail.Name}".\n\nProgram Name: "${dataToSend.data.name}"\n\nThank you for choosing Alleviate!`,
              });
            }
          }
        }

        if (req.query.ModelName === "Program") {
          if (dataToSend.data.suite.category) {
            const category = req.user.categoryNotifications.find(
              (item) => item.category === dataToSend.data.suite.category
            );
            const categoryData = await db
              .collection("impact_categories")
              .find({ _id: new ObjectId(dataToSend.data.suite.category) })
              .toArray();

            if (category && categoryData && categoryData[0].Name.length > 0) {
              if (req.body.isAdded) {
                if (category.notifications.assessmentCreate) {
                  await sendMail({
                    to: req.user.email,
                    subject: "Assessment Creation",
                    message: `Hello,\n\nThis is to inform you that a new assessment has been created in the category "${categoryData[0].Name}".\n\nAssessment Name: "${dataToSend.data.name}"\n\nThank you for choosing Alleviate!`,
                  });
                }
                if (category.notifications.assessmentCreateAlert) {
                  await sendSMS({
                    to: req.user.phone,
                    text: `Hello,\n\nA new assessment has been created in the category "${categoryData[0].Name}".\n\nAssessment Name: "${dataToSend.data.name}"\n\nThank you for choosing Alleviate!`,
                  });
                }
              }

              if (req.body.isPublished) {
                if (category.notifications.assessmentPublish) {
                  await sendMail({
                    to: req.user.email,
                    subject: "Assessment Publish",
                    message: `Hello,\n\nThis is to inform you that an assessment has been published for the category "${categoryData[0].Name}".\n\nAssessment Name: "${dataToSend.data.name}"\n\nThank you for choosing Alleviate!`,
                  });
                }
                if (category.notifications.assessmentPublishAlert) {
                  await sendSMS({
                    to: req.user.phone,
                    text: `Hello,\n\nAn assessment has been published for the category "${categoryData[0].Name}".\n\nAssessment Name: "${dataToSend.data.name}"\n\nThank you for choosing Alleviate!`,
                  });
                }
              }
            }
          }
        }
      }
      res.json(dataToSend.data);
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
      console.log("req.user._id", req.user._id);
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

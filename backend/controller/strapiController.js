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

const landingPage = async (req, res) => {
  try {
    const landingpage = await db.collection("landingpages").findOne({
      published_at: { $ne: null },
    });

    if (landingpage) {
      landingpage.HeroImages = await db
        .collection("upload_file")
        .find({
          _id: { $in: landingpage.HeroImages },
        })
        .toArray();
      landingpage.TrustedLogos = await db
        .collection("upload_file")
        .find({
          _id: { $in: landingpage.TrustedLogos },
        })
        .toArray();
    }

    const testimonialPipeline = [
      {
        $match: {
          published_at: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "upload_file",
          localField: "AuthorCompanyLogo",
          foreignField: "_id",
          as: "AuthorCompanyLogo",
        },
      },
      {
        $lookup: {
          from: "upload_file",
          localField: "AuthorImage",
          foreignField: "_id",
          as: "AuthorImage",
        },
      },
    ];
    const testimonials = await db
      .collection("landingpage_testimonials")
      .aggregate(testimonialPipeline)
      .toArray();

    const teamPipeline = [
      {
        $match: {
          published_at: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "upload_file",
          localField: "Image",
          foreignField: "_id",
          as: "Image",
        },
      },
    ];
    const team = await db
      .collection("landingpage_teams")
      .aggregate(teamPipeline)
      .toArray();

    const stats = await db
      .collection("landingpage_stats")
      .find({ published_at: { $ne: null } })
      .toArray();
    const pricings = await db
      .collection("landingpage_pricings")
      .find({ published_at: { $ne: null } })
      .toArray();
    const features = await db
      .collection("landingpage_features")
      .find({ published_at: { $ne: null } })
      .toArray();
    const faqs = await db
      .collection("landingpage_faqs")
      .find({ published_at: { $ne: null } })
      .toArray();

    const blogPipeline = [
      {
        $match: {
          published_at: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "upload_file",
          localField: "Image",
          foreignField: "_id",
          as: "Image",
        },
      },
      {
        $lookup: {
          from: "blog_categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          body: 0,
        },
      },
    ];
    const blogs = await db
      .collection("blogs")
      .aggregate(blogPipeline)
      .toArray();

    res.json({
      landingpage,
      testimonials,
      team,
      stats,
      pricings,
      features,
      faqs,
      blogs,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

const getBlog = async (req, res) => {
  try {
    console.log(req.query.id);
    const blog = await db
      .collection("blogs")
      .findOne({ _id: new ObjectId(req.query.id) });

    if (blog) {
      blog.category = await db
        .collection("blog_categories")
        .find({
          _id: {
            $in: Array.isArray(blog.category) ? blog.category : [blog.category],
          },
        })
        .toArray();
      blog.Image = await db
        .collection("upload_file")
        .find({
          _id: {
            $in: Array.isArray(blog.Image) ? blog.Image : [blog.Image],
          },
        })
        .toArray();
    }

    res.json({
      blog,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

const getList = async (req, res) => {
  try {
    const list = await db
      .collection(req.query.name)
      .find({ published_at: { $ne: null } })
      .toArray();

    res.json(list);
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

const getCoreProgramMetrics = async (req, res) => {
  try {
    const categoryFilter = req.query.impact_category;
    const pipeline = [
      {
        $match: {
          published_at: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "impact_categories",
          localField: "impact_category",
          foreignField: "_id",
          as: "impact_category",
        },
      },
      {
        $lookup: {
          from: "metric_levels",
          localField: "metric_level",
          foreignField: "_id",
          as: "metric_level",
        },
      },
      {
        $lookup: {
          from: "metric_quantity_types",
          localField: "metric_quantity_type",
          foreignField: "_id",
          as: "metric_quantity_type",
        },
      },
      {
        $unwind: "$metric_quantity_type",
      },
      {
        $lookup: {
          from: "metric_types",
          localField: "metric_type",
          foreignField: "_id",
          as: "metric_type",
        },
      },
      {
        $lookup: {
          from: "reporting_formats",
          localField: "reporting_format",
          foreignField: "_id",
          as: "reporting_format",
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "section",
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "subsection",
          foreignField: "_id",
          as: "subsection",
        },
      },
      {
        $unwind: "$subsection",
      },
      {
        $lookup: {
          from: "sustainable_development_goals",
          localField: "sustainable_development_goals",
          foreignField: "_id",
          as: "sustainable_development_goals",
        },
      },
      {
        $lookup: {
          from: "themes",
          localField: "themes",
          foreignField: "_id",
          as: "themes",
        },
      },
      // {
      //   $match: {
      //     'metric_quantity_type.Name': 'Stock',
      //     'subsection.Name': 'Client Information'
      //   }
      // }
    ];

    if (categoryFilter) {
      pipeline.push({
        $unwind: '$impact_category',
      });
      pipeline.push({
        $match: {
          'impact_category.Name': categoryFilter,
        },
      });
    }

    const list = await db
      .collection("core_program_metrics")
      .aggregate(pipeline)
      .toArray();

    res.json(list);
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

module.exports = {
  landingPage,
  getBlog,
  getList,
  getCoreProgramMetrics,
};

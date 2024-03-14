const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    subscription: Object,
    KYCProcess: Object,

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    resetToken: { type: String },
    OTP: { type: String },
    OTPurpose: { type: String },
    OTPExpire: { type: Date },
    roleSelected: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["admin", "ngo-company", "ngo-beneficiary", "expert", "donor"],
      default: "ngo-company", // Set default role as Beneficiary
    },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    kycVerified: { type: Boolean, default: false },

    locale: { type: String, default: "en" },
    themeColor: { type: String, default: "#104392" },
    theme: { type: Number, default: 1 },

    // NGO Company specific fields
    companyName: { type: String, default: "", when: { role: "company" } },
    organizationType: { type: String, default: "", when: { role: "company" } },
    businessId: { type: String, default: "", when: { role: "company" } },
    businessIdDocumentRejected: {
      type: Object,
      default: { reason: String, timestamp: Date },
      when: { role: "company" },
    },
    businessIdDocument: {
      type: String,
      default: "",
      when: { role: "company" },
    },
    businessIdApproved: {
      type: Boolean,
      default: false,
      when: { role: "company" },
    },

    // Expert specific fields
    expertiseAreas: [{ type: String, default: "", when: { role: "expert" } }],
    experienceYears: { type: Number, default: 0, when: { role: "expert" } },
    education: [
      {
        type: {
          institution: String,
          details: String,
          startYear: Date,
          endYear: Date,
        },
        default: "",
        when: { role: "expert" },
      },
    ],
    certifications: [
      {
        type: {
          institution: String,
          link: String,
          year: Date,
        },
        default: "",
        when: { role: "expert" },
      },
    ],

    // Donor specific fields
    donationHistory: [
      {
        organization: String, // Name of the organization donated to
        amount: Number, // Amount donated
        date: Date, // Date of donation
      },
    ],
    preferredCauses: [{ type: String, default: "", when: { role: "donor" } }],

    // Admin specific fields
    roles: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
      default: [],
      when: { role: "admin" },
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    accessLevel: {
      type: String,
      enum: ["read-write", "read"],
      default: "read-write",
    },

    // Other common fields (you can add more as needed)
    avatar: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    about: { type: String, default: "" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "US" },

    website: { type: String, default: "" },
    cvDocument: { type: String, default: "" },
    socialMediaLinks: [{ platform: String, link: String }],

    // Notification settings
    notification: {
      securityalerts: { type: Boolean, default: true },
      platformupdates: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
      programmilestonereminders: { type: Boolean, default: true },
      grantproposaldeadlines: { type: Boolean, default: true },
      donorengagementopportunities: { type: Boolean, default: true },
      volunteercoordinationupdates: { type: Boolean, default: true },
      resourceaccessnotifications: { type: Boolean, default: true },
      programenrollmentconfirmation: {
        type: Boolean,
        default: true,
      },
      benefitdistributionalerts: { type: Boolean, default: true },
      programfeedbackrequests: { type: Boolean, default: true },
      communityeventannouncements: { type: Boolean, default: true },
      emergencyalerts: { type: Boolean, default: true },
      consultationrequests: { type: Boolean, default: true },
      contentcontributionacknowledgment: {
        type: Boolean,
        default: true,
      },
      engagementmetrics: { type: Boolean, default: true },
      newopportunityalerts: { type: Boolean, default: true },
      expertiseupdates: { type: Boolean, default: true },
      donationconfirmation: { type: Boolean, default: true },
      impactreports: { type: Boolean, default: true },
      matchingdonationcampaigns: { type: Boolean, default: true },
      fundingprogressupdates: { type: Boolean, default: true },
      specialrecognition: { type: Boolean, default: true },
    },

    sector: { type: String },
    blocked: { type: Boolean, default: false },
    relevantDataset: { type: [String], default: [] },
    // Category wise notification settings
    categoryNotifications: [
      {
        category: String,
        notifications: {
          programCreate: { type: Boolean, default: false },
          programPublish: { type: Boolean, default: false },
          assessmentCreate: { type: Boolean, default: false },
          assessmentPublish: { type: Boolean, default: false },
          programCreateAlert: { type: Boolean, default: false },
          programPublishAlert: { type: Boolean, default: false },
          assessmentCreateAlert: { type: Boolean, default: false },
          assessmentPublishAlert: { type: Boolean, default: false },
        },
      },
    ],
  },
  { timestamps: true }
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    writeAccess: [String], // Array of model names for write access
    readAccess: [String], // Array of model names for read access
    conditions: [Object], // Optional conditions for granting access
  },
  { timestamps: true }
);

const useCaseSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
  },
  { timestamps: true }
);
const questionBankSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);
const programTypeSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    useCase: { type: mongoose.Schema.Types.ObjectId, ref: "UseCase" },
  },
  { timestamps: true }
);
const ProgramSubmissionSchema = new mongoose.Schema(
  {
    programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    KPIs: {
      type: [
        {
          key: String,
          submittedValue: String,
          kpiType: String,
          options: [],
        },
      ],
      default: [],
    },
    formData: Object,
    status: {
      type: String,
      enum: ["not-approve", "approve", "reject"],
      default: "not-approve",
    },
  },
  { timestamps: true }
);
const programSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    programType: { type: mongoose.Schema.Types.ObjectId, ref: "ProgramType" },
    suite: { type: mongoose.Schema.Types.ObjectId, ref: "Suite" },
    published: { type: Boolean, default: false },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    endDate: { type: Date },
    listedForNGOBeneficiaries: { type: Boolean, default: false },
    listedForDonors: { type: Boolean, default: false },
    listedForExperts: { type: Boolean, default: false },
    AIEnhancements: { type: Boolean, default: false },
    displaySteps: { type: Boolean, default: true },
    form: Object,
    assessmentType: { type: String, default: "" },
    isDefaultAssessment: { type: Boolean, default: false },
    enrollClientMethod: { type: String, default: "" },
    formAccessibility: { type: String, default: "" },
    invitePeopleEmails: { type: [String], default: [] },
    invitedEmails: { type: [String], default: [] },
    reminderType: { type: String, default: "" },
    nextReminderDate: { type: Date },
  },
  { timestamps: true }
);

const suiteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    programType: { type: mongoose.Schema.Types.ObjectId, ref: "ProgramType" },
    published: { type: Boolean, default: false },
    favoriteBy: { type: [String], default: [] },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "UseCase" },
    impactThemes: { type: [String], default: [] },
    KPIs: { type: [String], default: [] },
    additionalKPIData: { type: [Object], default: [] },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date },
    objectives: { type: String, default: "" },
    image: { type: String, default: "" },
    listedForNGOBeneficiaries: { type: Boolean, default: false },
    listedForDonors: { type: Boolean, default: false },
    listedForExperts: { type: Boolean, default: false },
    strategicGoals: { type: String, default: "" },
    deliveryModel: { type: String, default: "" },
    products: { type: String, default: "" },
    form: Object,
    reminderType: { type: String, default: "" },
    nextReminderDate: { type: Date },
    completedGoals: { type: [String], default: [] },
    invitedEmails: { type: [String], default: [] },
  },
  { timestamps: true }
);

const templateSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    published: { type: Boolean, default: false },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    assessments: [],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "UseCase" },
    impactThemes: { type: [String], default: [] },
    KPIs: { type: [String], default: [] },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date },
    objectives: { type: String, default: "" },
    image: { type: String, default: "" },
    listedForNGOBeneficiaries: { type: Boolean, default: false },
    listedForDonors: { type: Boolean, default: false },
    listedForExperts: { type: Boolean, default: false },
    strategicGoals: { type: [String], default: [] },
    deliveryModel: { type: [String], default: [] },
    products: { type: [String], default: [] },
    form: Object,
  },
  { timestamps: true }
);

const defaultAssessmentSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    form: Object,
    assessmentType: { type: String, default: "" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
    isTemplateAssessment: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const benchMarkSchema = new mongoose.Schema(
  {
    benchMarkType: { type: String },
    sheetType: { type: String },
    KPIType: { type: String },
    disaggregations: { type: Object },
    iso3: { type: String },
    country: { type: String },
    region: { type: String },
    sub_region: { type: String },
    development_regions: { type: String },
    total: { type: Number },
    year: { type: Number },
    gender: { type: Object },
    residence: { type: Object },
    wealth_quintile: { type: Object },
    source: { type: Object },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({
  email: "text",
  firstName: "text",
  lastName: "text",
});
useCaseSchema.index({
  name: "text",
});
programTypeSchema.index({
  name: "text",
  description: "text",
});
suiteSchema.index({
  name: "text",
  description: "text",
});
programSchema.index({
  name: "text",
  description: "text",
});
questionBankSchema.index({
  name: "text",
  description: "text",
});
defaultAssessmentSchema.index({
  name: "text",
  description: "text",
});

const User = mongoose.model("User", userSchema);
const Role = mongoose.model("Role", roleSchema);
const UseCase = mongoose.model("UseCase", useCaseSchema);
const ProgramType = mongoose.model("ProgramType", programTypeSchema);
const Program = mongoose.model("Program", programSchema);
const Suite = mongoose.model("Suite", suiteSchema);
const ProgramSubmission = mongoose.model(
  "ProgramSubmission",
  ProgramSubmissionSchema
);
const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);
const DefaultAssessment = mongoose.model(
  "DefaultAssessment",
  defaultAssessmentSchema
);
const Template = mongoose.model("Template", templateSchema);
const BenchMark = mongoose.model("BenchMark", benchMarkSchema);

const models = {
  User,
  Role,
  UseCase,
  ProgramType,
  QuestionBank,
  Program,
  ProgramSubmission,
  Suite,
  DefaultAssessment,
  Template,
  BenchMark,
};

module.exports = {
  models,
  ...models,
};

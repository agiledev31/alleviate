import { Breadcrumb, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import CrudService from "../../service/CrudService";
import NotificationService from "../../service/NotificationService";
import StrapiService from "../../service/StrapiService";
import GrantDetails from "./GrantDetails";

export const sectors = [
  { value: "Education", label: "Education" },
  { value: "Health", label: "Health" },
  {
    value: "Agriculture & Food Security",
    label: "Agriculture & Food Security",
  },
  { value: "Employment", label: "Employment" },
  { value: "Diversity & Inclusion", label: "Diversity & Inclusion" },
  { value: "Financial Services", label: "Financial Services" },
  {
    value: "Social Services and Welfare",
    label: "Social Services and Welfare",
  },
  { value: "Community Development", label: "Community Development" },
  { value: "Youth Development", label: "Youth Development" },
  {
    value: "Women's Empowerment & Gender Equality",
    label: "Women's Empowerment & Gender Equality",
  },
  {
    value: "Small Business & Entrepreneurship",
    label: "Small Business & Entrepreneurship",
  },
];

export const humanReadableRevenue = (num) => {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    return (num / 1000).toFixed(0) + "k";
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(0) + "M";
  } else {
    return (num / 1000000000).toFixed(0) + "B";
  }
};

const GrantPreInformation = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [programDataDisplay, setProgramDataForDisplay] = useState(null);
  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [strategicGoals, setStrategicGoals] = useState([]);
  const [deliveryModels, setDeliveryModels] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categoryDeliveryModel, setCategoryDeliveryModel] = useState([]);
  const [categoryStrategicGoals, setCategoryStrategicGoals] = useState([]);
  const [impactThemes, setImpactThemes] = useState([]);
  const [programCreated, setProgramCreated] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    // if (!id) return;
    setProgramData(null);

    if (id) {
      setProgramCreated(true);
      CrudService.getSingle("Suite", id).then((res) => {
        if (!res.data) return;
        setProgramData(res.data);
        setFormData(res.data);
      });
    } else {
      setProgramCreated(false);
      setProgramData(null);
    }
  }, [searchParams]);

  useEffect(() => {
    StrapiService.getList("impact_categories").then(({ data }) =>
      setCategories(data)
    );
    StrapiService.getList("themes").then(({ data }) => setImpactThemes(data));
    StrapiService.getList("products_and_services").then(({ data }) =>
      setProducts(data)
    );
    StrapiService.getList("strategic_goals").then(({ data }) =>
      setStrategicGoals(data)
    );
    StrapiService.getList("delivery_models").then(({ data }) =>
      setDeliveryModels(data)
    );
  }, []);

  const filterAndSetState = (
    selectedCategory,
    key,
    sourceArray,
    targetSetter
  ) => {
    if (selectedCategory && selectedCategory[key]) {
      const selectedCategoryItems = selectedCategory[key];
      const matchedItems = sourceArray.filter(({ _id }) =>
        selectedCategoryItems.includes(_id)
      );
      targetSetter(matchedItems);
    } else {
      targetSetter([]);
    }
  };

  const updateCategoryData = (
    selectedCategory,
    products,
    setCategoryProducts,
    strategicGoals,
    setCategoryStrategicGoals,
    deliveryModels,
    setCategoryDeliveryModel
  ) => {
    filterAndSetState(
      selectedCategory,
      "products_and_services",
      products,
      setCategoryProducts
    );
    filterAndSetState(
      selectedCategory,
      "strategic_goals",
      strategicGoals,
      setCategoryStrategicGoals
    );
    filterAndSetState(
      selectedCategory,
      "delivery_models",
      deliveryModels,
      setCategoryDeliveryModel
    );
  };

  useEffect(() => {
    if (programDataDisplay && programDataDisplay.category) {
      const selectedCategory = categories.find(
        ({ _id }) => _id === programDataDisplay.category
      );
      updateCategoryData(
        selectedCategory,
        products,
        setCategoryProducts,
        strategicGoals,
        setCategoryStrategicGoals,
        deliveryModels,
        setCategoryDeliveryModel
      );
    }
  }, [programDataDisplay]);

  const handleMissionChange = (fieldName, value) => {
    if (fieldName === "category") {
      const selectedCategory = categories.find(({ _id }) => _id === value);
      updateCategoryData(
        selectedCategory,
        products,
        setCategoryProducts,
        strategicGoals,
        setCategoryStrategicGoals,
        deliveryModels,
        setCategoryDeliveryModel
      );
    }
  };

  const steps = [
    {
      id: "step1",
      name: "General Information",
      form: [
        {
          fieldName: "name",
          label: "Title of Grant Opportunity",
          type: "input",
          placeholder: "What is the title of your grant opportunity?",
          required: true,
        },
        {
          fieldName: "locations",
          label: "Provide applicable locations",
          type: "list",
          defaultForm: [
            {
              fieldName: "country",
              type: "country",
            },
          ],
          defaultObject: {
            country: "",
          },
        },
        {
          fieldName: "eligibleNationalities",
          label: "Provide eligible nationalities",
          type: "list",
          defaultForm: [
            {
              fieldName: "country",
              type: "country",
            },
          ],
          defaultObject: {
            country: "",
          },
        },
        {
          label: "Sectors",
          fieldName: "sectors",
          type: "select",
          multi: true,
          options: sectors.sort(function (a, b) {
            return a.label === b.label ? 0 : a.label < b.label ? -1 : 1;
          }),
        },
        {
          label: "Funding Agencies",
          fieldName: "fundingAgencies",
          type: "select",
          multi: true,
          options: [
            {
              value: "National Science Foundation",
              label: "National Science Foundation",
            },
            {
              value: "Federal Ministry of Education and Research",
              label: "Federal Ministry of Education and Research",
            },
            {
              value: "Agence nationale de la recherche",
              label: "Agence nationale de la recherche",
            },
            {
              value: "Fundacao para a Ciencia e a Tecnologia",
              label: "Fundacao para a Ciencia e a Tecnologia",
            },
            {
              value: "National Science Centre",
              label: "National Science Centre",
            },
            {
              value: "Research Council of Norway",
              label: "Research Council of Norway",
            },
            { value: "State Research Agency", label: "State Research Agency" },
            {
              value:
                "Unitatea Executiva Pentru Finantarea Invatamantului Superior a Cercetarii Dezvoltarii si Inovarii",
              label:
                "Unitatea Executiva Pentru Finantarea Invatamantului Superior a Cercetarii Dezvoltarii si Inovarii",
            },
            {
              value: "Scientific and Technological Research Council of Türkiye",
              label: "Scientific and Technological Research Council of Türkiye",
            },
            {
              value: "Ministry of Education, Universities and Research",
              label: "Ministry of Education, Universities and Research",
            },
            {
              value: "Ministry of Climate Action and Energy",
              label: "Ministry of Climate Action and Energy",
            },
            {
              value: "Swedish Governmental Agency for Innovation Systems",
              label: "Swedish Governmental Agency for Innovation Systems",
            },
            { value: "Innovate UK", label: "Innovate UK" },
            {
              value: "Economic and Social Research Council",
              label: "Economic and Social Research Council",
            },
            {
              value: "Austrian Research Promotion Agency",
              label: "Austrian Research Promotion Agency",
            },
            {
              value: "National Endowment for the Arts",
              label: "National Endowment for the Arts",
            },
            {
              value: "National Endowment for the Humanities",
              label: "National Endowment for the Humanities",
            },
            {
              value: "United States Department of Justice",
              label: "United States Department of Justice",
            },
            {
              value: "U.S. Department of Homeland Security",
              label: "U.S. Department of Homeland Security",
            },
            {
              value: "United States Department of Health and Human Services",
              label: "United States Department of Health and Human Services",
            },
            {
              value: "United States Environmental Protection Agency",
              label: "United States Environmental Protection Agency",
            },
            {
              value: "United States Department of Energy",
              label: "United States Department of Energy",
            },
            {
              value:
                "United States Department of Housing and Urban Development",
              label:
                "United States Department of Housing and Urban Development",
            },
            {
              value: "United States Department of Education",
              label: "United States Department of Education",
            },
            { value: "NASA", label: "NASA" },
            {
              value: "European Research Council",
              label: "European Research Council",
            },
            {
              value: "National Institutes of Health",
              label: "National Institutes of Health",
            },
            { value: "DARPA", label: "DARPA" },
            {
              value: "National Human Genome Research Institute",
              label: "National Human Genome Research Institute",
            },
            {
              value:
                "Federal Ministry for Economic Affairs and Climate Action of Germany",
              label:
                "Federal Ministry for Economic Affairs and Climate Action of Germany",
            },
            {
              value:
                "Federal Ministry for Environment, Nature Conservation and Nuclear Safety (Germany)",
              label:
                "Federal Ministry for Environment, Nature Conservation and Nuclear Safety (Germany)",
            },
            {
              value: "Federal Ministry of Food and Agriculture",
              label: "Federal Ministry of Food and Agriculture",
            },
            {
              value: "Czech Science Foundation",
              label: "Czech Science Foundation",
            },
            {
              value: "Defence Research & Development Organisation",
              label: "Defence Research & Development Organisation",
            },
            {
              value: "Department of Science and Technology",
              label: "Department of Science and Technology",
            },
            {
              value: "Department of Biotechnology",
              label: "Department of Biotechnology",
            },
            {
              value: "Department of Atomic Energy",
              label: "Department of Atomic Energy",
            },
            {
              value: "United States Agency for International Development",
              label: "United States Agency for International Development",
            },
            {
              value: "Department of Chemicals and Petro-Chemicals",
              label: "Department of Chemicals and Petro-Chemicals",
            },
            {
              value: "Centers for Disease Control and Prevention",
              label: "Centers for Disease Control and Prevention",
            },
            {
              value:
                "Cooperative State Research, Education, and Extension Service",
              label:
                "Cooperative State Research, Education, and Extension Service",
            },
            {
              value: "Office of Naval Research",
              label: "Office of Naval Research",
            },
            {
              value: "Health Resources and Services Administration",
              label: "Health Resources and Services Administration",
            },
            {
              value: "Indian Council of Social Science Research",
              label: "Indian Council of Social Science Research",
            },
            {
              value: "United States Department of Defense",
              label: "United States Department of Defense",
            },
            {
              value: "United States Department of Agriculture",
              label: "United States Department of Agriculture",
            },
            {
              value: "United States Department of Veterans Affairs",
              label: "United States Department of Veterans Affairs",
            },
            {
              value:
                "Ministry of Chemicals and Fertilisers, Government of India",
              label:
                "Ministry of Chemicals and Fertilisers, Government of India",
            },
            {
              value: "Atomic Energy Regulatory Board",
              label: "Atomic Energy Regulatory Board",
            },
            {
              value: "UK Research and Innovation",
              label: "UK Research and Innovation",
            },
            { value: "Health Research Board", label: "Health Research Board" },
          ].sort(function (a, b) {
            return a.label === b.label ? 0 : a.label < b.label ? -1 : 1;
          }),
        },
        {
          fieldName: "applicationDeadline",
          label: "Application Deadline",
          type: "datepicker",
        },
        {
          fieldName: "attachments",
          label: "Attachments",
          type: "upload",
        },
        {
          fieldName: "urlLinks",
          label: "URL Links",
          type: "list",
          defaultForm: [
            {
              fieldName: "URL",
              type: "input",
            },
          ],
          defaultObject: {
            URL: "",
          },
        },
        {
          fieldName: "fundingAmount",
          label: "Funding Amount",
          type: "inputRange",
          max: 20000000,
          step: 10000,
          tipFormatter: (value) => `$${humanReadableRevenue(value)}`,
        },
      ],
    },

    {
      id: "previewstep2",
      name: "Preview Grant Opportunity",
      form: [
        {
          type: "custom",
          CustomInputComponent: () => (
            <>
              <GrantDetails mockProgramData={formData} />
            </>
          ),
        },
      ],
      programPreviewDescriptionTitle: "Application Instructions",
      programPreviewDescriptionKey: "description",
    },
  ];

  const id = searchParams.get("id");
  const option = searchParams.get("option");

  if (!programData && programCreated) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <h2 className="text-xl mt-5 mx-3">
          <strong>Grant General Information</strong>
        </h2>
        <MultiStepComponent
          displaySteps={false}
          AIEnhancements={true}
          steps={steps}
          finishButtonTitle="Save"
          defaultValues={{
            ...programData,
          }}
          onFinish={async (formData) => {
            setFormData(formData);
            if (!id) {
              if (option === "scratch") {
                if (formData && formData.isFinishClicked) {
                  await CrudService.create("Suite", {
                    ...formData,
                    isGrantOpportunity: true,
                  }).then(async (program) => {
                    if (!program.data) return;

                    navigate(`/dashboard/grantdetail?id=${program.data._id}`);
                  });
                }
              }
            } else {
              if (programData && programCreated && formData) {
                await CrudService.update("Suite", id, {
                  ...formData,
                }).then((res) => {
                  if (!res.data) return;
                  setProgramDataForDisplay(res.data);
                });
                if (programData.published && formData.isFinishClicked) {
                  await NotificationService.updatedGrant({ id });
                }
                if (formData.isFinishClicked)
                  navigate(`/dashboard/grantdetail?id=${programData._id}`);
              }
            }
          }}
          programDataDisplay={programDataDisplay}
          onChangeFromSelect={(fieldName, value) =>
            handleMissionChange(fieldName, value)
          }
          formType={"SuitePre"}
        />
      </div>
    </>
  );
};

export default GrantPreInformation;

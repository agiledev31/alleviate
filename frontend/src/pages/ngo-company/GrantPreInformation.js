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
  const [fundingAgencies, setFundingAgencies] = useState([]);
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
    StrapiService.getList("funding_agencies").then(({ data }) => {
      setFundingAgencies(data);
    });
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
          fieldName: "description",
          label: "Description",
          type: "textarea",
          rows: 4,
          placeholder: "Describe this grant opportunity",
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
          width: 400,
          multi: true,
          options: fundingAgencies
            .map((a) => ({ value: a.Title, label: a.Title }))
            .sort(function (a, b) {
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

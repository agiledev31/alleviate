import { Breadcrumb, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import CrudService from "../../service/CrudService";
import NotificationService from "../../service/NotificationService";
import StrapiService from "../../service/StrapiService";

const GrantPreInformation = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [programDataDisplay, setProgramDataForDisplay] = useState(null);
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
          fieldName: "description",
          label: "Application Instructions",
          type: "textarea",
          placeholder: "Describe your grant opportunity",
          rows: 6,
        },
        {
          fieldName: "grantEligibilityCriteria",
          label: "Eligibility Criteria",
          type: "textarea",
          placeholder: "Describe the eligibility criteria of the opportunity",
          rows: 6,
        },
        {
          fieldName: "fundingAmount",
          label: "Funding Amount",
          type: "inputNumber",
        },
      ],
    },

    {
      id: "step2",
      name: "Program Details",
      form: [
        {
          fieldName: "category",
          label: "Which impact category best aligns with your mission?",
          type: "quiz",
          options: categories.map((c) => ({ value: c._id, label: c.Name })),
        },
        {
          fieldName: "strategicGoals",
          label: "Which Strategic Goal(s) best match your approach?",
          type: "quiz",
          options: categoryStrategicGoals.map((c) => ({
            value: c._id,
            label: c.Name,
          })),
        },
        {
          fieldName: "deliveryModel",
          label:
            "What approach is your organization using to achieve the selected strategic goal(s)?",
          type: "quiz",
          options: categoryDeliveryModel.map((c) => ({
            value: c._id,
            label: c.Name,
          })),
        },
        {
          fieldName: "products",
          label:
            "What specific products or services are you offering within your chosen delivery model?",
          type: "quiz",
          options: categoryProducts.map((c) => ({
            value: c._id,
            label: c.Name,
          })),
        },
        {
          fieldName: "impactThemes",
          label: "Which impact themes align with your priorities?",
          type: "quiz",
          multi: true,
          options: impactThemes.map((c) => ({ value: c._id, label: c.Name })),
        },
        {
          fieldName: "startDate",
          label: "Start Date",
          type: "datepicker",
        },
        {
          fieldName: "endDate",
          label: "End Date",
          type: "datepicker",
        },
      ],
    },
    {
      id: "previewstep",
      name: "Preview Grant Opportunity",
      form: [],
      programPreviewDescriptionTitle: "Application Instructions",
      programPreviewDescriptionKey: "description",
      programPreviewEligibilityKey: "grantEligibilityCriteria",
      programPreviewEligibilityTitle: "Eligibility Criteria",
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
          defaultValues={{
            ...programData,
          }}
          onFinish={async (formData) => {
            if (!id) {
              if (option === "scratch") {
                if (formData && formData.isFinishClicked) {
                  await CrudService.create("Suite", {
                    ...formData,
                    isGrantOpportunity: true,
                  }).then(async (program) => {
                    if (!program.data) return;

                    navigate(`/dashboard/suitedetails?id=${program.data._id}`);
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
                  navigate(`/dashboard/suitedetails?id=${programData._id}`);
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

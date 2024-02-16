import { Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import CrudService from "../../service/CrudService";
import StrapiService from "../../service/StrapiService";

const CreateTemplate = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
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
  const [reloadSteps, setReloadSteps] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      setReloadSteps(true);
      setProgramData(null);
      setTimeout(() => setReloadSteps(false), 1000)
    } else {
      const fetchData = async () => {
        if (id) {
          const res = await CrudService.getSingle("Template", id);
          if (res.data) {
            setProgramData(res.data);
          }
        }
      };

      fetchData();
    }
  }, [searchParams]);


  const handleActiveStep = (activeStep) => {
    setActiveStep(activeStep)
  };

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
          label: "Template Name ",
          type: "input",
          placeholder: "Enter template name",
          required: true,
        },
        {
          fieldName: "description",
          label: "Template Description",
          type: "textarea",
          placeholder: "Enter program description",
          rows: 6,
        },
        {
          fieldName: "image",
          label: "Thumbnail",
          type: "upload",
          placeholder: "Upload a thumbnail",
          rows: 6,
        },
      ],
    },

    {
      id: "step2",
      name: "Template Details",
      form: [
        {
          fieldName: "category",
          // label: "Program Category",
          label:
            "Which impact category best aligns with your organization's mission?",
          type: "quiz",
          options: categories.map((c) => ({ value: c._id, label: c.Name })),
          required: true,
        },
        {
          fieldName: "strategicGoals",
          label: "Which Strategic Goal(s) best match your approach?",
          type: "quiz",
          options: categoryStrategicGoals.map((c) => ({
            value: c._id,
            label: c.Name,
          })),
          required: true,
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
          required: true,
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
          required: true,
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
    // Step 3: Template Objectives
    {
      id: "step3",
      name: "Template Objectives",
      form: [
        {
          fieldName: "objectives",
          label: "Template Objectives",
          type: "textarea",
          placeholder: "Describe the objectives of the template",
          rows: 4,
        },
      ],
    },
    // Ste 4: Template Preview
    {
      id: "step4",
      name: "Preview Template",
      form: [],
    },
  ];
  const id = searchParams.get("id");
  if (id && !programData ) return <Skeleton active />;
  if (reloadSteps) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <MultiStepComponent
          AIEnhancements={true}
          steps={steps}
          defaultValues={{
            ...programData,
          }}
          onActiveStepChange={handleActiveStep}
          onFinish={async (formData) => {
            if (activeStep === 0 && formData && !programData) {
              const template = await CrudService.create("Template", {
                ...formData
              })
              if (template) {
                setProgramData(template);
                const templateId = template.data._id;
                searchParams.set('id', templateId);
                navigate(`${window.location.pathname}?${searchParams.toString()}`, {replace: true});

                const defaultAssessment = await CrudService.search("DefaultAssessment", 1, 1, {sort: {createdAt: 1}});
                await CrudService.update("Template", templateId ,{
                  assessments: [defaultAssessment.data.items[0]._id],
                });
              }
            } else {
              const id = searchParams.get("id");
              if (!id) return;
              await CrudService.update("Template",id ,{
                ...formData,
              }).then((res) => {
                if (!res.data) return;
                setProgramData(res.data)
                setProgramDataForDisplay(res.data);
              });
            }

            if (formData && formData.isFinishClicked) {
              navigate(`/dashboard/templatedetails?id=${id}`);
            }
          }}
          programDataDisplay={programDataDisplay}
          onChangeFromSelect={(fieldName, value) =>
            handleMissionChange(fieldName, value)
          }
          formType={"createTemplate"}
        />
      </div>
    </>
  );
};

export default CreateTemplate;

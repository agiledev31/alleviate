import { Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import CrudService from "../../service/CrudService";
import StrapiService from "../../service/StrapiService";

const SuitePre = () => {
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

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    setProgramData(null);

    CrudService.getSingle("Suite", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
    });
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
          label: "What is the name of your organization's impact program? ",
          type: "input",
          placeholder: "Enter program name",
          required: true,
        },
        {
          fieldName: "description",
          label: "Program Description",
          type: "textarea",
          placeholder: "Enter program description",
          rows: 6,
        },
      ],
    },

    {
      id: "step2",
      name: "Program Details",
      form: [
        {
          fieldName: "category",
          // label: "Program Category",
          label:
            "Which impact category best aligns with your organization's mission?",
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
          multi: true,
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
          multi: true,
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
    // Step 3: Program Objectives
    {
      id: "step3",
      name: "Program Objectives",
      form: [
        {
          fieldName: "objectives",
          label: "Program Objectives",
          type: "textarea",
          placeholder: "Describe the objectives of the program",
          rows: 4,
        },
      ],
    },
    // Ste 4: Program Preview
    {
      id: "previewstep",
      name: "Preview Program",
      form: [],
    },
  ];

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <MultiStepComponent
          AIEnhancements={true}
          steps={steps}
          defaultValues={{
            ...programData,
          }}
          onFinish={async (formData) => {
            const id = searchParams.get("id");
            if (!id) return;

            formData.isAdded = !!(
              !programData.category &&
              formData.category &&
              !programDataDisplay.category
            );

            await CrudService.update("Suite", id, {
              ...formData,
            }).then((res) => {
              if (!res.data) return;
              setProgramDataForDisplay(res.data);
            });
            if (formData && formData.isFinishClicked) {
              navigate(`/dashboard/suitedetails?id=${id}`);
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

export default SuitePre;

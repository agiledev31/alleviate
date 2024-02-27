import { Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import CrudService from "../../service/CrudService";
import StrapiService from "../../service/StrapiService";

const SuiteObjective = () => {
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

    if (programData && programData.category) {
      const selectedCategory = categories.find(
        ({ _id }) => _id === programData.category
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
  }, [programData]);

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

  const objectiveSteps = [
    {
      id: "",
      name: "Program Details and Objectives",
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
          fieldName: "objectives",
          label: "Program Objectives",
          type: "textarea",
          placeholder: "Describe the objectives of the program",
          rows: 4,
        },
      ],
    },
  ];

  const id = searchParams.get("id");

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <h2 className="text-xl mt-5 mx-3">
          <strong>Program Details and Objectives</strong>
        </h2>
        <MultiStepComponent
          displaySteps={false}
          AIEnhancements={true}
          steps={objectiveSteps}
          isShowBack={true}
          defaultValues={{
            ...programData,
          }}
          onFinish={async (formData) => {
            if (formData && formData.isFinishClicked) {
              await CrudService.update("Suite", id, {
                ...formData,
              }).then((res) => {
                if (!res.data) return;
                setProgramDataForDisplay(res.data);
                navigate(`/dashboard/suitedetails?id=${programData._id}`);
              });
            }
            if (formData.isBackClicked) {
              navigate(`/dashboard/suitedetails?id=${programData._id}`);
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

export default SuiteObjective;

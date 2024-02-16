import { Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import CrudService from "../../service/CrudService";

const TemplatePre = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [assessmentCreated, setAssessmentCreated] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    // if (!id) return;
    setProgramData(null);

    if (id) {
      setAssessmentCreated(true);
      CrudService.getSingle("DefaultAssessment", id).then((res) => {
        if (!res.data) return;
        setProgramData(res.data);
        setAssessmentCreated(true);
      });
    } else {
      setAssessmentCreated(false);
    }

  }, [searchParams]);

  const steps = [
    {
      id: "step1",
      name: "General Information",
      form: [
        {
          fieldName: "name",
          label: "Assessment Name",
          type: "input",
          placeholder: "Enter assessment name",
          required: true,
        },
        {
          fieldName: "description",
          label: "Assessment Description",
          type: "textarea",
          placeholder: "Enter template description",
          rows: 6,
        },
      ],
    },
    {
      id: "step2",
      name: "Edit Form",
      form: [],
    },
  ];

  if (!programData && assessmentCreated) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <MultiStepComponent
          displaySteps={true}
          AIEnhancements={true}
          steps={steps}
          defaultValues={{
            ...programData,
          }}
          onFinish={async (formData) => {
            const templateId = searchParams.get("templateId");
            const assessmentType = searchParams.get("assessmentType");
            const formType = "templatePre";

            if (!assessmentCreated && templateId) {
              const templateRes = await CrudService.getSingle("Template", templateId);

              const createRes = await CrudService.create("DefaultAssessment", {
                ...formData,
                template: templateId,
                assessmentType: assessmentType,
                published: false,
                isTemplateAssessment: true,
              });

              setAssessmentCreated(true);

              if (createRes && templateRes.data) {
                const updatedTemplate = await CrudService.update("Template", templateId, {
                  assessments: [...templateRes.data.assessments, createRes.data._id],
                });

                if (updatedTemplate) {
                  navigate(`/dashboard/assessmentedit?id=${createRes.data._id}&formType=${formType}`);
                }
              }
            } else {
              const id = searchParams.get("id");
              if (!id || !assessmentCreated) return;
                await CrudService.update("DefaultAssessment", id, {
                  ...formData,
                });
                navigate(`/dashboard/assessmentedit?id=${id}&formType=${formType}`);
            }
          }}
        />
      </div>
    </>
  );
};

export default TemplatePre;

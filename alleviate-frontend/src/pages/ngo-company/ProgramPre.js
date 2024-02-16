import { Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import CrudService from "../../service/CrudService";

const ProgramPre = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    setProgramData(null);

    CrudService.getSingle("Program", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
    });
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
          placeholder: "Enter program description",
          rows: 6,
        },
        {
          fieldName: "endDate",
          label: "End Date",
          type: "datepicker",
        },
      ],
    },
    {
      id: "step2",
      name: "Edit Form",
      form: [],
    },
    {
      id: "step3",
      name: "Publish",
      form: [],
    },
  ];

  if (!programData) return <Skeleton active />;
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
            const id = searchParams.get("id");
            if (!id) return;

            if (!programData.name && formData.name) {
              formData.isAdded = true
            } else {
              formData.isAdded = false
            }

            await CrudService.update("Program", id, {
              ...formData,
            });

            const formType = "programPre";
            navigate(`/dashboard/programedit?id=${id}&formType=${formType}`);
          }}
        />
      </div>
    </>
  );
};

export default ProgramPre;

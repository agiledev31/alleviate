import { Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import CrudService from "../../service/CrudService";

const SuiteTarget = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [programDataDisplay, setProgramDataForDisplay] = useState(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    setProgramData(null);

    CrudService.getSingle("Suite", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
    });
  }, [searchParams]);

  // Program target and timeline
  const targetSteps = [
    {
      name: "Program Targets and Timelines",
      form: [
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
  ];

  if (!programData) return <Skeleton active />;

  return (
    <>
      <div style={{ height: "80vh" }}>
        <h2 className="text-xl mt-5 mx-3">
          <strong>Program Targets and Timelines</strong>
        </h2>
        <MultiStepComponent
          displaySteps={false}
          AIEnhancements={true}
          steps={targetSteps}
          isShowBack={true}
          defaultValues={{
            ...programData,
          }}
          onFinish={async (formData) => {
            // const targetAction = programData.updateSuiteStages.actions.find(action => action.id === "target");
            if (formData && formData.isFinishClicked) {
              await CrudService.update("Suite", id, {
                ...formData,
              }).then((res) => {
                if (!res.data) return;
                navigate(`/dashboard/suitedetails?id=${programData._id}`);
              });
            }
            if (formData.isBackClicked) {
              navigate(`/dashboard/suitedetails?id=${programData._id}`);
            }
          }}
          programDataDisplay={programDataDisplay}
          formType={"SuitePre"}
        />
      </div>
    </>
  );
};

export default SuiteTarget;

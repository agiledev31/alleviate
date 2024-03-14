import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { Breadcrumb, Button, Popconfirm, Skeleton, Space } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import CrudService from "../../service/CrudService";

const ProgramPublish = () => {
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
          fieldName: "image",
          label: "Assessment Image",
          type: "upload",
        },
        {
          fieldName: "AIEnhancements",
          label: "Enable AI enhancement option on your form",
          type: "switch",
        },
        {
          fieldName: "displaySteps",
          label: "Display steps on top of your form",
          type: "switch",
        },
      ],
    },
    {
      id: "step2",
      name: "Access Control",
      form: [
        {
          fieldName: "listedForNGOBeneficiaries",
          label: "List my program for NGO beneficiaries",
          type: "switch",
        },
        {
          fieldName: "listedForDonors",
          label: "List my program for donors",
          type: "switch",
        },
        {
          fieldName: "listedForExperts",
          label: "List my program for experts",
          type: "switch",
        },
      ],
    },
  ];

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <Breadcrumb
          items={[
            {
              title: <Link to="/dashboard/myprograms">My Programs</Link>,
            },
            {
              title: (
                <Link to={`/dashboard/suitedetails?id=${programData?._id}`}>
                  {programData?.name ?? ""}
                </Link>
              ),
            },
            {
              title: "Publish Program",
            },
          ]}
        />

        <MultiStepComponent
          AIEnhancements={true}
          steps={steps}
          defaultValues={{
            ...programData,
          }}
          onFinish={async (formData) => {
            const id = searchParams.get("id");
            if (!id) return;

            await CrudService.update("Program", id, {
              ...formData,
              published: true,
              ...(formData.isFinishClicked ? { isPublished: true } : {}),
            });

            if (formData && formData.isFinishClicked) {
              navigate(`/dashboard/programdetails?id=${id}`);
            }
          }}
        />
      </div>
    </>
  );
};

export default ProgramPublish;

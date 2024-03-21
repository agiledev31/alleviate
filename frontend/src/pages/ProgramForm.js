import { Breadcrumb, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../components/MultiStepComponent";
import { selectUser } from "../redux/auth/selectors";
import CrudService from "../service/CrudService";

const ProgramForm = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [suite, setSuite] = useState(null);
  const [defaultAssessmentValue, setDefaultAssessmentValue] = useState(null);
  const [programSubmittedData, setProgramSubmittedData] = useState(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    setProgramData(null);

    CrudService.search("ProgramSubmission", 1, 1, {
      filters: {
        programId: id,
        user_id: user._id,
        "formData.submittedData": { $exists: true },
      },
    }).then((res) => {
      if (res.data.items.length > 0) {
        setProgramSubmittedData(res.data.items[0]);
        // if (res.data.items[0].formData.isFinishClicked === true) {
        //   navigate(`/dashboard/programthankyou?id=${id}`);
        // }
      }
    });
    CrudService.getSingle("Program", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
      if (res.data?.suite?._id)
        CrudService.getSingle("Suite", res.data.suite._id).then((res) => {
          setSuite(res.data);
        });

      if (res.data.isDefaultAssessment) {
        if (user) {
          const data = {};
          if (user.firstName) {
            data.name = user.firstName;

            if (user.lastName) {
              data.name = user.firstName + " " + user.lastName;
            }
          }
          if (user.email) {
            data.email = user.email;
          }

          if (user.phone) {
            data.phoneNumber = user.phone;
          }

          if (user.country) {
            data.country = user.country;
          }
          if (user.city) {
            data.city = user.city;
          }
          setDefaultAssessmentValue(data);
        }
      }
    });
  }, [searchParams]);

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <Breadcrumb
          items={
            user?.role == "ngo-beneficiary"
              ? [
                  {
                    title: <Link to="/dashboard/programs">Programs</Link>,
                  },
                  {
                    title: (
                      <Link
                        to={`/dashboard/suitedetail?id=${programData?.suite?._id}`}
                      >
                        {programData?.name ?? ""}
                      </Link>
                    ),
                  },
                ]
              : [
                  {
                    title: (
                      <Link
                        to={`/dashboard/${
                          suite?.isGrantOpportunity
                            ? "grantopportunities"
                            : "programs"
                        }`}
                      >
                        {suite?.isGrantOpportunity
                          ? "Grant Opportunities"
                          : "Programs"}
                      </Link>
                    ),
                  },
                  {
                    title: (
                      <Link
                        to={`/dashboard/suitedetails?id=${programData?._id}`}
                      >
                        {programData?.name ?? ""}
                      </Link>
                    ),
                  },
                ]
          }
        />

        <MultiStepComponent
          displaySteps={programData.displaySteps}
          AIEnhancements={programData.AIEnhancements}
          steps={programData.form}
          defaultValues={{
            ...programSubmittedData?.formData.submittedData,
            ...defaultAssessmentValue,
          }}
          onFinish={async (formData) => {
            const id = searchParams.get("id");
            if (!id) return;

            if (formData) {
              const id = searchParams.get("id");
              if (!id) return;

              const KPIs = [];

              const form = programData.form;
              for (const step of form) {
                for (const item of step.form) {
                  if (
                    item.kpi &&
                    typeof formData?.[item.fieldName] === "number"
                  )
                    KPIs.push({
                      key: item.kpi,
                      submittedValue: formData[item.fieldName],
                      kpiType: item.type,
                    });

                  if (
                    item.kpi &&
                    (item.type === "select" ||
                      item.type === "radio" ||
                      item.type === "quiz")
                  ) {
                    KPIs.push({
                      key: item.kpi,
                      submittedValue: formData[item.fieldName],
                      kpiType: item.type,
                      options: item.options,
                    });
                  }
                }
              }

              if (
                Object.keys(formData).length === 0 &&
                formData.constructor === Object
              ) {
                formData.isFinishClicked = false;
              }

              if (programSubmittedData) {
                await CrudService.update(
                  "ProgramSubmission",
                  programSubmittedData._id,
                  {
                    // programId: id,
                    formData: {
                      submittedData: formData,
                      isFinishClicked: formData.isFinishClicked,
                    },
                    KPIs,
                  }
                ).then((res) => {
                  if (!res.data) return;
                });
              } else {
                await CrudService.create("ProgramSubmission", {
                  programId: id,
                  formData: {
                    submittedData: formData,
                    isFinishClicked: formData.isFinishClicked,
                  },
                  KPIs,
                }).then((res) => {
                  if (!res.data) return;
                  setProgramSubmittedData(res.data);
                });
              }

              if (formData && formData.isFinishClicked) {
                navigate(`/dashboard/programthankyou?id=${id}`);
              }
            }
          }}
        />
      </div>
    </>
  );
};

export default ProgramForm;

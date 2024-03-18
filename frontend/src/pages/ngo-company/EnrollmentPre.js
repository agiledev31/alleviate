import { Allotment } from "allotment";
import { Breadcrumb, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import MultiStepConfigurator from "../../components/MultiStepConfigurator";
import AuthService from "../../service/AuthService";
import CrudService from "../../service/CrudService";

const EnrollmentPre = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [suite, setSuite] = useState(null);
  const [selectedOption, setSelectedOption] = useState("optionA");
  const [formAccessibilitySelectedOption, setFormAccessibilitySelectedOption] =
    useState("public");
  const [funnelSteps, setFunnelSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [importFileData, setImportFileData] = useState([]);

  const handleOnChange = (fieldName, value) => {
    setFormAccessibilitySelectedOption(value);
  };

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    setEnrollmentData(null);

    CrudService.getSingle("Program", id).then((res) => {
      if (!res.data) return;
      CrudService.getSingle("Suite", res.data?.suite?._id).then((res) => {
        setSuite(res.data);
      });
      setEnrollmentData(res.data);
      setFunnelSteps(res.data?.form);
    });
  }, [searchParams]);

  const steps = [
    {
      id: "step1",
      name: "Enrollment Method",
      form: [
        {
          fieldName: "enrollClientMethod",
          label: "How would you like to enroll clients in your program?",
          type: "radio",
          options: [
            {
              value: "optionA",
              label: "Option A: Through an online application form",
            },
            {
              value: "optionB",
              label: "Option B: Through internal data upload",
            },
            { value: "both", label: "Option C: Both A and B" },
          ],
          required: true,
        },
      ],
    },
    {
      id: "step2",
      name: "Form",
      form:
        selectedOption === "optionB"
          ? [
              {
                fieldName: "internalData",
                label: "Upload Internal Data",
              },
            ]
          : [],
    },
    ...(selectedOption !== "optionB"
      ? [
          {
            id: "step3",
            name: "Accessibility",
            form: [
              {
                fieldName: "formAccessibility",
                label: "Form Accessibility",
                type: "radio",
                options: [
                  {
                    value: "public",
                    label: "Open to the public (available to all on Alleviate)",
                  },
                  {
                    value: "invitation",
                    label: "Shared with specific people (invitation-based)",
                  },
                ],
                required: true,
              },
              ...(formAccessibilitySelectedOption === "invitation"
                ? [
                    {
                      fieldName: "invitePeopleEmails",
                      label: "Invite People Email",
                      type: "tagInput",
                      options: [],
                      required: true,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  if (!enrollmentData) return <Skeleton active />;
  if (!suite) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "70vh" }}>
        <Breadcrumb
          items={[
            {
              title: (
                <Link
                  to={`/dashboard/${
                    suite?.isGrantOpportunity
                      ? "mygrantopporunities"
                      : "myprograms"
                  }`}
                >
                  {suite?.isGrantOpportunity
                    ? "My Grant Opportunities"
                    : "My Programs"}
                </Link>
              ),
            },
            {
              title: (
                <Link to={`/dashboard/suitedetails?id=${suite?._id}`}>
                  {suite?.name ?? ""}
                </Link>
              ),
            },
            {
              title: "Enroll",
            },
          ]}
        />

        <MultiStepComponent
          displaySteps={true}
          AIEnhancements={true}
          steps={steps}
          formType={"enrollmentPre"}
          defaultValues={{
            ...enrollmentData,
            ...(!enrollmentData.enrollClientMethod && {
              enrollClientMethod: "optionA",
            }),
            ...(!enrollmentData.formAccessibility && {
              formAccessibility: "public",
            }),
          }}
          onActiveStepChange={async (step) => {
            setActiveStep(step);
          }}
          onChangeFromSelect={(fieldName, value) =>
            handleOnChange(fieldName, value)
          }
          onFileImport={(importFileData) => setImportFileData(importFileData)}
          onFinish={async (formData) => {
            const id = searchParams.get("id");
            if (!id) return;
            setSelectedOption(formData.enrollClientMethod);
            setFormAccessibilitySelectedOption(formData.formAccessibility);

            if (formData.enrollClientMethod === "optionB") {
              if (formData.isFinishClicked) {
                importFileData.map(async (data) => {
                  const KPIs = [];
                  for (const step of funnelSteps) {
                    for (const item of step.form) {
                      if (
                        item.kpi &&
                        typeof data?.[item.fieldName] === "number"
                      )
                        KPIs.push({
                          key: item.kpi,
                          submittedValue: data[item.fieldName],
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
                          submittedValue: data[item.fieldName],
                          kpiType: item.type,
                          options: item.options,
                        });
                      }
                    }
                  }

                  const body = {
                    programId: id,
                    formData: {
                      fileData: data,
                      isFinishClicked: true,
                    },
                    KPIs,
                    isFinishClicked: true,
                    status: "approve",
                  };

                  await CrudService.create("ProgramSubmission", body).then(
                    (res) => {
                      if (!res.data) return;
                    }
                  );
                });

                navigate(
                  `/dashboard/suitedetails?id=${enrollmentData.suite._id}`
                );
              }
            } else {
              const data = await CrudService.update("Program", id, {
                ...formData,
              });
              setEnrollmentData(data.data);
              if (formData.isFinishClicked) {
                if (formAccessibilitySelectedOption === "invitation") {
                  await AuthService.generateLinkToInviteUser({
                    program: enrollmentData,
                    invitePeopleEmails: formData.invitePeopleEmails,
                    type: "assessment",
                  }).then((res) => {
                    if (!res) return;

                    navigate(
                      `/dashboard/suitedetails?id=${enrollmentData.suite._id}`
                    );
                  });
                } else {
                  navigate(
                    `/dashboard/suitedetails?id=${enrollmentData.suite._id}`
                  );
                }
              }
            }
          }}
        />

        {enrollmentData.enrollClientMethod !== "optionB" &&
          activeStep === 1 &&
          selectedOption !== "optionB" && (
            <Allotment defaultSizes={[150, 150]}>
              <Allotment.Pane snap>
                <MultiStepComponent steps={funnelSteps} />
              </Allotment.Pane>
              <Allotment.Pane snap>
                <div>
                  <MultiStepConfigurator
                    funnelSteps={funnelSteps}
                    setFunnelSteps={(e) => {
                      const result =
                        typeof e === "function" ? e(funnelSteps) : e;
                      setFunnelSteps(result);
                      const id = searchParams.get("id");
                      if (!id) return;
                      CrudService.update("Program", id, { form: result });
                    }}
                  />
                </div>
              </Allotment.Pane>
            </Allotment>
          )}
      </div>
    </>
  );
};

export default EnrollmentPre;

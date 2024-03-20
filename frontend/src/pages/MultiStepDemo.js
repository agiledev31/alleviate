import { Allotment } from "allotment";
import React, { useState } from "react";
import MultiStepComponent from "../components/MultiStepComponent";
import MultiStepConfigurator from "../components/MultiStepConfigurator";

import "allotment/dist/style.css";

export const steps = [
  {
    id: "step1",
    name: "Organization Information",
    form: [
      {
        fieldName: "orgName",
        label: "Organization Name",
        type: "input",
        placeholder: "Enter organization name",
      },
      {
        fieldName: "orgType",
        label: "Organization Type",
        type: "select",
        options: [
          { value: "ngo", label: "NGO" },
          { value: "nonprofit", label: "Nonprofit" },
          { value: "foundation", label: "Foundation" },
          { value: "other", label: "Other" },
        ],
      },
      {
        fieldName: "contactPerson",
        label: "Contact Person",
        type: "input",
        placeholder: "Enter contact person's name",
      },
    ],
  },
  {
    id: "step2",
    name: "Financial Information",
    form: [
      {
        fieldName: "annualRevenue",
        label: "Annual Revenue (USD)",
        type: "inputNumber",
        min: 0,
        step: 1,
      },
      {
        fieldName: "fundingSources",
        label: "Funding Sources",
        type: "textarea",
        placeholder: "List funding sources (if any)",
      },
      {
        fieldName: "financialStatements",
        label: "Financial Statements",
        type: "fileUpload",
      },
    ],
  },
  {
    id: "step3",
    name: "Programs and Impact",
    form: [
      {
        fieldName: "programs",
        label: "Describe Your Programs",
        type: "textarea",
        placeholder: "Describe the programs your organization runs",
      },
      {
        fieldName: "impactMetrics",
        label: "Impact Metrics",
        type: "checkboxGroup",
        options: [
          { value: "education", label: "Education" },
          { value: "healthcare", label: "Healthcare" },
          { value: "environment", label: "Environment" },
          { value: "poverty", label: "Poverty Alleviation" },
        ],
      },
    ],
  },
  {
    id: "step4",
    name: "Partnerships and Collaborations",
    form: [
      {
        fieldName: "partners",
        label: "Current Partnerships",
        type: "textarea",
        placeholder: "List current partnerships (if any)",
      },
      {
        fieldName: "collaborations",
        label: "Collaborative Projects",
        type: "textarea",
        placeholder: "Describe collaborative projects (if any)",
      },
    ],
  },
  {
    id: "step5",
    name: "Additional Information",
    form: [
      {
        fieldName: "additionalComments",
        label: "Additional Comments",
        type: "textarea",
        placeholder: "Any additional comments or information",
      },
    ],
  },
];

const MultiStepDemo = () => {
  const [funnelSteps, setFunnelSteps] = useState(steps);

  return (
    <div style={{ height: "100vh" }}>
      <Allotment defaultSizes={[150, 150]}>
        <Allotment.Pane snap>
          <MultiStepComponent steps={funnelSteps} />
        </Allotment.Pane>
        <Allotment.Pane snap>
          <div>
            <MultiStepConfigurator
              funnelSteps={funnelSteps}
              setFunnelSteps={setFunnelSteps}
            />
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default MultiStepDemo;

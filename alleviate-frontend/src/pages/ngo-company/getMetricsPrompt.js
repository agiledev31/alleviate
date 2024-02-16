import React from "react";

const getMetricsPrompt = (metrics, data) => {
  return `
  Generate a questionnaire based on the following instructions:
Description of the questionnaire: We need a questionnaire for an assessment of a program that will be used by an NGO organization.
The assessment is for a program:
Program name: ${data.name}
Program description: ${data.description}
${metrics?.length > 0 ? `Consider this metrics in the questionnaire: ${metrics}` : 'Recommend & Consider at least 15 core metrics that align with the given program in the questionnaire.'}
Please create a questionnaire that asks as many qualifying and relevant questions as possible!
Please provide the questionnaire in JSON format suitable for a web application.
Here is an example of the format I require:
[
{id: "step1", name: "Step name x", form: [{fieldName: "xy", label: "Label for my input", type: "input", placeholder: "Lorem ipsum"}, {...}]
},
{id: "step2", name: "Step name y", form: [{fieldName: "xxy", label: "here number", type: "inputNumber", min: 0, step: 1}, {...}]}, {...}
]
Use this structure to generate each step, ensuring that all the necessary information is captured as per the program provided.

Here is the rendering logic based on "type" so that you have a better understanding of what different items there are that you can use for each step:

switch (item.type) {
  case "input":
    return (
      <Input
        placeholder={item.placeholder}
        onChange={(e) => onChange(item.fieldName, e.target.value)}
        value={formData?.[item.fieldName]}
      />
    );
  case "textarea":
    return (
      <Input.TextArea
        placeholder={item.placeholder}
        onChange={(e) => onChange(item.fieldName, e.target.value)}
        value={formData?.[item.fieldName]}
      />
    );
  case "inputNumber":
    return (
      <InputNumber
        min={item.min}
        max={item.max}
        step={item.step}
        onChange={(value) => onChange(item.fieldName, value)}
        value={formData?.[item.fieldName]}
      />
    );
  case "radio":
    return (
      <Radio.Group
        onChange={(e) => onChange(item.fieldName, e.target.value)}
        value={formData?.[item.fieldName]}
      >
        {item.options.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    );
  case "rate":
    return (
      <Rate
        onChange={(value) => onChange(item.fieldName, value)}
        value={formData?.[item.fieldName]}
      />
    );
  case "select":
    return (
      <Select        
        onChange={(value) => onChange(item.fieldName, value)}
        value={formData?.[item.fieldName]}
      >
        {item.options.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    );
  case "slider":
    return (
      <Slider
        min={item.min}
        max={item.max}
        step={item.step}
        onChange={(value) => onChange(item.fieldName, value)}
        value={formData?.[item.fieldName]}
      />
    );
  case "switch":
    return (
      <Switch
        checked={formData?.[item.fieldName]}
        onChange={(value) => onChange(item.fieldName, value)}
      />
    );
  case "timepicker":
    return (
      <TimePicker
        onChange={(time, timeString) =>
          onChange(item.fieldName, timeString)
        }
        value={
          formData?.[item.fieldName]
            ? moment(formData?.[item.fieldName], "HH:mm:ss")
            : null
        }
      />
    );
  case "datepicker":
    return (
      <DatePicker
        onChange={(date, dateString) =>
          onChange(item.fieldName, dateString)
        }
        value={
          formData?.[item.fieldName]
            ? moment(formData?.[item.fieldName])
            : null
        }
      />
    );
  case "upload":
    return (
      <CloudinaryUpload
        onChange={(info) => {
          onChange(item.fieldName, info);
        }}
      />
    );
  case "checkbox":
    return (
      <Checkbox
        checked={formData?.[item.fieldName]}
        onChange={(e) => {
          onChange(item.fieldName, e.target.checked);
        }}
      >
        {item.label}
      </Checkbox>
    );
  case "colorpicker":
    return (
      <ColorPicker
        onChange={(color) => onChange(item.fieldName, color)}
        value={formData?.[item.fieldName]}
      />
    );
  default:
    return null;
}

Important! In your answer, please do not write anything other than the barebone JSON array itself.
The form must have at least 4 steps; do not put a limit on the number of questions!
`;
};

export default getMetricsPrompt;

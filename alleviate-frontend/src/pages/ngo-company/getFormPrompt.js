import React from "react";

const getFormPrompt = (description) => {
  return `
  Generate a formData configuration for a multistep form based on the following specifications:
  Description of the form: 
  ${description}

  Please provide the formData in JSON format suitable for an application, ensuring it includes arrays for each step with objects for each field that specify the fieldName, label, type, placeholder, and any additional properties like options for select inputs or validation rules. The form should be structured with steps, and each step should have a unique id, a name, and an array of form fields. Here is example of the format I require:
  [
  {
    id: "step1",
    name: "Step name x",
    form: [
      {
        fieldName: "xy",
        label: "Label for my input",
        type: "input",
        placeholder: "Lorem ipsum",
      },
  {...}
    ],
  },
  {
    id: "step2",
    name: "Step name y",
    form: [
      {
        fieldName: "xxy",
        label: "here number",
        type: "inputNumber",
        min: 0,
        step: 1,
      },
  {...}
    ],
  },
  {...}
]
Use this structure to generate each step, ensuring that all the necessary information is captured as per the description provided.

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
        style={{ width: 150 }}
        onChange={(value) => onChange(item.fieldName, value)}
        value={formData?.[item.fieldName]}
      >
        {item.options.sort((a, b) => a.label.localeCompare(b.label)).map((option) => (
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
The form must have at least 4 steps, and each step should have many relevant questions!
  `;
};

export default getFormPrompt;

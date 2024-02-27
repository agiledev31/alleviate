import { Modal, Radio } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SuiteModal = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState("template");

  const handleOk = async () => {
    if (selectedOption === "template") {
      navigate("/dashboard/suite");
    }

    if (selectedOption === "scratch") {
      navigate(`/dashboard/suitepre?option=${selectedOption}`);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    navigate(-1);
    setIsModalOpen(false);
  };

  const formData = {
    label: "Build programs from scratch or templates",
    fieldName: "createOption",
    type: "radio",
    placeholder: "Select Option",
    options: [
      { value: "template", label: "Templates" },
      { value: "scratch", label: "Scratch" },
    ],
    required: true,
  };

  const onChange = (fieldName, value) => {
    setSelectedOption(value);
  };

  return (
    <>
      <Modal
        title={formData.label}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Radio.Group
          onChange={(e) => onChange(formData.fieldName, e.target.value)}
          value={selectedOption}
        >
          {formData.options.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      </Modal>
    </>
  );
};

export default SuiteModal;

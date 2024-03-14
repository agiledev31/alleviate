import { Modal, Radio } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SuiteModal = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState("scratch");

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
    label: "How would you like to start?",
    fieldName: "createOption",
    type: "radio",
    placeholder: "Select Option",
    options: [
      { value: "scratch", label: "From scratch" },
      { value: "template", label: "Use template" },
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

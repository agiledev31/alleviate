import { Button, Checkbox, Divider, Modal, Space, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { Input, InputNumber, Select, Typography } from "antd";
import { GrInfo } from "react-icons/gr";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid"; // Import uuid to generate unique keys
import { selectDarkMode } from "../redux/auth/selectors";
const { Title } = Typography;

const EditFormModal = ({
  isVisible,
  editedItem,
  setEditedItem,
  onSave,
  onCancel,
  funnelSteps,
  kpis,
}) => {
  const darkMode = useSelector(selectDarkMode);

  const handleSave = () => {
    onSave(editedItem);
  };

  useEffect(() => {
    if (!editedItem?.options) {
      setEditedItem((item) => ({ ...item, options: [] }));
    }
  }, [editedItem]);

  const renderSkipLogic = [
    "inputNumber",
    "radio",
    "rate",
    "select",
    "switch",
    "checkbox",
  ].includes(editedItem?.type);
  const renderKPI = ["inputNumber", "rate", "radio", "select", "quiz"].includes(
    editedItem?.type
  );

  const addCondition = () => {
    const newCondition = {
      comparison: "equals", // Default comparison type
      value: "",
    };

    setEditedItem((item) => ({
      ...item,
      conditions: item.conditions
        ? [...item.conditions, newCondition]
        : [newCondition],
    }));
  };

  const removeCondition = (index) => {
    setEditedItem((item) => {
      const updatedConditions = [...item.conditions];
      updatedConditions.splice(index, 1);
      return {
        ...item,
        conditions: updatedConditions.length > 0 ? updatedConditions : null,
      };
    });
  };

  const getDefaultComparison = () => {
    switch (editedItem.type) {
      case "inputNumber":
      case "rate":
        return [
          "equals",
          "not equals",
          "is more than",
          "is less than",
          "is more than or equal",
          "is less than or equal",
        ];
      case "radio":
      case "select":
        return ["equals", "not equals"];
      case "switch":
      case "checkbox":
        return ["is true", "is false"];
      default:
        return [];
    }
  };

  const renderConditionsEditor = () => {
    if (renderSkipLogic) {
      if (!editedItem.conditions) {
        return (
          <div>
            <Button type="dashed" onClick={addCondition}>
              Add Condition
            </Button>
          </div>
        );
      }

      return (
        <div>
          {editedItem.conditions.map((condition, index) => (
            <div key={index}>
              <Select
                style={{ width: 200 }}
                value={condition.comparison}
                onChange={(value) =>
                  setEditedItem((item) => {
                    const updatedConditions = [...item.conditions];
                    updatedConditions[index].comparison = value;
                    return {
                      ...item,
                      conditions: updatedConditions,
                    };
                  })
                }
              >
                {getDefaultComparison().map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
              {["inputNumber", "radio", "rate", "select"].includes(
                editedItem.type
              ) && (
                <Input
                  className="dark:bg-gray-900"
                  value={condition.value}
                  onChange={(e) =>
                    setEditedItem((item) => {
                      const updatedConditions = [...item.conditions];
                      updatedConditions[index].value = e.target.value;
                      return {
                        ...item,
                        conditions: updatedConditions,
                      };
                    })
                  }
                />
              )}
              <Button type="link" onClick={() => removeCondition(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="dashed" onClick={addCondition}>
            Add Condition
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderSkipStepEditor = () => {
    if (renderSkipLogic) {
      return (
        <div>
          <label>
            If one of above conditions are met, it should skip to step:
          </label>
          <Select
            style={{ width: 200 }}
            value={editedItem.skipStep}
            onChange={(value) =>
              setEditedItem({ ...editedItem, skipStep: value })
            }
          >
            {funnelSteps.map((step) => (
              <Select.Option key={step.id} value={step.id}>
                {step.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      );
    }
    return null;
  };

  if (!editedItem) return null;
  return (
    <Modal
      wrapClassName={`${darkMode ? "dark" : ""}`}
      title="Edit Form Input"
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <div>
        <label>Label:</label>
        <Input
          className="dark:bg-gray-900"
          value={editedItem.label}
          onChange={(e) =>
            setEditedItem({ ...editedItem, label: e.target.value })
          }
        />
      </div>
      <div>
        <label>Type:</label>
        <Select
          style={{ width: 150 }}
          value={editedItem.type}
          onChange={(value) => setEditedItem({ ...editedItem, type: value })}
        >
          {/* Add options for different types */}
          <Select.Option value="input">Short Input</Select.Option>
          <Select.Option value="textarea">Large Input</Select.Option>
          <Select.Option value="inputNumber">Input Number</Select.Option>
          <Select.Option value="radio">Radio</Select.Option>
          <Select.Option value="select">Select</Select.Option>
          <Select.Option value="rate">Rate</Select.Option>
          <Select.Option value="slider">Slider</Select.Option>
          <Select.Option value="switch">Switch</Select.Option>
          <Select.Option value="timepicker">Time Picker</Select.Option>
          <Select.Option value="datepicker">Date Picker</Select.Option>
          <Select.Option value="upload">Upload</Select.Option>
          <Select.Option value="checkbox">Checkbox</Select.Option>
          <Select.Option value="colorpicker">Color Picker</Select.Option>
          <Select.Option value="quiz">Quiz</Select.Option>
          <Select.Option value="countrySelect">Country Select</Select.Option>
          <Select.Option value="address">Address</Select.Option>
          <Select.Option value="phoneInput">Phone Input</Select.Option>
        </Select>
      </div>
      {(editedItem.type === "inputNumber" || editedItem.type === "slider") && (
        <div>
          <label>Min:</label>
          <InputNumber
            value={editedItem.min}
            onChange={(value) => setEditedItem({ ...editedItem, min: value })}
          />
          <label>Max:</label>
          <InputNumber
            value={editedItem.max}
            onChange={(value) => setEditedItem({ ...editedItem, max: value })}
          />
          <label>Step:</label>
          <InputNumber
            value={editedItem.step}
            onChange={(value) => setEditedItem({ ...editedItem, step: value })}
          />
        </div>
      )}
      {editedItem.type === "textarea" && (
        <div>
          <label>Rows:</label>
          <InputNumber
            value={editedItem.rows}
            onChange={(value) => setEditedItem({ ...editedItem, rows: value })}
          />
        </div>
      )}
      {(editedItem.type === "select" ||
        editedItem.type === "radio" ||
        editedItem.type === "quiz") && (
        <div>
          <label>Options:</label>
          {editedItem.options?.map?.((option, index) => (
            <div key={option.value}>
              <Input
                className="dark:bg-gray-900"
                value={option.label}
                onChange={(e) => {
                  const updatedOptions = [...editedItem.options];
                  updatedOptions[index].label = e.target.value;
                  setEditedItem({
                    ...editedItem,
                    options: updatedOptions,
                  });
                }}
                placeholder="Option Label"
              />
              <Button
                type="link"
                onClick={() => {
                  const updatedOptions = [...editedItem.options];
                  updatedOptions.splice(index, 1);
                  setEditedItem({
                    ...editedItem,
                    options: updatedOptions,
                  });
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="dashed"
            onClick={() => {
              const updatedOptions = [
                ...editedItem.options,
                { value: uuidv4(), label: "" },
              ];
              setEditedItem({
                ...editedItem,
                options: updatedOptions,
              });
            }}
          >
            Add Option
          </Button>
        </div>
      )}

      <div className={"mt-3"}>
        <Checkbox
          checked={editedItem?.required}
          onChange={(e) => {
            setEditedItem({ ...editedItem, required: e.target.checked });
          }}
        >
          Required
        </Checkbox>
      </div>

      {renderSkipLogic && (
        <>
          <Divider />
          <h2 className="text-lg">
            <strong>Skip Logic Conditions</strong>
          </h2>
        </>
      )}

      {renderConditionsEditor()}
      {renderSkipStepEditor()}

      {renderKPI && (
        <>
          <Divider />

          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg">
              <strong>KPI Display Name</strong>
            </h2>
            <Tooltip title="Add a descriptive name for your KPI to make it easily recognizable in your dashboard. This KPI will be based on the average value across all form submissions made by participants in response to this particular field.">
              <GrInfo />
            </Tooltip>
          </div>

          {kpis?.length > 0 ? (
            <Select
              style={{ width: 450 }}
              onChange={(value) =>
                setEditedItem({
                  ...editedItem,
                  kpi: value,
                })
              }
              value={editedItem?.kpi ?? ""}
            >
              {kpis
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((option) => (
                  <Select.Option key={option.value} value={option.label}>
                    {option.label}
                  </Select.Option>
                ))}
            </Select>
          ) : (
            <Input
              className="dark:bg-gray-900"
              placeholder="Enter metric name to track as a KPI"
              value={editedItem?.kpi ?? ""}
              onChange={(e) =>
                setEditedItem({
                  ...editedItem,
                  kpi: e.target.value,
                })
              }
            />
          )}
        </>
      )}
    </Modal>
  );
};

const MultiStepConfigurator = ({
  funnelSteps,
  setFunnelSteps,
  kpis,
  activeStep,
  isProgramEditForm,
}) => {
  const [editStepIndex, setEditStepIndex] = useState(null);
  const [editedStepForm, setEditedStepForm] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control the visibility of the JSON modal
  const [selectedItem, setSelectedItem] = useState(null); // State to store the JSON representation of the selected item

  useEffect(() => {
    if (isProgramEditForm) {
      handleEditStep(activeStep);
    }
  }, [activeStep]);

  useEffect(() => {
    const updatedSteps = [...funnelSteps];
    if (updatedSteps[editStepIndex]) {
      updatedSteps[editStepIndex].form = editedStepForm;

      setFunnelSteps(updatedSteps);
    }
  }, [editedStepForm]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedSteps = [...funnelSteps];
    const [reorderedStep] = reorderedSteps.splice(result.source.index, 1);
    reorderedSteps.splice(result.destination.index, 0, reorderedStep);

    setFunnelSteps(reorderedSteps);
  };

  const onDragEndOverlay = (result) => {
    if (!result.destination) return;

    const reorderedSteps = [...editedStepForm];
    const [reorderedStep] = reorderedSteps.splice(result.source.index, 1);
    reorderedSteps.splice(result.destination.index, 0, reorderedStep);

    setEditedStepForm(reorderedSteps);
  };

  const handleEditStep = (index) => {
    // Open the overlay for editing the form of the selected step
    const selectedStep = funnelSteps[index];
    setEditedStepForm(selectedStep.form);
    setEditStepIndex(index);
  };

  const handleEditFormStep = (index) => {
    const selectedStep = editedStepForm[index];
    setSelectedItem(selectedStep);
    setIsModalVisible(true);
  };
  const handleCloseFormStep = () => {
    setSelectedItem(null);
    setIsModalVisible(false);
  };

  const handleDeleteStep = (index) => {
    const updatedSteps = [...funnelSteps];
    updatedSteps.splice(index, 1);
    setFunnelSteps(updatedSteps);
  };

  const handleDeleteFormStep = (index) => {
    const updatedSteps = [...editedStepForm];
    updatedSteps.splice(index, 1);
    setEditedStepForm(updatedSteps);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleCloseOverlay = () => {
    setEditedStepForm([]);
    setEditStepIndex(null);
  };

  const handleSaveEditedFormOverlay = (editedItem) => {
    const updatedSteps = [...editedStepForm];
    const currentItemIndex = updatedSteps.findIndex(
      (e) => e.fieldName === editedItem.fieldName
    );

    if (currentItemIndex !== -1) {
      updatedSteps[currentItemIndex] = editedItem;
      setEditedStepForm(updatedSteps);
    }

    handleCloseFormStep();
  };

  if (editStepIndex !== null) {
    return (
      <div className="p-10">
        <div className="overlay-content">
          <DragDropContext onDragEnd={onDragEndOverlay}>
            <Droppable droppableId="edited-step-form">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {editedStepForm.map((element, index) => (
                    <Draggable
                      key={element.fieldName}
                      draggableId={element.fieldName}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="bg-white dark:bg-gray-900 rounded-md p-4 mb-4 shadow-md border border-gray-300"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <Title
                              level={5}
                              className="text-lg font-semibold"
                              editable={{
                                onChange: (e) => {
                                  const updatedSteps = [...funnelSteps];
                                  updatedSteps[editStepIndex].form[
                                    index
                                  ].label = e;
                                  setFunnelSteps(updatedSteps);
                                },
                              }}
                            >
                              {element.label}
                            </Title>

                            <div className="space-x-2">
                              <Button
                                className="px-2 py-1 text-sm  rounded "
                                onClick={() => handleEditFormStep(index)}
                              >
                                Edit
                              </Button>
                              <Button
                                className="px-2 py-1 text-sm bg-indigo-500 text-white rounded "
                                onClick={() => handleDeleteFormStep(index)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Space>
            {!isProgramEditForm && (
              <Button onClick={handleCloseOverlay}>Back</Button>
            )}
            <Button
              className="px-2 py-1 text-sm bg-indigo-500 text-white rounded "
              onClick={() => {
                const updatedSteps = [
                  ...editedStepForm,
                  {
                    fieldName: uuidv4(),
                    label: "",
                    type: "input",
                  },
                ];
                setEditedStepForm(updatedSteps);
              }}
            >
              Add
            </Button>
          </Space>
        </div>

        <EditFormModal
          isVisible={isModalVisible}
          editedItem={selectedItem}
          setEditedItem={setSelectedItem}
          onSave={handleSaveEditedFormOverlay}
          onCancel={handleCloseModal}
          funnelSteps={funnelSteps}
          kpis={kpis}
        />
      </div>
    );
  }

  return (
    <div className="p-10">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="funnel-steps">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {funnelSteps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided) => (
                    <div
                      className="bg-white dark:bg-gray-900 rounded-md p-4 mb-4 shadow-md border border-gray-300"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Title
                          level={5}
                          className="text-lg font-semibold"
                          editable={{
                            onChange: (e) => {
                              const updatedSteps = [...funnelSteps];
                              updatedSteps[index].name = e;
                              setFunnelSteps(updatedSteps);
                            },
                          }}
                        >
                          {step.name}
                        </Title>

                        <div className="space-x-2">
                          <Button
                            className="px-2 py-1 text-sm  rounded "
                            onClick={() => handleEditStep(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            className="px-2 py-1 text-sm bg-indigo-500 text-white rounded "
                            onClick={() => handleDeleteStep(index)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button
        className="px-2 py-1 text-sm bg-indigo-500 text-white rounded "
        onClick={() =>
          setFunnelSteps((current) => [
            ...current,
            {
              id: uuidv4(),
              name: "",
              form: [],
            },
          ])
        }
      >
        Add
      </Button>
    </div>
  );
};

export default MultiStepConfigurator;

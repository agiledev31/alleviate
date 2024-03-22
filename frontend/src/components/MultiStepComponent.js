import { Pie } from "@ant-design/charts";
import {
  Button,
  Card,
  Checkbox,
  Col,
  ColorPicker,
  DatePicker,
  Divider,
  Dropdown,
  Input,
  InputNumber,
  Menu,
  Modal,
  Radio,
  Rate,
  Row,
  Select,
  Slider,
  Statistic,
  Steps,
  Switch,
  Table,
  Tag,
  TimePicker,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import moment from "moment";
import { TweenOneGroup } from "rc-tween-one";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import { AiOutlineDelete } from "react-icons/ai";
import { MdLocationOn } from "react-icons/md";
import { TbRobotFace } from "react-icons/tb";
import PhoneInput from "react-phone-number-input";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { countries } from "../data/constants";
import { selectDarkMode } from "../redux/auth/selectors";
import CrudService from "../service/CrudService";
import placeService from "../service/PlaceService";
import CloudinaryUpload from "./CloudinaryUpload";
import ExcelImport from "./ExcelImport";
import MultiStepConfigurator from "./MultiStepConfigurator";
const { Title } = Typography;

const DynamicForm = ({
  form,
  onChange,
  formData,
  AIEnhancements,
  thinking,
  setThinking,
  formType,
  isProgramSubmission,
  isDataSummary,
  className = "",
  verticalSpacing = 5,
}) => {
  const socket = useRef();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState([]);
  const inputRef = useRef(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const fileInputRef = useRef(null);
  const [addressResults, setAddressResults] = useState([]);
  const [showAddressResultsMenu, setShowAddressResultsMenu] = useState(false);
  const [cityAutoTag, setCityAutoTag] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
      setIsEmailError(inputRef.current.input.value === "");
    }
  }, [inputVisible]);

  const handleClose = (removedTag, field) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
    onChange(field, newTags);
  };
  const showInput = () => {
    setInputVisible(true);
  };
  const handleInputChange = (e, isEmail = false) => {
    setInputValue(e.target.value);
    if (isEmail) {
      const isEmailTouched =
        e.target.value !== null &&
        e.target.value !== undefined &&
        e.target.value !== "";
      const isEmailError = !isEmailTouched;
      setIsEmailError(isEmailError);
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value);
      setIsEmailValid(valid);
    }
  };
  const handleInputConfirm = (field) => {
    if (field === "invitePeopleEmails" && !isEmailValid) {
      setInputVisible(inputValue !== "");
    } else {
      if (inputValue && tags.indexOf(inputValue) === -1) {
        setTags([...tags, inputValue]);
        onChange(field, [...tags, inputValue]);
      }
      setInputVisible(false);
      setInputValue("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowAddressResultsMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [wrapperRef]);

  const debounce = (func, delay) => {
    let timeoutId;

    return function (...args) {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedHandleSearch = debounce((fieldName, text) => {
    if (text) {
      placeService.getPlaces({ text: text }).then((places) => {
        if (
          places.data &&
          places.data.results &&
          places.data.results.length <= 0
        ) {
          setShowAddressResultsMenu(false);
        } else {
          setShowAddressResultsMenu(true);
        }
        setAddressResults(places.data.results);
      });
    } else {
      setShowAddressResultsMenu(false);
      onChange("country", null);
      handleClose(cityAutoTag, "city");
      setAddressResults([]);
    }
  }, 1000);

  const handleSearch = (fieldName, text) => {
    onChange(fieldName, text);
    debouncedHandleSearch(fieldName, text);
  };

  const renderDataSummaryItem = (item) => {
    const listColumns = [
      {
        title: "No",
        dataIndex: "id",
        key: "id",
        render: (text) => text || "-",
      },
      {
        title: "Value",
        dataIndex: "value",
        key: "value",
        render: (text) => text || "-",
      },
    ];

    const chartData = useMemo(() => {
      if (
        item.type == "radio" ||
        item.type == "select" ||
        item.type == "quiz"
      ) {
        let _counts = {};
        formData?.[item.fieldName]?.map((value) => {
          _counts[value] = (_counts[value] || 0) + 1;
        });
        const total = Object.values(_counts).reduce((total, cell) => {
          return (total += cell);
        });
        if (total && total !== undefined) {
          const _chartData = item.options
            ?.map?.((option) => ({
              label: option.label,
              ratio: parseFloat(
                (((_counts[option.value] || 0) / total) * 100).toFixed(2)
              ),
            }))
            .filter((i) => i.ratio != 0);
          return _chartData;
        } else {
          return [];
        }
      } else if (
        item.type == "switch" ||
        item.type == "checkbox" ||
        item.type == "countrySelect"
      ) {
        let _counts = {};
        formData?.[item.fieldName]?.map?.((value) => {
          _counts[value] = (_counts[value] || 0) + 1;
        });
        const total = Object.values(_counts).reduce((total, cell) => {
          return (total += cell);
        });
        if (total && total !== undefined) {
          if (item.type == "countrySelect") {
            const _chartData = Object.keys(_counts)?.map?.((key) => ({
              label: countries.filter((i) => i.value == key)?.[0].label,
              ratio: parseFloat(
                (((_counts[key] || 0) / total) * 100).toFixed(2)
              ),
            }));
            return _chartData;
          } else {
            const _chartData = Object.keys(_counts)?.map?.((key) => ({
              label: key,
              ratio: parseFloat(
                (((_counts[key] || 0) / total) * 100).toFixed(2)
              ),
            }));
            return _chartData;
          }
        } else {
          return [];
        }
      }
    }, [item]);

    const generateChartData = (data) => {
      return {
        appendPadding: 50,
        data: data,
        angleField: "ratio",
        colorField: "label",
        radius: 1,
        autoFit: true,
        label: {
          type: "inner",
          offset: "-30%",
          content: function content(_ref) {
            return "".concat(_ref.ratio, " %");
          },
          style: {
            fontSize: 12,
            textAlign: "center",
          },
        },
        legend: {
          position: "top",
          flipPage: false,
          style: {
            textAlign: "center",
          },
        },
        interactions: [
          { type: "pie-legend-active" },
          { type: "element-active" },
        ],
      };
    };

    return (
      <>
        {(item.type == "input" ||
          item.type == "textarea" ||
          item.type == "upload" ||
          item.type == "address" ||
          item.type == "phoneInput" ||
          item.type == "custom" ||
          item.type == "tagInput") && (
          <Table
            dataSource={formData?.[item.fieldName]?.map?.((element, index) => ({
              id: index + 1,
              value: element,
            }))}
            columns={listColumns}
            rowKey={(record) => record.id}
            pagination={true}
            scroll={{ x: "700px" }}
          />
        )}
        {(item.type == "inputNumber" ||
          item.type == "rate" ||
          item.type == "slider") && (
          <Row gutter={[16, 16]} className="mt-2">
            <Col span={8}>
              <Card>
                <div style={{ textAlign: "center" }}>
                  <Statistic
                    title={""}
                    value={formData?.[item.fieldName]?.average.toFixed(2)}
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p>
                    Min: {formData?.[item.fieldName]?.min} | Max:{" "}
                    {formData?.[item.fieldName]?.max}
                  </p>
                  <p>Median: {formData?.[item.fieldName]?.median}</p>
                </div>
              </Card>
            </Col>
          </Row>
        )}
        {(item.type == "radio" ||
          item.type == "select" ||
          item.type == "switch" ||
          item.type == "checkbox" ||
          item.type == "quiz" ||
          item.type == "countrySelect") && (
          <Row gutter={[16, 16]} className="mt-2">
            {chartData?.length > 0 && (
              <Col span={8}>
                <Card className={"grid justify-center"}>
                  <div
                    style={{
                      width: "300px",
                      height: "300px",
                      position: "relative",
                    }}
                  >
                    <Pie {...generateChartData(chartData)} />
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        )}
        {item.type == "timepicker" &&
          formData?.[item.fieldName]?.map?.((data, i) => (
            <TimePicker
              key={i}
              className="m-1"
              readOnly={true}
              disabled={true}
              value={data ? dayjs(data, "HH:mm:ss") : null}
            />
          ))}
        {item.type == "datepicker" &&
          formData?.[item.fieldName]?.map?.((data, i) => (
            <DatePicker
              key={i}
              className="m-1"
              readOnly={true}
              disabled={true}
              value={data ? dayjs(data) : null}
            />
          ))}
        {item.type == "colorpicker" &&
          formData?.[item.fieldName]?.map?.((color, index) => (
            <div
              key={index}
              className="rounded-md text-center"
              style={{
                backgroundColor: `rgba(${color.metaColor.r}, ${color.metaColor.g}, ${color.metaColor.b}, ${color.metaColor.a})`,
                width: "50px",
                height: "50px",
                margin: "10px",
                display: "inline-block",
              }}
            ></div>
          ))}
      </>
    );
  };

  const renderFormItem = (item) => {
    const selectFieldValue = formData?.[item.fieldName];
    const isSelectTouched =
      selectFieldValue !== null &&
      selectFieldValue !== undefined &&
      selectFieldValue !== "";
    const isSelectError = item.required && !isSelectTouched;
    const selectErrorMessage =
      (isSelectError &&
        item.fieldName === "category" &&
        "Please select category") ||
      (isSelectError &&
        item.fieldName === "strategicGoals" &&
        "Please select strategic goal") ||
      (isSelectError &&
        item.fieldName === "deliveryModel" &&
        "Please select delivery model") ||
      (isSelectError &&
        item.fieldName === "products" &&
        "Please select products or services");

    switch (item.type) {
      case "input":
        const fieldValue = formData?.[item.fieldName];
        const isTouched =
          fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
        const isError = item.required && !isTouched;
        const errorMessage =
          isError &&
          item.fieldName === "name" &&
          `Please enter ${item.label.toLowerCase()}`;

        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <>
            <Input
              className="dark:bg-gray-900"
              placeholder={item.placeholder}
              onChange={(e) => onChange(item.fieldName, e.target.value)}
              value={formData?.[item.fieldName]}
              disabled={thinking.includes(item.fieldName)}
              required={item.required}
              readOnly={isProgramSubmission}
            />
            {item.required && isError && (
              <span style={{ color: "red", "padding-top": "5px" }}>
                {errorMessage}
              </span>
            )}
          </>
        );
      case "password":
        if (isDataSummary)
          return <>{JSON.stringify(formData?.[item.fieldName])}</>;
        return (
          <Input
            className="dark:bg-gray-900"
            type="password"
            placeholder={item.placeholder}
            onChange={(e) => onChange(item.fieldName, e.target.value)}
            value={formData?.[item.fieldName]}
            readOnly={isProgramSubmission}
          />
        );
      case "textarea":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <Input.TextArea
            className="dark:bg-gray-900"
            placeholder={item.placeholder}
            onChange={(e) => onChange(item.fieldName, e.target.value)}
            value={formData?.[item.fieldName]}
            rows={item.rows ?? 2}
            disabled={thinking.includes(item.fieldName)}
            readOnly={isProgramSubmission}
            required={item.required}
          />
        );
      case "inputNumber":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <InputNumber
            min={item.min}
            max={item.max}
            step={item.step}
            onChange={(value) => onChange(item.fieldName, value)}
            value={formData?.[item.fieldName]}
            readOnly={isProgramSubmission}
          />
        );
      case "inputRange":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <Slider
            range
            min={item.min}
            max={item.max}
            step={item.step}
            onChange={(value) => onChange(item.fieldName, value)}
            value={formData?.[item.fieldName]}
            disabled={isProgramSubmission}
            tipFormatter={item.tipFormatter}
          />
        );
      case "radio":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <Radio.Group
            className={formType === "enrollmentPre" && "grid"}
            onChange={(e) =>
              !isProgramSubmission && onChange(item.fieldName, e.target.value)
            }
            value={formData?.[item.fieldName]}
          >
            {item.options?.map?.((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        );
      case "rate":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <Rate
            onChange={(value) => onChange(item.fieldName, value)}
            value={formData?.[item.fieldName]}
            disabled={isProgramSubmission}
          />
        );
      case "select":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <>
            <Select
              style={{ width: item.fieldName === "category" ? 150 : 250 }}
              onChange={(value) =>
                !isProgramSubmission && onChange(item.fieldName, value)
              }
              value={formData?.[item.fieldName]}
              mode={item.multi ? "multiple" : null}
            >
              {item.options
                .sort((a, b) => a.label.localeCompare(b.label))
                ?.map?.((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
            </Select>
            <div>
              {item.required && isSelectError && (
                <span style={{ color: "red", paddingTop: "5px" }}>
                  {selectErrorMessage}
                </span>
              )}
            </div>
          </>
        );

      case "quiz":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <>
            {item.options?.map?.((option) => (
              <Checkbox
                className="flex"
                key={option.value}
                onChange={(e) => {
                  let selectedValues;
                  if (item.multi) {
                    const currentValue = formData?.[item.fieldName] || [];
                    selectedValues = e.target.checked
                      ? [...currentValue, option.value]
                      : currentValue.filter((value) => value !== option.value);

                    if (selectedValues.length <= 0) {
                      selectedValues = null;
                    }
                  } else {
                    selectedValues = e.target.checked ? option.value : null;
                  }
                  onChange(item.fieldName, selectedValues);
                }}
                checked={
                  formData?.[item.fieldName] &&
                  (formData?.[item.fieldName]).includes(option.value)
                }
                disabled={isProgramSubmission}
              >
                {option.label}
              </Checkbox>
            ))}
            <div>
              {item.required && isSelectError && (
                <span style={{ color: "red", paddingTop: "5px" }}>
                  {selectErrorMessage}
                </span>
              )}
            </div>
          </>
        );
      case "slider":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <Slider
            min={item.min}
            max={item.max}
            step={item.step}
            onChange={(value) => onChange(item.fieldName, value)}
            value={formData?.[item.fieldName]}
            disabled={isProgramSubmission}
          />
        );
      case "switch":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <Switch
            checked={formData?.[item.fieldName]}
            onChange={(value) =>
              !isProgramSubmission && onChange(item.fieldName, value)
            }
          />
        );
      case "timepicker":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <TimePicker
            onChange={(time, timeString) =>
              !isProgramSubmission && onChange(item.fieldName, timeString)
            }
            value={
              formData?.[item.fieldName]
                ? dayjs(formData?.[item.fieldName], "HH:mm:ss")
                : null
            }
          />
        );
      case "datepicker":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <DatePicker
            onChange={(date, dateString) =>
              !isProgramSubmission && onChange(item.fieldName, dateString)
            }
            value={
              formData?.[item.fieldName]
                ? dayjs(formData?.[item.fieldName])
                : null
            }
          />
        );
      case "upload":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <CloudinaryUpload
            value={formData?.[item.fieldName]}
            onChange={(info) => {
              !isProgramSubmission && onChange(item.fieldName, info);
            }}
          />
        );
      case "checkbox":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <Checkbox
            checked={formData?.[item.fieldName]}
            onChange={(e) => {
              !isProgramSubmission &&
                onChange(item.fieldName, e.target.checked);
            }}
          >
            {item.label}
          </Checkbox>
        );
      case "colorpicker":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <ColorPicker
            onChange={(color) =>
              !isProgramSubmission && onChange(item.fieldName, color)
            }
            value={formData?.[item.fieldName]}
          />
        );
      case "custom":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <item.CustomInputComponent
            onChange={(value) =>
              !isProgramSubmission && onChange(item.fieldName, value)
            }
            value={formData?.[item.fieldName]}
          />
        );
      case "tagInput":
        const forMap = (tag) => {
          const tagElem = (
            <Tag
              closable
              onClose={(e) => {
                e.preventDefault();
                handleClose(tag, item.fieldName);
              }}
            >
              {tag}
            </Tag>
          );
          return (
            <span
              key={tag}
              style={{
                display: "inline-block",
              }}
            >
              {tagElem}
            </span>
          );
        };

        const tagChild = tags.map(forMap);
        const tagPlusStyle = {
          borderStyle: "dashed",
        };
        const errorEmailMessage =
          (isEmailError && `Please enter ${item.label.toLowerCase()}`) ||
          (!isEmailValid && "Please enter a valid email address");

        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <>
            <div
              style={{
                marginBottom: 16,
              }}
            >
              <TweenOneGroup
                enter={{
                  scale: 0.8,
                  opacity: 0,
                  type: "from",
                  duration: 100,
                }}
                onEnd={(e) => {
                  if (e.type === "appear" || e.type === "enter") {
                    e.target.style = "display: inline-block";
                  }
                }}
                leave={{
                  opacity: 0,
                  width: 0,
                  scale: 0,
                  duration: 200,
                }}
                appear={false}
              >
                {tagChild}
              </TweenOneGroup>
            </div>
            {inputVisible ? (
              <>
                <Input
                  className="dark:bg-gray-900"
                  ref={inputRef}
                  type="text"
                  size="small"
                  style={{
                    width: 200,
                  }}
                  value={inputValue}
                  onChange={(e) =>
                    handleInputChange(
                      e,
                      item.fieldName === "invitePeopleEmails"
                    )
                  }
                  onBlur={() => handleInputConfirm(item.fieldName)}
                  onPressEnter={() => handleInputConfirm(item.fieldName)}
                />
                {errorEmailMessage && (
                  <div style={{ color: "red" }}>{errorEmailMessage}</div>
                )}
              </>
            ) : (
              <Tag onClick={showInput} style={tagPlusStyle}>
                {item.fieldName === "invitePeopleEmails"
                  ? "+ Add New Email"
                  : `+ Add ${item.fieldName}`}
              </Tag>
            )}

            {item.fieldName === "invitePeopleEmails" && (
              // Import emails from excel file
              <div className={"mt-3"}>
                <Button
                  type="primary"
                  className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
                  onClick={() => {
                    fileInputRef.current.value = "";
                    fileInputRef.current.click();
                  }}
                >
                  Import Emails
                </Button>
                <ExcelImport
                  modalName={"Suite"}
                  targetMapping={[
                    {
                      value: "email",
                      label: "Email",
                      type: "string",
                    },
                  ]}
                  handleImport={async (e) => {
                    const mappedItems = e.mappedItems;
                    const fileEmails = [];

                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    mappedItems.forEach((item) => {
                      if (
                        emailRegex.test(item.email) &&
                        !tags.includes(item.email)
                      ) {
                        fileEmails.push(item.email);
                      }
                    });

                    if (fileEmails.length > 0) {
                      setTags([...tags, ...fileEmails]);
                      onChange("invitePeopleEmails", [...tags, ...fileEmails]);
                    }
                  }}
                  fileInputRef={fileInputRef}
                />
              </div>
            )}
          </>
        );

      case "list":
        return (
          <>
            {formData?.[item.fieldName]?.map?.((listItem, i) => (
              <div key={i} className="flex items-center gap-2 w-full">
                <DynamicForm
                  className="grow"
                  verticalSpacing={1}
                  AIEnhancements={AIEnhancements}
                  formData={listItem}
                  thinking={thinking}
                  setThinking={setThinking}
                  form={item.defaultForm}
                  onChange={(fieldname, value) => {
                    // Create a new list with the updated item.
                    const updatedList = formData[item.fieldName].map(
                      (item, index) => {
                        if (index === i) {
                          // For the item that changed, update the specific field.
                          return { ...item, [fieldname]: value };
                        }
                        return item;
                      }
                    );

                    // Call the main onChange with the updated list.
                    onChange(item.fieldName, updatedList);
                  }}
                />

                <Button
                  danger
                  className="mt-7 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold py-1 px-4 rounded !text-white"
                  onClick={() => {
                    onChange(
                      item.fieldName,
                      formData[item.fieldName].filter((_, index) => index !== i)
                    );
                  }}
                >
                  Delete
                </Button>
              </div>
            ))}

            <button
              className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white"
              onClick={() => {
                onChange(item.fieldName, [
                  ...(formData?.[item.fieldName] ?? []),
                  item.defaultObject,
                ]);
              }}
            >
              Add
            </button>
          </>
        );

      case "countrySelect":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <>
            <Select
              style={{ width: 250 }}
              onChange={(value) =>
                !isProgramSubmission && onChange(item.fieldName, value)
              }
              value={formData?.[item.fieldName]}
            >
              {countries
                .sort((a, b) => a.label.localeCompare(b.label))
                ?.map?.((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
            </Select>
            <div>
              {item.required && isSelectError && (
                <span style={{ color: "red", paddingTop: "5px" }}>
                  {selectErrorMessage}
                </span>
              )}
            </div>
          </>
        );

      case "address":
        const menu = (
          <Menu>
            {addressResults?.map?.((result) => (
              <Menu.Item
                key={result.id}
                icon={<MdLocationOn size={20} style={{ marginRight: "8px" }} />}
                onClick={() => {
                  setShowAddressResultsMenu(false);
                  onChange(item.fieldName, result.formatted);
                  const addressParts = result.formatted.split(", ");
                  const city = addressParts[addressParts.length - 3];
                  const country = addressParts[addressParts.length - 1];
                  if (result.formatted) {
                    if (city) {
                      setTags([...tags, city]);
                      setCityAutoTag(city);
                      onChange("city", [...tags, city]);
                    }

                    if (country) {
                      let countryLabel = country;
                      if (country === "United States of America") {
                        countryLabel = "United States";
                      }
                      onChange("country", countryLabel);
                    }
                  }
                  setAddressResults([]);
                }}
              >
                {result.formatted}
              </Menu.Item>
            ))}
          </Menu>
        );

        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <div ref={wrapperRef}>
            <Dropdown overlay={menu} visible={showAddressResultsMenu}>
              <Input
                className="dark:bg-gray-900"
                placeholder={item.placeholder}
                onChange={(e) => handleSearch(item.fieldName, e.target.value)}
                value={formData?.[item.fieldName]}
                disabled={thinking.includes(item.fieldName)}
                required={item.required}
                readOnly={isProgramSubmission}
              />
            </Dropdown>
            <div>
              {item.required && isSelectError && (
                <span style={{ color: "red", paddingTop: "5px" }}>
                  {selectErrorMessage}
                </span>
              )}
            </div>
          </div>
        );

      case "country":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <ReactFlagsSelect
            className="min-w-[240px]"
            selected={formData?.[item.fieldName]}
            onSelect={(e) => handleSearch(item.fieldName, e)}
            searchable
            multi
          />
        );

      case "phoneInput":
        if (isDataSummary) return <>{renderDataSummaryItem(item)}</>;
        return (
          <PhoneInput
            placeholder="Enter phone number"
            defaultCountry="US"
            value={formData?.[item.fieldName] || null}
            onChange={(value) => onChange(item.fieldName, value)}
            disabled={isProgramSubmission}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {form
        .filter((row) => !row.condition || row.condition(formData))
        ?.map?.((row) => (
          <div
            key={row.fieldName}
            className={`form-item my-${verticalSpacing}`}
          >
            <div className="flex justify-between">
              <label>
                {row.label}{" "}
                {row.required && <span style={{ color: "red" }}>*</span>}
              </label>
              {AIEnhancements && ["textarea", "input"].includes(row.type) && (
                <TbRobotFace
                  size={18}
                  className="cursor-pointer"
                  onClick={() => {
                    if (!formData?.[row.fieldName])
                      return message.info("Please write some text first");

                    if (
                      row.fieldName === "description" &&
                      formData?.[row.fieldName]?.length < 50
                    ) {
                      return message.info(
                        "AI needs a little more context. Please write at least 50 characters."
                      );
                    } else if (formData?.[row.fieldName]?.length < 10) {
                      return message.info(
                        "AI needs a little more context. Please write at least 10 characters."
                      );
                    }

                    socket.current = new WebSocket(
                      `wss://booklified-chat-socket.herokuapp.com`
                    );

                    socket.current.addEventListener("open", async () => {
                      setInterval(
                        () =>
                          socket.current.send(JSON.stringify({ id: "PING" })),
                        30000
                      );
                      const content = `Hello, I need your expertise in transforming the following text into something extraordinary. Please apply your literary skills to rewrite this text. Elevate its language, and ensure it resonates with the reader. The goal is to make it a thousand times more impactful, engaging, and persuasive. Here's the text:

                        ${formData?.[row.fieldName]}

                        I'm looking for a version that's absolutely stunning and highly effective in capturing attention and driving action. Also, when you are answering to this, please only answer with the enhanced version of the text. Do not add anything else into your answer, since your answer will be posted as is on the website. Do NOT use quotes before and after the text in your answer! Also your version of text should under no circumstance be longer than ${
                          formData?.[row.fieldName]?.length * 2
                        } characters.`;

                      setThinking((e) => [...e, row.fieldName]);
                      socket.current.send(
                        JSON.stringify({
                          id: "OPEN_AI_PROMPT",
                          payload: {
                            content,
                            model: "gpt-3.5-turbo-16k",
                          },
                        })
                      );
                    });

                    socket.current.addEventListener(
                      "message",
                      async (event) => {
                        const message = JSON.parse(event.data);
                        const response = message.payload?.response;

                        onChange(row.fieldName, response);
                        setThinking((e) =>
                          e.filter((x) => x !== row.fieldName)
                        );
                      }
                    );
                  }}
                />
              )}
            </div>
            {renderFormItem(row)}
          </div>
        ))}
    </div>
  );
};

const MultiStepComponent = ({
  steps,
  defaultValues,
  onFinish = () => {},
  onPublish = () => {},
  onActiveStepChange = () => {},
  onFileImport = () => {},
  AIEnhancements = false,
  displaySteps = true,
  programDataDisplay,
  onChangeFromSelect,
  formType,
  isClickedPublish,
  isProgramSubmission = false,
  isProgramEditForm = false,
  onProgramFormEdit = () => {},
  kpis,
  isShowBack = false,
  isDataSummary = false,
  finishButtonTitle,
}) => {
  const [formData, setFormData] = useState(defaultValues ?? {});
  const [activeStep, setActiveStep] = useState(0); // Initialize current step to 0
  const [skippedSteps, setSkippedSteps] = useState([]);
  const [thinking, setThinking] = useState([]);
  const [onFinishClick, setOnFinishClick] = useState(false);
  const [programEditFormPreviewModal, setProgramEditFormPreviewModal] =
    useState(false);
  const fileInputRef = useRef(null);
  const darkMode = useSelector(selectDarkMode);

  useEffect(() => {
    if (isClickedPublish) {
      setActiveStep(2);
    }
  }, [isClickedPublish]);

  useEffect(() => {
    onActiveStepChange(activeStep);
  }, [activeStep, onActiveStepChange]);

  useEffect(() => {
    if (
      (formType === "programPre" || formType === "templatePre") &&
      activeStep === 0
    ) {
      setActiveStep(1);
    }

    if (
      (formType === "programPre" || formType === "templatePre") &&
      activeStep === 2
    ) {
      onPublish({ isPublished: true });
    }
  }, [formType, activeStep, onPublish]);

  useEffect(() => {
    if (isProgramSubmission) {
      setActiveStep(0);
      setFormData(defaultValues);
    }
  }, [defaultValues]);

  const handleFormChange = (fieldName, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
      isFinishClicked: false,
    }));

    if (fieldName === "category") {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: value,
        strategicGoals: [],
        deliveryModel: [],
        products: [],
        isFinishClicked: false,
      }));
      onChangeFromSelect(fieldName, value);
    }

    if (fieldName === "formAccessibility") {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: value,
      }));
      onChangeFromSelect(fieldName, value);
    }
  };

  useEffect(() => {
    if (onFinishClick) {
      setFormData({
        ...formData,
        isFinishClicked: true,
      });
    }
  }, [onFinishClick]);

  useEffect(() => {
    onActiveStepChange(activeStep);
  }, [activeStep, onActiveStepChange]);

  const generateTargetMapping = () => {
    if (!formData.form) return [];

    return formData.form.reduce((acc, step) => {
      if (step.form) {
        const stepMapping = step.form?.map?.((field) => ({
          value: field.fieldName,
          label: field.fieldName,
          type: field.type || "string",
          required: field.required || false,
        }));

        return [...acc, ...stepMapping];
      }

      return acc;
    }, []);
  };

  const hasEmptyRequiredFields = () => {
    for (const step of steps) {
      for (const formInput of steps[activeStep]?.form) {
        if (formInput.required && !formData[formInput.fieldName]) {
          return true;
        }
      }
    }
    return false;
  };

  const handleStepNameChange = (index, newName) => {
    const updatedSteps = [...steps];
    updatedSteps[index].name = newName;
    onProgramFormEdit(updatedSteps);
  };

  const handleAddNewStep = () => {
    const newStep = {
      id: uuidv4(),
      name: "",
      form: [],
    };
    const updatedSteps = [...steps, newStep];
    onProgramFormEdit(updatedSteps);
  };

  const handleDeleteStep = (index) => {
    const updatedSteps = [...steps];
    updatedSteps.splice(index, 1);

    const updateActiveStep = index === updatedSteps.length && index - 1;
    if (updateActiveStep) {
      setActiveStep(updateActiveStep);
    }

    onProgramFormEdit(updatedSteps);
  };

  if (steps.length === 0) return <></>;
  return (
    <div
      className={`flex flex-col overflow-auto max-h-[100%] ${
        !displaySteps && formType === "SuitePre" ? "px-5" : "px-10 pt-5"
      }`}
    >
      {displaySteps && (
        <div className="hidden md:block ">
          <Steps
            progressDot
            current={activeStep}
            items={steps?.map?.((step, index) => ({
              title: (
                <>
                  {isProgramEditForm ? (
                    <>
                      <Title
                        level={5}
                        className="text-sm font-normal inline mb-0"
                        editable={{
                          onChange: (newName) =>
                            handleStepNameChange(index, newName),
                        }}
                      >
                        {step.name}
                      </Title>
                      <Button
                        className={"p-0 delete-step-btn"}
                        type="text"
                        icon={<AiOutlineDelete size={18} color={"red"} />}
                        onClick={() => handleDeleteStep(index)}
                      />
                    </>
                  ) : (
                    <>{step.name}</>
                  )}
                </>
              ),
            }))}
          />

          {isProgramEditForm && (
            <>
              <Button
                className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                onClick={handleAddNewStep}
              >
                + Add New Step
              </Button>
            </>
          )}
        </div>
      )}
      <div
        className={`flex-grow ${formType !== "SuitePre" && "p-5"} ${
          formType === "programPre" || isProgramEditForm ? "hidden" : ""
        }`}
      >
        {steps[activeStep]?.id === "previewstep" &&
        (formType === "SuitePre" ||
          (formType === "createTemplate" && programDataDisplay)) ? (
          <>
            <div className={"flex sm:flex-row flex-col"}>
              <div className={"pl-5 sm:w-8/12"}>
                <p className={"p-2"}>
                  <strong>
                    {formType === "SuitePre" ? "Program" : "Template"} Name
                  </strong>
                  : {(programDataDisplay ?? formData)?.name}
                </p>
                <p className={"p-2"}>
                  <strong>
                    {formType === "SuitePre" ? "Program" : "Template"}{" "}
                    {steps[activeStep]?.programPreviewDescriptionTitle ??
                      "Description"}
                  </strong>
                  :{" "}
                  {
                    (programDataDisplay ?? formData)?.[
                      steps[activeStep]?.programPreviewDescriptionKey ??
                        "description"
                    ]
                  }
                </p>

                <div>
                  {(programDataDisplay ?? formData)?.categoryDetail?.Name && (
                    <p className={"p-2"}>
                      <strong>
                        {formType === "SuitePre" ? "Program" : "Template"}{" "}
                        Category
                      </strong>
                      : {(programDataDisplay ?? formData)?.categoryDetail.Name}
                    </p>
                  )}
                  {(programDataDisplay ?? formData)?.impactThemeDetails &&
                    (programDataDisplay ?? formData)?.impactThemeDetails
                      .length > 0 && (
                      <p className={"p-2"}>
                        <strong>
                          {formType === "SuitePre" ? "Program" : "Template"}{" "}
                          Impact
                        </strong>
                        :{" "}
                        {(
                          programDataDisplay ?? formData
                        )?.impactThemeDetails?.map?.((item, index) => (
                          <>
                            <span key={item._id}>{item.Name}</span>
                            {index !==
                            (programDataDisplay ?? formData)?.impactThemeDetails
                              .length -
                              1
                              ? ", "
                              : ""}
                          </>
                        ))}
                      </p>
                    )}
                  {(programDataDisplay ?? formData)?.startDate && (
                    <p className={"p-2"}>
                      <strong>
                        {formType === "SuitePre" ? "Program" : "Template"} Start
                        Date
                      </strong>
                      :{" "}
                      {moment(
                        (programDataDisplay ?? formData)?.startDate
                      ).format("LLLL d, yyyy")}
                    </p>
                  )}
                  {(programDataDisplay ?? formData)?.endDate && (
                    <p className={"p-2"}>
                      <strong>
                        {formType === "SuitePre" ? "Program" : "Template"} End
                        Date
                      </strong>
                      :{" "}
                      {moment((programDataDisplay ?? formData)?.endDate).format(
                        "LLLL d, yyyy"
                      )}
                    </p>
                  )}
                </div>
                {(programDataDisplay ?? formData)?.objectives && (
                  <p className={"p-2"}>
                    <strong>
                      {formType === "SuitePre" ? "Program" : "Template"}{" "}
                      Objectives
                    </strong>
                    : {(programDataDisplay ?? formData)?.objectives}
                  </p>
                )}
                {(programDataDisplay ?? formData)?.strategicGoalDetails && (
                  <p className={"p-2"}>
                    <strong>Strategic Goal</strong>:{" "}
                    {
                      (programDataDisplay ?? formData)?.strategicGoalDetails
                        .Name
                    }
                  </p>
                )}
                {(programDataDisplay ?? formData)?.deliveryModelDetails && (
                  <p className={"p-2"}>
                    <strong>Delivery Model</strong>:{" "}
                    {
                      (programDataDisplay ?? formData)?.deliveryModelDetails
                        .Name
                    }
                  </p>
                )}
                {(programDataDisplay ?? formData)?.productDetails && (
                  <p className={"p-2"}>
                    <strong>Products And Services</strong>:{" "}
                    {(programDataDisplay ?? formData)?.productDetails.Name}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <DynamicForm
              thinking={thinking}
              setThinking={setThinking}
              AIEnhancements={AIEnhancements}
              formData={formData}
              form={steps[activeStep].form}
              onChange={(fieldName, value) =>
                handleFormChange(fieldName, value)
              }
              onChangeFromSelect={onChangeFromSelect}
              formType={formType}
              isProgramSubmission={isProgramSubmission}
              isDataSummary={isDataSummary}
            />

            {formType === "enrollmentPre" &&
              activeStep === 1 &&
              formData.enrollClientMethod === "optionB" && (
                <>
                  <button
                    className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                    onClick={() => {
                      fileInputRef.current.value = "";
                      fileInputRef.current.click();
                    }}
                  >
                    Import Form
                  </button>
                  {formData.form && (
                    <ExcelImport
                      modalName={"Enrollment"}
                      targetMapping={generateTargetMapping()}
                      handleImport={async (e) => {
                        onFileImport(e.mappedItems);
                      }}
                      fileInputRef={fileInputRef}
                    />
                  )}
                </>
              )}
          </>
        )}
      </div>

      {isProgramEditForm && (
        <>
          <div>
            <MultiStepConfigurator
              kpis={kpis}
              activeStep={activeStep}
              isProgramEditForm={true}
              funnelSteps={steps}
              setFunnelSteps={(e) => {
                const result = typeof e === "function" ? e(steps) : e;
                onProgramFormEdit(result);
              }}
            />
          </div>
        </>
      )}

      {/* Sticky Footer */}
      <div
        className={`bg-white dark:bg-gray-900 p-4 shadow-md sticky bottom-0 ${
          formType === "programPre" || formType === "templatePre"
            ? "hidden"
            : ""
        }`}
      >
        <div className="flex justify-between">
          <div>
            {activeStep > 0 && (
              <button
                className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                onClick={() => {
                  if (activeStep > 0) {
                    // Find the last remembered skipped step before the current step
                    const lastSkippedSteps = skippedSteps.filter(
                      (step) => step <= activeStep
                    );
                    let previousStep = activeStep - 1;

                    if (lastSkippedSteps.length > 0) {
                      // If there are skipped steps before the current step,
                      // navigate to the last non-skipped step before the current step
                      previousStep = Math.max(...lastSkippedSteps, -1);
                    }
                    const lastSkippedStep =
                      lastSkippedSteps?.[lastSkippedSteps.length - 1];

                    // If found, navigate to that step
                    if (
                      typeof lastSkippedStep === "number" &&
                      lastSkippedStep > 0 &&
                      lastSkippedStep < steps.length
                    ) {
                      setActiveStep(lastSkippedStep - 1);
                      // Remove the last remembered skipped step from the list
                    } else {
                      // Otherwise, navigate to the previous step
                      setActiveStep(activeStep - 1);
                    }
                  }
                }}
              >
                Previous
              </button>
            )}

            {!displaySteps && formType === "SuitePre" && isShowBack && (
              <Button
                loading={thinking.length > 0}
                onClick={() => {
                  let finalData = {
                    isBackClicked: true,
                  };
                  onFinish(finalData);
                }}
                type="primary"
                className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
              >
                Back
              </Button>
            )}
          </div>
          <div>
            {activeStep < steps.length - 1 && (
              <Button
                onClick={() => {
                  let nextStep = activeStep + 1;

                  // Skip logic
                  if (steps[activeStep]?.form)
                    for (const formInput of steps[activeStep].form) {
                      if (
                        ![
                          "inputNumber",
                          "radio",
                          "rate",
                          "select",
                          "quiz",
                          "switch",
                          "checkbox",
                        ].includes(formInput.type)
                      )
                        continue;
                      if (
                        !formInput.conditions ||
                        formInput.conditions.length === 0
                      )
                        continue;

                      if (
                        formInput.conditions.every((c) => {
                          return (
                            (c.comparison === "is more than" &&
                              formData?.[formInput?.fieldName] > c.value) ||
                            (c.comparison === "is less than" &&
                              formData?.[formInput?.fieldName] < c.value) ||
                            (c.comparison === "is more than or equal" &&
                              formData?.[formInput?.fieldName] >= c.value) ||
                            (c.comparison === "is less than or equal" &&
                              formData?.[formInput?.fieldName] <= c.value) ||
                            (c.comparison === "equals" &&
                              ["inputNumber", "rate"].includes(
                                formInput.type
                              ) &&
                              formData?.[formInput?.fieldName] == c.value) ||
                            (c.comparison === "equals" &&
                              ["radio", "select", "quiz"].includes(
                                formInput.type
                              ) &&
                              formInput?.options?.find?.(
                                (o) => o.label == c.value
                              )?.value == formData?.[formInput?.fieldName]) ||
                            (c.comparison === "not equals" &&
                              ["inputNumber", "rate"].includes(
                                formInput.type
                              ) &&
                              formData?.[formInput?.fieldName] != c.value) ||
                            (c.comparison === "not equals" &&
                              ["radio", "select", "quiz"].includes(
                                formInput.type
                              ) &&
                              formInput?.options?.find?.(
                                (o) => o.label == c.value
                              )?.value != formData?.[formInput?.fieldName]) ||
                            (c.comparison === "is true" &&
                              formData?.[formInput?.fieldName] === true) ||
                            (c.comparison === "is false" &&
                              formData?.[formInput?.fieldName] === false)
                          );
                        })
                      ) {
                        const skipStepIdx = steps.findIndex(
                          (c) => c.id === formInput.skipStep
                        );
                        if (
                          typeof skipStepIdx === "number" &&
                          skipStepIdx !== -1
                        )
                          nextStep = skipStepIdx;
                      }
                    }
                  if (nextStep > activeStep + 1) {
                    // If next step is ahead, remember skipped steps
                    const skipped = Array.from(
                      { length: nextStep - activeStep - 1 },
                      (_, i) => activeStep + i + 1
                    );
                    setSkippedSteps((prevSkippedSteps) => [
                      ...prevSkippedSteps.filter((step) => step <= activeStep),
                      ...skipped,
                    ]);
                  } else {
                    setSkippedSteps((prevSkippedSteps) => [
                      ...prevSkippedSteps.filter((step) => step <= activeStep),
                      activeStep + 1,
                    ]);
                  }
                  setActiveStep(nextStep);
                  onFinish(formData);
                }}
                className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
                loading={thinking.length > 0}
                disabled={
                  (!isProgramEditForm && hasEmptyRequiredFields()) ||
                  thinking.length > 0
                }
              >
                Next
              </Button>
            )}

            {activeStep === steps.length - 1 &&
              !isProgramSubmission &&
              !isProgramEditForm && (
                <Button
                  loading={thinking.length > 0}
                  onClick={() => {
                    let finalData = {
                      ...formData,
                      isFinishClicked: true,
                    };
                    onFinish(finalData);
                    setOnFinishClick(true);
                  }}
                  type="primary"
                  className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
                  disabled={hasEmptyRequiredFields()}
                >
                  {finishButtonTitle ?? "Finish"}
                </Button>
              )}

            {isProgramEditForm && (
              <>
                <Button
                  className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white ml-3"
                  loading={thinking.length > 0}
                  onClick={() => {
                    setProgramEditFormPreviewModal(true);
                  }}
                  type="primary"
                >
                  Preview
                </Button>
                <Modal
                  wrapClassName={`${darkMode ? "dark" : ""}`}
                  width={800}
                  height={500}
                  open={programEditFormPreviewModal}
                  onOk={() => setProgramEditFormPreviewModal(false)}
                  onCancel={() => setProgramEditFormPreviewModal(false)}
                >
                  <>
                    <MultiStepComponent steps={steps} />
                  </>
                </Modal>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepComponent;

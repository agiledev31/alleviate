import { Allotment } from "allotment";
import "allotment/dist/style.css";
import {
  Alert,
  Breadcrumb,
  Button,
  Divider,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Skeleton,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import TabPane from "antd/es/tabs/TabPane";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { GrInfo } from "react-icons/gr";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CloudinaryUpload from "../../components/CloudinaryUpload";
import LoadingSpinner from "../../components/Loader";
import MultiStepComponent from "../../components/MultiStepComponent";
import StatsDashboard from "../../components/StatsDashboard";
import {
  API_DATA_LIMIT,
  DATA_PAR_PAGE,
  PAGE_NUMBER,
  convertCamelCaseStringToNormalString,
} from "../../data/constants";
import CrudService from "../../service/CrudService";
import StatsService from "../../service/StatsService";

const ProgramDetails = () => {
  let [searchParams] = useSearchParams();
  const [programData, setProgramData] = useState(null);
  const [dataSummary, setDataSummary] = useState(null);
  const [isLinkPublic, setIsLinkPublic] = useState(false);
  const [submittedProgramData, setSubmittedProgramData] = useState([]);
  const [dataSummeryModal, setDataSummeryModal] = useState(false);
  const [submissionModal, setSubmissionModal] = useState(false);
  const [selectedSubmissionData, setSelectedSubmissionData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [qualificationActiveTab, setQualificationActiveTab] =
    useState("qualified");
  const [qualificationModal, setQualificationModal] = useState(false);
  const [questionSets, setQuestionSets] = useState([
    {
      id: 1,
      fieldName: "",
      fieldAnswer: "",
      qualifyOption: "include",
      operator: "",
    },
  ]);
  const [programFields, setProgramFields] = useState([]);
  const [suite, setSuite] = useState(null);
  const [programFieldsAnswers, setProgramFieldsAnswers] = useState([]);
  const [disabledAddSetButton, setDisabledAddSetButton] = useState(true);
  const [qualificationData, setQualificationData] = useState([]);
  const [unQualificationData, setUnQualificationData] = useState([]);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    setProgramData(null);

    CrudService.getSingle("Program", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);

      CrudService.getSingle("Suite", res.data?.suite?._id).then((res) => {
        setSuite(res.data);
      });
      if (
        res.data.hasOwnProperty("formAccessibility") &&
        res.data.formAccessibility === "public"
      ) {
        setIsLinkPublic(true);
      }
    });

    if (id)
      StatsService.getDataSummary(id).then(({ data }) => {
        setDataSummary(data.formData);
      });

    CrudService.search("ProgramSubmission", 1000, PAGE_NUMBER, {
      filters: {
        programId: id,
      },
      sort: { createdAt: -1 },
    }).then((res) => {
      setSubmittedProgramData(res.data.items);
    });
  }, [searchParams]);

  const handleViewSubmission = (record) => {
    setSelectedSubmissionData(null);
    setSubmissionModal(true);
    setSelectedSubmissionData(record);
  };

  const columns = [
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
    },
    {
      title: "Submission Type",
      dataIndex: "submissionType",
      key: "submissionType",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag
          color={
            text === "Submitted"
              ? "green"
              : text === "Waiting"
              ? "orange"
              : text === "Approved"
              ? "green"
              : "red"
          }
        >
          {text === "Waiting" ? "Submitted" : text}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (text) => (
        <time dateTime={text} className="mr-2">
          {moment(text).format("Do MMM, YYYY")}
        </time>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (record) => (
        <Space size={[12, 10]} wrap>
          <Button
            className="px-2 py-1 text-sm rounded"
            type="primary"
            onClick={() => {
              handleViewSubmission(record);
            }}
          >
            View Submission
          </Button>

          <Modal
            width={800}
            height={300}
            open={submissionModal}
            onOk={() => setSubmissionModal(false)}
            onCancel={() => {
              setSubmissionModal(false);
              setSelectedSubmissionData(null);
            }}
          >
            <>
              {selectedSubmissionData &&
              selectedSubmissionData.data.formData ? (
                <>
                  <h2 className={"text-lg font-bold mb-2"}>Submitted Data</h2>
                  {selectedSubmissionData.data.formData.hasOwnProperty(
                    "submittedData"
                  ) && (
                    <>
                      <MultiStepComponent
                        displaySteps={true}
                        steps={selectedSubmissionData.data.programId.form}
                        defaultValues={{
                          ...selectedSubmissionData?.data.formData
                            .submittedData,
                        }}
                        isProgramSubmission={true}
                      />
                    </>
                  )}
                  {selectedSubmissionData.data.formData.hasOwnProperty(
                    "fileData"
                  ) && (
                    <>
                      <MultiStepComponent
                        displaySteps={true}
                        steps={selectedSubmissionData.data.programId.form}
                        defaultValues={{
                          ...selectedSubmissionData?.data.formData.fileData,
                        }}
                        isProgramSubmission={true}
                      />
                    </>
                  )}
                </>
              ) : (
                <span>No data selected</span>
              )}
            </>
          </Modal>
          <Popconfirm
            title="Are you sure to delete this submission?"
            onConfirm={async () => {
              await CrudService.delete("ProgramSubmission", record.data._id);

              const data = submittedProgramData.filter?.(
                (a) => a._id !== record.data._id
              );
              setSubmittedProgramData(data);
            }}
          >
            <Button danger>Delete Submission</Button>
          </Popconfirm>

          {record.data.formData.hasOwnProperty("submittedData") &&
            activeTab === "waiting" && (
              <>
                {record.data.status === "not-approve" && (
                  <>
                    <Button
                      type={"primary"}
                      onClick={async () => {
                        const updatedSubmission = await CrudService.update(
                          "ProgramSubmission",
                          record.data._id,
                          { status: "approve" }
                        );
                        if (updatedSubmission) {
                          const updatedSubmissionDataList =
                            submittedProgramData.map((item) => {
                              if (item._id === record.data._id) {
                                return { ...item, status: "approve" };
                              }
                              return item;
                            });
                          setSubmittedProgramData(updatedSubmissionDataList);
                        }
                      }}
                    >
                      Approve Submission
                    </Button>
                    <Popconfirm
                      title="Are you sure to reject this submission?"
                      onConfirm={async () => {
                        const updatedSubmission = await CrudService.update(
                          "ProgramSubmission",
                          record.data._id,
                          { status: "reject" }
                        );
                        if (updatedSubmission) {
                          const updatedSubmissionDataList =
                            submittedProgramData.map((item) => {
                              if (item._id === record.data._id) {
                                return { ...item, status: "reject" };
                              }
                              return item;
                            });
                          setSubmittedProgramData(updatedSubmissionDataList);
                        }
                      }}
                    >
                      <Button danger>Reject Submission</Button>
                    </Popconfirm>
                  </>
                )}
              </>
            )}
        </Space>
      ),
    },
  ];

  const qualificationColumns = [
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
    },
    {
      title: "Submission Type",
      dataIndex: "submissionType",
      key: "submissionType",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag
          color={
            text === "Submitted"
              ? "green"
              : text === "Waiting"
              ? "orange"
              : text === "Approved"
              ? "green"
              : "red"
          }
        >
          {text === "Waiting" ? "Submitted" : text}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (text) => (
        <time dateTime={text} className="mr-2">
          {moment(text).format("Do MMM, YYYY")}
        </time>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (record) => (
        <Space size={[12, 10]} wrap>
          <Button
            className="px-2 py-1 text-sm rounded"
            type="primary"
            onClick={() => {
              handleViewSubmission(record);
            }}
          >
            View Submission
          </Button>

          <Modal
            width={800}
            height={300}
            open={submissionModal}
            onOk={() => setSubmissionModal(false)}
            onCancel={() => {
              setSubmissionModal(false);
              setSelectedSubmissionData(null);
            }}
          >
            <>
              {selectedSubmissionData &&
              selectedSubmissionData.data.formData ? (
                <>
                  <h2 className={"text-lg font-bold mb-2"}>Submitted Data</h2>
                  {selectedSubmissionData.data.formData.hasOwnProperty(
                    "submittedData"
                  ) && (
                    <>
                      <MultiStepComponent
                        displaySteps={true}
                        steps={selectedSubmissionData.data.programId.form}
                        defaultValues={{
                          ...selectedSubmissionData?.data.formData
                            .submittedData,
                        }}
                        isProgramSubmission={true}
                      />
                    </>
                  )}
                  {selectedSubmissionData.data.formData.hasOwnProperty(
                    "fileData"
                  ) && (
                    <>
                      <MultiStepComponent
                        displaySteps={true}
                        steps={selectedSubmissionData.data.programId.form}
                        defaultValues={{
                          ...selectedSubmissionData?.data.formData.fileData,
                        }}
                        isProgramSubmission={true}
                      />
                    </>
                  )}
                </>
              ) : (
                <span>No data selected</span>
              )}
            </>
          </Modal>
          <Popconfirm
            title="Are you sure to delete this submission?"
            onConfirm={async () => {
              await CrudService.delete("ProgramSubmission", record.data._id);

              const data = submittedProgramData.filter?.(
                (a) => a._id !== record.data._id
              );
              setSubmittedProgramData(data);
            }}
          >
            <Button danger>Delete Submission</Button>
          </Popconfirm>

          {record.data.formData.hasOwnProperty("submittedData") && (
            <>
              {record.data.status === "not-approve" && (
                <>
                  <Button
                    type={"primary"}
                    onClick={async () => {
                      const updatedSubmission = await CrudService.update(
                        "ProgramSubmission",
                        record.data._id,
                        { status: "approve" }
                      );
                      if (updatedSubmission) {
                        if (qualificationActiveTab === "qualified") {
                          const updatedDataList = qualificationData.map(
                            (item) => {
                              if (item._id === record.data._id) {
                                return { ...item, status: "approve" };
                              }
                              return item;
                            }
                          );
                          setQualificationData(updatedDataList);
                        } else {
                          const updatedDataList = unQualificationData.map(
                            (item) => {
                              if (item._id === record.data._id) {
                                return { ...item, status: "approve" };
                              }
                              return item;
                            }
                          );
                          setUnQualificationData(updatedDataList);
                        }

                        const updatedSubmissionDataList =
                          submittedProgramData.map((item) => {
                            if (item._id === record.data._id) {
                              return { ...item, status: "approve" };
                            }
                            return item;
                          });
                        setSubmittedProgramData(updatedSubmissionDataList);
                      }
                    }}
                  >
                    Approve Submission
                  </Button>
                  <Popconfirm
                    title="Are you sure to reject this submission?"
                    onConfirm={async () => {
                      const updatedSubmission = await CrudService.update(
                        "ProgramSubmission",
                        record.data._id,
                        { status: "reject" }
                      );
                      if (updatedSubmission) {
                        if (qualificationActiveTab === "qualified") {
                          const updatedDataList = qualificationData.map(
                            (item) => {
                              if (item._id === record.data._id) {
                                return { ...item, status: "reject" };
                              }
                              return item;
                            }
                          );

                          setQualificationData(updatedDataList);
                        } else {
                          const updatedDataList = unQualificationData.map(
                            (item) => {
                              if (item._id === record.data._id) {
                                return { ...item, status: "reject" };
                              }
                              return item;
                            }
                          );
                          setUnQualificationData(updatedDataList);
                        }

                        const updatedSubmissionDataList =
                          submittedProgramData.map((item) => {
                            if (item._id === record.data._id) {
                              return { ...item, status: "reject" };
                            }
                            return item;
                          });
                        setSubmittedProgramData(updatedSubmissionDataList);
                      }
                    }}
                  >
                    <Button danger>Reject Submission</Button>
                  </Popconfirm>
                </>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleAddQuestionSet = () => {
    const newId = questionSets.length + 1;
    setDisabledAddSetButton(true);
    setQuestionSets([
      ...questionSets,
      {
        id: newId,
        fieldName: "",
        fieldAnswer: "",
        qualifyOption: "include",
        operator: "",
      },
    ]);
  };

  const handleRemoveQuestionSet = (id, index) => {
    setQuestionSets((prevSets) => prevSets.filter((set) => set.id !== id));
    const currentSet = questionSets.filter((set) => set.id !== id);
    const lastSetIndex = questionSets.length - 1;
    if (lastSetIndex === index) {
      const prevId = currentSet[currentSet.length - 1].id;
      setQuestionSets((prevSets) =>
        prevSets.map((set) =>
          set.id === prevId ? { ...set, operator: "" } : set
        )
      );
    }
  };

  const handleQualifyOptionChange = (value, id) => {
    setQuestionSets((prevSets) =>
      prevSets.map((set) =>
        set.id === id ? { ...set, qualifyOption: value } : set
      )
    );
    const currentSet = questionSets.find((set) => set.id === id);
    if (currentSet.id === id) {
      currentSet.qualifyOption = value;
    }
    checkSetValidation(id);
  };

  const handleFieldAnswerChange = (value, id) => {
    setQuestionSets((prevSets) =>
      prevSets.map((set) =>
        set.id === id ? { ...set, fieldAnswer: value } : set
      )
    );

    const currentSet = questionSets.find((set) => set.id === id);
    if (currentSet.id === id) {
      currentSet.fieldAnswer = value;
    }
    checkSetValidation(id);
  };

  const onQualificationOperatorsChange = (value, id) => {
    setQuestionSets((prevSets) =>
      prevSets.map((set) => (set.id === id ? { ...set, operator: value } : set))
    );
    const currentSet = questionSets.find((set) => set.id === id);
    if (currentSet.id === id) {
      if (!currentSet.operator) {
        handleAddQuestionSet();
      }
      currentSet.operator = value;
    }
    checkSetValidation(id);
  };

  const checkSetValidation = (id) => {
    const currentSet = questionSets.find((set) => set.id === id);

    const isCurrentSetIncomplete =
      !currentSet.fieldName || !currentSet.fieldAnswer;

    const isAnySetIncomplete = questionSets.some(
      (set) => !set.fieldName || !set.fieldAnswer
    );

    setDisabledAddSetButton(isAnySetIncomplete || isCurrentSetIncomplete);
  };

  const handleQualifications = () => {
    setProgramFields([]);
    setProgramFieldsAnswers([]);
    setQualificationModal(true);
    setQualificationData([]);
    setUnQualificationData([]);
    setQuestionSets([
      {
        id: 1,
        fieldName: "",
        fieldAnswer: "",
        qualifyOption: "include",
        operator: "",
      },
    ]);

    const fields = programData.form.flatMap((item) =>
      item.form.map((data) => ({
        value: data.fieldName,
        label: data.label,
      }))
    );
    setProgramFields(fields);
  };

  const handleQualificationModalClose = () => {
    setQualificationModal(false);
    setQualificationData([]);
    setUnQualificationData([]);
    setQuestionSets([
      {
        id: 1,
        fieldName: "",
        fieldAnswer: "",
        qualifyOption: "include",
        operator: "",
      },
    ]);
    setProgramFields([]);
    setProgramFieldsAnswers([]);
  };

  const handleSelectProgramField = (value, id) => {
    setProgramFieldsAnswers([]);
    const matchField = value;
    const answers = [];
    const answersOptions = [];
    submittedProgramData.map((item) => {
      if (item.formData.hasOwnProperty("submittedData")) {
        Object.entries(item.formData.submittedData).map(([key, value]) => {
          if (key === matchField) {
            if (!answers.includes(value)) {
              answers.push(value);
              answersOptions.push({ value: value, label: value });
            }
          }
        });
      }
    });

    setQuestionSets((prevSets) =>
      prevSets.map((set) =>
        set.id === id ? { ...set, fieldName: value, fieldAnswer: "" } : set
      )
    );

    const currentSet = questionSets.find((set) => set.id === id);
    if (currentSet.id === id) {
      currentSet.fieldAnswer = "";
    }

    checkSetValidation(id);
    setProgramFieldsAnswers(answersOptions);
  };

  const handleQualificationSearch = () => {
    setShowLoader(true);
    const orFilter = [];
    const matchConditions = {};

    questionSets.forEach((qualification) => {
      const { fieldName, fieldAnswer, qualifyOption, operator } = qualification;
      const condition = {};
      condition[`formData.submittedData.${fieldName}`] = fieldAnswer;

      if (qualifyOption === "exclude") {
        condition[`formData.submittedData.${fieldName}`] = { $ne: fieldAnswer };
      }

      if (operator === "or") {
        orFilter.push(condition);
      } else {
        Object.assign(matchConditions, condition);
      }

      if (orFilter.length > 0) {
        matchConditions["$or"] = orFilter;
      }
    });

    const id = searchParams.get("id");
    if (!id) return;
    CrudService.search("ProgramSubmission", 1000, PAGE_NUMBER, {
      filters: {
        programId: id,
        status: "not-approve",
        ...matchConditions,
      },
      sort: { createdAt: -1 },
    }).then((res) => {
      if (!res) return;
      const qualifiedDataIds = res.data.items.map((item) => item._id);
      const qualifiedOriginalData = submittedProgramData.filter(
        (item) =>
          qualifiedDataIds.includes(item._id) && item.formData.submittedData
      );
      const unQualifiedOriginalData = submittedProgramData.filter(
        (item) =>
          !qualifiedDataIds.includes(item._id) &&
          item.formData.submittedData &&
          item.status === "not-approve"
      );
      setQualificationData(qualifiedOriginalData);
      setUnQualificationData(unQualifiedOriginalData);
      setShowLoader(false);
    });
  };

  if (!programData) return <Skeleton active />;
  if (!suite) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
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
              title: programData?.name ?? "",
            },
          ]}
        />

        <div className="text-3xl font-extrabold text-indigo-900 mb-4">
          <Typography.Title
            level={2}
            editable={{
              onChange: async (e) => {
                const id = searchParams.get("id");
                if (!id) return;

                await CrudService.update("Program", id, { name: e });
                CrudService.getSingle("Program", id).then((res) => {
                  if (!res.data) return;
                  setProgramData(res.data);
                });
              },
              text: programData.name,
            }}
          >
            {programData.name}
          </Typography.Title>
        </div>
        <div className="text-lg text-indigo-700 mb-6">
          <Typography.Paragraph
            editable={{
              onChange: async (e) => {
                const id = searchParams.get("id");
                if (!id) return;

                await CrudService.update("Program", id, { description: e });
                CrudService.getSingle("Program", id).then((res) => {
                  if (!res.data) return;
                  setProgramData(res.data);
                });
              },
              text: programData.description,
            }}
          >
            {programData.description}
          </Typography.Paragraph>
        </div>
        <Divider />

        <div>
          <Space>
            <h3 className="text-lg font-bold">Sharing Link</h3>
            <Tooltip title="Share this link with your beneficiaries, experts, or donors, beseeching them to partake in your program. Authentication within the application will be required to participate in your program. If they have not yet registered, do not worry! Upon visiting the sharing link, they will run through a simple registration form, and afterwards be redirected to your program's realm without delay.">
              <GrInfo />
            </Tooltip>
          </Space>
        </div>

        <div>
          <Space
            className="cursor-pointer text-indigo-400 font-bold"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `${window.location.origin}/dashboard/programform?id=${programData._id}`
              );
              message.success("Copied to clipboard");
            }}
          >
            <span>
              {window.location.origin}/dashboard/programform?id=
              {programData._id}
            </span>
            <FaCopy />
          </Space>
        </div>

        <div className="mt-3">
          <Button
            type="primary"
            onClick={() => {
              setDataSummeryModal(true);
            }}
          >
            View Data Summary
          </Button>
          <Modal
            width={1000}
            open={dataSummeryModal}
            onOk={() => setDataSummeryModal(false)}
            onCancel={() => setDataSummeryModal(false)}
          >
            <MultiStepComponent
              displaySteps={true}
              steps={programData?.form}
              isDataSummary={true}
              defaultValues={{
                ...dataSummary,
              }}
              isProgramSubmission={true}
            />
          </Modal>
        </div>
        <Divider />
        <div className="d-flex items-center pb-4">
          <Space size={24}>
            <h3 className="text-lg font-bold">Client Overview</h3>
            <Button
              type="primary"
              onClick={handleQualifications}
              className="px-2"
            >
              Qualifications
            </Button>
            <Modal
              width={1500}
              open={qualificationModal}
              onOk={handleQualificationModalClose}
              onCancel={handleQualificationModalClose}
            >
              <h3 className="text-lg font-bold">Qualifications Data</h3>
              <Divider />
              <div className={"qualification-modal-spinner"}>
                {showLoader && (
                  <>
                    <LoadingSpinner />
                  </>
                )}
                {questionSets.map((questionSet, index) => (
                  <div
                    className={"qualification-modal-form"}
                    key={questionSet.id}
                  >
                    <div className={"qualification-select"}>
                      <h4>Select Question</h4>
                      <Select
                        options={programFields}
                        value={questionSet.fieldName}
                        onChange={(value) =>
                          handleSelectProgramField(value, questionSet.id)
                        }
                      />
                    </div>

                    <div className={"qualification-options"}>
                      <h4>Select Qualify Option</h4>
                      <Radio.Group
                        onChange={(e) =>
                          handleQualifyOptionChange(
                            e.target.value,
                            questionSet.id
                          )
                        }
                        value={questionSet.qualifyOption}
                      >
                        <Radio defaultChecked={true} value="include">
                          {" "}
                          Include{" "}
                        </Radio>
                        <Radio value="exclude"> Exclude </Radio>
                      </Radio.Group>
                    </div>

                    <div className={"qualification-select"}>
                      <h4>Select Submitted Answer</h4>
                      <Select
                        disabled={!questionSet.fieldName}
                        options={programFieldsAnswers}
                        value={questionSet.fieldAnswer}
                        onChange={(value) =>
                          handleFieldAnswerChange(value, questionSet.id)
                        }
                      />
                    </div>

                    <div className={"qualification-options"}>
                      <h4>Select Operator</h4>
                      <Radio.Group
                        onChange={(e) =>
                          onQualificationOperatorsChange(
                            e.target.value,
                            questionSet.id
                          )
                        }
                        value={questionSet.operator}
                        disabled={disabledAddSetButton}
                      >
                        <Radio value="and"> AND </Radio>
                        <Radio value="or"> OR </Radio>
                      </Radio.Group>
                    </div>

                    {questionSet.id > 1 && (
                      <Button
                        type="primary"
                        onClick={() =>
                          handleRemoveQuestionSet(questionSet.id, index)
                        }
                      >
                        Remove Criteria Set
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <Button type={"primary"} onClick={handleQualificationSearch}>
                  Search
                </Button>
              </div>
              <Divider />
              <div>
                <Tabs
                  activeKey={qualificationActiveTab}
                  onChange={(key) => setQualificationActiveTab(key)}
                >
                  <TabPane key="qualified" tab="Qualified">
                    {qualificationData.length > 0 ? (
                      <Table
                        dataSource={qualificationData.map((item, index) => ({
                          key: index,
                          userName:
                            item.user_id?.firstName +
                            " " +
                            item.user_id?.lastName,
                          userEmail: item.user_id?.email,
                          submissionType:
                            (item.formData.hasOwnProperty("submittedData") &&
                              "Online") ||
                            (item.formData.hasOwnProperty("fileData") &&
                              "Imported Data"),
                          status: (() => {
                            if (item.status === "reject") {
                              return "Rejected";
                            } else if (item.status === "approve") {
                              return "Approved";
                            } else {
                              return "Waiting";
                            }
                          })(),
                          data: item,
                        }))}
                        columns={qualificationColumns}
                        pagination={false}
                        bordered={false}
                        scroll={{ x: "700px" }}
                        rowKey="_id"
                      />
                    ) : (
                      <div>
                        <strong>No Qualified Data Found</strong>
                      </div>
                    )}
                  </TabPane>
                  <TabPane key="unQualified" tab="UnQualified">
                    {unQualificationData.length > 0 ? (
                      <Table
                        dataSource={unQualificationData.map((item, index) => ({
                          key: index,
                          userName:
                            item.user_id?.firstName +
                            " " +
                            item.user_id?.lastName,
                          userEmail: item.user_id?.email,
                          submissionType:
                            (item.formData.hasOwnProperty("submittedData") &&
                              "Online") ||
                            (item.formData.hasOwnProperty("fileData") &&
                              "Imported Data"),
                          status: (() => {
                            if (item.status === "reject") {
                              return "Rejected";
                            } else if (item.status === "approve") {
                              return "Approved";
                            } else {
                              return "Waiting";
                            }
                          })(),
                          data: item,
                        }))}
                        columns={qualificationColumns}
                        pagination={false}
                        bordered={false}
                        scroll={{ x: "700px" }}
                        rowKey="_id"
                      />
                    ) : (
                      <div>
                        <strong> No Un Qualified Data Found </strong>
                      </div>
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </Modal>
          </Space>
        </div>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <TabPane tab="All" key="all">
            {submittedProgramData.length > 0 ? (
              <Table
                dataSource={submittedProgramData.map((item, index) => ({
                  key: index,
                  userName:
                    item.user_id?.firstName + " " + item.user_id?.lastName,
                  userEmail: item.user_id?.email,
                  submissionType:
                    (item.formData.hasOwnProperty("submittedData") &&
                      "Online") ||
                    (item.formData.hasOwnProperty("fileData") &&
                      "Imported Data"),
                  status: (() => {
                    if (
                      item.formData.isFinishClicked &&
                      item.formData.hasOwnProperty("fileData")
                    ) {
                      return "Approved";
                    } else if (item.status === "reject") {
                      return "Rejected";
                    } else if (item.status === "approve") {
                      return "Approved";
                    } else {
                      return "Waiting";
                    }
                  })(),
                  data: item,
                }))}
                columns={columns}
                pagination={false}
                bordered={false}
                scroll={{ x: "700px" }}
                rowKey="_id"
              />
            ) : (
              <div>
                <strong>No Submission Data Found</strong>
              </div>
            )}
          </TabPane>
          <TabPane tab="Approved" key="approved">
            {submittedProgramData.length > 0 ? (
              <Table
                dataSource={submittedProgramData
                  .filter((item) => item.status === "approve")
                  .map((item, index) => ({
                    key: index,
                    userName:
                      item.user_id?.firstName + " " + item.user_id?.lastName,
                    userEmail: item.user_id?.email,
                    submissionType:
                      (item.formData.hasOwnProperty("submittedData") &&
                        "Online") ||
                      (item.formData.hasOwnProperty("fileData") &&
                        "Imported Data"),
                    status: (() => {
                      if (
                        item.formData.isFinishClicked &&
                        item.formData.hasOwnProperty("fileData")
                      ) {
                        return "Approved";
                      } else if (item.status === "reject") {
                        return "Rejected";
                      } else if (item.status === "approve") {
                        return "Approved";
                      } else {
                        return "Waiting";
                      }
                    })(),
                    data: item,
                  }))}
                columns={columns}
                pagination={false}
                bordered={false}
                scroll={{ x: "700px" }}
                rowKey="_id"
              />
            ) : (
              <div>
                <strong> No Approved Submission Data Found </strong>
              </div>
            )}
          </TabPane>
          <TabPane tab="Waiting List" key="waiting">
            {submittedProgramData.length > 0 ? (
              <Table
                dataSource={submittedProgramData
                  .filter((item) => item.status === "not-approve")
                  .map((item, index) => ({
                    key: index,
                    userName:
                      item.user_id?.firstName + " " + item.user_id?.lastName,
                    userEmail: item.user_id?.email,
                    submissionType:
                      (item.formData.hasOwnProperty("submittedData") &&
                        "Online") ||
                      (item.formData.hasOwnProperty("fileData") &&
                        "Imported Data"),
                    status: (() => {
                      if (
                        item.formData.isFinishClicked &&
                        item.formData.hasOwnProperty("fileData")
                      ) {
                        return "Approved";
                      } else if (item.status === "reject") {
                        return "Rejected";
                      } else if (item.status === "approve") {
                        return "Approved";
                      } else {
                        return "Waiting";
                      }
                    })(),
                    data: item,
                  }))}
                columns={columns}
                pagination={false}
                bordered={false}
                scroll={{ x: "700px" }}
                rowKey="_id"
              />
            ) : (
              <div>
                <strong> No Waiting Submission Data Found </strong>
              </div>
            )}
          </TabPane>
          <TabPane tab="Rejected" key="reject">
            {submittedProgramData.length > 0 ? (
              <Table
                dataSource={submittedProgramData
                  .filter((item) => item.status === "reject")
                  .map((item, index) => ({
                    key: index,
                    userName:
                      item.user_id?.firstName + " " + item.user_id?.lastName,
                    userEmail: item.user_id?.email,
                    submissionType:
                      (item.formData.hasOwnProperty("submittedData") &&
                        "Online") ||
                      (item.formData.hasOwnProperty("fileData") &&
                        "Imported Data"),
                    status: (() => {
                      if (
                        item.formData.isFinishClicked &&
                        item.formData.hasOwnProperty("fileData")
                      ) {
                        return "Approved";
                      } else if (item.status === "reject") {
                        return "Rejected";
                      } else if (item.status === "approve") {
                        return "Approved";
                      } else {
                        return "Waiting";
                      }
                    })(),
                    data: item,
                  }))}
                columns={columns}
                pagination={false}
                bordered={false}
                scroll={{ x: "700px" }}
                rowKey="_id"
              />
            ) : (
              <div>
                <strong> No Rejected Submission Data Found </strong>
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default ProgramDetails;

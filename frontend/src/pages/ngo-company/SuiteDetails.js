import { Allotment } from "allotment";
import "allotment/dist/style.css";
import {
  Alert,
  Button,
  Divider,
  Modal,
  Pagination,
  Popconfirm,
  Skeleton,
  Space,
  Tabs,
  Tooltip,
  Typography,
  message,
  Progress,
  Col,
  Row,
  Card,
  Table,
  Tag,
  Input,
  Select
} from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaCopy, FaInfo } from "react-icons/fa";
import { GrCircleInformation, GrInfo } from "react-icons/gr";
import { useNavigate, useSearchParams } from "react-router-dom";
import CloudinaryUpload from "../../components/CloudinaryUpload";
import LoadingSpinner from "../../components/Loader";
import MultiStepComponent from "../../components/MultiStepComponent";
import StatsDashboard from "../../components/StatsDashboard";
import CrudService from "../../service/CrudService";
import StrapiService from "../../service/StrapiService";
import {AiOutlineArrowRight, AiOutlineCheckCircle, AiOutlineCloseCircle} from "react-icons/ai";
import AuthService from "../../service/AuthService";
import { TweenOneGroup } from "rc-tween-one";
import {Option} from "antd/es/mentions";
import ExcelImport from "../../components/ExcelImport";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

const SuiteDetails = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [KPIs, setKPIs] = useState([]);
  const [allKPIs, setAllKPIs] = useState([]);
  const [categoryKPIs, setCategoryKPIs] = useState([]);
  const [KPIModal, setKPIModal] = useState(false);
  const [KPILinkedQuestionModal, setKPILinkedQuestionModal] = useState(false);
  const [selectedKPIForLinkedQuestion, setSelectedKPIForLinkedQuestion] = useState('');
  const [KPILinkedQuestionAssessments, setKPILinkedQuestionAssessments] = useState([]);
  const [assessmentType, setAssessmentType] = useState("enrollment");
  const [activeTab, setActiveTab] = useState("programOverview");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(
    "Enrollment Assessment"
  );
  const [assessmentData, setAssessmentData] = useState([]);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [kpiSearch, setKPISearch] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [hasKPIs, setHasKPIs] = useState(false);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [hasPublishAssessment, setHasPublishAssessment] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState([]);
  const inputRef = useRef(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const [reminderType, setReminderType] = useState('')
  const [programCategoryName, setProgramCategoryName] = useState('')
  const [reminderUpdateLoader, setReminderUpdateLoader] = useState(false)
  const [KPILoader, setKPILoader] = useState(false)
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (inputVisible) {
        inputRef.current?.focus();
        setIsEmailError(inputRef.current.input.value === '')
    }
  }, [inputVisible]);

  const handleClose = (removedTag, field) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
    onChange(field, newTags)
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    const isEmailTouched = e.target.value !== null && e.target.value !== undefined && e.target.value !== '';
    const isEmailError = !isEmailTouched;
    setIsEmailError(isEmailError)
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value);
    setIsEmailValid(valid)
  };
  const handleInputConfirm = () => {
    if (!isEmailValid) {
        setInputVisible(inputValue !== '');
    } else {
        if (inputValue && tags.indexOf(inputValue) === -1) {
            setTags([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    }
  };

  const forMap = (tag) => {
    const tagElem = (
        <Tag
            closable
            onClose={(e) => {
                e.preventDefault();
                handleClose(tag);
            }}
        >
            {tag}
        </Tag>
    );
    return (
        <span
            key={tag}
            style={{
                display: 'inline-block',
            }}
        >
            {tagElem}
          </span>
    );
  };

  const tagChild = tags.map(forMap);
  const tagPlusStyle = {
    borderStyle: 'dashed',
  };

  const errorEmailMessage =
    (isEmailError && `Email is required`) ||
    (!isEmailValid && 'Please enter a valid email address');

  const load = useCallback(() => {
    const id = searchParams.get("id");
    const action = searchParams.get("action");
    if (!id) return;

    setActiveTab("programOverview");
    // setKPIs([])
    // setCategoryKPIs([])

    CrudService.getSingle("Suite", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
      setProgramCategoryName((res.data.hasOwnProperty('categoryDetail') && res.data.categoryDetail.Name) && res.data.categoryDetail.Name )
      setReminderType((res.data.hasOwnProperty('reminderType') && res.data.reminderType) ? res.data.reminderType : '')
      setHasKPIs(!!(res.data.KPIs && res.data.KPIs.length > 0));
      (percentage > 0 && (hasAssessment || hasPublishAssessment)) ? setPercentage(res.data.KPIs && res.data.KPIs.length > 0 ? percentage + 33.33 : 0) : setPercentage(res.data.KPIs && res.data.KPIs.length > 0 ? 33.33 : 0);
    });

    if (action === 'baseline') {
        setActiveTab('assessments')
    }
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    StrapiService.getCoreProgramMetrics().then(({ data }) => {
      setAllKPIs(data)
      setKPISearch('')
    });
  }, []);

  useEffect(() => {
    setAssessmentData([]);
    setTotalAssessments(0);
    const fetchData = async () => {
        if (!programData) return;
      await updateAssessmentData(
        assessmentType,
        limit,
        page,
        setAssessmentData,
        setTotalAssessments,
        setPage
      );
    };
    fetchData();
  }, [programData]);

  const fetchAssessmentData = async (
    assessmentType,
    limit,
    page
  ) => {
    setShowLoader(true);

    const assessmentRes = await CrudService.search("Program", 1, 1, { filters: { suite: programData._id, isDefaultAssessment: false } });
    const publishAssessmentRes = await CrudService.search("Program", 1, 1, { filters: { suite: programData._id, isDefaultAssessment: false, published: true } });
    const assessmentPercentage = assessmentRes.data && assessmentRes.data.items && assessmentRes.data.items.length > 0 ? 33.33 : 0;
    const publishAssessmentPercentage = publishAssessmentRes.data && publishAssessmentRes.data.items && publishAssessmentRes.data.items.length > 0 ? 33.34 : 0;
    setPercentage(percentage + assessmentPercentage + publishAssessmentPercentage);
    setHasAssessment(!!(assessmentRes.data && assessmentRes.data.items && assessmentRes.data.items.length > 0))
    setHasPublishAssessment(!!(publishAssessmentRes.data && publishAssessmentRes.data.items && publishAssessmentRes.data.items.length > 0))

    const data = {
      filters: { suite: programData._id, assessmentType }
    };
    const response = await CrudService.search("Program", limit, page, data);
    return response.data;
  };

const updateAssessmentData = async (
    assessmentType,
    limit,
    page,
    setAssessmentData,
    setTotalAssessments,
    setPage
  ) => {
    const assessmentData = await fetchAssessmentData(
      assessmentType,
      limit,
      page
    );
    setAssessmentData(assessmentData.items);
    setTotalAssessments(assessmentData.total);
    setShowLoader(false);
  };

  const onAssessmentTabChange = async (assessment) => {
    setAssessmentData([]);
    setTotalAssessments(0);
    setAssessmentType(assessment);
    const selectedType = assessmentTypes.find(
      (type) => type.key === assessment
    ).label;
    setSelectedAssessmentType(selectedType);

    if (assessment) {
      await updateAssessmentData(
        assessment,
        limit,
        page,
        setAssessmentData,
        setTotalAssessments,
        setPage
      );
    }
  };

  const onProgramTabChange = (type) => {
      setActiveTab(type)
      if (type === "applications") {
          setTags([]);
      }
  }

  const filterKPIs = (kpi, searchKPI) => {
    return !searchKPI || kpi.MetricName.toLowerCase().includes(searchKPI.toLowerCase());
  };

  const handleKPISearchChange = (event) => {
    const value = event.target.value;
    setKPISearch(value);

    setTimeout(() => {
      const filteredKPIs = categoryKPIs.filter((kpi) => filterKPIs(kpi, value));
      setKPIs(filteredKPIs || categoryKPIs);
    }, 500);
  };

  const handleViewKPILinkedQuestion = async (selectedKPI) => {
      setShowLoader(true)
      setKPILinkedQuestionAssessments([])
      setKPILinkedQuestionModal(true)
      setSelectedKPIForLinkedQuestion(selectedKPI)

      const data = {
          filters: {
              "form.form.kpi": selectedKPI
          }
      };
      const response = await CrudService.search("Program", limit, page, data);
      setKPILinkedQuestionAssessments(response.data.items)
      setShowLoader(false)
  }

  const handleAddUserClick = async (e) => {
      await AuthService.generateLinkToInviteUser({
          program: programData,
          invitePeopleEmails: tags,
          type: "suite"
      }).then((res) => {
          if (!res) return;

          setTags([])
          load();
      });
  }

  const handleKPIMetricsReminderChange = async (value) => {
    if (value) {
        setReminderType(value)
    }
  }

  const handleKPIMetricsReminderUpdate = async (value) => {
      if (value && value !== programData.reminderType) {
          setReminderUpdateLoader(true)
          const id = searchParams.get("id");
          if (!id) return;

          await CrudService.update("Suite", id, {
              reminderType: value
          }).then(res => {
              setProgramData(res.data)
          });
          setReminderUpdateLoader(false)
      }
  }

  const KPIsColumns = [
    {
        title: 'Metric Name',
        dataIndex: 'MetricName',
        key: 'MetricName',
        width: 200,
    },
    {
        title: 'Definition',
        dataIndex: 'Definition',
        key: 'Definition',
        width: 400,
    },
    {
        title: 'Calculation',
        dataIndex: 'Calculation',
        key: 'Calculation',
        width: 200,
        render: (text) => text || 'No Calculation',
    },
    {
        title: 'Sustainable Development Goals',
        dataIndex: 'sustainable_development_goals',
        key: 'sustainable_development_goals',
        width: 250,
        render: (sdgs) => (
            <ul role="list" className="list-disc space-y-1 pl-2">
                {sdgs?.map((sdg) => (
                    <li key={sdg.ID} className="flex items-center">
                        <img
                            className="h-8 w-auto rounded-md"
                            src={`/images/sdg-icons/E_WEB_${sdg.ID}.png`}
                            alt={sdg.Name}
                        />
                        <span className="px-1">{sdg.Name}</span>
                    </li>
                ))}
            </ul>
        ),
    },
    {
        title: 'Actions',
        key: 'actions',
        width: 300,
        render: (metric) => (
            <Space size={[12, 10]} wrap>
                <Popconfirm
                    title="Are you sure to delete?"
                    onConfirm={async () => {
                        const id = searchParams.get("id");
                        if (!id) return;
                        await CrudService.update("Suite", id, {
                            KPIs: [
                                ...(programData?.KPIs?.filter?.(
                                    (e) => e !== metric._id.toString()
                                ) ?? []),
                            ],
                        }).then((res) => {
                            if (!res.data) return;
                            setProgramData(res.data)
                            setActiveTab('kpis')
                            setShowLoader(false)
                        });
                    }}
                >
                    <Button>Remove</Button>
                </Popconfirm>
                <Button
                    className="px-2 py-1 text-sm rounded"
                    type="primary"
                    onClick={() => handleViewKPILinkedQuestion(metric.MetricName)}
                >
                    View Linked Questions
                </Button>
            </Space>
        ),
    },
  ];

  const KPIsModalColumns = [
        {
            title: 'Metric Name',
            dataIndex: 'MetricName',
            key: 'MetricName',
            width: 200,
        },
        {
            title: 'Definition',
            dataIndex: 'Definition',
            key: 'Definition',
            width: 500,
        },
        {
            title: 'Calculation',
            dataIndex: 'Calculation',
            key: 'Calculation',
            width: 250,
            render: (text) => text || 'No Calculation',
        },
        {
            title: 'Sustainable Development Goals',
            dataIndex: 'sustainable_development_goals',
            key: 'sustainable_development_goals',
            width: 350,
            render: (sdgs) => (
                <ul role="list" className="list-disc space-y-1 pl-2">
                    {sdgs?.map((sdg) => (
                        <li key={sdg.ID} className="flex items-center">
                            <img
                                className="h-8 w-auto rounded-md"
                                src={`/images/sdg-icons/E_WEB_${sdg.ID}.png`}
                                alt="Your Company"
                            />
                            <span className="px-1">{sdg.Name}</span>
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (metric) => (
                <div>
                    {!programData?.KPIs?.includes?.(metric._id.toString()) ? (
                        <Button
                            type="primary"
                            onClick={async () => {
                                setKPILoader(true)
                                const id = searchParams.get("id");
                                if (!id) return;
                                await CrudService.update("Suite", id, {
                                    KPIs: [
                                        ...(programData?.KPIs ?? []),
                                        metric._id.toString(),
                                    ],
                                }).then((res) => {
                                    if (!res.data) return;
                                    setProgramData(res.data)
                                    setActiveTab('kpis')
                                    setKPILoader(false)
                                });
                            }}
                        >
                            Add
                        </Button>
                    ) : (
                        <Button
                            danger
                            onClick={async () => {
                                setKPILoader(true)
                                const id = searchParams.get("id");
                                if (!id) return;
                                await CrudService.update("Suite", id, {
                                    KPIs: [
                                        ...(programData?.KPIs?.filter?.(
                                            (e) => e !== metric._id.toString()
                                        ) ?? []),
                                    ],
                                }).then((res) => {
                                    if (!res.data) return;
                                    setProgramData(res.data)
                                    setActiveTab('kpis')
                                    setKPILoader(false)
                                });
                            }}
                        >
                            Remove
                        </Button>
                    )}
                </div>
            ),
        },
    ];

  const assessmentColumns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => text || '-',
    },
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: 500,
        render: (text) => text || '-',
    },
    {
        title: 'Created Date',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 150,
        render: (text) => (
            <time dateTime={text} className="mr-2">
                {moment(text).format('Do MMM, YYYY')}
            </time>
        ),
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (text, record) => (
            <Space size={[12, 10]} wrap>
                <Tooltip title={(programData && !programData.published) ? 'Please publish the program first, and then proceed to enroll client.' : ''}>
                    <Button
                        className="py-1 text-sm rounded"
                        type="primary"
                        disabled={programData && !programData.published}
                        onClick={async () => {
                            navigate(`/dashboard/enrollmentpre?id=${record._id}`);
                        }}
                    >
                        Enroll Client
                    </Button>
                </Tooltip>
                <Button
                    className="px-2 py-1 text-sm rounded"
                    type="primary"
                    onClick={() => {
                        navigate(`/dashboard/programdetails?id=${record._id}`);
                    }}
                >
                    View Assessment
                </Button>
                <Button
                    className="px-2 py-1 text-sm rounded"
                    type="primary"
                    onClick={() => {
                        navigate(`/dashboard/programpre?id=${record._id}`);
                    }}
                >
                    Edit Assessment
                </Button>
                <Popconfirm
                    title="Are you sure to delete this assessment?"
                    onConfirm={async () => {
                        const res = await CrudService.delete("Program", record._id);
                        if (res) {
                            const totalPages = Math.ceil(totalAssessments / limit);
                            const isLastPage = page === totalPages;
                            const hasOneRecordOnLastPage = isLastPage && totalAssessments % limit === 1;
                            const updatedPage = hasOneRecordOnLastPage ? page - 1 : page;

                            await updateAssessmentData(
                                assessmentType,
                                limit,
                                updatedPage,
                                setAssessmentData,
                                setTotalAssessments,
                                setPage
                            );
                            setPage(updatedPage);
                        }
                    }}
                >
                    <Button danger>Delete Assessment</Button>
                </Popconfirm>
            </Space>
        ),
    },
  ];

  const enrollClientColumns = [
    {
        title: 'User Name',
        dataIndex: 'userName',
        key: 'userName',
        width: 200,
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: 400,
    },
    {
      title: 'Assessments',
      dataIndex: 'assessmentName',
      key: 'assessmentName',
      width: 400,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 200,
        render: (text) => (
            <Tag className={'capitalize'} color={text === 'registered' ? 'green' : 'red'}>{text}</Tag>
        ),
    },
  ];

  const assessmentTypes = [
    {
      key: "enrollment",
      label: "Enrollment Assessment",
    },
    {
      key: "impact",
      label: "Program Impact Assessment",
    },
  ];

  const programTab = [
    {
      key: "programOverview",
      label: "Program Overview",
      children: (
          <>
            <div className={'flex justify-between mb-4'}>
                <div className="text-3xl font-extrabold text-indigo-900">
                    <Typography.Title
                        level={2}
                        editable={{
                            onChange: async (e) => {
                                const id = searchParams.get("id");
                                if (!id) return;

                                await CrudService.update("Suite", id, { name: e });
                                CrudService.getSingle("Suite", id).then((res) => {
                                    if (!res.data) return;
                                    setProgramData(res.data);
                                });
                            },
                            text: programData?.name,
                        }}
                    >
                        {programData?.name}
                    </Typography.Title>
                </div>
                <Tooltip title={programData?.isFavorite ? 'Remove from Favorite': 'Add to Favorite'}>
                    {programData?.isFavorite ? (
                        <MdFavorite
                            className={'mx-5 cursor-pointer'}
                            color={'red'}
                            size={26}
                            onClick={async () => {
                                const id = searchParams.get("id");
                                if (!id) return;
                                await CrudService.update("Suite", id, {
                                    isFavorite: false,
                                }).then((res) => {
                                    if (res.data) {
                                        setProgramData(res.data)
                                    }
                                })
                            }}
                        />
                    ) : (
                        <MdFavoriteBorder
                            className={'mx-5 cursor-pointer'}
                            size={26}
                            onClick={async (value) => {
                                const id = searchParams.get("id");
                                if (!id) return;
                                await CrudService.update("Suite", id, {
                                    isFavorite: true,
                                }).then((res) => {
                                    if (res.data) {
                                        setProgramData(res.data)
                                    }
                                })
                            }}
                        />
                    )}
                </Tooltip>
            </div>
            <div className="text-lg text-indigo-700 mb-6">
              <Typography.Paragraph
                  editable={{
                    onChange: async (e) => {
                      const id = searchParams.get("id");
                      if (!id) return;

                      await CrudService.update("Suite", id, { description: e });
                      CrudService.getSingle("Suite", id).then((res) => {
                        if (!res.data) return;
                        setProgramData(res.data);
                      });
                    },
                    text: programData?.description,
                  }}
              >
                {programData?.description}
              </Typography.Paragraph>
            </div>

            <div>
              {programData?.categoryDetail?.Name && (
                  <p className={"py-2"}>
                    <strong>Category</strong>: {programData.categoryDetail.Name}
                  </p>
              )}
              {programData?.impactThemDetails &&
              programData?.impactThemDetails.length > 0 && (
                  <p className={"py-2"}>
                    <strong>Impact Theme</strong>:{" "}
                    {programData?.impactThemDetails.map(
                        (item, index) => (
                            <>
                              <span key={item._id}>{item.Name}</span>
                              {index !==
                              programData.impactThemDetails.length - 1
                                  ? ", "
                                  : ""}
                            </>
                        )
                    )}
                  </p>
              )}
              {programData?.strategicGoalDetails && (
                  <p className={"py-2"}>
                    <strong>Strategic Goal</strong>: {programData.strategicGoalDetails.Name}
                  </p>
              )}
              {programData?.deliveryModelDetails && (
                  <p className={"py-2"}>
                    <strong>Delivery Model</strong>: {programData.deliveryModelDetails.Name}
                  </p>
              )}
              {programData?.productDetails && (
                  <p className={"py-2"}>
                    <strong>Products And Services</strong>: {programData.productDetails.Name}
                  </p>
              )}
              {programData?.objectives && (
                  <p className={"py-2"}>
                    <strong>Objectives</strong>: {programData.objectives}
                  </p>
              )}
              {programData?.startDate && (
                  <p className={"py-2"}>
                    <strong>Start Date</strong>:{" "}
                    {moment(programData.startDate).format(
                        "LLLL"
                    )}
                  </p>
              )}
              {programData?.endDate && (
                  <p className={"py-2"}>
                    <strong>End Date</strong>:{" "}
                    {moment(programData.endDate).format(
                        "LLLL"
                    )}
                  </p>
              )}
            </div>

            <Divider />
            <Space>
              <Button
                  className="px-2 py-1 text-sm  rounded "
                  type="primary"
                  onClick={() => {
                    const id = searchParams.get("id");
                    if (!id) return;

                    navigate(`/dashboard/suitepre?id=${id}`);
                  }}
              >
                Edit Program
              </Button>
              <Popconfirm
                  title="Are you sure to duplicate this program?"
                  onConfirm={async () => {
                    const id = searchParams.get("id");
                    if (!id) return;
                    const { _id, createdAt, updatedAt, ...body } = {
                      ...programData,
                      name: programData.name + "-Copy",
                    };
                    const suite = await CrudService.create("Suite", body);
                    navigate(`/dashboard/suitepre?id=${suite.data._id}`);
                  }}
              >
                <Button type="primary">Duplicate Program</Button>
              </Popconfirm>
              <Popconfirm
                  title="Are you sure to delete this program?"
                  onConfirm={async () => {
                    const id = searchParams.get("id");
                    if (!id) return;
                    await CrudService.delete("Suite", id);
                    navigate("/dashboard/suite");
                  }}
              >
                <Button danger>Delete Program</Button>
              </Popconfirm>
            </Space>
          </>
      )
    },
    {
      key: "kpis",
      label: "KPIs",
      children: (
          <>
            <h3 className="text-lg font-bold">KPIs</h3>
            <Table
                dataSource={programData?.KPIs?.map?.((kpi) =>
                    allKPIs.find((k) => k._id.toString() === kpi)
                )?.filter?.((a) => !!a)}
                columns={KPIsColumns}
                rowKey={(record) => record._id}
                pagination={false}
                scroll={{ x: '700px'}}
            />
            <Button
                className="px-2 py-1 text-sm  rounded my-4"
                type="primary"
                onClick={() => {
                  setKPIs([])
                  setCategoryKPIs([])
                  setKPIModal(true);
                  setKPILoader(true);
                  StrapiService.getCoreProgramMetrics(programCategoryName && {impact_category: programCategoryName})
                      .then(({ data }) => {
                        setKPIs(data)
                        setCategoryKPIs(data);
                        setKPISearch('')
                      }).finally(() => {
                        setKPILoader(false);
                      });
                }}
            >
              Add KPI
            </Button>
            <Modal  width={1150} open={KPIModal} onCancel={() => setKPIModal(false)} onOk={() => setKPIModal(false)}>
              <div>
                <input
                    type="text"
                    name="search"
                    id="search"
                    placeholder="Search KPIs"
                    className="block w-col-9 mb-4 rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={kpiSearch}
                    onChange={handleKPISearchChange}
                />
              </div>
              <Table
                dataSource={KPIs.map(metric => ({
                    ...metric,
                    key: metric._id,
                }))}
                columns={KPIsModalColumns}
                rowKey={(record) => record._id}
                pagination={false}
                scroll={{ x: '700px'}}
                loading={KPILoader}
              />
            </Modal>
          </>
      )
    },
    {
      key: "assessments",
      label: "Assessments",
      children: (
          <>
            <div className="flex mb-3">
              <h3 className="text-lg font-bold">Assessments</h3>
              <Button
                  className="px-2 py-1 text-sm rounded mx-3"
                  type="primary"
                  onClick={async () => {
                    const program = await CrudService.create("Program", {
                      // programType: programData?.programType,
                      suite: programData._id,
                      name: "",
                      description: "",
                      // image: programData?.image,
                      published: false,
                      assessmentType: assessmentType,
                    });
                    navigate(
                        `/dashboard/programpre?id=${program.data._id}`
                    );
                  }}
              >
                Add {selectedAssessmentType}
              </Button>
            </div>
            <Tabs
                defaultActiveKey="1"
                items={assessmentTypes.map((item) => ({
                  ...item,
                  disabled: showLoader,
                }))}
                onChange={onAssessmentTabChange}
                indicatorSize={(origin) => origin - 16}
            />
            <div className={"relative assessments-tabs"}>
              {showLoader && (
                  <>
                    <LoadingSpinner />
                    {assessmentData.length <= 0 && <span className={"p-3"} />}
                  </>
              )}
              {assessmentData.length > 0 && (
                  <Table
                      dataSource={assessmentData}
                      columns={assessmentColumns}
                      pagination={false}
                      bordered={false}
                      scroll={{ x: '700px'}}
                      rowKey="_id"
                  />
              )}
              {totalAssessments > limit && (
                  <Pagination
                      className="my-3"
                      style={{ float: "right" }}
                      current={page}
                      pageSize={limit}
                      total={totalAssessments}
                      onChange={async (page) => {
                        setPage(page);
                        await updateAssessmentData(
                            assessmentType,
                            limit,
                            page,
                            setAssessmentData,
                            setTotalAssessments,
                            setPage
                        );
                      }}
                  />
              )}

              {assessmentData.length <= 0 && !showLoader && (
                  <span>{`No ${selectedAssessmentType} found`}</span>
              )}
            </div>
          </>
      )
    },
    {
      key: "metrics",
      label: "Metrics",
      children: (
          <>
              <h2 className={"font-bold"}>KPIs Reminder</h2>
              <Select
                  value={reminderType}
                  style={{ width: 180 }}
                  onChange={handleKPIMetricsReminderChange}
              >
                  <Option value="">Select type</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="annually">Annually</Option>
              </Select>
              <Button
                  className="px-2 ml-3 py-1 text-sm rounded"
                  type="primary"
                  onClick={() => handleKPIMetricsReminderUpdate(reminderType)}
                  disabled={!reminderType}
                  loading={reminderUpdateLoader}
              >
                  Update Reminder Type
              </Button>
              <Divider />
              <div className="relative">
                  <StatsDashboard />
              </div>
          </>
      )
    },
    {
      key: "applications",
      label: "Applications",
      children: (
          <div className="relative">
              {tags.length === 0 && (
                  <>
                  </>
              )}
              <div
                  style={{
                      marginBottom: 16,
                  }}
              >
                  <TweenOneGroup
                      enter={{
                          scale: 0.8,
                          opacity: 0,
                          type: 'from',
                          duration: 100,
                      }}
                      onEnd={(e) => {
                          if (e.type === 'appear' || e.type === 'enter') {
                              e.target.style = 'display: inline-block';
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
                          ref={inputRef}
                          type="text"
                          size="small"
                          style={{
                              width: 200,
                          }}
                          value={inputValue}
                          onChange={handleInputChange}
                          onBlur={handleInputConfirm}
                          onPressEnter={handleInputConfirm}
                      />
                      {errorEmailMessage && <div style={{ color: 'red' }}>{errorEmailMessage}</div>}
                  </>

              ) : (
                  <Tag onClick={showInput} style={tagPlusStyle}>
                      + Add New Email
                  </Tag>
              )}

              <ExcelImport
                  modalName={"Suite"}
                  targetMapping={[
                      {
                          value: "email",
                          label: "Email",
                          type: "string",
                      }
                  ]}
                  handleImport={async (e) => {
                      const mappedItems = e.mappedItems;
                      const fileEmails = [];

                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      mappedItems.forEach((item) => {
                          if (emailRegex.test(item.email) && !tags.includes(item.email)) {
                              fileEmails.push(item.email)
                          }
                      });

                      if (fileEmails.length > 0) {
                          setTags([...tags, ...fileEmails])
                      }
                  }}
                  fileInputRef={fileInputRef}
              />

              <div className="mt-4">
                  <Space>
                      <Button
                          type="primary"
                          onClick={() => {
                              fileInputRef.current.value = "";
                              fileInputRef.current.click();
                          }}
                      >
                          Import People Emails
                      </Button>

                      <Tooltip title={(programData && !programData.published) ? 'Please publish the program first, and then proceed to invite people.' : tags.length === 0 ? 'Add emails' : ''}>
                          <Button
                              className="px-2 py-1 text-sm rounded"
                              type="primary"
                              onClick={handleAddUserClick}
                              disabled={tags.length === 0 || (programData && !programData.published)}
                          >
                              Invite People
                          </Button>
                      </Tooltip>
                  </Space>
              </div>

              <Divider />

              <div className="">
                  <h3 className="text-lg font-bold pb-3">Enroll Client Overview</h3>
                  {programData && (
                      <>
                          {programData.hasOwnProperty('invitedPeoples') ? (
                              <Table
                                  dataSource={programData.invitedPeoples
                                      .map((item, index) => ({
                                          key: index,
                                          userName: (item.user.firstName && item.user.lastName) ? item.user.firstName + ' ' + item.user.lastName : '-',
                                          email: item.user.email ? item.user.email : '-',
                                          assessmentName: item.assessment ? item.assessment.name : 'All',
                                          status: item.status
                                      }))}
                                  columns={enrollClientColumns}
                                  pagination={false}
                                  bordered={false}
                                  scroll={{ x: '700px'}}
                                  rowKey="_id"
                              />
                          ) : (
                              <>
                                <span className={'mt-2'}>
                                    No enroll clients found
                                </span>
                              </>
                          )
                          }
                      </>
                  )}
              </div>
          </div>
      )
    },
  ];

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <Row className={'mb-4'}>
              <Col span={12}>
                  <Card className="p-2">
                      <Progress percent={percentage} status="active" type={'line'} trailColor={'red'} color={'blue'} />
                      <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                              {hasKPIs ? (<AiOutlineCheckCircle color={"green"} size={25}/>) : <AiOutlineCloseCircle color={"red"} size={25}/>}
                              <h3 className={"text-lg font-bold px-2"}>Add KPIs</h3>
                          </div>
                          <div>
                              <AiOutlineArrowRight size={25} className="cursor-pointer" onClick={() => {setActiveTab("kpis")}}/>
                          </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center">
                              {hasAssessment ? ( <AiOutlineCheckCircle color={"green"} size={25}/>) : (<AiOutlineCloseCircle color={"red"} size={25}/>)}
                              <h3 className={"text-lg font-bold px-2"}>Add Assessment</h3>
                          </div>
                          <div>
                              <AiOutlineArrowRight size={25} className="cursor-pointer" onClick={() => {setActiveTab("assessments")}} />
                          </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center">
                              {hasPublishAssessment ? <AiOutlineCheckCircle color={"green"} size={25}/> : <AiOutlineCloseCircle color={"red"} size={25}/>}
                              <h3 className={"text-lg font-bold px-2"}>Publish Assessment</h3>
                          </div>
                          <div>
                              <AiOutlineArrowRight size={25} className="cursor-pointer" onClick={() => {setActiveTab("assessments")}} />
                          </div>
                      </div>
                  </Card>
              </Col>
          </Row>
        <Tabs
            activeKey={activeTab}
            onChange={onProgramTabChange}
            items={programTab.map((item) => ({
              ...item
            }))}
            indicatorSize={(origin) => origin - 16}
        />

        <Modal width={1000} open={KPILinkedQuestionModal} onOk={() => setKPILinkedQuestionModal(false)} onCancel={() => setKPILinkedQuestionModal(false)}>
            {KPILinkedQuestionAssessments && (
                <div>
                  <Row gutter={[16, 16]}>
                      <Col span={8}>
                          <span className="font-bold">Assessment Name</span>
                      </Col>

                      <Col span={16}>
                          <span className="font-bold">Linked Questions</span>
                      </Col>
                  </Row>
                  <Divider />
                  <div className={"relative assessments-tabs"}>
                    {KPILinkedQuestionAssessments.length > 0 && (
                        <>
                            {KPILinkedQuestionAssessments.map((assessment) => (
                                <div key={assessment._id}>
                                    <Row gutter={[16, 16]}>
                                        <Col span={8}>{assessment.name}</Col>
                                        <Col span={16}>
                                            <ul style={{listStyle: 'disc'}}>
                                                {assessment.form
                                                    .flatMap((step) =>
                                                        step.form
                                                            .filter((question) => question.kpi === selectedKPIForLinkedQuestion)
                                                            .map((question) => (
                                                                <li className={'capitalize'} key={question.fieldName}>
                                                                    <span>{question.label}</span>
                                                                </li>
                                                            ))
                                                    )}
                                            </ul>
                                        </Col>
                                    </Row>
                                    <Divider />
                                </div>
                            ))}
                        </>
                    )}
                    {KPILinkedQuestionAssessments.length === 0 && !showLoader && (
                        <div className="mt-1 text-center">
                            <strong>No Data Found</strong>
                        </div>
                    )}
                    {showLoader && (
                        <>
                            <LoadingSpinner />
                            {KPILinkedQuestionAssessments.length <= 0 && <span className={"p-3 mt-5"} />}
                        </>
                    )}
                  </div>
                </div>
            )}
        </Modal>
      </div>
    </>
  );
};

export default SuiteDetails;

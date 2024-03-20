import { DndContext } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "allotment/dist/style.css";
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Divider,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { Option } from "antd/es/mentions";
import moment from "moment";
import { TweenOneGroup } from "rc-tween-one";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineMenu,
} from "react-icons/ai";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import ReactJson from "react-json-view";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ExcelImport from "../../components/ExcelImport";
import LoadingSpinner from "../../components/Loader";
import StatsDashboard from "../../components/StatsDashboard";
import { STANDARD_MOMENT_FORMAT } from "../../data/constants";
import { selectDarkMode, selectUser } from "../../redux/auth/selectors";
import AuthService from "../../service/AuthService";
import CrudService from "../../service/CrudService";
import NotificationService from "../../service/NotificationService";
import StatsService from "../../service/StatsService";
import StrapiService from "../../service/StrapiService";
import UserService from "../../service/UserService";

export const trackCategoriesList = [
  {
    type: "Education",
    stages: [
      {
        name: "Goal Setting and Target Setting",
        actions: [
          {
            id: "objective",
            text: () => "Identify educational goals and objectives",
            checker: ({ programData }) => !!programData?.objectives,
            tab: "details",
          },
          {
            id: "target",
            text: ({ programData, KPISurveys, allKPIs }) => {
              let _KPIs = programData?.KPIs;
              let _additionalKPIData = programData?.additionalKPIData ?? [];
              let _count = 0;
              _additionalKPIData.map((i) => {
                let _kpiMetricName = allKPIs?.filter(
                  (item) => item._id == i._id
                )?.[0]?.MetricName;
                let _kpiStats = KPISurveys.filter(
                  (item) => item.key == _kpiMetricName
                )?.[0];
                if (i.targetValue <= _kpiStats?.average) _count++;
              });
              let _text =
                "Set specific targets and timelines (" +
                _count +
                "/" +
                _KPIs.length +
                ")";
              return _text;
            },
            checker: ({ programData, KPISurveys, allKPIs }) => {
              let _additionalKPIData = programData?.additionalKPIData ?? [];
              let _count = 0;
              _additionalKPIData.map((i) => {
                let _kpiMetricName = allKPIs?.filter(
                  (item) => item._id == i._id
                )?.[0]?.MetricName;
                let _kpiStats = KPISurveys.filter(
                  (item) => item.key == _kpiMetricName
                )?.[0];
                if (i.targetValue <= _kpiStats?.average) _count++;
              });
              return !!_count;
            },
            tab: "details",
          },
        ],
      },
      {
        name: "Data Collection and Baseline Assessment",
        actions: [
          {
            id: "baseline",
            text: ({ programData }) => {
              let _KPIs = programData?.KPIs;
              let _additionalKPIData = programData?.additionalKPIData ?? [];
              let _count = 0;
              _additionalKPIData.map((i) => {
                if (i.baseline) _count++;
              });
              let _text =
                "Platform collects baseline data on beneficiaries (" +
                _count +
                "/" +
                _KPIs.length +
                ")";
              return _text;
            },
            checker: ({ programData }) => {
              let _additionalKPIData = programData?.additionalKPIData;
              let _count = 0;
              _additionalKPIData.map((i) => {
                if (i.baseline) _count++;
              });
              return !!_count;
            },
            tab: "assessments",
          },
          {
            id: "5",
            text: () =>
              "Platform identifies challenges and opportunities for improvement",
            checker: () => true,
          },
        ],
      },
      {
        name: "Monitoring and Support",
        actions: [
          {
            id: "6",
            text: () =>
              "Platform regularly monitors beneficiaries' academic performance",
            checker: () => true,
          },
          {
            id: "7",
            text: () => "Platform provides academic support as needed",
            checker: () => true,
          },
          {
            id: "8",
            text: () => "Platform addresses challenges and barriers promptly",
            checker: () => true,
          },
        ],
      },
      {
        name: "Periodic Surveys and Feedback",
        actions: [
          {
            id: "9",
            text: () =>
              "Platform conducts surveys to gather feedback from beneficiaries",
            checker: ({ assessmentData }) => {
              let _count = 0;
              assessmentData.map((i) => {
                if (i.reminderType) {
                  _count++;
                }
              });
              return !!_count;
            },
          },
        ],
      },
      {
        name: "Outcome Measurement",
        actions: [
          {
            id: "12",
            text: ({ assessmentData }) => {
              let _count = 0;
              assessmentData.map((i) => {
                if (i.name && i.form.length) _count++;
              });
              let _text =
                "Platform measures program outcomes (" +
                _count +
                "/" +
                assessmentData.length +
                ")";
              return _text;
            },
            checker: () => true,
          },
          {
            id: "13",
            text: () =>
              "Platform analyzes results to assess program effectiveness",
            checker: () => true,
          },
          {
            id: "14",
            text: () => "Platform adjusts strategies based on outcomes",
            checker: () => true,
          },
        ],
      },
      {
        name: "Reporting and Communication",
        actions: [
          {
            id: "15",
            text: () =>
              "Platform generates reports on beneficiary progress and program impact",
            checker: () => true,
          },
          {
            id: "16",
            text: () => "Platform shares reports with stakeholders",
            checker: () => true,
          },
          {
            id: "17",
            text: () =>
              "Platform communicates successes and areas for improvement",
            checker: () => true,
          },
        ],
      },
    ],
  },
  {
    type: "Entrepreneurship",
    stages: [
      {
        name: "Goal Setting",
        actions: [
          {
            id: "e1",
            text: () => "Define entrepreneurial goals and strategies",
            checker: ({ programData }) => !!programData?.objectives,
          },
          {
            id: "e2",
            text: () => "Set specific targets and timelines",
            checker: ({ programData }) => !!programData?.endDate,
          },
        ],
      },
      {
        name: "Resource Allocation",
        actions: [
          {
            id: "e3",
            text: () => "Platform allocates resources",
            checker: () => true,
          },
          {
            id: "e4",
            text: () =>
              "Platform ensures entrepreneurs have access to necessary tools",
            checker: () => true,
          },
          {
            id: "e5",
            text: () => "Platform monitors resource utilization",
            checker: () => true,
          },
        ],
      },
      {
        name: "Business Development and Support",
        actions: [
          {
            id: "e6",
            text: () =>
              "Platform provides guidance and mentorship on business development",
            checker: () => true,
          },
          {
            id: "e7",
            text: () =>
              "Platform offers workshops or training sessions on entrepreneurship",
            checker: () => true,
          },
          {
            id: "e8",
            text: () => "Platform connects entrepreneurs with industry experts",
            checker: () => true,
          },
        ],
      },
      {
        name: "Milestone Tracking",
        actions: [
          {
            id: "e9",
            text: () => "Platform tracks progress toward business milestones",
            checker: () => true,
          },
          {
            id: "e10",
            text: () =>
              "Platform monitors financial growth and customer acquisition",
            checker: () => true,
          },
          {
            id: "e11",
            text: () => "Platform evaluates product or service development",
            checker: () => true,
          },
        ],
      },
      {
        name: "Feedback and Adaptation",
        actions: [
          {
            id: "e12",
            text: () => "Platform gathers feedback from entrepreneurs",
            checker: ({ hasSubmission }) => !!hasSubmission,
          },
          {
            id: "e13",
            text: () => "Platform uses feedback to adapt strategies",
            checker: ({ hasSubmission }) => !!hasSubmission,
          },
          {
            id: "e14",
            text: () =>
              "Platform encourages agile and responsive decision-making",
            checker: () => true,
          },
        ],
      },
      {
        name: "Outcome Measurement and Scaling",
        actions: [
          {
            id: "e15",
            text: () => "Platform measures business outcomes",
            checker: () => true,
          },
          {
            id: "e16",
            text: () =>
              "Platform assesses the scalability and sustainability of startups",
            checker: () => true,
          },
          {
            id: "e17",
            text: () =>
              "Platform explores opportunities for expansion or scaling",
            checker: () => true,
          },
        ],
      },
      {
        name: "Reporting and Investor Relations",
        actions: [
          {
            id: "e18",
            text: () => "Platform generates reports on startup performance",
            checker: () => true,
          },
          {
            id: "e19",
            text: () =>
              "Platform shares progress with investors and stakeholders",
            checker: () => true,
          },
          {
            id: "e20",
            text: () =>
              "Platform fosters relationships with potential investors",
            checker: () => true,
          },
        ],
      },
    ],
  },

  {
    type: "Employment",
    stages: [
      {
        name: "Goal Setting and Target Setting",
        actions: [
          {
            id: "j1",
            text: () => "Define career goals and desired job roles",
            checker: ({ programData }) => !!programData?.objectives,
            tab: "details",
          },
          {
            id: "j1.2",
            text: () => "Create a career development plan",
            checker: ({ programData }) => !!programData?.objectives,
            tab: "details",
          },
          {
            id: "j2",
            text: () => "Set specific targets and timelines",
            checker: ({ programData }) => !!programData?.endDate,
            tab: "details",
          },
        ],
      },
      {
        name: "Job Search and Application",
        actions: [
          {
            id: "j3",
            text: () => "Search for job or internship opportunities",
            checker: ({ hasSubmission }) => !!hasSubmission,
          },
          {
            id: "j4",
            text: () => "Tailor resumes and cover letters for applications",
            checker: ({ hasSubmission }) => !!hasSubmission,
          },
          {
            id: "j5",
            text: () => "Apply for positions and internships",
            checker: ({ hasSubmission }) => !!hasSubmission,
          },
        ],
      },
      {
        name: "Interview Preparation",
        actions: [
          {
            id: "j6",
            text: () => "Prepares for interviews",
            checker: () => true,
          },
          {
            id: "j7",
            text: () => "Review potential interview questions and answers",
            checker: () => true,
          },
          {
            id: "j8",
            text: () => "Develops a strong personal brand",
            checker: () => true,
          },
        ],
      },
      {
        name: "Interview and Application Tracking",
        actions: [
          {
            id: "j9",
            text: () => "Platform tracks job and internship applications",
            checker: ({ hasSubmission }) => !!hasSubmission,
          },
          {
            id: "j10",
            text: () =>
              "Platform documents interview dates, outcomes, and feedback",
            checker: ({ hasSubmission }) => !!hasSubmission,
          },
          {
            id: "j11",
            text: () =>
              "Platform manages job offer negotiations and acceptances",
            checker: ({ hasSubmission }) => !!hasSubmission,
          },
        ],
      },
      {
        name: "Onboarding and Integration",
        actions: [
          {
            id: "j12",
            text: () => "Platform assists with onboarding procedures",
            checker: () => true,
          },
          {
            id: "j13",
            text: () =>
              "Platform ensures successful integration into the workplace",
            checker: () => true,
          },
          {
            id: "j14",
            text: () => "Platform supports job retention and performance",
            checker: () => true,
          },
        ],
      },
      {
        name: "Career Advancement",
        actions: [
          {
            id: "j15",
            text: () => "Platform monitors career progress and promotions",
            checker: () => true,
          },
          {
            id: "j16",
            text: () => "Platform provides opportunities for skill development",
            checker: () => true,
          },
          {
            id: "j17",
            text: () => "Platform offers ongoing career support and coaching",
            checker: () => true,
          },
        ],
      },
      {
        name: "Reporting and Feedback",
        actions: [
          {
            id: "j18",
            text: () =>
              "Platform generates reports on job placement and internship success",
            checker: () => true,
          },
          {
            id: "j19",
            text: () => "Platform gathers feedback from program participants",
            checker: () => true,
          },
          {
            id: "j20",
            text: () =>
              "Platform uses feedback to improve program effectiveness",
            checker: () => true,
          },
        ],
      },
    ],
  },
];

const TableRow = ({ children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props["data-row-key"],
  });
  const style = {
    ...props.style,
    transform: CSS.Transform.toString(
      transform && {
        ...transform,
        scaleY: 1,
      }
    ),
    transition,
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 9999,
        }
      : {}),
  };
  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if (child.key === "sort") {
          return React.cloneElement(child, {
            children: (
              <AiOutlineMenu
                size={30}
                ref={setActivatorNodeRef}
                style={{
                  touchAction: "none",
                  cursor: "move",
                }}
                {...listeners}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

const SuiteDetails = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [programData, setProgramData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [KPIs, setKPIs] = useState([]);
  const [allKPIs, setAllKPIs] = useState([]);
  const [categoryKPIs, setCategoryKPIs] = useState([]);
  const [KPIModal, setKPIModal] = useState(false);
  const [KPILinkedQuestionModal, setKPILinkedQuestionModal] = useState(false);
  const [KPIAdditionalDataModal, setKPIAdditionalDataModal] = useState(false);
  const [selectedKPIForLinkedQuestion, setSelectedKPIForLinkedQuestion] =
    useState("");
  const [selectedKPIAdditionalData, setSelectedKPIAdditionalData] =
    useState(null);
  const [KPILinkedQuestionAssessments, setKPILinkedQuestionAssessments] =
    useState([]);
  const [assessmentType, setAssessmentType] = useState("enrollment");
  const [activeTab, setActiveTab] = useState("checklist");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(
    "Enrollment Assessment"
  );
  const [assessmentData, setAssessmentData] = useState([]);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [kpiSearch, setKPISearch] = useState("");
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState([]);
  const inputRef = useRef(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEmailError, setIsEmailError] = useState(false);
  const [reminderType, setReminderType] = useState("");
  const [programCategoryName, setProgramCategoryName] = useState("");
  const [reminderUpdateLoader, setReminderUpdateLoader] = useState(false);
  const [KPILoader, setKPILoader] = useState(false);
  const [hasKPIs, setHasKPIs] = useState(false);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [hasSubmission, setHasSubmission] = useState(false);
  const [submittedProgramData, setSubmittedProgramData] = useState([]);
  const [KPISurveys, setKPISurveys] = useState([]);
  const [versionControlHistory, setVersionControlHistory] = useState([]);
  const [KPIDataForTable, setKPIDataForTable] = useState([]);
  const [currentFavoriteKPIs, setCurrentFavoriteKPIs] = useState(
    user?.favoriteKPIs ?? []
  );
  const darkMode = useSelector(selectDarkMode);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setCurrentFavoriteKPIs(user?.favoriteKPIs);
  }, [user]);

  useEffect(() => {
    if (programData && programData?.KPIs?.length) {
      setKPIDataForTable(
        programData?.KPIs?.map?.((kpi) =>
          allKPIs.find((k) => k._id.toString() === kpi)
        )
          ?.filter?.((a) => !!a)
          .map((item, i) => ({ ...item, key: i + 1 }))
      );
    }
  }, [programData, programData?.KPIs]);

  useEffect(() => {
    CrudService.search("UseCase", 10000, 1, {}).then(({ data }) => {
      StrapiService.getList("impact_categories").then((res) => {
        setCategories([...res.data, ...data.items]);
      });
    });
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id)
      CrudService.search("VersionControlSuite", 10000, 1, {
        sort: { createdAt: -1 },
      }).then(({ data }) => {
        setVersionControlHistory(data.items);
      });
  }, [searchParams]);

  useEffect(() => {
    let assessement_ids = assessmentData.map((i) => i._id);
    CrudService.search("ProgramSubmission", 100000, 1, {
      filters: {
        programId: { $in: assessement_ids },
      },
      sort: { createdAt: -1 },
    }).then((res) => {
      setSubmittedProgramData(res.data.items);
    });
  }, [assessmentData]);

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

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    const isEmailTouched =
      e.target.value !== null &&
      e.target.value !== undefined &&
      e.target.value !== "";
    const isEmailError = !isEmailTouched;
    setIsEmailError(isEmailError);
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value);
    setIsEmailValid(valid);
  };
  const handleInputConfirm = () => {
    if (!isEmailValid) {
      setInputVisible(inputValue !== "");
    } else {
      if (inputValue && tags.indexOf(inputValue) === -1) {
        setTags([...tags, inputValue]);
      }
      setInputVisible(false);
      setInputValue("");
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
    (isEmailError && `Email is required`) ||
    (!isEmailValid && "Please enter a valid email address");

  const load = useCallback(() => {
    const id = searchParams.get("id");
    if (!id) return;

    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab("checklist");
    }

    CrudService.getSingle("Suite", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
      setProgramCategoryName(
        res.data.hasOwnProperty("categoryDetail") &&
          res.data.categoryDetail.Name &&
          res.data.categoryDetail.Name
      );
      setReminderType(
        res.data.hasOwnProperty("reminderType") && res.data.reminderType
          ? res.data.reminderType
          : ""
      );

      setHasKPIs(!!(res.data.KPIs && res.data.KPIs.length > 0));
    });

    StatsService.getSurveys(id ?? "")
      .then(({ data }) => {
        setKPISurveys(data.KPIs || []);
      })
      .finally(() => {});
  }, [searchParams]);

  useEffect(() => {
    const execute = async () => {
      if (!programData) return;
      const assessmentRes = await CrudService.search("Program", 1, 1, {
        filters: { suite: programData._id },
      });
      setHasAssessment(
        !!(
          assessmentRes.data &&
          assessmentRes.data.items &&
          assessmentRes.data.items.length > 0
        )
      );

      CrudService.search("ProgramSubmission", 100000, 1, {
        filters: {
          programId: {
            $in: assessmentRes?.data?.items?.map?.((a) => a._id) ?? [],
          },
        },
      }).then(({ data }) => {
        setHasSubmission(data?.items?.length > 0);
        setSubmittedProgramData(data?.items);
      });
    };
    execute();
  }, [programData]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    StrapiService.getCoreProgramMetrics().then(({ data }) => {
      setAllKPIs(data);
      setKPISearch("");
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
        setPage,
        setSubmittedProgramData
      );
    };
    fetchData();
  }, [programData]);

  const fetchAssessmentData = async (assessmentType, limit, page) => {
    setShowLoader(true);
    const data = {
      filters: { suite: programData._id, assessmentType },
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
    setPage,
    setSubmittedProgramData
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
        setPage,
        setSubmittedProgramData
      );
    }
  };

  const onProgramTabChange = (type) => {
    setActiveTab(type);
    if (type === "applications") {
      setTags([]);
    }
  };

  const filterKPIs = (kpi, searchKPI) => {
    return (
      !searchKPI ||
      kpi.MetricName.toLowerCase().includes(searchKPI.toLowerCase())
    );
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
    setShowLoader(true);
    setKPILinkedQuestionAssessments([]);
    setKPILinkedQuestionModal(true);
    setSelectedKPIForLinkedQuestion(selectedKPI);

    const data = {
      filters: {
        "form.form.kpi": selectedKPI,
      },
    };
    const response = await CrudService.search("Program", limit, page, data);
    setKPILinkedQuestionAssessments(response.data.items);
    setShowLoader(false);
  };

  const handleEditAdditionalKPIData = async (selectedKPI) => {
    let _additionalKPIDataList = programData?.additionalKPIData ?? [];
    let _selectedAddtionalKPIDataList = _additionalKPIDataList.filter(
      (item) => item._id == selectedKPI._id
    );
    let _data = _selectedAddtionalKPIDataList[0] ?? { _id: selectedKPI._id };
    setSelectedKPIAdditionalData(_data);
    setShowLoader(true);
    setKPIAdditionalDataModal(true);
  };

  const handleAdditionalKPIDataChange = (_data) => {
    let value = _data.target.value;
    if (_data.target.name == "timeline") {
      value = new Date(_data.target.value).toISOString().replace("Z", "+00:00");
    }
    setSelectedKPIAdditionalData({
      ...selectedKPIAdditionalData,
      [_data.target.name]: value,
    });
  };

  const saveKPIAdditionalData = async () => {
    const id = searchParams.get("id");
    if (!id) return;
    let _additionalKPIDataList = programData?.additionalKPIData ?? [];
    let _temp = _additionalKPIDataList.filter(
      (i) => i._id == selectedKPIAdditionalData._id
    );
    if (_temp.length) {
      _additionalKPIDataList = _additionalKPIDataList.map((item) => {
        if (item._id == selectedKPIAdditionalData._id) {
          item = selectedKPIAdditionalData;
        }
        return item;
      });
    } else {
      _additionalKPIDataList.push(selectedKPIAdditionalData);
    }

    await CrudService.update("Suite", id, {
      additionalKPIData: _additionalKPIDataList,
    });
    load();
    setShowLoader(false);
    setKPIAdditionalDataModal(false);
    setActiveTab("kpis");
  };

  const handleAddUserClick = async (e) => {
    await AuthService.generateLinkToInviteUser({
      program: programData,
      invitePeopleEmails: tags,
      type: "suite",
    }).then((res) => {
      if (!res) return;

      setTags([]);
      load();
    });
  };

  const handleKPIMetricsReminderChange = async (value) => {
    if (value) {
      setReminderType(value);
    }
  };

  const handleKPIMetricsReminderUpdate = async (value) => {
    if (value && value !== programData.reminderType) {
      setReminderUpdateLoader(true);
      const id = searchParams.get("id");
      if (!id) return;

      await CrudService.update("Suite", id, {
        reminderType: value,
      }).then((res) => {
        setProgramData(res.data);
      });
      setReminderUpdateLoader(false);
    }
  };

  const KPIsColumns = [
    {
      key: "sort",
    },
    {
      title: "Metric Name",
      dataIndex: "MetricName",
      key: "MetricName",
      width: 200,
    },
    {
      title: "Definition",
      dataIndex: "Definition",
      key: "Definition",
      width: 400,
    },
    {
      title: "Calculation",
      dataIndex: "Calculation",
      key: "Calculation",
      width: 200,
      render: (text) => text || "No Calculation",
    },
    {
      title: "Target And Timeline",
      dataIndex: "_id",
      key: "_id",
      width: 300,
      render: (KPI_id) => {
        let _additionalKPIData = programData?.additionalKPIData ?? [];
        let _data = _additionalKPIData.filter((i) => i._id == KPI_id)?.[0];
        return (
          <div>
            <div>
              <span>Baseline: </span>
              <span>
                {_data?.baseline} {_data?.baseline ? _data?.targetUnit : ""}
              </span>
            </div>
            <div>
              <span>Target: </span>
              <span>
                {_data?.targetValue}{" "}
                {_data?.targetValue ? _data?.targetUnit : ""}
              </span>
            </div>
            <div>
              <span>TimeLine: </span>
              {_data?.timeline ? (
                <input
                  className="dark:bg-gray-900 w-[150px] border-none"
                  type="date"
                  name="timeline"
                  disabled
                  value={moment(_data?.timeline).format("YYYY-MM-DD")}
                  onChange={handleAdditionalKPIDataChange}
                />
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      title: "Sustainable Development Goals",
      dataIndex: "sustainable_development_goals",
      key: "sustainable_development_goals",
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
      title: "Actions",
      key: "actions",
      width: 300,
      render: (metric) => (
        <Space size={[12, 10]} wrap>
          <div className="min-w-[150px] text-right">
            <Tooltip
              title={
                currentFavoriteKPIs &&
                currentFavoriteKPIs?.includes(metric?._id)
                  ? "Remove from Favorite"
                  : "Add to Favorite"
              }
            >
              {currentFavoriteKPIs &&
              currentFavoriteKPIs.includes(metric._id) ? (
                <MdFavorite
                  className={"mx-1 cursor-pointer"}
                  stroke={"red"}
                  color={"red"}
                  size={22}
                  onClick={async () => {
                    await UserService.updateUser(user._id, {
                      favoriteKPIs: currentFavoriteKPIs.filter(
                        (id) => id !== metric._id
                      ),
                    }).then((res) => {
                      setCurrentFavoriteKPIs((prev) =>
                        prev.filter((p) => p != metric._id)
                      );
                    });
                  }}
                />
              ) : (
                <MdFavoriteBorder
                  className={"mx-1 cursor-pointer"}
                  stroke={"red"}
                  size={22}
                  onClick={async () => {
                    await UserService.updateUser(user._id, {
                      favoriteKPIs: [...currentFavoriteKPIs, metric._id],
                    }).then((res) => {
                      setCurrentFavoriteKPIs((prev) => [...prev, metric?._id]);
                    });
                  }}
                />
              )}
            </Tooltip>
          </div>

          <Button
            className="px-2 py-1 text-sm rounded"
            type="primary"
            onClick={() => handleEditAdditionalKPIData(metric)}
          >
            Edit
          </Button>
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
                setProgramData(res.data);
                setActiveTab("checklist");
                setShowLoader(false);
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

  const currentCategoryList = trackCategoriesList.find((t) =>
    ["name", "Name"].some(
      (x) =>
        t.type ===
        categories?.find?.((c) => c._id === programData?.category)?.[x]
    )
  );

  const KPIsModalColumns = [
    {
      title: "Metric Name",
      dataIndex: "MetricName",
      key: "MetricName",
      width: 200,
    },
    {
      title: "Definition",
      dataIndex: "Definition",
      key: "Definition",
      width: 500,
    },
    {
      title: "Calculation",
      dataIndex: "Calculation",
      key: "Calculation",
      width: 250,
      render: (text) => text || "No Calculation",
    },
    {
      title: "Sustainable Development Goals",
      dataIndex: "sustainable_development_goals",
      key: "sustainable_development_goals",
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
      title: "Actions",
      key: "actions",
      width: 100,
      render: (metric) => (
        <div>
          {!programData?.KPIs?.includes?.(metric._id.toString()) ? (
            <Button
              type="primary"
              onClick={async () => {
                setKPILoader(true);
                const id = searchParams.get("id");
                if (!id) return;
                await CrudService.update("Suite", id, {
                  KPIs: [...(programData?.KPIs ?? []), metric._id.toString()],
                }).then((res) => {
                  if (!res.data) return;
                  setProgramData(res.data);
                  setActiveTab("checklist");
                  setKPILoader(false);
                });
              }}
            >
              Add
            </Button>
          ) : (
            <Button
              danger
              onClick={async () => {
                setKPILoader(true);
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
                  setProgramData(res.data);
                  setActiveTab("checklist");
                  setKPILoader(false);
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
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => text || "-",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 500,
      render: (text) => text || "-",
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (text) => (
        <time dateTime={text} className="mr-2">
          {moment(text).format("Do MMM, YYYY")}
        </time>
      ),
    },
    {
      title: "Submission Period",
      dataIndex: "reminderType",
      key: "reminderType",
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size={[12, 10]} wrap>
          <Tooltip
            title={
              programData && !programData.published
                ? "Please publish the program first, and then proceed to enroll client."
                : ""
            }
          >
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
                const hasOneRecordOnLastPage =
                  isLastPage && totalAssessments % limit === 1;
                const updatedPage = hasOneRecordOnLastPage ? page - 1 : page;

                await updateAssessmentData(
                  assessmentType,
                  limit,
                  updatedPage,
                  setAssessmentData,
                  setTotalAssessments,
                  setPage,
                  setSubmittedProgramData
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
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 400,
    },
    {
      title: "Assessments",
      dataIndex: "assessmentName",
      key: "assessmentName",
      width: 400,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (text) => (
        <Tag
          className={"capitalize"}
          color={text === "registered" ? "green" : "red"}
        >
          {text}
        </Tag>
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

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setKPIDataForTable((previous) => {
        const activeIndex = previous.findIndex((i) => i.key === active.id);
        const overIndex = previous.findIndex((i) => i.key === over?.id);
        return arrayMove(previous, activeIndex, overIndex);
      });
    }
  };

  const programTab = [
    {
      key: "checklist",
      label: "Checklist",
      children: (
        <>
          <Card className="p-2">
            <h1 className="font-bold text-lg underline">Program Setup</h1>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                {hasKPIs ? (
                  <AiOutlineCheckCircle color={"green"} size={25} />
                ) : (
                  <AiOutlineCloseCircle color={"red"} size={25} />
                )}
                <h3 className={"text-lg font-bold px-2"}>Add KPIs</h3>
              </div>
              <div>
                <AiOutlineArrowRight
                  size={25}
                  className="cursor-pointer"
                  onClick={() => {
                    setActiveTab("kpis");
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                {!!programData?.objectives ? (
                  <AiOutlineCheckCircle color={"green"} size={25} />
                ) : (
                  <AiOutlineCloseCircle color={"red"} size={25} />
                )}
                <h3 className={"text-lg font-bold px-2"}>Specify Objectives</h3>
              </div>
              <div>
                <AiOutlineArrowRight
                  size={25}
                  className="cursor-pointer"
                  onClick={() => {
                    setActiveTab("details");
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center">
                {hasAssessment ? (
                  <AiOutlineCheckCircle color={"green"} size={25} />
                ) : (
                  <AiOutlineCloseCircle color={"red"} size={25} />
                )}
                <h3 className={"text-lg font-bold px-2"}>Add Assessment</h3>
              </div>
              <div>
                <AiOutlineArrowRight
                  size={25}
                  className="cursor-pointer"
                  onClick={() => {
                    setActiveTab("assessments");
                  }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-2 mt-5">
            <h1 className="font-bold text-lg underline">Progress Tracker</h1>
            <div>
              {currentCategoryList &&
                currentCategoryList.stages.map((stage, i) => (
                  <div key={i} className=" mt-2">
                    <Collapse
                      items={[
                        {
                          key: stage.id,
                          label: stage.name,
                          children: (
                            <>
                              {stage.actions?.map?.((action) => (
                                <div
                                  key={action.id}
                                  onClick={() => {
                                    if (action.link)
                                      navigate(action.link(programData));
                                    if (action.tab) setActiveTab(action.tab);
                                  }}
                                >
                                  <Checkbox
                                    checked={
                                      action.checker &&
                                      !!action.checker({
                                        programData,
                                        hasSubmission,
                                        assessmentData,
                                        KPISurveys,
                                        allKPIs,
                                      })
                                    }
                                    value={action.id}
                                  >
                                    {action.text({
                                      programData,
                                      assessmentData,
                                      KPISurveys,
                                      allKPIs,
                                    })}
                                  </Checkbox>
                                </div>
                              ))}
                            </>
                          ),
                        },
                      ]}
                    />
                  </div>
                ))}
            </div>
          </Card>
        </>
      ),
    },
    {
      key: "details",
      label: "Details",
      children: (
        <>
          <div className={"flex justify-between mb-4"}>
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
          </div>
          <div className="text-lg text-indigo-700 mb-6">
            <label>Description</label>
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

          {programData?.isGrantOpportunity &&
            programData?.grantEligibilityCriteria && (
              <div className="text-lg text-indigo-700 mb-6">
                <label>Eligibility Criteria</label>
                <Typography.Paragraph
                  editable={{
                    onChange: async (e) => {
                      const id = searchParams.get("id");
                      if (!id) return;

                      await CrudService.update("Suite", id, {
                        grantEligibilityCriteria: e,
                      });
                      CrudService.getSingle("Suite", id).then((res) => {
                        if (!res.data) return;
                        setProgramData(res.data);
                      });
                    },
                    text: programData?.grantEligibilityCriteria,
                  }}
                >
                  {programData?.grantEligibilityCriteria}
                </Typography.Paragraph>
              </div>
            )}
          {!programData?.isGrantOpportunity && programData?.objectives && (
            <div className="text-lg text-indigo-700 mb-6">
              <label>Objectives</label>
              <Typography.Paragraph
                editable={{
                  onChange: async (e) => {
                    const id = searchParams.get("id");
                    if (!id) return;

                    await CrudService.update("Suite", id, { objectives: e });
                    CrudService.getSingle("Suite", id).then((res) => {
                      if (!res.data) return;
                      setProgramData(res.data);
                    });
                  },
                  text: programData?.objectives,
                }}
              >
                {programData?.objectives}
              </Typography.Paragraph>
            </div>
          )}

          <div>
            {programData?.categoryDetail?.Name && (
              <p className={"py-2"}>
                <strong>Category</strong>: {programData.categoryDetail.Name}
              </p>
            )}
            {programData?.impactThemeDetails &&
              programData?.impactThemeDetails.length > 0 && (
                <p className={"py-2"}>
                  <strong>Impact Theme</strong>:{" "}
                  {programData?.impactThemeDetails.map((item, index) => (
                    <>
                      <span key={item._id}>{item.Name}</span>
                      {index !== programData.impactThemeDetails.length - 1
                        ? ", "
                        : ""}
                    </>
                  ))}
                </p>
              )}
            {programData?.strategicGoalDetails && (
              <p className={"py-2"}>
                <strong>Strategic Goal</strong>:{" "}
                {programData.strategicGoalDetails.Name}
              </p>
            )}
            {programData?.deliveryModelDetails && (
              <p className={"py-2"}>
                <strong>Delivery Model</strong>:{" "}
                {programData.deliveryModelDetails.Name}
              </p>
            )}
            {programData?.productDetails && (
              <p className={"py-2"}>
                <strong>Products And Services</strong>:{" "}
                {programData.productDetails.Name}
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
                {moment(programData.startDate).format("LLLL")}
              </p>
            )}
            <p className={"py-2"}>
              <strong>End Date</strong>:{" "}
              <input
                type="date"
                className="dark:bg-gray-900"
                defaultValue={
                  programData?.endDate
                    ? moment(programData?.endDate).format("YYYY-MM-DD")
                    : null
                }
                onChange={async (e) => {
                  const id = searchParams.get("id");
                  if (!id) return;

                  await CrudService.update("Suite", id, {
                    endDate: new Date(e.target.value)
                      .toISOString()
                      .replace("Z", "+00:00"),
                  });
                  CrudService.getSingle("Suite", id).then((res) => {
                    if (!res.data) return;
                    setProgramData(res.data);
                  });
                }}
              />
            </p>
          </div>
        </>
      ),
    },
    {
      key: "kpis",
      label: "KPIs",
      children: (
        <>
          {/* <Table
            dataSource={programData?.KPIs?.map?.((kpi) =>
              allKPIs.find((k) => k._id.toString() === kpi)
            )?.filter?.((a) => !!a)}
            columns={KPIsColumns}
            rowKey={(record) => record._id}
            pagination={false}
            scroll={{ x: "700px" }}
          /> */}
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              // rowKey array
              items={KPIDataForTable.map((i) => i.key)}
              strategy={verticalListSortingStrategy}
            >
              <Table
                className="program-kpi-table"
                components={{
                  body: {
                    row: TableRow,
                  },
                }}
                rowKey="key"
                columns={KPIsColumns}
                dataSource={KPIDataForTable}
              />
            </SortableContext>
          </DndContext>
          <Button
            className="px-2 py-1 text-sm  rounded my-4"
            type="primary"
            onClick={() => {
              setKPIs([]);
              setCategoryKPIs([]);
              setKPIModal(true);
              setKPILoader(true);
              StrapiService.getCoreProgramMetrics(
                programCategoryName && { impact_category: programCategoryName }
              )
                .then(({ data }) => {
                  setKPIs(data);
                  setCategoryKPIs(data);
                  setKPISearch("");
                })
                .finally(() => {
                  setKPILoader(false);
                });
            }}
          >
            Add KPI
          </Button>
          <Modal
            className="add-kpi-modal"
            wrapClassName={`${darkMode ? "dark" : ""}`}
            width={1150}
            open={KPIModal}
            onCancel={() => setKPIModal(false)}
            onOk={() => setKPIModal(false)}
          >
            <div>
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Search KPIs"
                className="dark:bg-gray-900 block w-col-9 mb-4 rounded-md border-0 py-1.5 pr-14 dark:text-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={kpiSearch}
                onChange={handleKPISearchChange}
              />
            </div>
            <Table
              dataSource={KPIs.map((metric) => ({
                ...metric,
                key: metric._id,
              }))}
              columns={KPIsModalColumns}
              rowKey={(record) => record._id}
              pagination={false}
              scroll={{ x: "700px" }}
              loading={KPILoader}
            />
          </Modal>
        </>
      ),
    },
    {
      key: "assessments",
      label: "Assessments",
      children: (
        <>
          <div className="flex mb-3">
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
                navigate(`/dashboard/programpre?id=${program.data._id}`);
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
                scroll={{ x: "700px" }}
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
                    setPage,
                    setSubmittedProgramData
                  );
                }}
              />
            )}

            {assessmentData.length <= 0 && !showLoader && (
              <span>{`No ${selectedAssessmentType} found`}</span>
            )}
          </div>
        </>
      ),
    },
    {
      key: "metrics",
      label: "Reports",
      children: (
        <>
          <Select
            value={reminderType}
            style={{ width: 180 }}
            onChange={handleKPIMetricsReminderChange}
          >
            <Select.Option value="">Select type</Select.Option>
            <Select.Option value="weekly">Weekly</Select.Option>
            <Select.Option value="quarterly">Quarterly</Select.Option>
            <Select.Option value="monthly">Monthly</Select.Option>
            <Select.Option value="annually">Annually</Select.Option>
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
      ),
    },
    {
      key: "applications",
      label: "Applications",
      children: (
        <div className="relative">
          {tags.length === 0 && <></>}
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
                onChange={handleInputChange}
                onBlur={handleInputConfirm}
                onPressEnter={handleInputConfirm}
              />
              {errorEmailMessage && (
                <div style={{ color: "red" }}>{errorEmailMessage}</div>
              )}
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
              },
            ]}
            handleImport={async (e) => {
              const mappedItems = e.mappedItems;
              const fileEmails = [];

              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              mappedItems.forEach((item) => {
                if (emailRegex.test(item.email) && !tags.includes(item.email)) {
                  fileEmails.push(item.email);
                }
              });

              if (fileEmails.length > 0) {
                setTags([...tags, ...fileEmails]);
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

              <Tooltip
                title={
                  programData && !programData.published
                    ? "Please publish the program first, and then proceed to invite people."
                    : tags.length === 0
                    ? "Add emails"
                    : ""
                }
              >
                <Button
                  className="px-2 py-1 text-sm rounded"
                  type="primary"
                  onClick={handleAddUserClick}
                  disabled={
                    tags.length === 0 || (programData && !programData.published)
                  }
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
                {programData.hasOwnProperty("invitedPeoples") ? (
                  <Table
                    dataSource={programData.invitedPeoples.map(
                      (item, index) => ({
                        key: index,
                        userName:
                          item.user.firstName && item.user.lastName
                            ? item.user.firstName + " " + item.user.lastName
                            : "-",
                        email: item.user.email ? item.user.email : "-",
                        assessmentName: item.assessment
                          ? item.assessment.name
                          : "All",
                        status: item.status,
                      })
                    )}
                    columns={enrollClientColumns}
                    pagination={false}
                    bordered={false}
                    scroll={{ x: "700px" }}
                    rowKey="_id"
                  />
                ) : (
                  <>
                    <span className={"mt-2"}>No enroll clients found</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "versionControl",
      label: "Version Control",
      children: (
        <div className="relative">
          {versionControlHistory.map((elem) => (
            <div key={elem._id}>
              <div>
                <strong>Old Version:</strong> <ReactJson src={elem.original} />
              </div>
              <div>
                <strong>New Version:</strong> <ReactJson src={elem.suiteObj} />
              </div>
              <div>
                <strong>Updated At:</strong>{" "}
                {moment(elem.createdAt).format(STANDARD_MOMENT_FORMAT)}
              </div>
              <Divider />
            </div>
          ))}
        </div>
      ),
    },
  ];

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <Breadcrumb
          items={[
            {
              title: (
                <Link
                  to={`/dashboard/${
                    programData?.isGrantOpportunity
                      ? "mygrantopporunities"
                      : "myprograms"
                  }`}
                >
                  {programData?.isGrantOpportunity
                    ? "My Grant Opportunities"
                    : "My Programs"}
                </Link>
              ),
            },
            {
              title: (
                <Link to={`/dashboard/suitedetails?id=${programData?._id}`}>
                  {programData?.name ?? ""}
                </Link>
              ),
            },
          ]}
        />

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-indigo-900 mb-3">
            {programData.name}
          </h1>

          <div className="flex flex-col gap-2">
            {!programData?.published && (
              <Button
                className="px-2 py-1 text-sm rounded animate-bounce animation-once "
                type="primary"
                onClick={async () => {
                  const id = searchParams.get("id");
                  if (!id) return;

                  CrudService.update("Suite", id, {
                    published: true,
                  }).then((res) => {
                    setProgramData(res.data);
                  });

                  await NotificationService.newGrant({ id });
                }}
              >
                Publish Program
              </Button>
            )}

            <Button
              className="px-2 py-1 text-sm rounded"
              type="primary"
              onClick={() => {
                const id = searchParams.get("id");
                if (!id) return;

                navigate(
                  `/dashboard/${
                    programData?.isGrantOpportunity ? "grantpre" : "suitepre"
                  }?id=${id}`
                );
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
                  name: programData.name + " (Copy)",
                };
                const suite = await CrudService.create("Suite", body);
                navigate(
                  `/dashboard/${
                    programData?.isGrantOpportunity ? "grantpre" : "suitepre"
                  }?id=${suite.data._id}`
                );
              }}
            >
              <Button>Duplicate Program</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure to delete this program?"
              onConfirm={async () => {
                const id = searchParams.get("id");
                if (!id) return;
                await CrudService.delete("Suite", id);
                navigate(
                  `/dashboard/${
                    programData?.isGrantOpportunity
                      ? "mygrantopporunities"
                      : "myprograms"
                  }`
                );
              }}
            >
              <Button danger>Delete Program</Button>
            </Popconfirm>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={onProgramTabChange}
          items={programTab.map((item) => ({
            ...item,
          }))}
          indicatorSize={(origin) => origin - 16}
        />

        <Modal
          wrapClassName={`${darkMode ? "dark" : ""}`}
          width={1000}
          open={KPILinkedQuestionModal}
          onOk={() => setKPILinkedQuestionModal(false)}
          onCancel={() => setKPILinkedQuestionModal(false)}
        >
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
                          <Col span={8}>
                            <span
                              className="cursor-pointer"
                              onClick={() => {
                                setActiveTab("assessments");
                                setKPILinkedQuestionModal(false);
                              }}
                            >
                              {assessment.name}
                            </span>
                          </Col>
                          <Col span={16}>
                            <ul style={{ listStyle: "disc" }}>
                              {assessment.form.flatMap((step) =>
                                step.form
                                  .filter(
                                    (question) =>
                                      question.kpi ===
                                      selectedKPIForLinkedQuestion
                                  )
                                  .map((question) => (
                                    <li
                                      className={"capitalize"}
                                      key={question.fieldName}
                                    >
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
                    {KPILinkedQuestionAssessments.length <= 0 && (
                      <span className={"p-3 mt-5"} />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>
        <Modal
          wrapClassName={`${darkMode ? "dark" : ""}`}
          width={600}
          open={KPIAdditionalDataModal}
          onOk={saveKPIAdditionalData}
          onCancel={() => setKPIAdditionalDataModal(false)}
        >
          <div className={"py-2"}>
            <strong>Baseline</strong>:{" "}
            <input
              type="text"
              name="baseline"
              id="baseline"
              placeholder="Baseline"
              className="dark:bg-gray-900 block w-col-9 mb-4 rounded-md border-0 py-1.5 pr-14 dark:text-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={selectedKPIAdditionalData?.baseline ?? ""}
              onChange={handleAdditionalKPIDataChange}
            />
          </div>
          <div className={"py-2"}>
            <strong>Target</strong>:{" "}
            <input
              type="text"
              name="targetValue"
              id="targetValue"
              placeholder="Target"
              className="dark:bg-gray-900 block w-col-9 mb-4 rounded-md border-0 py-1.5 pr-14 dark:text-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={selectedKPIAdditionalData?.targetValue ?? ""}
              onChange={handleAdditionalKPIDataChange}
            />
          </div>
          <div className={"py-2"}>
            <strong>Unit</strong>:{" "}
            <input
              type="text"
              name="targetUnit"
              id="targetUnit"
              placeholder="Unit"
              className="dark:bg-gray-900 block w-col-9 mb-4 rounded-md border-0 py-1.5 pr-14 dark:text-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={selectedKPIAdditionalData?.targetUnit ?? ""}
              onChange={handleAdditionalKPIDataChange}
            />
          </div>
          <div className={"py-2"}>
            <strong>Timeline</strong>:{" "}
            <input
              type="date"
              name="timeline"
              className="dark:bg-gray-900"
              value={
                selectedKPIAdditionalData?.timeline
                  ? moment(selectedKPIAdditionalData?.timeline).format(
                      "YYYY-MM-DD"
                    )
                  : moment("").format("YYYY-MM-DD")
              }
              onChange={handleAdditionalKPIDataChange}
            />
          </div>
        </Modal>
      </div>
    </>
  );
};

export default SuiteDetails;

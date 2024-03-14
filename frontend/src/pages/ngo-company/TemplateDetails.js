import "allotment/dist/style.css";
import {
  Button,
  Divider,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Tabs,
  Tooltip,
  Typography,
  message,
} from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { GrInfo } from "react-icons/gr";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/Loader";
import CrudService from "../../service/CrudService";
import StrapiService from "../../service/StrapiService";

const TemplateDetails = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [templateData, setTemplateData] = useState(null);
  const [KPIs, setKPIs] = useState([]);
  const [allKPIs, setAllKPIs] = useState([]);
  const [KPIModal, setKPIModal] = useState(false);
  const [assessmentType, setAssessmentType] = useState("enrollment");
  const [activeTab, setActiveTab] = useState("templateOverview");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(
    "Enrollment Assessment"
  );
  const [assessmentData, setAssessmentData] = useState([]);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [kpiSearch, setKPISearch] = useState("");
  const [defaultAssessmentData, setDefaultAssessmentData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDefaultAssessment, setSelectedDefaultAssessment] =
    useState(false);

  const load = useCallback(async () => {
    const id = searchParams.get("id");
    if (!id) return;

    setActiveTab("templateOverview");

    CrudService.getSingle("Template", id).then(async (res) => {
      if (!res.data) return;
      setTemplateData(res.data);
      const templateData = res.data;
      await CrudService.search("DefaultAssessment", 1000, 1, {}).then((res) => {
        const defaultAssessment = res.data.items;
        const data = defaultAssessment
          .filter((item) => !templateData.assessments.includes(item._id))
          .map((item) => ({ ...item }));
        setDefaultAssessmentData(data);
      });
    });
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    StrapiService.getCoreProgramMetrics().then(({ data }) => {
      setKPIs(data);
      setAllKPIs(data);
      setKPISearch("");
    });
  }, []);

  useEffect(() => {
    setAssessmentData([]);
    setTotalAssessments(0);
    const fetchData = async () => {
      if (!templateData) return;
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
  }, [templateData]);

  const fetchAssessmentData = async (assessmentType, limit, page) => {
    setShowLoader(true);
    const data = {
      filters: { _id: templateData.assessments, assessmentType },
    };
    const response = await CrudService.search(
      "DefaultAssessment",
      limit,
      page,
      data
    );
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

  const onTemplateTabChange = (type) => {
    setActiveTab(type);
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
      const filteredKPIs = allKPIs.filter((kpi) => filterKPIs(kpi, value));
      setKPIs(filteredKPIs || allKPIs);
    }, 500);
  };

  const handleModalOk = async () => {
    if (selectedDefaultAssessment) {
      const selectedAssessment = defaultAssessmentData.find(
        (item) => item._id === selectedDefaultAssessment
      );
      // await CrudService.update("Template", templateData._id, {
      //     assessments: [...templateData.assessments, selectedAssessment._id],
      // }).then(res => {
      //     setTemplateData(res.data);
      //     setIsModalOpen(false)
      // });
      if (selectedAssessment) {
        const ass = { ...selectedAssessment };
        delete ass._id;
        delete ass.createdAt;
        delete ass.updatedAt;
        ass.template = templateData._id;
        await CrudService.create("DefaultAssessment", ass).then(async (res) => {
          const createdAssessment = res.data;
          await CrudService.update("Template", templateData._id, {
            assessments: [...templateData.assessments, createdAssessment._id],
          }).then((res) => {
            setTemplateData(res.data);
          });
        });
        setIsModalOpen(false);
      }
    }
  };

  const handleModalCancel = () => {
    setSelectedDefaultAssessment(null);
    setIsModalOpen(false);
  };

  const assessmentTypes = [
    {
      key: "enrollment",
      label: "Enrollment Assessment",
    },
    {
      key: "impact",
      label: "Template Impact Assessment",
    },
  ];

  const templateTab = [
    {
      key: "templateOverview",
      label: "Template Overview",
      children: (
        <>
          <div className="text-3xl font-extrabold text-indigo-900 mb-4">
            <Typography.Title
              level={2}
              editable={{
                onChange: async (e) => {
                  const id = searchParams.get("id");
                  if (!id) return;

                  await CrudService.update("Template", id, { name: e });
                  CrudService.getSingle("Template", id).then((res) => {
                    if (!res.data) return;
                    setTemplateData(res.data);
                  });
                },
                text: templateData?.name,
              }}
            >
              {templateData?.name}
            </Typography.Title>
          </div>
          <div className="text-lg text-indigo-700 mb-6">
            <Typography.Paragraph
              editable={{
                onChange: async (e) => {
                  const id = searchParams.get("id");
                  if (!id) return;

                  await CrudService.update("Template", id, { description: e });
                  CrudService.getSingle("Template", id).then((res) => {
                    if (!res.data) return;
                    setTemplateData(res.data);
                  });
                },
                text: templateData?.description,
              }}
            >
              {templateData?.description}
            </Typography.Paragraph>
          </div>

          <div>
            {templateData?.categoryDetail?.Name && (
              <p className={"py-2"}>
                <strong>Category</strong>: {templateData.categoryDetail.Name}
              </p>
            )}
            {templateData?.impactThemeDetails &&
              templateData?.impactThemeDetails.length > 0 && (
                <p className={"py-2"}>
                  <strong>Impact Theme</strong>:{" "}
                  {templateData?.impactThemeDetails.map((item, index) => (
                    <>
                      <span key={item._id}>{item.Name}</span>
                      {index !== templateData.impactThemeDetails.length - 1
                        ? ", "
                        : ""}
                    </>
                  ))}
                </p>
              )}
            {templateData?.strategicGoalDetails && (
              <p className={"py-2"}>
                <strong>Strategic Goal</strong>:{" "}
                {templateData.strategicGoalDetails.Name}
              </p>
            )}
            {templateData?.deliveryModelDetails && (
              <p className={"py-2"}>
                <strong>Delivery Model</strong>:{" "}
                {templateData.deliveryModelDetails.Name}
              </p>
            )}
            {templateData?.productDetails && (
              <p className={"py-2"}>
                <strong>Products And Services</strong>:{" "}
                {templateData.productDetails.Name}
              </p>
            )}
            {templateData?.objectives && (
              <p className={"py-2"}>
                <strong>Objectives</strong>: {templateData.objectives}
              </p>
            )}
            {templateData?.startDate && (
              <p className={"py-2"}>
                <strong>Start Date</strong>:{" "}
                {moment(templateData.startDate).format("LLLL")}
              </p>
            )}
            {templateData?.endDate && (
              <p className={"py-2"}>
                <strong>End Date</strong>:{" "}
                {moment(templateData.endDate).format("LLLL")}
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

                navigate(`/dashboard/createtemplate?id=${id}`);
              }}
            >
              Edit Template
            </Button>
            <Popconfirm
              title="Are you sure to duplicate this template?"
              onConfirm={async () => {
                const id = searchParams.get("id");
                if (!id) return;
                const { _id, createdAt, updatedAt, ...body } = {
                  ...templateData,
                  name: templateData.name + " (Copy)",
                };
                const template = await CrudService.create("Template", body);
                navigate(`/dashboard/createtemplate?id=${template.data._id}`);
              }}
            >
              <Button type="primary">Duplicate Template</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure to delete this template?"
              onConfirm={async () => {
                const id = searchParams.get("id");
                if (!id) return;
                await CrudService.delete("Template", id);
                navigate("/dashboard/templates");
              }}
            >
              <Button danger>Delete Template</Button>
            </Popconfirm>
          </Space>
        </>
      ),
    },
    {
      key: "kpis",
      label: "KPIs",
      children: (
        <>
          <h3 className="text-lg font-bold">KPIs</h3>
          {templateData?.KPIs?.map?.((kpi) =>
            KPIs.find((k) => k._id.toString() === kpi)
          )
            ?.filter?.((a) => !!a)
            ?.map?.((metric) => (
              <div
                key={metric._id}
                className="flex items-center border-b border-gray-300 py-2 overflow-auto"
              >
                <div className="flex-1 px-4">
                  <Space>
                    <div className="cursor-pointer">
                      <Tooltip
                        title={
                          <>
                            <div className="mb-2">{metric.MetricName}</div>
                          </>
                        }
                      >
                        <GrInfo />
                      </Tooltip>
                    </div>
                    <div className="flex-1 px-4">{metric.ID}</div>
                  </Space>
                </div>
                <div className="flex-1 px-4">{metric.MetricName}</div>
                <div className="flex-1 px-4">
                  <Popconfirm
                    title="Are you sure to delete?"
                    onConfirm={async () => {
                      const id = searchParams.get("id");
                      if (!id) return;
                      await CrudService.update("Template", id, {
                        KPIs: [
                          ...(templateData?.KPIs?.filter?.(
                            (e) => e !== metric._id.toString()
                          ) ?? []),
                        ],
                      });
                      load();
                    }}
                  >
                    <Button>Remove</Button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          <Button
            className="px-2 py-1 text-sm  rounded mt-4"
            type="primary"
            onClick={() => {
              setKPIModal(true);
            }}
          >
            Add KPI
          </Button>
          <Modal
            width={1150}
            open={KPIModal}
            onCancel={() => setKPIModal(false)}
          >
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
            {KPIs.map((metric) => (
              <div
                key={metric._id}
                className="flex border-b border-gray-300 py-2 overflow-auto"
              >
                <div className={"flex"}>
                  <div className="cursor-pointer">
                    <Tooltip
                      title={
                        <>
                          <div className="mb-2">{metric.MetricName}</div>
                          <div className="flex-1">{metric.Definition}</div>
                        </>
                      }
                    >
                      <GrInfo />
                    </Tooltip>
                  </div>
                </div>
                <div className="flex-1 px-4">{metric.MetricName}</div>
                <div className="flex-1 px-4">{metric.Calculation || "-"}</div>
                <div className="flex-1 px-4">
                  <ul role="list" className="list-disc space-y-1 pl-2">
                    {metric?.reporting_format?.map((report) => (
                      <>
                        <li> {report.Name}</li>
                      </>
                    ))}
                  </ul>
                </div>
                <div className="flex-2 px-4">
                  <ul role="list" className="list-disc space-y-1 pl-2">
                    {metric?.sustainable_development_goals?.map((sdg) => (
                      <>
                        <li> {sdg.Name}</li>
                      </>
                    ))}
                  </ul>
                </div>
                <div className="max-w-[79px] px-4">
                  {!templateData?.KPIs?.includes?.(metric._id.toString()) ? (
                    <Button
                      type="primary"
                      onClick={async () => {
                        const id = searchParams.get("id");
                        if (!id) return;
                        await CrudService.update("Template", id, {
                          KPIs: [
                            ...(templateData?.KPIs ?? []),
                            metric._id.toString(),
                          ],
                        });
                        load();
                      }}
                    >
                      Add
                    </Button>
                  ) : (
                    <Button
                      danger
                      onClick={async () => {
                        const id = searchParams.get("id");
                        if (!id) return;
                        await CrudService.update("Template", id, {
                          KPIs: [
                            ...(templateData?.KPIs?.filter?.(
                              (e) => e !== metric._id.toString()
                            ) ?? []),
                          ],
                        });
                        load();
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {KPIs && KPIs.length === 0 && (
              <div className="mt-1 text-center">
                <strong>No Data Found</strong>
              </div>
            )}
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
            <h3 className="text-lg font-bold">Assessments</h3>
            <Button
              className="px-2 py-1 text-sm rounded mx-3"
              type="primary"
              onClick={async () => {
                navigate(
                  `/dashboard/templatepre?templateId=${templateData._id}&assessmentType=${assessmentType}`
                );
              }}
            >
              Add {selectedAssessmentType}
            </Button>
            <Button
              className="px-2 py-1 text-sm rounded mx-3"
              type="primary"
              onClick={async () => {
                setIsModalOpen(true);
              }}
            >
              Select Default Assessment
            </Button>
            <Modal
              width={500}
              open={isModalOpen}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
            >
              <h2 className="mt-2 font-bold">Select Default Assessment</h2>
              <Select
                placeholder={"Select assessment"}
                style={{ width: 200 }}
                value={selectedDefaultAssessment}
                onChange={async (value) => {
                  setSelectedDefaultAssessment(value);
                }}
              >
                {defaultAssessmentData &&
                  defaultAssessmentData.map((step) => (
                    <Select.Option key={step._id} value={step._id}>
                      {step.name}
                    </Select.Option>
                  ))}
              </Select>
            </Modal>
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

            {assessmentData?.map?.((assessment) => (
              <div
                key={assessment._id}
                className="flex items-center border-b border-gray-300 py-2 overflow-auto"
              >
                <div className="flex-1 px-4">
                  <Space>
                    <div className="flex-1 px-4">{assessment.name || "-"}</div>
                  </Space>
                </div>
                <div className="flex-1 px-4">
                  {assessment.description || "-"}
                </div>
                <div className="flex-1 px-4">
                  <time dateTime={assessment.createdAt} className="mr-2">
                    {moment(assessment.createdAt).format("Do MMM, YYYY")}
                  </time>
                </div>
                <div className="flex-1 px-4">
                  <Space>
                    <Button
                      className="px-2 py-1 text-sm rounded"
                      type="primary"
                      onClick={() => {
                        navigate(`/dashboard/templatepre?id=${assessment._id}`);
                      }}
                    >
                      Edit assessment
                    </Button>
                    <Popconfirm
                      title="Are you sure to delete this assessment?"
                      onConfirm={async () => {
                        const assessments = templateData.assessments.filter(
                          (id) => id !== assessment._id
                        );
                        const mainDefaultAssessment = await CrudService.search(
                          "DefaultAssessment",
                          1,
                          1,
                          { sort: { createdAt: 1 } }
                        );
                        if (
                          mainDefaultAssessment.data.items[0]._id ===
                          assessment._id
                        ) {
                          const id = searchParams.get("id");
                          if (!id) return;
                          await CrudService.update("Template", id, {
                            assessments: assessments,
                          }).then((res) => {
                            setTemplateData(res.data);
                          });
                        } else {
                          const res = await CrudService.delete(
                            "DefaultAssessment",
                            assessment._id
                          );
                          if (res) {
                            const id = searchParams.get("id");
                            if (!id) return;
                            await CrudService.update("Template", id, {
                              assessments: assessments,
                            }).then((res) => {
                              setTemplateData(res.data);
                            });
                          }
                        }
                      }}
                    >
                      <Button danger>Delete assessment</Button>
                    </Popconfirm>
                  </Space>
                </div>
              </div>
            ))}
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
      ),
    },
  ];

  if (!templateData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <Tabs
          activeKey={activeTab}
          onChange={onTemplateTabChange}
          items={templateTab.map((item) => ({
            ...item,
          }))}
          indicatorSize={(origin) => origin - 16}
        />
      </div>
    </>
  );
};

export default TemplateDetails;

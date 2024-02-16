import { Column, Pie } from "@ant-design/charts";
import {
  Button,
  Card,
  Skeleton,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
} from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Select from "../components/Select";
import { countries } from "../data/constants";
import { selectUser } from "../redux/auth/selectors";
import CrudService from "../service/CrudService";
import DashboardService from "../service/DashboardService";
import { sectorOptions } from "./ngo-company/Benchmarks";

const avg = (arr) => {
  if (!arr || !arr.length) return 0;
  const sum = arr.reduce((acc, cur) => acc + cur);
  const average = sum / arr.length;
  return average;
};

const DashboardDetail = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isOnlyMyCountry, setIsOnlyMyCountry] = useState(false);
  const [KPIs, setKPIs] = useState([]);
  const [sdgs, setSdgs] = useState([]);
  const [pendingProgramData, setPendingProgramData] = useState([]);
  const [submittedProgramData, setSubmittedProgramData] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const user = useSelector(selectUser);
  const [country, setCountry] = useState();
  const [year, setYear] = useState(null);

  useEffect(() => {
    setCountry(user.country);
  }, [user]);

  useEffect(() => {
    CrudService.search("BenchMark", 1000000, 1, {
      filters: {
        KPIType: { $in: user.relevantDataset },
      },
    }).then(({ data }) => {
      setBenchmarks(data.items);
    });
  }, [user]);

  const load = useCallback(() => {
    DashboardService.getDashboardDetails().then((res) => {
      if (!res.data) return;
      setData(res.data);
      setKPIs(res.data.KPIs);
      setSdgs(res.data.sdgs);
      setPendingProgramData(res.data.pendingPrograms);
      setSubmittedProgramData(res.data.submissions);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const generateChartData = (data) => {
    return {
      appendPadding: 50,
      data: data,
      angleField: "ratio",
      colorField: "label",
      radius: 0.8,
      autoFit: true,
      label: {
        type: "inner",
        offset: "-30%",
        content: function content(_ref) {
          return "".concat(_ref.ratio, "%");
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
      interactions: [{ type: "pie-legend-active" }, { type: "element-active" }],
    };
  };

  const generateSdgBarChartData = (data) => {
    return {
      data,
      xField: "label",
      yField: "count",
      label: {
        position: "middle",
        style: {
          fill: "#FFFFFF",
          opacity: 0.6,
        },
      },
      xAxis: {
        label: {
          autoHide: true,
          autoRotate: false,
        },
      },
      meta: {
        label: {
          alias: "a",
        },
        count: {
          alias: "Count",
        },
      },
    };
  };

  const submissionColumns = [
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      width: 180,
    },
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
      width: 180,
    },
    {
      title: "Assessment Name",
      dataIndex: "assessmentName",
      key: "assessmentName",
      width: 180,
    },
    {
      title: "Submission Type",
      dataIndex: "submissionType",
      key: "submissionType",
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
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
      width: 160,
      render: (text) => (
        <time dateTime={text} className="">
          {moment(text).format("Do MMM, YYYY")}
        </time>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 100,
      render: (record) => (
        <Space size={[12, 10]} wrap>
          <Button
            className="px-2 py-1 text-sm rounded"
            type="primary"
            onClick={() => {
              navigate(
                `/dashboard/programdetails?id=${record.data.programId._id}`
              );
            }}
          >
            View Submission
          </Button>
        </Space>
      ),
    },
  ];

  const pendingProgramsColumns = [
    {
      title: "Program Name",
      dataIndex: "programName",
      key: "programName",
      width: 160,
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 150,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 350,
      render: (text) => <div className="line-clamp-3">{text}</div>,
    },
    {
      title: "Incomplete Steps",
      dataIndex: "incompleteSteps",
      key: "incompleteSteps",
      width: 180,
      render: (incompleteSteps) => (
        <ul role="list" className="list-disc space-y-1 pl-2">
          {incompleteSteps &&
            incompleteSteps?.map((step) => (
              <li key={step}>
                <span className="px-1">{step}</span>
              </li>
            ))}
        </ul>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 100,
      render: (record) => (
        <Button
          className="px-2 py-1 text-sm rounded"
          type="primary"
          onClick={() => {
            navigate(`/dashboard/suitedetails?id=${record.data._id}`);
          }}
        >
          View Program
        </Button>
      ),
    },
  ];

  if (!data) return <Skeleton active />;

  return (
    <div className="">
      <div className={"mx-auto md:p-4 2xl:p-6 2xl:px-6 bg-[#f1f5f9]"}>
        <div className={"mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5 "}>
          <div className={"col-span-12 xl:col-span-6 shadow-sm bg-white p-8"}>
            <h2 className={"text-gray-900 text-2xl font-bold pb-4"}>
              Statistics by KPIs
            </h2>

            <div>
              {KPIs && KPIs.length > 0 ? (
                <Pie {...generateChartData(KPIs)} />
              ) : (
                <>No KPIs data found</>
              )}
            </div>
          </div>

          <div className={"col-span-12 xl:col-span-6 shadow-sm bg-white p-8"}>
            <div className="flex justify-between items-start">
              <h2 className={"text-gray-900 text-2xl font-bold pb-4"}>
                Benchmarks
              </h2>
              <Space direction="vertical">
                <Switch
                  checked={isOnlyMyCountry}
                  onChange={(e) => setIsOnlyMyCountry(e)}
                  unCheckedChildren="Global"
                  checkedChildren="My Country"
                />

                <div>
                  <label>Country</label>
                  <Select
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e)}
                    options={[{ value: null, label: "" }, ...countries]}
                  />
                </div>

                <div>
                  <label>Year</label>
                  <Select
                    value={year}
                    onChange={(e) => setYear(e)}
                    options={[
                      {
                        value: null,
                        label: "",
                      },
                      ...Array.from(new Set(benchmarks.map((b) => b.year)))
                        .filter((a) => !!a)
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map((a) => ({
                          value: a,
                          label: a,
                        })),
                    ]}
                  />
                </div>
              </Space>
            </div>

            <div>
              {user?.relevantDataset
                ?.filter?.((dataset) =>
                  benchmarks?.some?.((b) => b.KPIType === dataset)
                )
                ?.map?.((dataset, i) => (
                  <div key={i}>
                    <Card bordered={false}>
                      <div className="flex justify-between">
                        <Statistic
                          title={
                            Object.values(sectorOptions)
                              .flat()
                              .find((e) => e.value === dataset)?.label ?? ""
                          }
                          value={avg(
                            benchmarks
                              .filter(
                                (b) =>
                                  b.KPIType === dataset &&
                                  (!isOnlyMyCountry ||
                                    b.country ===
                                      countries.find((c) => country === c.value)
                                        ?.label) &&
                                  (!year ||
                                    !b.year ||
                                    b.year === parseInt(year))
                              )
                              .map((b) => b.total ?? 0)
                          )}
                          precision={2}
                        />
                        {!isOnlyMyCountry && (
                          <Statistic
                            title={`${
                              Object.values(sectorOptions)
                                .flat()
                                .find((e) => e.value === dataset)?.label ?? ""
                            } (${
                              countries.find((c) => c.value === user.country)
                                ?.label
                            })`}
                            value={avg(
                              benchmarks
                                .filter(
                                  (b) =>
                                    b.KPIType === dataset &&
                                    b.country ===
                                      countries.find(
                                        (c) => user.country === c.value
                                      )?.label &&
                                    (!year ||
                                      !b.year ||
                                      b.year === parseInt(year))
                                )
                                .map((b) => b.total ?? 0)
                            )}
                            precision={2}
                          />
                        )}
                      </div>
                    </Card>
                  </div>
                ))}
            </div>
          </div>

          <div className={"col-span-12 shadow-sm bg-white p-8"}>
            <h2 className={"text-gray-900 text-2xl font-bold pb-4"}>
              Recent Submissions
            </h2>
            <div
              className={
                "col-span-12 rounded-sm border border-stroke bg-white  pt-7.5 shadow-default sm:px-7.5 xl:col-span-8"
              }
            >
              <div className="relative overflow-x-auto">
                <Table
                  dataSource={submittedProgramData.map((item, index) => ({
                    key: index,
                    userName:
                      item.user_id?.firstName + " " + item.user_id?.lastName,
                    userEmail: item.user_id?.email,
                    assessmentName: item.programId.name,
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
                  columns={submissionColumns}
                  pagination={false}
                  bordered={false}
                  scroll={{ x: "750px" }}
                  rowKey="_id"
                />
              </div>
            </div>
          </div>

          <div className={"col-span-12 shadow-sm bg-white p-8"}>
            <h2 className={"text-gray-900 text-2xl font-bold pb-4"}>
              Pending Programs
            </h2>
            <div
              className={
                "col-span-12 rounded-sm border border-stroke bg-white pt-7.5 shadow-default sm:px-7.5 xl:col-span-8"
              }
            >
              <div className="relative overflow-x-auto">
                <Table
                  dataSource={pendingProgramData.map((item, index) => {
                    const incompleteSteps = [];
                    if (!item.hasKPIs) incompleteSteps.push("No KPIs");
                    if (!item.hasAssessment)
                      incompleteSteps.push("No Assessment");
                    if (!item.hasPublishAssessment)
                      incompleteSteps.push("No Published Assessment");

                    return {
                      key: index,
                      programName: item.name,
                      categoryName: item.categoryDetails?.Name || "-",
                      description: item.description,
                      incompleteSteps:
                        incompleteSteps.length > 0 ? incompleteSteps : ["-"],
                      data: item,
                    };
                  })}
                  columns={pendingProgramsColumns}
                  pagination={false}
                  bordered={false}
                  scroll={{ x: "750px" }}
                  rowKey="_id"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetail;

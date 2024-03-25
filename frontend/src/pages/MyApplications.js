import { Button, Skeleton, Space, Table, Tag } from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../redux/auth/selectors";
import LoadingSpinner from "../components/Loader";
import CrudService from "../service/CrudService";

const MyApplications = () => {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [submittedProgramData, setSubmittedProgramData] = useState([]);
  const user = useSelector(selectUser);

  const load = useCallback(() => {
    CrudService.search("ProgramSubmission", 10000, 1, {
      filters: { user_id: user?._id },
    }).then(res => {
      if (!res.data) return;
      setSubmittedProgramData(res.data.items);
      setShowLoader(false);
    })
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
            className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
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

  return (
    <div className="">
      <div className={"mx-auto md:p-4 2xl:p-6 2xl:px-6"}>
        <div className={"mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5 "}>
          {showLoader && (
            <>
              <LoadingSpinner />
              {submittedProgramData?.length <= 0 && (
                <span className={"p-3 mt-5"} />
              )}
            </>
          )}
          {submittedProgramData?.length > 0 ? (
            <div
              className={"col-span-12 shadow-sm bg-white dark:bg-gray-900 p-8"}
            >
              <h2
                className={
                  "dark:text-white dark:text-white text-gray-900 text-2xl font-bold pb-4"
                }
              >
                My Submissions
              </h2>
              <div
                className={
                  "col-span-12 rounded-sm border border-stroke bg-white dark:bg-gray-900  pt-7.5 shadow-default sm:px-7.5 xl:col-span-8"
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
                    pagination={true}
                    bordered={false}
                    scroll={{ x: "750px" }}
                    rowKey="_id"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;

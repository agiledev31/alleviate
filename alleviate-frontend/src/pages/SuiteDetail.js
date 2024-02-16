import "allotment/dist/style.css";
import {
    Button,
    Pagination,
    Skeleton,
    Space,
    Tabs,
    Table,
    Tag,
    Modal,
} from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CrudService from "../service/CrudService";
import LoadingSpinner from "../components/Loader";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/auth/selectors";
import TabPane from "antd/es/tabs/TabPane";
import MultiStepComponent from "../components/MultiStepComponent";

const SuiteDetail = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [activeTab, setActiveTab] = useState("assessments");
  const [assessmentData, setAssessmentData] = useState([]);
  const [submissionData, setSubmissionData] = useState([]);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [submissionModal, setSubmissionModal] = useState(false);
  const [selectedSubmissionData, setSelectedSubmissionData] = useState(null);
  const [activeSubmissionTab, setActiveSubmissionTab] = useState('all');
  const user = useSelector(selectUser);

  const load = useCallback(() => {
    const id = searchParams.get("id");
    if (!id) return;

    setActiveTab("assessments");

    CrudService.getSingle("Suite", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
    });
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setAssessmentData([]);
    setTotalAssessments(0);
    const fetchData = async () => {
        if (!programData) return;
      await updateAssessmentData(
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
    limit,
    page
  ) => {
    setShowLoader(true);
    const data = {
      filters: { suite: programData._id, published: true }
    };
    const response = await CrudService.search("Program", limit, page, data);

    const hasInvitedEmails = response.data.items.some(program => program.invitedEmails && program.invitedEmails.includes(user.email));
    if (hasInvitedEmails) {
        const data = {
            filters: { suite: programData._id, published: true, invitedEmails: {$in: [user.email]} }
        };
        const updatedResponse = await CrudService.search("Program", limit, page, data);
        return updatedResponse.data;
    } else {
        return response.data;
    }
  };

const updateAssessmentData = async (
    limit,
    page,
    setAssessmentData,
    setTotalAssessments,
    setPage
  ) => {
    const assessmentData = await fetchAssessmentData(
      limit,
      page
    );
    setShowLoader(false);
    setAssessmentData(assessmentData.items);
    setTotalAssessments(assessmentData.total);
  };

  const handleViewSubmission = (record) => {
    setSubmissionModal(true);
    setSelectedSubmissionData(record)
  }

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
                <Button
                    className="px-2 py-1 text-sm rounded"
                    type="primary"
                    onClick={() => {
                        navigate(`/dashboard/programform?id=${record._id}`);
                    }}
                >
                    Participate
                </Button>
            </Space>
        ),
    },
  ];

  const columns = [
      {
          title: 'Assessment Name',
          dataIndex: 'assessmentName',
          key: 'assessmentName',
      },
      {
        title: 'Submission Type',
        dataIndex: 'submissionType',
        key: 'submissionType',
      },
      {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          render: (text) => (
              <Tag color={
                  text === 'Submitted' ? 'orange' :
                  text === 'Waiting' ? 'orange' :
                  text === 'Approved' ? 'green' :
                  'red'
              }>
                  {text === 'Waiting' ? 'Submitted' : text}
              </Tag>
          ),
      },
      {
        title: 'Date',
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: 150,
        render: (text) => (
            <time dateTime={text} className="mr-2">
                {moment(text).format('Do MMM, YYYY')}
            </time>
        ),
      },
      {
        title: 'Actions',
        key: 'action',
        render: (record) => (
            <Space size={[12, 10]} wrap>
                <Button
                    className="px-2 py-1 text-sm rounded"
                    type="primary"
                    onClick={() => { handleViewSubmission(record) }}
                >
                    View Submission
                </Button>

                <Modal width={800} height={300} open={submissionModal} onOk={() => setSubmissionModal(false)} onCancel={() => setSubmissionModal(false)}>
                    <>
                        {selectedSubmissionData && selectedSubmissionData.data.formData ? (
                            <>
                                <h2 className={'text-lg font-bold mb-2'}>Submitted Data</h2>
                                {selectedSubmissionData.data.formData.hasOwnProperty('submittedData') && (
                                    <>
                                        <MultiStepComponent
                                            displaySteps={true}
                                            steps={selectedSubmissionData.data.programId.form}
                                            defaultValues={{...selectedSubmissionData?.data.formData.submittedData}}
                                            isProgramSubmission={true}
                                        />
                                    </>
                                )}
                                {selectedSubmissionData.data.formData.hasOwnProperty('fileData') && (
                                    <>
                                        <MultiStepComponent
                                            displaySteps={true}
                                            steps={selectedSubmissionData.data.programId.form}
                                            defaultValues={{...selectedSubmissionData?.data.formData.fileData}}
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
            </Space>
        ),
      },
  ];

  const onProgramTabChange = async (type) => {
      setActiveTab(type)

      if (type === 'submissions') {
          setShowLoader(true);
          const data = await fetchSubmissions();
          if (data) {
              setShowLoader(false);
              setSubmissionData(data)
          }
      }
  }

  const fetchSubmissions = async () => {
      const response = await CrudService.search("ProgramSubmission", 1000, 1, {filters: { programId: assessmentData.map(item => item._id), user_id: user._id }});
      return response.data.items;
  };

  const programTab = [
    {
      key: "assessments",
      label: "Assessments",
      children: (
          <>
            <div className="flex mb-3">
              <h3 className="text-lg font-bold">Assessments</h3>
            </div>
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
                            limit,
                            page,
                            setAssessmentData,
                            setTotalAssessments,
                            setPage
                        );
                      }}
                  />
              )}
            </div>
          </>
      )
    },
    {
      key: "submissions",
      label: "Submissions",
      children: (
        <>
            <Tabs activeKey={activeSubmissionTab} onChange={(key) => setActiveSubmissionTab(key)}>
                <TabPane tab="All" key="all">
                    {submissionData.length > 0 ? (
                        <Table
                            dataSource={submissionData
                                .map((item, index) => ({
                                    key: index,
                                    assessmentName: item.programId?.name,
                                    submissionType: 'Online',
                                    status: (() => {
                                    if (item.status === 'reject') {
                                        return 'Rejected';
                                    } else if (item.status === 'approve') {
                                        return 'Approved';
                                    } else {
                                        return 'Waiting';
                                    }
                                })(),
                                data: item,
                            }))}
                            columns={columns}
                            pagination={false}
                            bordered={false}
                            scroll={{ x: '700px'}}
                            rowKey="_id"
                        />
                    ) : (
                        <div>
                            {showLoader ? (
                                <>
                                    <LoadingSpinner />
                                </>
                            ): (
                                <strong> No Submission Data Found  </strong>
                            )}
                        </div>
                    )}
                </TabPane>
                <TabPane tab="Approved" key="approved">
                    {submissionData.length > 0 ? (
                        <Table
                            dataSource={submissionData
                                .filter(item => item.status === 'approve')
                                .map((item, index) => ({
                                    key: index,
                                    assessmentName: item.programId?.name,
                                    submissionType: 'Online',
                                    status: (() => {
                                        if (item.status === 'reject') {
                                            return 'Rejected';
                                        } else if (item.status === 'approve') {
                                            return 'Approved';
                                        } else {
                                            return 'Waiting';
                                        }
                                    })(),
                                    data: item,
                                }))}
                            columns={columns}
                            pagination={false}
                            bordered={false}
                            scroll={{ x: '700px'}}
                            rowKey="_id"
                        />
                    ) : (
                        <div>
                            {showLoader ? (
                                <>
                                    <LoadingSpinner />
                                </>
                            ): (
                                <strong> No Approved Submission Data Found  </strong>
                            )}
                        </div>
                    )}
                </TabPane>
                <TabPane tab="Waiting List" key="waiting">
                    {submissionData.length > 0 ? (
                        <Table
                            dataSource={submissionData
                                .filter(item => item.status === 'not-approve')
                                .map((item, index) => ({
                                    key: index,
                                    assessmentName: item.programId?.name,
                                    submissionType: 'Online',
                                    status: (() => {
                                        if (item.status === 'reject') {
                                            return 'Rejected';
                                        } else if (item.status === 'approve') {
                                            return 'Approved';
                                        } else {
                                            return 'Waiting';
                                        }
                                    })(),
                                    data: item,
                                }))}
                            columns={columns}
                            pagination={false}
                            bordered={false}
                            scroll={{ x: '700px'}}
                            rowKey="_id"
                        />
                    ) : (
                        <div>
                            {showLoader ? (
                                <>
                                    <LoadingSpinner />
                                </>
                            ): (
                                <strong> No Waiting Submission Data Found  </strong>
                            )}
                        </div>
                    )}
                </TabPane>
                <TabPane tab="Rejected" key="reject">
                    {submissionData.length > 0 ? (
                        <Table
                            dataSource={submissionData
                                .filter((item) => item.status === 'reject')
                                .map((item, index) => ({
                                    key: index,
                                    assessmentName: item.programId?.name,
                                    submissionType: 'Online',
                                    status: (() => {
                                        if (item.status === 'reject') {
                                            return 'Rejected';
                                        } else if (item.status === 'approve') {
                                            return 'Approved';
                                        } else {
                                            return 'Waiting';
                                        }
                                    })(),
                                    data: item,
                                }))}
                            columns={columns}
                            pagination={false}
                            bordered={false}
                            scroll={{ x: '700px'}}
                            rowKey="_id"
                        />
                    ) : (
                        <div>
                            {showLoader ? (
                                <>
                                    <LoadingSpinner />
                                </>
                            ): (
                                <strong> No Rejected Submission Data Found  </strong>
                            )}
                        </div>
                    )}
                </TabPane>
            </Tabs>

            {/*<Tabs activeKey={activeSubmissionTab} onChange={(key) => setActiveSubmissionTab(key)}>*/}
            {/*    <TabPane tab="Submitted" key="submitted">*/}
            {/*        <div className={"relative assessments-tabs"}>*/}
            {/*            {submissionData.length > 0 ? (*/}
            {/*                <Table*/}
            {/*                    dataSource={submissionData*/}
            {/*                        .filter((item) => (item.formData.isFinishClicked && item.formData.hasOwnProperty('submittedData')))*/}
            {/*                        .map((item, index) => ({*/}
            {/*                            key: index,*/}
            {/*                            assessmentName: item.programId?.name,*/}
            {/*                            submissionType: 'Online',*/}
            {/*                            status: (() => {*/}
            {/*                                if (item.status === 'reject') {*/}
            {/*                                    return 'Rejected';*/}
            {/*                                } else if (item.status === 'approve') {*/}
            {/*                                    return 'Approved';*/}
            {/*                                } else {*/}
            {/*                                    return 'Waiting';*/}
            {/*                                }*/}
            {/*                            })(),*/}
            {/*                            data: item,*/}
            {/*                        }))}*/}
            {/*                    columns={columns}*/}
            {/*                    pagination={false}*/}
            {/*                    bordered={false}*/}
            {/*                    scroll={{ x: '700px'}}*/}
            {/*                    rowKey="_id"*/}
            {/*                />*/}
            {/*            ) : (*/}
            {/*                <div>*/}
            {/*                    {showLoader ? (*/}
            {/*                        <>*/}
            {/*                            <LoadingSpinner />*/}
            {/*                        </>*/}
            {/*                    ) : (*/}
            {/*                        <strong>No  Data Found</strong>*/}
            {/*                    )}*/}
            {/*                </div>*/}
            {/*            )}*/}
            {/*        </div>*/}
            {/*    </TabPane>*/}
            {/*    <TabPane tab="Pending" key="pending">*/}
            {/*        <div className={"relative assessments-tabs"}>*/}
            {/*            {submissionData.length > 0 ? (*/}
            {/*                <Table*/}
            {/*                    dataSource={submissionData*/}
            {/*                        .filter((item) => (!item.formData.isFinishClicked && item.formData.hasOwnProperty('submittedData')))*/}
            {/*                        .map((item, index) => ({*/}
            {/*                            key: index,*/}
            {/*                            assessmentName: item.programId?.name,*/}
            {/*                            submissionType: 'Online',*/}
            {/*                            // status: item.formData.isFinishClicked ? 'Submitted' : 'Pending',*/}
            {/*                            status: (() => {*/}
            {/*                                if (!item.formData.isFinishClicked) {*/}
            {/*                                    return 'Pending'*/}
            {/*                                } else if (item.status === 'reject') {*/}
            {/*                                    return 'Reject';*/}
            {/*                                } else if (item.status === 'approve') {*/}
            {/*                                    return 'Approved';*/}
            {/*                                } else {*/}
            {/*                                    return 'Waiting';*/}
            {/*                                }*/}
            {/*                            })(),*/}
            {/*                            data: item,*/}
            {/*                        }))}*/}
            {/*                    columns={columns}*/}
            {/*                    pagination={false}*/}
            {/*                    bordered={false}*/}
            {/*                    scroll={{ x: '700px'}}*/}
            {/*                    rowKey="_id"*/}
            {/*                />*/}
            {/*            ) : (*/}
            {/*                <div>*/}
            {/*                    {showLoader ? (*/}
            {/*                        <>*/}
            {/*                            <LoadingSpinner />*/}
            {/*                        </>*/}
            {/*                    ): (*/}
            {/*                        <strong> No Pending Data Found </strong>*/}
            {/*                    )}*/}
            {/*                </div>*/}
            {/*            )}*/}
            {/*        </div>*/}
            {/*    </TabPane>*/}
            {/*</Tabs>*/}
        </>
      )
    },
  ];

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
          <Button
              className="px-2 py-1 text-sm rounded mb-5"
              type="primary"
              onClick={() => {
                  const id = searchParams.get("id");
                  if (!id) return;

                  navigate(`/dashboard/programoverview?id=${id}`);
              }}
          >
              Back to Program
          </Button>

          <h1 className="text-3xl font-extrabold text-indigo-900 mb-3">{programData.name}</h1>

          <Tabs
            activeKey={activeTab}
            onChange={onProgramTabChange}
            items={programTab.map((item) => ({
              ...item
            }))}
            indicatorSize={(origin) => origin - 16}
        />
      </div>
    </>
  );
};

export default SuiteDetail;

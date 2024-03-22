import "allotment/dist/style.css";
import {
  Button,
  Card,
  Col,
  Divider,
  Popconfirm,
  Progress,
  Row,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import {
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { selectUser } from "../../redux/auth/selectors";
import CrudService from "../../service/CrudService";

const SuiteDetails = () => {
  const user = useSelector(selectUser);
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [assessmentType, setAssessmentType] = useState("enrollment");
  const [assessmentData, setAssessmentData] = useState([]);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [hasKPIs, setHasKPIs] = useState(false);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [hasPublishAssessment, setHasPublishAssessment] = useState(false);

  const load = useCallback(() => {
    const id = searchParams.get("id");
    if (!id) return;

    CrudService.getSingle("Suite", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
      setHasKPIs(!!(res.data.KPIs && res.data.KPIs.length > 0));
      percentage > 0 && (hasAssessment || hasPublishAssessment)
        ? setPercentage(
            res.data.KPIs && res.data.KPIs.length > 0 ? percentage + 33.33 : 0
          )
        : setPercentage(res.data.KPIs && res.data.KPIs.length > 0 ? 33.33 : 0);
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

  const fetchAssessmentData = async (assessmentType, limit, page) => {
    setShowLoader(true);

    const assessmentRes = await CrudService.search("Program", 1, 1, {
      filters: { suite: programData._id, isDefaultAssessment: false },
    });
    const publishAssessmentRes = await CrudService.search("Program", 1, 1, {
      filters: {
        suite: programData._id,
        isDefaultAssessment: false,
        published: true,
      },
    });
    const assessmentPercentage =
      assessmentRes.data &&
      assessmentRes.data.items &&
      assessmentRes.data.items.length > 0
        ? 33.33
        : 0;
    const publishAssessmentPercentage =
      publishAssessmentRes.data &&
      publishAssessmentRes.data.items &&
      publishAssessmentRes.data.items.length > 0
        ? 33.34
        : 0;
    setPercentage(
      percentage + assessmentPercentage + publishAssessmentPercentage
    );
    setHasAssessment(
      !!(
        assessmentRes.data &&
        assessmentRes.data.items &&
        assessmentRes.data.items.length > 0
      )
    );
    setHasPublishAssessment(
      !!(
        publishAssessmentRes.data &&
        publishAssessmentRes.data.items &&
        publishAssessmentRes.data.items.length > 0
      )
    );

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

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <Row className={"mb-4"}>
          <Col span={12}>
            <Card className="p-2">
              <Progress
                percent={percentage}
                status="active"
                type={"line"}
                trailColor={"red"}
                color={"blue"}
              />
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
                      navigate(
                        `/dashboard/suiteoverviewdetail?id=${programData._id}&tab=kpis`
                      );
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
                      navigate(
                        `/dashboard/suiteoverviewdetail?id=${programData._id}&tab=assessments`
                      );
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                  {hasPublishAssessment ? (
                    <AiOutlineCheckCircle color={"green"} size={25} />
                  ) : (
                    <AiOutlineCloseCircle color={"red"} size={25} />
                  )}
                  <h3 className={"text-lg font-bold px-2"}>
                    Publish Assessment
                  </h3>
                </div>
                <div>
                  <AiOutlineArrowRight
                    size={25}
                    className="cursor-pointer"
                    onClick={() => {
                      navigate(
                        `/dashboard/suiteoverviewdetail?id=${programData._id}&tab=kpis`
                      );
                    }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

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
            <Tooltip
              title={
                programData?.favoriteBy.includes(user._id)
                  ? "Remove from Favorite"
                  : "Add to Favorite"
              }
            >
              {programData &&
              programData.hasOwnProperty("favoriteBy") &&
              programData.favoriteBy.includes(user._id) ? (
                <MdFavorite
                  className={"mx-5 cursor-pointer"}
                  color={"red"}
                  size={26}
                  onClick={async () => {
                    const id = searchParams.get("id");
                    if (!id) return;
                    await CrudService.update("Suite", id, {
                      favoriteBy: programData.favoriteBy.filter(
                        (id) => id !== user._id
                      ),
                    }).then((res) => {
                      if (res.data) {
                        setProgramData(res.data);
                      }
                    });
                  }}
                />
              ) : (
                <MdFavoriteBorder
                  className={"mx-5 cursor-pointer"}
                  size={26}
                  onClick={async () => {
                    const id = searchParams.get("id");
                    if (!id) return;
                    await CrudService.update("Suite", id, {
                      favoriteBy: [...programData.favoriteBy, user._id],
                    }).then((res) => {
                      if (res.data) {
                        setProgramData(res.data);
                      }
                    });
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
            {programData?.endDate && (
              <p className={"py-2"}>
                <strong>End Date</strong>:{" "}
                {moment(programData.endDate).format("LLLL")}
              </p>
            )}
          </div>

          <Divider />
          <Space>
            <Button
              className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
              type="primary"
              onClick={() => {
                const id = searchParams.get("id");
                if (!id) return;

                navigate(`/dashboard/suiteoverviewdetail?id=${id}`);
              }}
            >
              View Program
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
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
              <Button className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white">
                Duplicate Program
              </Button>
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
                      ? "grantopportunities"
                      : "myprograms"
                  }`
                );
              }}
            >
              <Button
                danger
                className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
              >
                Delete Program
              </Button>
            </Popconfirm>
          </Space>
        </>
      </div>
    </>
  );
};

export default SuiteDetails;

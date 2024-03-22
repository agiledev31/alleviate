import "allotment/dist/style.css";
import { Button, Divider, Skeleton, Space, Tooltip, Typography } from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { selectUser } from "../redux/auth/selectors";
import CrudService from "../service/CrudService";

const SuiteDetails = () => {
  const user = useSelector(selectUser);
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);

  const load = useCallback(() => {
    const id = searchParams.get("id");
    if (!id) return;

    CrudService.getSingle("Suite", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
    });
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <div className={"flex justify-between mb-4"}>
          <div className="text-3xl font-extrabold text-indigo-900">
            <Typography.Title
              level={2}
              editable={
                user?.role !== "ngo-beneficiary" && {
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
                }
              }
            >
              {programData?.name}
            </Typography.Title>
          </div>
          <Tooltip
            title={
              programData?.favoriteBy?.includes(user._id)
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
            editable={
              user?.role !== "ngo-beneficiary" && {
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
              }
            }
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

              navigate(`/dashboard/suitedetail?id=${id}`);
            }}
          >
            View Program
          </Button>
        </Space>
      </div>
    </>
  );
};

export default SuiteDetails;

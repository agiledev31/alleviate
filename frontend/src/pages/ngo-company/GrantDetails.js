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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { countries, STANDARD_MOMENT_FORMAT } from "../../data/constants";
import { selectDarkMode, selectUser } from "../../redux/auth/selectors";
import AuthService from "../../service/AuthService";
import CrudService from "../../service/CrudService";
import NotificationService from "../../service/NotificationService";
import StatsService from "../../service/StatsService";
import StrapiService from "../../service/StrapiService";
import UserService from "../../service/UserService";
import { humanReadableRevenue } from "./GrantPreInformation";

const GrantDetails = ({ mockProgramData }) => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [serverProgramData, setServerProgramData] = useState(null);
  const [favorite, setFavorite] = useState(null);

  const load = useCallback(() => {
    const id = searchParams.get("id");
    if (!id) return;

    CrudService.getSingle("Suite", id).then((res) => {
      if (!res.data) return;
      setServerProgramData(res.data);
    });
  }, [searchParams]);
  useEffect(() => {
    if (!mockProgramData) load();
  }, [load, mockProgramData]);
  const programData = useMemo(
    () => mockProgramData ?? serverProgramData,
    [mockProgramData, serverProgramData]
  );

  useEffect(() => {
    const id = mockProgramData?._id ?? searchParams.get("id");
    if (!id) return;
    if (!user) return;

    CrudService.search("SuiteFavorite", 1, 1, {
      filters: { suite: id, user_id: user._id },
    }).then((response) => {
      const item = response.data?.items?.[0];
      if (item) setFavorite(item._id);
    });
  }, [mockProgramData, serverProgramData, user]);

  const isOpen = useMemo(() => {
    return new Date(programData?.applicationDeadline) > new Date();
  }, [programData]);

  if (!programData) return <Skeleton active />;
  return (
    <>
      <Breadcrumb
        items={[
          {
            title: (
              <Link to="/dashboard/grantopportunities">
                Grant Opportunities
              </Link>
            ),
          },
          {
            title: (
              <Link to={`/dashboard/grantdetail?id=${programData?._id}`}>
                {programData?.name ?? ""}
              </Link>
            ),
          },
        ]}
      />
      <div className=" mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center ">
          <h2 className="text-xl font-semibold text-gray-700">
            {programData?.name ?? ""}{" "}
            {isOpen ? (
              <span className="border border-1 border-green-600 rounded-full p-2 text-sm text-green-600">
                Open
              </span>
            ) : (
              <span className="border border-1 border-red-600 rounded-full p-2 text-sm text-red-600">
                Closed
              </span>
            )}
          </h2>
          {user?.role === "admin" && (
            <div className="flex gap-1">
              <button
                className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                onClick={() => {
                  navigate(`/dashboard/grantpre?id=${programData?._id}`);
                }}
              >
                Edit
              </button>
              {!programData?.published && (
                <button
                  className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                  onClick={async () => {
                    await CrudService.update("Suite", programData?._id, {
                      published: true,
                    });
                    load();
                  }}
                >
                  Publish
                </button>
              )}
              <Popconfirm
                title="Are you sure?"
                onConfirm={async () => {
                  await CrudService.delete("Suite", programData?._id);
                  navigate("/dashboard/grantopportunities");
                }}
              >
                <button className="bg-gradient-to-r from-red-300 to-red-500 hover:from-red-400 hover:to-red-700 text-white font-bold py-1 px-4 rounded">
                  Delete
                </button>
              </Popconfirm>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-2">
          {favorite ? (
            <button
              className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
              onClick={async () => {
                await CrudService.delete("SuiteFavorite", favorite);
                setFavorite(null);
              }}
            >
              Remove from Favorites
            </button>
          ) : (
            <button
              className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
              onClick={async () => {
                const item = await CrudService.create("SuiteFavorite", {
                  user_id: user._id,
                  suite: programData?._id,
                });
                if (item.data) setFavorite(item.data._id);
              }}
            >
              Save as Favorite
            </button>
          )}
        </div>
        <div className="border-t border-b py-4 mt-6">
          <div className="flex flex-wrap -mx-3 mb-2 ">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="application-deadline"
              >
                Application Deadline
              </label>
              <p id="application-deadline" className="text-gray-700">
                {moment(programData?.applicationDeadline).format(
                  STANDARD_MOMENT_FORMAT
                )}
              </p>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="application-deadline"
              >
                Funding Amount
              </label>
              <p id="application-deadline" className="text-gray-700">
                ${humanReadableRevenue(programData?.fundingAmount?.[0])} - $
                {humanReadableRevenue(programData?.fundingAmount?.[1])}
              </p>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-4">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="location"
              >
                Location
              </label>
              <p id="location" className="text-gray-700">
                {programData?.locations
                  ?.map?.(
                    (a) =>
                      countries.find((c) => c.value === a?.country ?? "US")
                        ?.label
                  )
                  ?.join?.(", ")}
              </p>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-4">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="location"
              >
                Eligible Nationalities
              </label>
              <p id="location" className="text-gray-700">
                {programData?.eligibleNationalities
                  ?.map?.(
                    (a) =>
                      countries.find((c) => c.value === a?.country ?? "US")
                        ?.label
                  )
                  ?.join?.(", ")}
              </p>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-4">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="location"
              >
                Sectors
              </label>
              <p id="location" className="text-gray-700">
                {programData?.sectors?.map?.((a) => a)?.join?.(", ")}
              </p>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-4">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="location"
              >
                Funding Agencies
              </label>
              <p id="location" className="text-gray-700">
                {programData?.fundingAgencies?.map?.((a) => a)?.join?.(", ")}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Description
          </h3>
          <div
            dangerouslySetInnerHTML={{
              __html: programData?.description?.replace?.(/\n/g, "<br>"),
            }}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Attachments
          </h3>
          {programData?.attachments?.map?.((attachment) => (
            <a href={attachment} target="_blank">
              {attachment}
            </a>
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Links</h3>
          {programData?.urlLinks?.map?.((attachment) => (
            <a href={attachment.URL} target="_blank">
              {attachment.URL}
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default GrantDetails;

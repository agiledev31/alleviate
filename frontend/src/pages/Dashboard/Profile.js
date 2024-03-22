import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Divider,
  Modal,
  Skeleton,
  Switch,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaKickstarter,
  FaLinkedin,
  FaMedium,
  FaPinterest,
  FaStackOverflow,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { HiOutlineMapPin } from "react-icons/hi2";
import { IoCallOutline } from "react-icons/io5";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdOutlineMailOutline,
} from "react-icons/md";
import { SiFiverr, SiFreelancer, SiGofundme, SiUpwork } from "react-icons/si";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectDarkMode, selectUser } from "../../redux/auth/selectors";
import CrudService from "../../service/CrudService";
const { Paragraph } = Typography;

const Profile = () => {
  const user = useSelector(selectUser);
  const darkMode = useSelector(selectDarkMode);
  const navigate = useNavigate();
  const [profilePreviewModal, setProfilePreviewModal] = useState(false);
  const [upcomingPrograms, setUpcomingPrograms] = useState([]);
  const [expandedMap, setExpandedMap] = useState({});
  const [coverPhotoDimensions, setCoverPhotoDimensions] = useState({
    width: 0,
    height: 0,
  });

  const socialMediaIcons = {
    facebook: <FaFacebook color={"blue"} size={26} />,
    twitter: <FaTwitter color={"#1DA1F2"} size={26} />,
    linkedin: <FaLinkedin color={"#0077B5"} size={26} />,
    instagram: <FaInstagram color={"#fccc63"} size={26} />,
    youtube: <FaYoutube color={"#FF0000"} size={26} />,
    pinterest: <FaPinterest color={"#E60023"} size={26} />,
    tiktok: <FaTiktok color={"#ff0050"} size={26} />,
    github: <FaGithub color={"#4078c0"} size={26} />,
    medium: <FaMedium color={"#66cdaa"} size={26} />,
    fiverr: <SiFiverr color={"#00b22d"} size={26} />,
    upwork: <SiUpwork color={"#6fda44"} size={26} />,
    freelancer: <SiFreelancer color={"#29B2FE"} size={26} />,
    stackoverflow: <FaStackOverflow color={"#f58025"} size={26} />,
    "donor-advised funds": null,
    gofundme: <SiGofundme color={"#02a95c"} size={26} />,
    kickstarter: <FaKickstarter color={"#05ce78"} size={26} />,
    indiegogo: null,
  };

  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const getData = async () => {
    const filter = {
      startDate: {
        $exists: true,
        $gte: today,
        $lte: oneWeekLater,
      },
      isGrantOpportunity: true,
    };
    await CrudService.search("Suite", 15, 1, {
      filters: filter,
      sort: { createdAt: -1 },
    }).then((res) => {
      if (!res.data) return;

      setUpcomingPrograms(res.data.items);
    });
  };

  const toggleExpanded = (programId) => {
    setExpandedMap((prevMap) => ({
      ...prevMap,
      [programId]: !prevMap[programId],
    }));
  };

  const shouldShowReadMore = (program) =>
    program.description.length > 300 && !expandedMap[program._id];

  const truncatedDescription = (program) => program.description.slice(0, 300);

  const extractCVFileName = (url) => {
    return url.substring(url.lastIndexOf("/") + 1);
  };

  const openCVInNewTab = () => {
    if (user.cvDocument) {
      window.open(user.cvDocument, "_blank");
    }
  };

  useEffect(() => {
    if (!user) return;
    setUpcomingPrograms([]);
    getData();

    if (user.coverPhoto) {
      const img = new Image();
      img.src = user.coverPhoto;
      img.onload = () => {
        const dimensions = { width: img.width, height: img.height };
        setCoverPhotoDimensions(dimensions);
      };
    }
  }, []);

  const profileTab = [
    {
      key: "My Profile",
      label: (
        <label
          style={{ fontSize: "18px", fontWeight: "600", cursor: "pointer" }}
        >
          My Profile
        </label>
      ),
      children: (
        <>
          <div className={"w-full"}>
            <div className={"border p-6"}>
              <div className={"py-6 pt-4"}>
                <div className={"w-full xl:ps-[25px]"}>
                  <div className={"flex gap-3  md:items-center "}>
                    <p
                      className={
                        "font-bold text-base md:w-[25%] w-[22%] lg:w-[16%] sm-w-[50%]"
                      }
                    >
                      Company Name:
                    </p>
                    <p className={"md:w-[75%] w-[50%]"}>{user.companyName}</p>
                  </div>
                  <div className={"flex gap-3 mt-2 items-center "}>
                    <p
                      className={
                        "font-bold text-base md:w-[25%] w-[22%] lg:w-[16%] sm-w-[50%]"
                      }
                    >
                      Organization:
                    </p>
                    <p className={"md:w-[75%] w-[50%]"}>
                      {user.organizationType}
                    </p>
                  </div>
                  <div className={"flex gap-3 mt-2 "}>
                    <p
                      className={
                        "font-bold text-base md:w-[25%] w-[22%] lg:w-[16%] sm-w-[50%]"
                      }
                    >
                      About:
                    </p>
                    <p className={"md:w-[75%] w-[50%]"}>{user.about}</p>
                  </div>
                  <div className={"flex gap-3 mt-2 "}>
                    <p
                      className={
                        "font-bold text-base md:w-[25%] w-[22%] lg:w-[16%] sm-w-[50%]"
                      }
                    >
                      Social Media Links:
                    </p>
                    {user.socialMediaLinks.length > 0 ? (
                      <div className="flex">
                        {user.socialMediaLinks.map((item, index) => (
                          <div key={index} className="mr-2">
                            <Tooltip
                              title={item.platform + " - " + item.link}
                              className={"capitalize"}
                            >
                              <a className={"pointer"} href={"#"}>
                                {socialMediaIcons[item.platform]}
                              </a>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No Social Media Links Available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      key: "My Documents",
      label: (
        <label
          style={{ fontSize: "18px", fontWeight: "600", cursor: "pointer" }}
        >
          My Documents
        </label>
      ),
      children: (
        <>
          <div className={"w-full"}>
            <div className={"border p-6"}>
              <div className={"grid xl:grid-cols-3 md:grid-cols-2 gap-5"}>
                <div className={""}>
                  <h6 className={"font-semibold text-lg mb-2"}>Cover Photo</h6>
                  <p>
                    <span className={"font-bold"}>Photo Dimensions:</span>{" "}
                    {coverPhotoDimensions.width} w x{" "}
                    {coverPhotoDimensions.height} h pixels
                  </p>
                  <div className={"overflow-hidden border rounded-md p-2"}>
                    {user.coverPhoto ? (
                      <img
                        src={user.coverPhoto}
                        className={"rounded-md w-full h-full object-fit"}
                      />
                    ) : (
                      <PhotoIcon
                        className="rounded-md dark:text-white text-gray-300"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>
                <div className={""}>
                  <h6 className={"font-semibold text-lg mb-2"}>
                    Curriculum Vitae
                  </h6>
                  <div className={"border rounded-md p-5 mt-8"}>
                    {user?.cvDocument ? (
                      <div>
                        {/*<Tooltip title={'View CV'}>*/}
                        {/*    <a href={user?.cvDocument} target="_blank" rel="noopener noreferrer" className={'font-bold mt-3'}>*/}
                        {/*        {extractCVFileName(user?.cvDocument)}*/}
                        {/*    </a>*/}
                        {/*</Tooltip>*/}
                        <p className={"font-bold mt-3"}>
                          {extractCVFileName(user?.cvDocument)}
                        </p>
                      </div>
                    ) : (
                      <p>
                        <strong>No uploaded curriculum citae file</strong>
                      </p>
                    )}
                    <Button
                      type="primary"
                      className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white my-5"
                      disabled={!user?.cvDocument}
                      onClick={openCVInNewTab}
                    >
                      View CV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      key: "Upcoming Events",
      label: (
        <label
          style={{ fontSize: "18px", fontWeight: "600", cursor: "pointer" }}
        >
          Upcoming Events
        </label>
      ),
      children: (
        <>
          <div className={"w-full"}>
            {upcomingPrograms && upcomingPrograms.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                {upcomingPrograms.map((programType) => (
                  <div
                    key={programType._id}
                    className="max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out border p-[20px] rounded-md bg-[#98a9b817]"
                  >
                    <div className="px-3 pt-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-xl mb-2">
                          {programType.name}
                        </div>
                        <div className="flex items-center justify-between">
                          <Tooltip
                            title={
                              programType.published
                                ? "Published"
                                : "Unpublished"
                            }
                          >
                            <Switch
                              size="small"
                              checked={programType.published}
                              onChange={async (value) => {
                                setUpcomingPrograms((prevPrograms) =>
                                  prevPrograms.map((p) =>
                                    p._id === programType._id
                                      ? { ...p, published: value }
                                      : p
                                  )
                                );
                                await CrudService.update(
                                  "Suite",
                                  programType._id,
                                  {
                                    published: value,
                                  }
                                )
                                  .then((res) => {
                                    if (res.data) {
                                    }
                                  })
                                  .catch((error) => {
                                    setUpcomingPrograms((prevPrograms) =>
                                      prevPrograms.map((p) =>
                                        p._id === programType._id
                                          ? { ...p, published: !value }
                                          : p
                                      )
                                    );
                                  });
                              }}
                            />
                          </Tooltip>
                          <Tooltip
                            title={
                              programType.isFavorite
                                ? "Remove from Favorite"
                                : "Add to Favorite"
                            }
                          >
                            {programType &&
                            programType.hasOwnProperty("isFavorite") &&
                            programType.isFavorite ? (
                              <MdFavorite
                                className={"mx-1 cursor-pointer"}
                                stroke={"red"}
                                color={"red"}
                                size={22}
                                onClick={async (value) => {
                                  setUpcomingPrograms((prevPrograms) =>
                                    prevPrograms.map((p) =>
                                      p._id === programType._id
                                        ? { ...p, isFavorite: false }
                                        : p
                                    )
                                  );
                                  await CrudService.update(
                                    "Suite",
                                    programType._id,
                                    {
                                      isFavorite: false,
                                    }
                                  )
                                    .then((res) => {
                                      if (res.data) {
                                      }
                                    })
                                    .catch((error) => {
                                      setUpcomingPrograms((prevPrograms) =>
                                        prevPrograms.map((p) =>
                                          p._id === programType._id
                                            ? { ...p, isFavorite: false }
                                            : p
                                        )
                                      );
                                    });
                                }}
                              />
                            ) : (
                              <MdFavoriteBorder
                                className={"mx-1 cursor-pointer"}
                                stroke={"red"}
                                size={22}
                                onClick={async (value) => {
                                  setUpcomingPrograms((prevPrograms) =>
                                    prevPrograms.map((p) =>
                                      p._id === programType._id
                                        ? { ...p, isFavorite: true }
                                        : p
                                    )
                                  );
                                  await CrudService.update(
                                    "Suite",
                                    programType._id,
                                    {
                                      isFavorite: true,
                                    }
                                  )
                                    .then((res) => {
                                      if (res.data) {
                                      }
                                    })
                                    .catch((error) => {
                                      setUpcomingPrograms((prevPrograms) =>
                                        prevPrograms.map((p) =>
                                          p._id === programType._id
                                            ? { ...p, isFavorite: true }
                                            : p
                                        )
                                      );
                                    });
                                }}
                              />
                            )}
                          </Tooltip>
                        </div>
                      </div>
                      <Paragraph
                        className="dark:text-white dark:text-white text-gray-700 text-base m-0"
                        ellipsis={{
                          rows: 500,
                          expandable: false,
                        }}
                      >
                        {expandedMap[programType._id] ||
                        !shouldShowReadMore(programType) ? (
                          programType.description
                        ) : (
                          <>
                            {truncatedDescription(programType)}
                            {shouldShowReadMore(programType) && (
                              <>
                                ...
                                <span
                                  className="cursor-pointer text-primary"
                                  onClick={() =>
                                    toggleExpanded(programType._id)
                                  }
                                >
                                  {" "}
                                  Read more
                                </span>
                              </>
                            )}
                          </>
                        )}
                      </Paragraph>
                    </div>
                    <div className="px-6 pt-1 pb-2">
                      <button
                        className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                        onClick={async () => {
                          navigate(
                            `/dashboard/suitedetails?id=${programType._id}`
                          );
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={" border p-[20px] rounded-md bg-[#98a9b817] mt-3"}
              >
                <div className={"md:flex gap-8"}>No upcoming event</div>
              </div>
            )}
          </div>
        </>
      ),
    },
    {
      key: "Opportunities Alert",
      label: (
        <label
          style={{ fontSize: "18px", fontWeight: "600", cursor: "pointer" }}
        >
          Opportunities Alert
        </label>
      ),
      children: (
        <>
          <div className={"w-full border p-6"}>
            <strong>No Data Found</strong>
          </div>
        </>
      ),
    },
    {
      key: "Announcements",
      label: (
        <label
          style={{ fontSize: "18px", fontWeight: "600", cursor: "pointer" }}
        >
          Announcements
        </label>
      ),
      children: (
        <>
          <div className={"w-full border p-6"}>
            <strong>No Data Found</strong>
          </div>
        </>
      ),
    },
  ];
  if (!user) return <Skeleton />;

  return (
    <div className="relative flex flex-col w-full min-w-0 mb-6 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30 draggable pb-4">
      <div className="px-9 pt-9 flex-auto min-h-[70px] pb-0 bg-transparent">
        <div className="flex flex-wrap mb-6 xl:flex-nowrap">
          <div className="mb-5 mr-5">
            <div className="relative inline-block shrink-0 rounded-2xl">
              {user.avatar ? (
                <img
                  className="inline-block shrink-0 rounded-2xl w-[80px] h-[80px] lg:w-[160px] lg:h-[160px]"
                  src={user.avatar}
                  alt="Avatar"
                />
              ) : (
                <UserCircleIcon
                  className="h-12 w-12 dark:text-white text-gray-300"
                  aria-hidden="true"
                />
              )}
              <div className="group/tooltip relative">
                <span className="w-[15px] h-[15px] absolute bg-success rounded-full bottom-0 end-0 -mb-1 -mr-2  border border-white" />
              </div>
            </div>
          </div>
          <div className="grow">
            <div className="flex flex-wrap items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <a
                    className="text-secondary-inverse hover:text-primary transition-colors duration-200 ease-in-out font-semibold text-[1.5rem] mr-1"
                    href="javascript:void(0)"
                  >
                    {user.firstName + " " + user.lastName}
                  </a>
                </div>
                <div className="">
                  <div className={"flex mt-2"}>
                    <a
                      className="flex items-center mb-2 mr-5 text-secondary-dark hover:text-primary"
                      href="javascript:void(0)"
                    >
                      <span className="mr-1">
                        <IoCallOutline size={20} />
                      </span>
                      {user.phone}
                    </a>
                    <a
                      className="flex items-center mb-2 mr-5 text-secondary-dark hover:text-primary"
                      href="javascript:void(0)"
                    >
                      <span className="mr-1">
                        <MdOutlineMailOutline size={20} />
                      </span>
                      {user.email}
                    </a>
                  </div>
                  <div className={"flex flex-wrap pr-2 mb-4 font-medium"}>
                    <a
                      className="flex items-center mb-2 mr-5 text-secondary-dark hover:text-primary"
                      href="javascript:void(0)"
                    >
                      <span className="mr-1">
                        <HiOutlineMapPin size={20} />
                      </span>{" "}
                      {user.line1 +
                        ", " +
                        (user.line2 ? user.line2 + ", " : "") +
                        user.city +
                        ", " +
                        user.state +
                        ", " +
                        user.country}
                    </a>
                  </div>
                  <Button
                    type="primary"
                    className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
                    onClick={() => {
                      setProfilePreviewModal(true);
                    }}
                  >
                    Profile Preview
                  </Button>
                  <Modal
                    wrapClassName={`${darkMode ? "dark" : ""}`}
                    width={800}
                    height={300}
                    open={profilePreviewModal}
                    onOk={() => setProfilePreviewModal(false)}
                    onCancel={() => {
                      setProfilePreviewModal(false);
                    }}
                    className={"p-0"}
                  >
                    <div className={"w-[752px] h-[300px] mt-8"}>
                      {user.coverPhoto ? (
                        <img
                          src={user.coverPhoto}
                          className="rounded-md w-full h-full object-cover"
                        />
                      ) : (
                        <PhotoIcon
                          className="rounded-md w-full h-full object-cover dark:text-white text-gray-300"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className={"flex gap-5"}>
                      <div className={"w-[20%]"}>
                        <div className="w-[120px] h-[120px] rounded-full mt-[-86px] ms-[20px]">
                          {user.avatar ? (
                            <img
                              className="object-cover w-full h-full rounded-full mt-5 dark:text-white text-gray-300"
                              style={{
                                border: "2px solid",
                                "background-color": "white",
                              }}
                              src={user.avatar}
                              alt="Avatar"
                            />
                          ) : (
                            <UserCircleIcon
                              className="object-cover w-full h-full mt-5 rounded-full dark:text-white text-gray-300"
                              style={{
                                border: "2px solid",
                                "background-color": "white",
                              }}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      </div>

                      <div className={"w-[80%] mt-4"}>
                        <h2 className={"text-xl font-semibold"}>
                          {user.firstName + " " + user.lastName}
                        </h2>
                        <p className={"flex gap-2 items-center mt-2"}>
                          {" "}
                          <MdOutlineMailOutline />
                          {user.email}
                        </p>
                        <p className={"flex gap-2 items-center"}>
                          {" "}
                          <IoCallOutline />
                          {user.phone}
                        </p>
                        <p className={"flex gap-2 items-center"}>
                          <HiOutlineMapPin />
                          <p className={"md:w-[75%] w-[50%]"}>
                            {user.line1 +
                              ", " +
                              (user.line2 ? user.line2 + ", " : "") +
                              user.city +
                              ", " +
                              user.state +
                              ", " +
                              user.country}
                          </p>
                        </p>
                      </div>
                    </div>
                    <Divider />
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="w-full h-px border-neutral-200" />
        <Tabs
          defaultActiveKey="1"
          items={profileTab.map((item) => ({
            ...item,
          }))}
          indicatorSize={(origin) => origin - 16}
        />
      </div>
    </div>
  );
};

export default Profile;

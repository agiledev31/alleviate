import { Menu, Transition } from "@headlessui/react";
import { Button, Modal, Popconfirm, Space, Switch } from "antd";
import classNames from "classnames";
import moment from "moment";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MdDelete } from "react-icons/md";
import { RiSortAsc } from "react-icons/ri";
import { TbDeviceHeartMonitor } from "react-icons/tb";
import PhoneInput from "react-phone-input-2";
import { useSelector } from "react-redux";
import { selectLoading } from "../../../redux/auth/selectors";
import UserService from "../../../service/UserService";

const PAGE_LIMIT = 18;
const LOG_LOAD_PAGINATION = 25;

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [sortId, setSortId] = useState("recent_created");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const backendLoading = useSelector(selectLoading);

  const sortQuery = {
    recent_created: { createdAt: -1 },
    oldest_created: { createdAt: 1 },
  };

  const loadMoreUsers = useCallback(
    async ({ text = undefined, refresh = false, page = 1 }) => {
      setLoading(true);
      try {
        const response = await UserService.searchUsers({
          page,
          limit: PAGE_LIMIT,
          sort: sortId ? sortQuery[sortId] : {},
          text,
        });

        const newUsers = response.data.result;
        setUsers((prevUsers) => [...(refresh ? [] : prevUsers), ...newUsers]);
        setPage((prevPage) => prevPage + 1);
        setTotal(response.data.total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [sortId]
  );

  useEffect(() => {
    loadMoreUsers({});
  }, [loadMoreUsers]);

  useEffect(() => {
    if (loading) return;
    const handleScroll = () => {
      const container = document.getElementById("myContainer");

      if (
        container &&
        window.innerHeight + window.scrollY >= container.scrollHeight - 100
      ) {
        loadMoreUsers({ page });
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, loading]);

  // Function to perform the actual search
  const performSearch = useCallback((text) => {
    setPage(1);
    loadMoreUsers({
      text: text ? text : undefined,
      refresh: true,
      page: 1,
    });
  }, []);

  // Function to handle the input change with debounce
  const searchTimer = useRef();
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setSearchTerm(newValue);

    // Delay the execution of the search function by 300 milliseconds (adjust as needed)
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      performSearch(newValue);
    }, 1000);
  };

  const handleInviteUser = async () => {
    await UserService.inviteUser(inviteData);
    setIsInviteModalOpen(false);
  };

  return (
    <>
      <div className="relative mt-2 flex items-center">
        <input
          type="text"
          placeholder="Search Team Members"
          className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 dark:text-gray-400  shadow-sm dark:shadow-gray-400/50  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 "
          value={searchTerm}
          onChange={handleInputChange}
        />

        <Menu as="div" className="relative ml-3">
          <div>
            <Menu.Button
              type="button"
              className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-400  ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <RiSortAsc />
              Sort
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-900 py-1 shadow-lg dark:shadow-gray-400/50 hover:shadow-gray-600/50  ring-1 ring-black ring-opacity-5 focus:outline-none">
              {[
                { _id: "recent_created", name: "Newest first" },
                { _id: "oldest_created", name: "Oldest first" },
              ].map((item) => (
                <Menu.Item key={item._id}>
                  {({ active }) => (
                    <div
                      className={classNames(
                        active || sortId === item._id
                          ? "bg-gray-100 dark:bg-gray-400 dark:bg-gray-600"
                          : "",
                        "block px-4 py-2 text-sm text-gray-700 dark:text-gray-300  cursor-pointer"
                      )}
                      onClick={() => {
                        setPage(1);
                        setUsers([]);
                        setSortId(item._id);
                      }}
                    >
                      {item.name}
                    </div>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <div className="w-full justify-end flex">
        <Button
          className="px-2 py-1 text-sm bg-indigo-500 text-white rounded mt-2"
          onClick={() => {
            setLastScroll(window.scrollY);
            setIsInviteModalOpen(true);
          }}
        >
          Invite Team Member
        </Button>
      </div>

      <div className="container mx-auto p-4" id="myContainer">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="max-w-sm rounded-xl overflow-hidden shadow-lg dark:shadow-gray-400/50 hover:shadow-gray-600/50  hover:shadow-2xl transition duration-300 ease-in-out"
            >
              <div className="flex justify-center">
                <img
                  className="h-40 p-4 rounded-full"
                  src={user.avatar}
                  alt=""
                />
              </div>
              <div className="px-6 py-4">
                <div className="flex justify-between">
                  <div className="font-bold text-xl mb-2">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="flex items-center gap-1">
                    {new Date().getTime() -
                      new Date(user.lastActive).getTime() <=
                      5 * 60 * 1000 && (
                      <span class="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold leading-5 text-green-800">
                        Online
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div>
                    <a
                      href={`mailto:${user.email}`}
                      className="text-gray-700 dark:text-gray-300  text-base"
                    >
                      {user.email}
                    </a>
                  </div>
                  <div>
                    <a
                      href={`tel:${user.phone}`}
                      className="text-gray-700 dark:text-gray-300  text-base"
                    >
                      {user.phone}
                    </a>
                  </div>
                </div>

                <div className="text-sm my-2 flex items-center justify-between">
                  <Space>
                    <div>Access Allowed</div>
                    <Switch
                      size={"sm"}
                      checked={!user.blocked}
                      onChange={(e) => {
                        setUsers((cur) => {
                          const current = [...cur];
                          const thisUser = current.find(
                            (u) => u._id === user._id
                          );
                          if (thisUser) thisUser.blocked = !e;
                          return current;
                        });
                        UserService.updateUser(user._id, { blocked: !e });
                      }}
                    />
                  </Space>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-gray-400 text-[10px]">
                      Joined:{" "}
                      {moment(user.createdAt).format("Do MMM, YYYY, HH:mm")}
                    </p>
                  </div>

                  <Space>
                    <Popconfirm
                      title="Are you sure to delete this team member?"
                      onConfirm={async () => {
                        await UserService.deleteTeamMember(user._id);
                        setUsers((cur) => {
                          const current = [...cur];
                          return current.filter((u) => u._id !== user._id);
                        });
                      }}
                    >
                      <MdDelete className="cursor-pointer text-red-500" />
                    </Popconfirm>
                  </Space>
                </div>
              </div>
            </div>
          ))}
        </div>

        {total >= PAGE_LIMIT * (page - 1) && (
          <div className="flex justify-center mt-5">
            <Button loading={loading} onClick={() => loadMoreUsers({ page })}>
              Load more
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
        destroyOnClose
        title="Invite Team Member"
        afterOpenChange={(e) => {
          if (!e) window.scrollTo(0, lastScroll);
        }}
      >
        <div className="mb-2 mt-5">
          <input
            type="email"
            className="w-full mt-2 dark:bg-gray-900"
            placeholder="Email"
            value={inviteData.email}
            onChange={(e) =>
              setInviteData({ ...inviteData, email: e.target.value })
            }
          />
          <input
            type="text"
            className="w-full mt-2 dark:bg-gray-900"
            placeholder="Firstname"
            value={inviteData.firstName}
            onChange={(e) =>
              setInviteData({ ...inviteData, firstName: e.target.value })
            }
          />
          <input
            type="text"
            className="w-full mt-2 dark:bg-gray-900"
            placeholder="Lastname"
            value={inviteData.lastName}
            onChange={(e) =>
              setInviteData({ ...inviteData, lastName: e.target.value })
            }
          />
          <PhoneInput
            placeholder={"Phone"}
            defaultCountry="US"
            className="w-full mt-2"
            inputClass="dark:!bg-gray-900"
            dropdownClass="dark:!text-black"
            buttonClass="dark:!bg-gray-900"
            value={inviteData.phone}
            onChange={(e) => setInviteData({ ...inviteData, phone: e })}
          />
        </div>
        <div className="w-full justify-end flex mt-2">
          <Button
            className="text-sm bg-indigo-500 text-white rounded"
            onClick={handleInviteUser}
            loading={backendLoading}
          >
            Send Invite
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Team;

import {
  BellIcon,
  ChartPieIcon,
  HomeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { FaMagnifyingGlassChart } from "react-icons/fa6";

import { Skeleton, message } from "antd";
import Color from "color";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Route,
  Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { login, setDarkMode } from "../../redux/auth/actions";
import { selectDarkMode, selectUser } from "../../redux/auth/selectors";
import { store } from "../../redux/store";
import AuthService from "../../service/AuthService";
import CrudService from "../../service/CrudService";
import { default as DashboardDetail } from "../DashboardDetail";
import GrantOpportunities from "../GrantOpportunities";
import MyBenchmarks from "../MyBenchmarks";
import MyDocuments from "../MyDocuments";
import MyApplications from "../MyApplications";
import ProgramForm from "../ProgramForm";
import ProgramThankyou from "../ProgramThankyou";
import Programs from "../Programs";
import { default as SuiteDetail } from "../SuiteDetail";
import Benchmarks from "../ngo-company/Benchmarks";
import CategotyNotifications from "../ngo-company/CategoryNotifications";
import CreateGrantOpportunity from "../ngo-company/CreateGrantOpportunity";
import CreateSuite from "../ngo-company/CreateSuite";
import { default as CreateTemplate } from "../ngo-company/CreateTemplate";
import { default as EnrollmentPre } from "../ngo-company/EnrollmentPre";
import GrantDetails from "../ngo-company/GrantDetails";
import GrantModal from "../ngo-company/GrantModal";
import GrantPreInformation from "../ngo-company/GrantPreInformation";
import MyPrograms from "../ngo-company/MyPrograms";
import ProgramDetails from "../ngo-company/ProgramDetails";
import ProgramEdit from "../ngo-company/ProgramEdit";
import ProgramPre from "../ngo-company/ProgramPre";
import ProgramPublish from "../ngo-company/ProgramPublish";
import SDGDetails from "../ngo-company/SDGDetails";
import SuiteModal from "../ngo-company/SuiteModal";
import SuiteObjective from "../ngo-company/SuiteObjective";
import SuiteOverview from "../ngo-company/SuiteOverview";
import SuiteOverviewDetails from "../ngo-company/SuiteOverviewDetails";
import SuitePreInformation from "../ngo-company/SuitePreInformation";
import SuiteTarget from "../ngo-company/SuiteTarget";
import SuiteTrack from "../ngo-company/SuiteTrack";
import Team from "../ngo-company/Team";
import { default as TemplateDetails } from "../ngo-company/TemplateDetails";
import { default as TemplateEdit } from "../ngo-company/TemplateEdit";
import { default as TemplatePre } from "../ngo-company/TemplatePre";
import { default as Templates } from "../ngo-company/Templates";
import Profile from "./Profile";
import Settings from "./Settings";
import ThemeFive from "./ThemeFive";
import ThemeOne from "./ThemeOne";
import ThemeThree from "./ThemeThree";
import ThemeTwo from "./ThemeTwo";

const MyProgramsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
    />
  </svg>
);

const BuildProgramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
);

export const getNavigation = (user) =>
  [
    {
      id: 1,
      name: user?.role === "ngo-beneficiary" ? "Home" : "Dashboard",
      component: <DashboardDetail />,
      href: "/dashboard",
      icon: HomeIcon,
      display: true,
    },
    {
      id: 2,
      name: "My Benchmarks",
      component: <MyBenchmarks />,
      href: "/dashboard/mybenchmarks",
      icon: FaMagnifyingGlassChart,
      display: user?.role === "ngo-company",
    },
    {
      id: 3,
      name: "Team",
      component: <Team />,
      href: "/dashboard/team",
      icon: UsersIcon,
      display: ["ngo-company", "admin"].includes(user?.role),
    },
    {
      id: 4,
      name: "My Programs",
      component: <MyPrograms />,
      href: "/dashboard/myprograms",
      icon: MyProgramsIcon,
      display: user?.role === "ngo-company",
    },
    {
      id: 5,
      name: "My Programs",
      component: <Programs />,
      href: "/dashboard/programs",
      icon: MyProgramsIcon,
      display: !["ngo-company", "admin"].includes(user?.role),
    },
    {
      id: 6,
      name: "My Applications",
      component: <MyApplications />,
      href: "/dashboard/myapplications",
      icon: MyProgramsIcon,
      display: ["ngo-beneficiary"].includes(user?.role),
    },
    {
      id: 7,
      name: "Build Program",
      component: <SuiteModal />,
      href: "/dashboard/suitemodal",
      icon: BuildProgramIcon,
      display: user?.role === "ngo-company",
    },

    {
      id: 8,
      name: "Category Notifications",
      component: <CategotyNotifications />,
      href: "/dashboard/categotynofications",
      icon: BellIcon,
      display: ["ngo-company", "ngo-beneficiary"].includes(user?.role),
    },
    {
      id: 9,
      name: "Create Template",
      component: <CreateTemplate />,
      href: "/dashboard/createtemplate",
      icon: BuildProgramIcon,
      display: user?.role === "admin",
    },
    {
      id: 10,
      name: "Templates",
      component: <Templates />,
      href: "/dashboard/templates",
      icon: MyProgramsIcon,
      display: user?.role === "admin",
    },
    {
      id: 11,
      name: "Benchmarks",
      component: <Benchmarks />,
      href: "/dashboard/benchmarks",
      icon: BuildProgramIcon,
      display: user?.role === "admin",
    },
    
    {
      id: 12,
      name: "Post Grant Opportunity",
      component: <GrantModal />,
      href: "/dashboard/grantmodal",
      icon: BuildProgramIcon,
      display: user?.role === "admin",
    },
    {
      id: 13,
      name: "Grant Opportunities",
      component: <GrantOpportunities />,
      href: "/dashboard/grantopportunities",
      icon: ChartPieIcon,
      display: ["ngo-beneficiary", "ngo-company", "admin"].includes(user?.role),
    },
    {
      id: 14,
      name: "My Documents",
      component: <MyDocuments />,
      href: "/dashboard/mydocuments",
      icon: MyProgramsIcon,
      display: ["ngo-beneficiary"].includes(user?.role),
    },
  ].filter((a) => {
    if (user?.parent && !user?.accessControl?.[a.id]) return false;
    return true;
  });

export const THEME_OPTIONS = [
  { value: 1, label: "Default" },
  { value: 2, label: "Minimalistic" },
  { value: 3, label: "Dark" },
  { value: 5, label: "Stacked" },
];

function changeIndigoShades(newShades) {
  Object.keys(newShades).forEach((shade) => {
    document.documentElement.style.setProperty(
      `--indigo-${shade}`,
      newShades[shade]
    );
  });
}

function generateTailwindPalette(baseColor) {
  const base = Color(baseColor);
  let palette = {};

  // Generate lighter shades for 50 to 400
  for (let i = 50; i <= 400; i += 50) {
    palette[i] = base.lighten((4 - i / 100) * 0.2).hex();
  }

  // Base color for 500
  palette[500] = baseColor;

  // Generate darker shades for 600 to 950
  for (let i = 600; i <= 950; i += 50) {
    palette[i] = base.darken((i - 500) / 1000).hex();
  }

  return palette;
}

const Dashboard = () => {
  const user = useSelector(selectUser);
  const darkMode = useSelector(selectDarkMode);
  const [theme, setTheme] = useState(null);
  const Theme = useCallback(
    (props) => {
      if (theme === 1) return <ThemeOne {...props} />;
      if (theme === 2) return <ThemeTwo {...props} />;
      if (theme === 3) return <ThemeThree {...props} />;
      if (theme === 4) return <ThemeFour {...props} />;
      if (theme === 5) return <ThemeFive {...props} />;
    },
    [theme]
  );

  const refreshColor = () => {
    AuthService.me().then((data) => {
      store.dispatch(login(data.data.me));
      changeIndigoShades(generateTailwindPalette(data.data.me.themeColor));
      setTheme(data.data.me.theme);
    });
  };
  useEffect(() => {
    refreshColor();
    document.addEventListener("REFRESH.PROFILE", refreshColor);
    return () => document.removeEventListener("REFRESH.PROFILE", refreshColor);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      if (!Cookies.get("accessToken")) {
        localStorage.lastVisit = window.location.href;
        return navigate("/auth/login");
      }
      const res = await AuthService.me();

      const onboardingStatus = res.data.onboardingStatus;

      if (onboardingStatus.actionRequired) {
        // User is not onboarded

        if (
          onboardingStatus.step === "isEmailVerified" &&
          !location.pathname.includes("/auth/otpemail")
        )
          navigate("/auth/otpemail");
        if (
          onboardingStatus.step === "isPhoneVerified" &&
          !location.pathname.includes("/auth/otpphone")
        )
          navigate("/auth/otpphone");
        if (
          onboardingStatus.step === "isRoleSelected" &&
          !location.pathname.includes("/auth/roleSelect")
        )
          navigate("/auth/roleSelect");
        if (
          onboardingStatus.step === "kycVerified" &&
          !location.pathname.includes("/auth/kyc")
        )
          navigate("/auth/kyc");
        if (
          onboardingStatus.step === "businessIdApproved" &&
          !location.pathname.includes("/auth/business")
        )
          navigate("/auth/business");
        if (
          onboardingStatus.step === "profileCompletion" &&
          !location.pathname.includes("/dashboard/settings")
        ) {
          message.info("Please complete your profile");
          navigate("/dashboard/settings");
        }
      } else if (localStorage.lastVisit) {
        window.location.href = localStorage.lastVisit;
        localStorage.removeItem("lastVisit");
      }
    };
    checkUser();
  }, [location, navigate]);

  const navigation = getNavigation(user)
    .filter((e) => e.display === true)
    .map((elem) => ({
      ...elem,
      current: location.pathname === elem.href,
      path: elem.href.replace("/dashboard", ""),
    }));

  const [subMenus, setSubMenus] = useState([]);

  useEffect(() => {
    if (!["ngo-company", "admin"].includes(user?.role)) return;
    CrudService.search("Suite", 5, 1, {
      filters: {
        published: false,
        isGrantOpportunity: false,
        user_id: user._id,
      },
      sort: { createdAt: -1 },
    }).then((res) => {
      if (res.data.items.length > 0)
        setSubMenus((e) =>
          [
            ...e.filter((x) => x.title !== "Pending Programs"),
            {
              title: "Pending Programs",
              items: res.data.items
                .map((item) => ({
                  id: item._id,
                  name: item.name,
                  // component: <SuiteDetails />,
                  component: <SuiteOverviewDetails />,
                  href: `/dashboard/suitedetails?id=${item._id}`,
                  initial: item.name?.[0]?.toUpperCase?.(),
                }))
                .map((elem) => ({
                  ...elem,
                  current: location.pathname === elem.href,
                  path: elem.href.replace("/dashboard", "")?.split?.("?")?.[0],
                })),
            },
          ].sort(function (a, b) {
            return a.title === b.title ? 0 : a.title < b.title ? -1 : 1;
          })
        );
    });
  }, [location, user]);

  const userNavigation = [
    {
      name: "Your profile",
      href: "/dashboard/profile",
      // component: <>Your profile</>,
      component: <Profile />,
    },
    { name: "Settings", href: "/dashboard/settings", component: <Settings /> },
    {
      name: (
        <div
          className="w-full flex justify-left"
          onClick={() => store.dispatch(setDarkMode(!darkMode))}
        >
          <DarkModeSwitch
            checked={darkMode}
            onChange={(e) => store.dispatch(setDarkMode(e))}
            size={20}
          />
        </div>
      ),
      href: "#",
      onClick: (e) => {
        e.preventDefault();
      },
    },
    {
      name: "Sign out",
      href: "/dashboard",
      onClick: () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/";
      },
    },
  ].map((elem) => ({
    ...elem,
    current: location.pathname === elem.href,
    path: elem.href.replace("/dashboard", ""),
  }));

  if (!theme) return <Skeleton active />;
  return (
    <Theme
      navigation={navigation}
      subMenus={subMenus}
      userNavigation={userNavigation}
    >
      <Routes>
        {navigation.map((nav) => (
          <Route path={nav.path} element={nav.component} />
        ))}
        {subMenus
          .map((s) => [...s.items])
          .flat()
          .map((nav) => (
            <Route path={nav.path} element={nav.component} />
          ))}
        {userNavigation.map((nav) => (
          <Route path={nav.path} element={nav.component} />
        ))}
        <Route path={"/programpublish"} element={<ProgramPublish />} />
        <Route path={"/programdetails"} element={<ProgramDetails />} />
        <Route path={"/suitedetails"} element={<SuiteOverviewDetails />} />
        <Route path={"/grantdetail"} element={<GrantDetails />} />
        <Route
          path={"/suiteoverviewdetail"}
          element={<SuiteOverviewDetails />}
        />
        <Route path={"/programpre"} element={<ProgramPre />} />
        <Route path={"/programform"} element={<ProgramForm />} />
        <Route path={"/programthankyou"} element={<ProgramThankyou />} />
        <Route path={"/suite"} element={<CreateSuite />} />
        <Route
          path={"/grantopportunity"}
          element={<CreateGrantOpportunity />}
        />
        <Route path={"/templatedetails"} element={<TemplateDetails />} />
        <Route path={"/templatepre"} element={<TemplatePre />} />
        <Route path={"/assessmentedit"} element={<TemplateEdit />} />
        <Route path={"/enrollmentpre"} element={<EnrollmentPre />} />
        <Route path={"/suitedetail"} element={<SuiteDetail />} />
        <Route path={"/benchmarks"} element={<Benchmarks />} />
        <Route path={"/suitepre"} element={<SuitePreInformation />} />
        <Route path={"/grantpre"} element={<GrantPreInformation />} />
        <Route path={"/suitetrack"} element={<SuiteTrack />} />
        <Route path={"/suitetarget"} element={<SuiteTarget />} />
        <Route path={"/suiteobjective"} element={<SuiteObjective />} />
        <Route path={"/sdgdetails"} element={<SDGDetails />} />
        <Route path={"/programedit"} element={<ProgramEdit />} />
      </Routes>
    </Theme>
  );
};

export default Dashboard;

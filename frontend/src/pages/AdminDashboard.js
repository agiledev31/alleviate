import React, { useEffect, useState } from "react";

import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import { Skeleton } from "antd";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/auth/selectors";
import StatsService from "../service/StatsService";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user?.role === "admin")
      StatsService.getAdminStats().then((res) => {
        setStatsData(res.data);
      });
  }, [user]);

  const stats = [
    {
      name: "Active Users",
      stat: statsData?.activeUsersCount,
      description: "NGOs / Donors / Volunteers / Consultants",
    },
    {
      name: "Daily Active Users",
      stat: `${statsData?.dailyActiveUsersPercentage?.toFixed?.(1)}%`,
      description: "Activity in last 24h",
    },
    {
      name: "Weekly Active Users",
      stat: `${statsData?.weeklyActiveUsersPercentage?.toFixed?.(1)}%`,
      description: "Activity in last week",
    },
    {
      name: "Monthly Active Users",
      stat: `${statsData?.monthlyActiveUsersPercentage?.toFixed?.(1)}%`,
      description: "Activity in last month",
    },
    {
      name: "Number of NGO Organizations",
      stat: statsData?.ngoOrganizationCount,
      description: "",
    },
    {
      name: "Number of Programs",
      stat: statsData?.programCount,
      description: "created by NGOs",
    },
    {
      name: "Number of Donations",
      stat: "x",
      description: "TODO",
    },
  ];

  if (!statsData) return <Skeleton active />;
  return (
    <>
      <div className="mb-5">
        <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((item) => (
            <div key={item.name} className="px-4 py-5 sm:p-6">
              <dt className="text-base font-normal text-gray-900">
                {item.name}
              </dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                  {item.stat}
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    {item.description}
                  </span>
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
};

export default AdminDashboard;

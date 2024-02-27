/*
  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import {
  Select as AntdSelect,
  Button,
  ColorPicker,
  Divider,
  Progress,
  Skeleton,
  Tooltip,
} from "antd";
import moment from "moment/moment";
import React, { useCallback, useEffect, useState } from "react";
import { FaDeleteLeft } from "react-icons/fa6";
import { THEME_OPTIONS } from ".";
import Select from "../../components/Select";
import { benchmarksSectorType, countries } from "../../data/constants";
import AuthService from "../../service/AuthService";
import UploadService from "../../service/UploadService";

function replaceAtIndex(arr, index, newValue) {
  // Create a copy of the original array
  const newArray = [...arr];

  // Check if the provided index is within the valid range
  if (index >= 0 && index < newArray.length) {
    // Replace the element at the specified index with the new value
    newArray[index] = newValue;
  } else {
    // Handle the case where the index is out of range
    console.error("Index is out of range");
  }

  // Return the modified array
  return newArray;
}
function removeAtIndex(arr, index) {
  // Create a copy of the original array
  const newArray = [...arr];

  // Check if the provided index is within the valid range
  if (index >= 0 && index < newArray.length) {
    // Use splice() to remove the element at the specified index
    newArray.splice(index, 1);
  } else {
    // Handle the case where the index is out of range
    console.error("Index is out of range");
  }

  // Return the modified array
  return newArray;
}

function getColorFun(r, g, b) {
  return (
    "#" +
    ((1 << 24) + (Math.ceil(r) << 16) + (Math.ceil(g) << 8) + Math.ceil(b))
      .toString(16)
      .slice(1)
  );
}

export default function Example() {
  const [me, setMe] = useState(null);
  const [softValue, setSoftValue] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [coverPhotoDimensions, setCoverPhotoDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleUpdate = useCallback(async () => {
    await AuthService.updateMe(softValue);
    const res = await AuthService.me();
    setMe(res.data.me);
    setOnboardingStatus(res.data.onboardingStatus);
    document.dispatchEvent(new CustomEvent("REFRESH.PROFILE"));

    if (
      res.data.onboardingStatus?.profileCompletion === 100 &&
      localStorage.lastVisit
    )
      window.location.href = localStorage.lastVisit;
  }, [softValue]);

  useEffect(() => {
    setSoftValue(me);
  }, [me]);

  useEffect(() => {
    AuthService.me().then((data) => {
      setMe(data.data.me);
      setOnboardingStatus(data.data.onboardingStatus);

      if (data.data.me.coverPhoto) {
        const img = new Image();
        img.src = data.data.me.coverPhoto;
        img.onload = () => {
          const dimensions = { width: img.width, height: img.height };
          setCoverPhotoDimensions(dimensions);
        };
      }
    });
  }, []);

  const getProps = (fieldKey) => ({
    value: softValue?.[fieldKey],
    onChange: (e) =>
      setSoftValue((current) => ({
        ...current,
        [fieldKey]: e?.target?.value ?? e,
      })),
  });

  const extractCVFileName = (url) => {
    return url.substring(url.lastIndexOf("/") + 1);
  };

  const notificationConfig = [
    {
      title: "Security Alerts",
      id: "securityalerts",
      description:
        "Notifications regarding account security, like login from a new device or location.",
      push: true,
    },
    {
      title: "Platform Updates",
      id: "platformupdates",
      description:
        "Information about new features, updates, or maintenance schedules.",
    },

    {
      title: "Newsletter",
      id: "newsletter",
      description: "Regular updates on NGO-related news, insights, and tips. ",
    },

    {
      title: "Program Milestone Reminders",
      id: "programmilestonereminders",
      description:
        "Alerts for upcoming deadlines or milestones for ongoing programs.",
      scope: "ngo-company",
      push: true,
    },

    {
      title: "Grant Proposal Deadlines",
      id: "grantproposaldeadlines",
      description: "Reminders about upcoming grant application deadlines.",
      scope: "ngo-company",
      push: true,
    },

    {
      title: "Donor Engagement Opportunities",
      id: "donorengagementopportunities",
      description: "Notifications about potential donors expressing interest.",
      scope: "ngo-company",
      push: true,
    },

    {
      title: "Volunteer Coordination Updates",
      id: "volunteercoordinationupdates",
      description: "Changes or updates in volunteer schedules or availability.",
      scope: "ngo-company",
    },

    {
      title: "Resource Access Notifications",
      id: "resourceaccessnotifications",
      description:
        "Alerts when new resources or training materials become available.",
      scope: "ngo-company",
    },

    {
      title: "Program Enrollment Confirmation",
      id: "programenrollmentconfirmation",
      description: "Notification upon successful enrollment in a program.",
      scope: "ngo-beneficiary",
    },

    {
      title: "Benefit Distribution Alerts",
      id: "benefitdistributionalerts",
      description:
        "Information about when to expect benefits or aid distributions.",
      scope: "ngo-beneficiary",
    },

    {
      title: "Program Feedback Requests",
      id: "programfeedbackrequests",
      description:
        "Invitations to provide feedback on programs participated in.",
      scope: "ngo-beneficiary",
    },

    {
      title: "Community Event Announcements",
      id: "communityeventannouncements",
      description:
        "Notifications about events or meetings they might be interested in.",
      scope: "ngo-beneficiary",
    },

    {
      title: "Emergency Alerts",
      id: "emergencyalerts",
      description:
        "Urgent notifications relevant to their welfare or program participation.",
      scope: "ngo-beneficiary",
      push: true,
    },

    {
      title: "Consultation Requests",
      id: "consultationrequests",
      description: "Alerts when an NGO requests a consultation session.",
      scope: "expert",
      push: true,
    },

    {
      title: "Content Contribution Acknowledgment",
      id: "contentcontributionacknowledgment",
      description:
        "Confirmation when submitted articles or materials are published.",
      scope: "expert",
    },

    {
      title: "Engagement Metrics",
      id: "engagementmetrics",
      description:
        "Periodic updates on the engagement with their content or consultations.",
      scope: "expert",
    },

    {
      title: "New Opportunity Alerts",
      id: "newopportunityalerts",
      description:
        "Notifications about new NGOs joining the platform seeking expertise.",
      scope: "expert",
      push: true,
    },

    {
      title: "Expertise Updates",
      id: "expertiseupdates",
      description:
        "Requests to update their profile with new skills or experience.",
      scope: "expert",
    },

    {
      title: "Donation Confirmation",
      id: "donationconfirmation",
      description: "Receipts and thank you messages upon successful donations.",
      scope: "donor",
    },

    {
      title: "Impact Reports",
      id: "impactreports",
      description: "Periodic updates on the impact of their donations.",
      scope: "donor",
    },

    {
      title: "Matching Donation Campaigns",
      id: "matchingdonationcampaigns",
      description:
        "Alerts about campaigns where their donation could be matched or multiplied.",
      scope: "donor",
    },

    {
      title: "Funding Progress Updates",
      id: "fundingprogressupdates",
      description:
        "Notifications on the progress of fundraising campaigns they have contributed to.",
      scope: "donor",
    },
    {
      title: "Special Recognition",
      id: "specialrecognition",
      description:
        "Acknowledgment for reaching certain donation milestones or contributions.",
      scope: "donor",
    },
  ];

  if (!softValue) return <Skeleton />;

  return (
    <div className="space-y-10 divide-y divide-gray-900/10">
      <div className="sticky top-16 z-30 flex h-12 shrink-0 items-center  border-b border-gray-200 bg-white  shadow-sm">
        <div>Profile Completion</div>
        <Progress
          percent={onboardingStatus?.profileCompletion}
          status={onboardingStatus?.profileCompletion < 100 ? "active" : null}
        />
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Use a permanent address where you can receive mail.
          </p>
        </div>

        <form
          className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className={`"block text-sm font-medium leading-6 text-gray-900" ${
                    !softValue?.firstName ? "text-red font-semibold" : ""
                  }`}
                >
                  First name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...getProps("firstName")}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className={`block text-sm font-medium leading-6 text-gray-900 ${
                    !softValue?.lastName ? "text-red font-semibold" : ""
                  }`}
                >
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="last-name"
                    id="last-name"
                    autoComplete="family-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...getProps("lastName")}
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    disabled
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...getProps("email")}
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Phone
                </label>
                <div className="mt-2">
                  <input
                    disabled
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...getProps("phone")}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="street-address"
                  className={`block text-sm font-medium leading-6 text-gray-900 ${
                    !softValue?.line1 ? "text-red font-semibold" : ""
                  }`}
                >
                  Line 1
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="street-address"
                    id="street-address"
                    autoComplete="street-address"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...getProps("line1")}
                  />
                </div>
              </div>
              <div className="col-span-full">
                <label
                  htmlFor="street-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Line 2
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="street-address"
                    id="street-address"
                    autoComplete="street-address"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...getProps("line2")}
                  />
                </div>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Country
                </label>
                <div className="mt-2">
                  <Select
                    options={countries.sort((a, b) =>
                      a.label.localeCompare(b.label)
                    )}
                    {...getProps("country")}
                  />
                </div>
              </div>
              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="region"
                  className={`block text-sm font-medium leading-6 text-gray-900 ${
                    !softValue?.state ? "text-red font-semibold" : ""
                  }`}
                >
                  State / Province
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="region"
                    id="region"
                    autoComplete="address-level1"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...getProps("state")}
                  />
                </div>
              </div>
              <div className="sm:col-span-2 ">
                <label
                  htmlFor="city"
                  className={`block text-sm font-medium leading-6 text-gray-900 ${
                    !softValue?.city ? "text-red font-semibold" : ""
                  }`}
                >
                  City
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="city"
                    id="city"
                    autoComplete="address-level2"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...getProps("city")}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="postal-code"
                  className={`block text-sm font-medium leading-6 text-gray-900 ${
                    !softValue?.zipCode ? "text-red font-semibold" : ""
                  }`}
                >
                  ZIP / Postal code
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="postal-code"
                    id="postal-code"
                    autoComplete="postal-code"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...getProps("zipCode")}
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Country
                </label>
                <div className="mt-2">
                  <Select
                    options={countries.sort((a, b) =>
                      a.label.localeCompare(b.label)
                    )}
                    {...getProps("country")}
                  />
                </div>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="sector"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Sector
                </label>
                <div className="mt-2">
                  <Select
                    options={benchmarksSectorType}
                    {...getProps("sector")}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {me?.role !== "admin" && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0 mt-4">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly.
            </p>
          </div>

          <form
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 mt-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="px-4 py-6 sm:p-8 ">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {me?.role === "ngo-company" && (
                  <>
                    <div className="col-span-full">
                      <label
                        htmlFor="street-address"
                        className={`block text-sm font-medium leading-6 text-gray-900 ${
                          !softValue?.companyName
                            ? "text-red font-semibold"
                            : ""
                        }`}
                      >
                        Company name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          {...getProps("companyName")}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Organization Type
                      </label>
                      <div className="mt-2">
                        <Select
                          options={[
                            { value: "", label: "" },
                            { value: "Non-profit", label: "Non-profit" },
                            { value: "Government", label: "Government" },
                            { value: "Private", label: "Private" },
                            { value: "Other", label: "Other" },
                          ]}
                          {...getProps("organizationType")}
                        />
                      </div>
                    </div>
                  </>
                )}
                {me?.role === "ngo-beneficiary" && <>{/* Empty */}</>}
                {me?.role === "expert" && (
                  <>
                    <div className="col-span-full">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Experience Years
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          placeholder="Experience Years"
                          className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          {...getProps("experienceYears")}
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label
                        className={`"block text-sm font-medium leading-6 text-gray-900" ${
                          softValue?.expertiseAreas?.length === 0
                            ? "text-red font-semibold"
                            : ""
                        }`}
                      >
                        Expertise Areas
                      </label>
                      <div className="mt-2">
                        {softValue?.expertiseAreas?.map?.((area, index) => (
                          <div
                            key={index}
                            className="flex space-x-2 items-center"
                          >
                            <input
                              type="text"
                              placeholder="Expertise Area"
                              className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={area}
                              onChange={(e) => {
                                setSoftValue((v) => ({
                                  ...v,
                                  expertiseAreas: replaceAtIndex(
                                    v.expertiseAreas,
                                    index,
                                    e.target.value
                                  ),
                                }));
                              }}
                            />
                            <FaDeleteLeft
                              size={25}
                              color="#333"
                              className="cursor-pointer"
                              onClick={() =>
                                setSoftValue((v) => ({
                                  ...v,
                                  expertiseAreas: removeAtIndex(
                                    v.expertiseAreas,
                                    index
                                  ),
                                }))
                              }
                            />
                          </div>
                        ))}
                        <button
                          className={`"block text-sm font-medium leading-6 text-gray-900" ${
                            softValue?.expertiseAreas?.length === 0
                              ? "text-red font-semibold"
                              : ""
                          }`}
                          onClick={(e) => {
                            setSoftValue((v) => ({
                              ...v,
                              expertiseAreas: [...v.expertiseAreas, ""],
                            }));
                          }}
                        >
                          + Add Expertise Area
                        </button>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        Share your areas of expertise to help others understand
                        your skills and knowledge. List the fields you excel in
                        and contribute your expertise to the community.
                      </p>
                      <Divider />
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Education
                      </label>
                      <div className="mt-2">
                        {softValue?.education?.map?.((edu, index) => (
                          <div key={index} className="mt-5">
                            <div className="flex space-x-2 items-center">
                              <input
                                type="text"
                                placeholder="Institution"
                                className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={edu.institution}
                                onChange={(e) => {
                                  setSoftValue((v) => ({
                                    ...v,
                                    education: replaceAtIndex(
                                      v.education,
                                      index,
                                      {
                                        ...v.education[index],
                                        institution: e.target.value,
                                      }
                                    ),
                                  }));
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Details"
                                className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={edu.details}
                                onChange={(e) => {
                                  setSoftValue((v) => ({
                                    ...v,
                                    education: replaceAtIndex(
                                      v.education,
                                      index,
                                      {
                                        ...v.education[index],
                                        details: e.target.value,
                                      }
                                    ),
                                  }));
                                }}
                              />

                              <FaDeleteLeft
                                size={25}
                                color="#333"
                                className="cursor-pointer"
                                onClick={() =>
                                  setSoftValue((v) => ({
                                    ...v,
                                    education: removeAtIndex(
                                      v.education,
                                      index
                                    ),
                                  }))
                                }
                              />
                            </div>

                            <div className="flex space-x-2 items-center mt-2">
                              <label htmlFor={`${index}-from`}>From</label>
                              <input
                                type="date"
                                id={`${index}-from`}
                                className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={moment(edu.startYear).format(
                                  "YYYY-MM-DD"
                                )}
                                min={1900}
                                onChange={(e) => {
                                  setSoftValue((v) => ({
                                    ...v,
                                    education: replaceAtIndex(
                                      v.education,
                                      index,
                                      {
                                        ...v.education[index],
                                        startYear: e.target.value,
                                      }
                                    ),
                                  }));
                                }}
                              />
                              <label htmlFor={`${index}-to`}>To</label>
                              <input
                                type="date"
                                id={`${index}-to`}
                                className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={moment(edu.endYear).format("YYYY-MM-DD")}
                                min={1900}
                                onChange={(e) => {
                                  setSoftValue((v) => ({
                                    ...v,
                                    education: replaceAtIndex(
                                      v.education,
                                      index,
                                      {
                                        ...v.education[index],
                                        endYear: e.target.value,
                                      }
                                    ),
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          className="mt-5"
                          onClick={(e) => {
                            setSoftValue((v) => ({
                              ...v,
                              education: [
                                ...v.education,
                                {
                                  institution: "",
                                  startYear: new Date(),
                                  endYear: new Date(),
                                },
                              ],
                            }));
                          }}
                        >
                          + Add Education
                        </button>
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          Share your educational background. Add details about
                          your institutions, degrees, and academic achievements.
                        </p>
                        <Divider />
                      </div>

                      <div className="col-span-full">
                        <label className="block text-sm font-medium leading-6 text-gray-900">
                          Certifications
                        </label>
                        <div className="mt-2">
                          {softValue?.certifications?.map?.((edu, index) => (
                            <div key={index} className="mt-5">
                              <div className="flex space-x-2 items-center">
                                <input
                                  type="text"
                                  placeholder="Institution"
                                  className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  value={edu.institution}
                                  onChange={(e) => {
                                    setSoftValue((v) => ({
                                      ...v,
                                      certifications: replaceAtIndex(
                                        v.certifications,
                                        index,
                                        {
                                          ...v.certifications[index],
                                          institution: e.target.value,
                                        }
                                      ),
                                    }));
                                  }}
                                />
                                <input
                                  type="text"
                                  placeholder="Link"
                                  className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  value={edu.link}
                                  onChange={(e) => {
                                    setSoftValue((v) => ({
                                      ...v,
                                      certifications: replaceAtIndex(
                                        v.certifications,
                                        index,
                                        {
                                          ...v.certifications[index],
                                          link: e.target.value,
                                        }
                                      ),
                                    }));
                                  }}
                                />

                                <FaDeleteLeft
                                  size={25}
                                  color="#333"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setSoftValue((v) => ({
                                      ...v,
                                      certifications: removeAtIndex(
                                        v.certifications,
                                        index
                                      ),
                                    }))
                                  }
                                />
                              </div>

                              <div className="flex space-x-2 items-center mt-2">
                                <label htmlFor={`${index}-c-date`}>Date</label>
                                <input
                                  type="date"
                                  id={`${index}-c-date`}
                                  className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  value={moment(edu.year).format("YYYY-MM-DD")}
                                  min={1900}
                                  onChange={(e) => {
                                    setSoftValue((v) => ({
                                      ...v,
                                      certifications: replaceAtIndex(
                                        v.certifications,
                                        index,
                                        {
                                          ...v.certifications[index],
                                          year: e.target.value,
                                        }
                                      ),
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            className="mt-5"
                            onClick={(e) => {
                              setSoftValue((v) => ({
                                ...v,
                                certifications: [
                                  ...v.certifications,
                                  {
                                    institution: "",
                                    link: "",
                                    year: new Date(),
                                  },
                                ],
                              }));
                            }}
                          >
                            + Add Certification
                          </button>
                          <p className="mt-3 text-sm leading-6 text-gray-600">
                            Highlight your certifications and qualifications to
                            demonstrate your expertise in specific areas.
                            Provide information about the institutions, dates,
                            and details of your certifications.
                          </p>
                          <Divider />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {me?.role === "donor" && (
                  <>
                    <div className="col-span-full">
                      <label
                        className={`"block text-sm font-medium leading-6 text-gray-900" ${
                          softValue?.preferredCauses?.length === 0
                            ? "text-red font-semibold"
                            : ""
                        }`}
                      >
                        Preferred Causes
                      </label>
                      <div className="mt-2">
                        {softValue?.preferredCauses?.map?.((area, index) => (
                          <div
                            key={index}
                            className="flex space-x-2 items-center"
                          >
                            <input
                              type="text"
                              placeholder="Preferred Cause"
                              className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={area}
                              onChange={(e) => {
                                setSoftValue((v) => ({
                                  ...v,
                                  preferredCauses: replaceAtIndex(
                                    v.preferredCauses,
                                    index,
                                    e.target.value
                                  ),
                                }));
                              }}
                            />
                            <FaDeleteLeft
                              size={25}
                              color="#333"
                              className="cursor-pointer"
                              onClick={() =>
                                setSoftValue((v) => ({
                                  ...v,
                                  preferredCauses: removeAtIndex(
                                    v.preferredCauses,
                                    index
                                  ),
                                }))
                              }
                            />
                          </div>
                        ))}
                        <button
                          className={`"block text-sm font-medium leading-6 text-gray-900" ${
                            softValue?.preferredCauses?.length === 0
                              ? "text-red font-semibold"
                              : ""
                          }`}
                          onClick={(e) => {
                            setSoftValue((v) => ({
                              ...v,
                              preferredCauses: [...v.preferredCauses, ""],
                            }));
                          }}
                        >
                          + Add Preferred Cause
                        </button>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        Show your support for meaningful causes by listing your
                        preferred causes. Let others know what you care about
                        and how you contribute to making a difference.
                      </p>
                      <Divider />
                    </div>
                  </>
                )}

                {/*<div className="col-span-full">*/}
                {/*  <label*/}
                {/*    htmlFor="street-address"*/}
                {/*    className={`"block text-sm font-medium leading-6 text-gray-900" ${*/}
                {/*      !softValue?.website && softValue?.role === "ngo-company"*/}
                {/*        ? "text-red font-semibold"*/}
                {/*        : ""*/}
                {/*    }`}*/}
                {/*  >*/}
                {/*    Website*/}
                {/*  </label>*/}
                {/*  <div className="mt-2">*/}
                {/*    <input*/}
                {/*      type="text"*/}
                {/*      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"*/}
                {/*      {...getProps("website")}*/}
                {/*    />*/}
                {/*  </div>*/}
                {/*</div>*/}
                <div className="col-span-full">
                  <label
                    className={
                      "block text-sm font-medium leading-6 text-gray-900"
                    }
                  >
                    Curriculum Vitae
                  </label>

                  {softValue.cvDocument && (
                    <div>
                      <Tooltip title={"View CV"}>
                        <a
                          href={softValue.cvDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={"font-bold mt-3"}
                        >
                          {extractCVFileName(softValue.cvDocument)}
                        </a>
                      </Tooltip>
                    </div>
                  )}

                  <Button
                    type="primary"
                    className="rounded-md px-2 py-1.5 mt-2 text-sm font-semibold ring-1 ring-inset hover:bg-gray-50"
                    onClick={async () => {
                      const fileInput = document.getElementById("fileInput");
                      fileInput.click();

                      fileInput.addEventListener("change", async () => {
                        const selectedFile = fileInput.files[0]; // Get the selected file
                        if (selectedFile) {
                          const result = await UploadService.upload(
                            selectedFile
                          );
                          await AuthService.updateMe({
                            cvDocument: result.data.secure_url,
                          });
                          const res = await AuthService.me();
                          setSoftValue((v) => ({
                            ...v,
                            cvDocument: res.data.me.cvDocument,
                          }));
                        } else {
                          console.log("No file selected.");
                        }
                      });
                    }}
                  >
                    Upload CV
                  </Button>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Upload a Curriculum Vitae PDF file
                  </p>

                  <Divider />
                </div>
                <div className="col-span-full">
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    About
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="about"
                      name="about"
                      rows={3}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      defaultValue={""}
                      {...getProps("about")}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Write a few sentences about yourself to introduce yourself
                    to the community.
                  </p>
                  <Divider />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Social Media Links
                  </label>
                  <div className="mt-2">
                    {softValue?.socialMediaLinks?.map?.((link, index) => (
                      <div key={index} className="flex space-x-2 items-center">
                        <Select
                          options={[
                            { value: "facebook", label: "Facebook" },
                            { value: "twitter", label: "Twitter" },
                            { value: "linkedin", label: "LinkedIn" },
                            { value: "instagram", label: "Instagram" },
                            { value: "youtube", label: "YouTube" },
                            { value: "pinterest", label: "Pinterest" },
                            { value: "tiktok", label: "TikTok" },
                            { value: "github", label: "GitHub" },
                            { value: "medium", label: "Medium" },
                            { value: "fiverr", label: "Fiverr" },
                            { value: "upwork", label: "Upwork" },
                            { value: "freelancer", label: "Freelancer" },
                            { value: "stackoverflow", label: "StackOverflow" },
                            {
                              value: "donor-advised funds",
                              label: "Donor-Advised Funds",
                            },
                            { value: "gofundme", label: "GoFundMe" },
                            { value: "kickstarter", label: "Kickstarter" },
                            { value: "indiegogo", label: "Indiegogo" },
                          ]}
                          onChange={(e) => {
                            setSoftValue((v) => ({
                              ...v,
                              socialMediaLinks: replaceAtIndex(
                                v.socialMediaLinks,
                                index,
                                {
                                  link: v.socialMediaLinks[index].link,
                                  platform: e,
                                }
                              ),
                            }));
                          }}
                          value={link.platform}
                          className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <input
                          type="text"
                          placeholder="Link"
                          className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          value={link.link}
                          onChange={(e) => {
                            setSoftValue((v) => ({
                              ...v,
                              socialMediaLinks: replaceAtIndex(
                                v.socialMediaLinks,
                                index,
                                {
                                  platform: v.socialMediaLinks[index].platform,
                                  link: e.target.value,
                                }
                              ),
                            }));
                          }}
                        />

                        <FaDeleteLeft
                          size={25}
                          color="#333"
                          className="cursor-pointer"
                          onClick={() =>
                            setSoftValue((v) => ({
                              ...v,
                              socialMediaLinks: removeAtIndex(
                                v.socialMediaLinks,
                                index
                              ),
                            }))
                          }
                        />
                      </div>
                    ))}
                    <button
                      onClick={(e) => {
                        setSoftValue((v) => ({
                          ...v,
                          socialMediaLinks: [
                            ...v.socialMediaLinks,
                            { link: "", platform: "facebook" },
                          ],
                        }));
                      }}
                    >
                      + Add Link
                    </button>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      Connect with your audience by sharing your social media
                      profiles. Add your LinkedIn profile, and include other
                      relevant links to showcase your online presence.
                    </p>
                    <Divider />
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Photo
                  </label>
                  <div className="mt-2 flex items-center gap-x-3">
                    {softValue?.avatar ? (
                      <img
                        className="h-12 w-12 text-gray-300 rounded-full"
                        src={softValue.avatar}
                      />
                    ) : (
                      <UserCircleIcon
                        className="h-12 w-12 text-gray-300"
                        aria-hidden="true"
                      />
                    )}
                    <button
                      type="button"
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={async () => {
                        const fileInput = document.getElementById("fileInput");
                        fileInput.click();

                        fileInput.addEventListener("change", async () => {
                          const selectedFile = fileInput.files[0]; // Get the selected file
                          if (selectedFile) {
                            const result = await UploadService.upload(
                              selectedFile
                            );
                            await AuthService.updateMe({
                              avatar: result.data.secure_url,
                            });
                            const res = await AuthService.me();
                            // setMe(res.data.me);
                            // setOnboardingStatus(res.data.onboardingStatus);

                            // You can perform further actions with the selected file here
                            setSoftValue((v) => ({
                              ...v,
                              avatar: res.data.me.avatar,
                            }));
                          } else {
                            console.log("No file selected.");
                          }
                        });
                      }}
                    >
                      Change
                    </button>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Upload a clean profile avatar to personalize your profile
                    and make a positive first impression.
                  </p>
                  <Divider />
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Cover photo
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      {softValue?.coverPhoto ? (
                        <img
                          className="mx-auto  text-gray-300 max-w-[75%]"
                          src={softValue.coverPhoto}
                        />
                      ) : (
                        <PhotoIcon
                          className="mx-auto h-12 w-12 text-gray-300"
                          aria-hidden="true"
                        />
                      )}

                      <div className="mt-4 flex text-sm leading-6 text-gray-600 flex justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={async (e) => {
                              const selectedFile = e.target.files?.[0];
                              if (selectedFile) {
                                const result = await UploadService.upload(
                                  selectedFile
                                );
                                await AuthService.updateMe({
                                  coverPhoto: result.data.secure_url,
                                });
                                const res = await AuthService.me();
                                // setMe(res.data.me);
                                // setOnboardingStatus(res.data.onboardingStatus);

                                setSoftValue((v) => ({
                                  ...v,
                                  coverPhoto: res.data.me.coverPhoto,
                                }));

                                if (res.data.me.coverPhoto) {
                                  const img = new Image();
                                  img.src = res.data.me.coverPhoto;
                                  img.onload = () => {
                                    const dimensions = {
                                      width: img.width,
                                      height: img.height,
                                    };
                                    setCoverPhotoDimensions(dimensions);
                                  };
                                }
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className={"mt-3"}>
                <span className={"font-bold"}>Photo Dimensions:</span>{" "}
                {coverPhotoDimensions.width} w x {coverPhotoDimensions.height} h
                pixels
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Upload an appealing cover photo for your profile.
              </p>
            </div>
            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Notifications
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            We'll always let you know about important changes, but you pick what
            else you want to hear about.
          </p>
        </div>

        <form
          className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="px-4 py-6 sm:p-8">
            <div className="max-w-2xl space-y-10">
              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-gray-900">
                  By Email
                </legend>
                <div className="mt-6 space-y-6">
                  {notificationConfig
                    .filter(
                      (n) => !n.push && (!n.scope || n.scope === me?.role)
                    )
                    .map((item, index) => (
                      <div className="relative flex gap-x-3" key={index}>
                        <div className="flex h-6 items-center">
                          <input
                            id={`notification-email-${index}`}
                            name={`notification-email-${index}`}
                            checked={softValue?.notification?.[`${item.id}`]}
                            onChange={(e) => {
                              setSoftValue((v) => ({
                                ...v,
                                notification: {
                                  ...v.notification,
                                  [`${item.id}`]: e.target.checked,
                                },
                              }));
                            }}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </div>
                        <div className="text-sm leading-6">
                          <label
                            htmlFor={`notification-email-${index}`}
                            className="font-medium text-gray-900"
                          >
                            {item.title}
                          </label>
                          <p className="text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-gray-900">
                  Push Notifications
                </legend>
                <p className="mt-1 text-sm leading-6 text-gray-600 mb-4">
                  These are delivered via SMS to your mobile phone.
                </p>
                {notificationConfig
                  .filter((n) => !!n.push && (!n.scope || n.scope === me?.role))
                  .map((item, index) => (
                    <div className="relative flex gap-x-3 mt-4" key={index}>
                      <div className="flex h-6 items-center">
                        <input
                          id={`notification-phone-${index}`}
                          name={`notification-phone-${index}`}
                          checked={softValue?.notification?.[`${item.id}`]}
                          onChange={(e) => {
                            setSoftValue((v) => ({
                              ...v,
                              notification: {
                                ...v.notification,
                                [`${item.id}`]: e.target.checked,
                              },
                            }));
                          }}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="text-sm leading-6">
                        <label
                          htmlFor={`notification-phone-${index}`}
                          className="font-medium text-gray-900"
                        >
                          {item.title}
                        </label>
                        <p className="text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
              </fieldset>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Theme Configuration
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Adjust the UI according to your preferences.
          </p>
        </div>

        <form
          className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <label
                htmlFor="photo"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Theme
              </label>
              <Select
                options={THEME_OPTIONS}
                value={softValue?.theme}
                onChange={(e) =>
                  setSoftValue({
                    ...me,
                    theme: e,
                  })
                }
              />
            </div>
            <br />
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <label
                htmlFor="photo"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Theme Color
              </label>
              <ColorPicker
                value={softValue?.themeColor}
                onChange={(e) =>
                  setSoftValue({
                    ...me,
                    themeColor: getColorFun(
                      e.metaColor.r,
                      e.metaColor.g,
                      e.metaColor.b
                    ),
                  })
                }
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Prefered Language
              </label>
              <div className="mt-2">
                <Select
                  options={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Spanish" },
                    { value: "fr", label: "French" },
                  ]}
                  {...getProps("locale")}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

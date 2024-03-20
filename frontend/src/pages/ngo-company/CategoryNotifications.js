import { Skeleton, Tabs } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import AuthService from "../../service/AuthService";
import StrapiService from "../../service/StrapiService";

const CategotyNotifications = () => {
  const [me, setMe] = useState(null);
  const [softValue, setSoftValue] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesTabs, setCategoriesTabs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryNotifications, setCategoryNotifications] = useState([]);

  const handleUpdate = useCallback(async () => {
    await AuthService.updateMe(softValue);
    const res = await AuthService.me();
    setMe(res.data.me);
  }, [softValue]);

  useEffect(() => {
    setSoftValue(me);
  }, [me]);

  useEffect(() => {
    AuthService.me().then((data) => {
      setMe(data.data.me);
      setCategoryNotifications(data.data.me.categoryNotifications);
    });
    StrapiService.getList("impact_categories").then(({ data }) =>
      setCategories(data)
    );
  }, []);

  useEffect(() => {
    if (categories && setCategoriesTabs.length > 0) {
      const modifiedCategories = categories.map((item) => ({
        ...item,
        key: item._id,
        label: item.Name,
      }));
      setSelectedCategory(modifiedCategories[0]?.key);
      setCategoriesTabs(modifiedCategories);
    }
  }, [categories]);

  const notificationConfig = [
    {
      title: "Program Create",
      id: "programCreate",
      description: "Regular updates on create the programs.",
      scope: "ngo-company",
    },
    {
      title: "Program Publish",
      id: "programPublish",
      description: "Regular updates on publish the programs.",
      scope: "ngo-company",
    },
    {
      title: "Assessment Create",
      id: "assessmentCreate",
      description: "Regular updates on create the assessments. ",
      scope: "ngo-company",
    },
    {
      title: "Assessment Publish",
      id: "assessmentPublish",
      description: "Regular updates on publish the assessments.",
      scope: "ngo-company",
    },
    {
      title: "Program Create",
      id: "programCreateAlert",
      description: "Alerts for create the programs.",
      scope: "ngo-company",
      push: true,
    },
    {
      title: "Program Publish",
      id: "programPublishAlert",
      description: "Alerts for publish the programs.",
      scope: "ngo-company",
      push: true,
    },
    {
      title: "Assessment Create",
      id: "assessmentCreateAlert",
      description: "Alerts for create the assessments. ",
      scope: "ngo-company",
      push: true,
    },
    {
      title: "Assessment Publish",
      id: "assessmentPublishAlert",
      description: "Alerts for publish the assessments.",
      scope: "ngo-company",
      push: true,
    },
  ];

  const handleCategoryTabChange = (category) => {
    setSelectedCategory(category);
  };

  const handleCheckboxChange = async (categoryId, itemId, checked) => {
    if (categoryNotifications.length > 0) {
      const updatedNotifications = categoryNotifications.map((item) => {
        if (item.category === selectedCategory) {
          return {
            ...item,
            notifications: {
              ...item.notifications,
              [itemId]: checked,
            },
          };
        }
        return item;
      });

      const categoryExists = categoryNotifications.some(
        (item) => item.category === selectedCategory
      );
      if (!categoryExists) {
        updatedNotifications.push({
          category: selectedCategory,
          notifications: {
            [itemId]: checked,
          },
        });
      }
      setCategoryNotifications(updatedNotifications);
    } else {
      setCategoryNotifications([
        {
          category: selectedCategory,
          notifications: {
            [itemId]: checked,
          },
        },
      ]);
    }
  };

  useEffect(() => {
    setSoftValue((v) => ({
      ...v,
      categoryNotifications: categoryNotifications,
    }));
  }, [categoryNotifications]);
  if (!softValue) return <Skeleton />;

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-base font-semibold leading-7 dark:text-white text-gray-900">
          Categories
        </h2>
        {categories && categories.length > 0 && (
          <>
            <Tabs
              defaultActiveKey="1"
              items={categoriesTabs.map((item) => ({
                ...item,
              }))}
              onChange={handleCategoryTabChange}
              indicatorSize={(origin) => origin - 16}
            />
          </>
        )}
      </div>

      <div className="pt-1">
        <div className="px-4 mb-3 sm:px-0">
          <h2 className="text-base font-semibold leading-7 dark:text-white text-gray-900">
            Notifications
          </h2>
          <p className="mt-1 text-sm leading-6 dark:text-white text-gray-600">
            We'll always let you know about important changes, but you pick what
            else you want to hear about.
          </p>
        </div>

        <form
          className="bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="px-4 py-6 sm:p-8">
            <div className="max-w-2xl space-y-10">
              <fieldset>
                <legend className="text-sm font-semibold leading-6 dark:text-white text-gray-900">
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
                            checked={
                              (categoryNotifications &&
                                categoryNotifications.length > 0 &&
                                categoryNotifications.find(
                                  (item) => item.category === selectedCategory
                                )?.notifications[item.id]) ||
                              false
                            }
                            onChange={(e) =>
                              handleCheckboxChange(
                                item.category,
                                item.id,
                                e.target.checked
                              )
                            }
                            type="checkbox"
                            className="dark:bg-gray-900 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </div>
                        <div className="text-sm leading-6">
                          <label
                            htmlFor={`notification-email-${index}`}
                            className="font-medium dark:text-white text-gray-900"
                          >
                            {item.title}
                          </label>
                          <p className="dark:text-white dark:text-white text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold leading-6 dark:text-white text-gray-900">
                  By Notifications
                </legend>
                <p className="mt-1 text-sm leading-6 dark:text-white text-gray-600 mb-4">
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
                          checked={
                            (categoryNotifications &&
                              categoryNotifications.length > 0 &&
                              categoryNotifications.find(
                                (item) => item.category === selectedCategory
                              )?.notifications[item.id]) ||
                            false
                          }
                          onChange={(e) =>
                            handleCheckboxChange(
                              item.category,
                              item.id,
                              e.target.checked
                            )
                          }
                          type="checkbox"
                          className="dark:bg-gray-900 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="text-sm leading-6">
                        <label
                          htmlFor={`notification-phone-${index}`}
                          className="font-medium dark:text-white text-gray-900"
                        >
                          {item.title}
                        </label>
                        <p className="dark:text-white dark:text-white text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </fieldset>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              className="text-sm font-semibold leading-6 dark:text-white text-gray-900"
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
};

export default CategotyNotifications;

import { Alert, Button, Modal, Select, Spin, Typography, message } from "antd";
import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { selectDarkMode, selectLoading } from "../../../redux/auth/selectors";
import CrudService from "../../../service/CrudService";

// const targetFields = [
//   { value: "country", label: "Country" },
//   { value: "region", label: "Region" },
//   { value: "total", label: "Total" },
//   { value: "year", label: "Year" },
// ];
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const ImportModule = ({
  json,
  KPIType,
  header,
  disaggregations,
  refreshData,
}) => {
  const [bulkUploadProcess, setBulkUploadProcess] = useState({});
  const loading = useSelector(selectLoading);
  const targetFields = header.map((i) => ({ value: i, label: i }));
  const darkMode = useSelector(selectDarkMode);

  return (
    <>
      <Button
        className="px-2 py-1 text-sm bg-indigo-500 text-white rounded"
        onClick={() => {
          let mappings = {};
          try {
            mappings = JSON.parse(
              localStorage[
                `importfile_mapping_${Object.keys(header).join("_")}`
              ]
            );
          } catch (e) {}

          setBulkUploadProcess((current) => ({ ...current, json, mappings }));
        }}
      >
        Import Selected Sheet
      </Button>

      <Modal
        wrapClassName={`${darkMode ? "dark" : ""}`}
        open={!!bulkUploadProcess?.json?.[0]}
        onCancel={() => setBulkUploadProcess({})}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
        destroyOnClose
      >
        <Alert
          type="info"
          message="Please check and verify the data"
          className="mt-5"
        />

        {bulkUploadProcess?.mappedItems ? (
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 mt-5 mb-3">
              <thead>
                <tr className="font-bold">
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs dark:text-white text-gray-500"
                  >
                    Delete
                  </th>
                  {targetFields.map((t, idx) => (
                    <th
                      key={idx}
                      scope="col"
                      className="px-6 py-3 text-left text-xs dark:text-white text-gray-500"
                    >
                      {t.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 dark:bg-gray-900 divide-y divide-gray-200">
                {bulkUploadProcess?.mappedItems?.map((line, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <MdDelete
                        onClick={() => {
                          setBulkUploadProcess((cur) => {
                            const current = { ...cur };

                            current.mappedItems.splice(i + 1, 1);

                            return current;
                          });
                        }}
                        className="cursor-pointer text-red-500 relative top-0.5 start-1"
                      />
                    </td>
                    {targetFields.map((t, idx) => (
                      <td key={idx} className="px-6 py-4 whitespace-nowrap">
                        <Typography.Paragraph
                          editable={{
                            onChange: (e) => {
                              setBulkUploadProcess((cur) => {
                                const current = { ...cur };

                                current.mappedItems[i + 1][t.value] = e;

                                return current;
                              });
                            },
                          }}
                        >
                          {line?.[t.value] ?? ""}
                        </Typography.Paragraph>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3">
              <button
                onClick={async () => {
                  const chunk = (arr, size) =>
                    Array.from(
                      { length: Math.ceil(arr.length / size) },
                      (v, i) => arr.slice(i * size, i * size + size)
                    );

                  const chunks = chunk(
                    bulkUploadProcess.mappedItems.map((l) => ({
                      ...l,
                    })),
                    100
                  );

                  await CrudService.delete("BenchMark", null, { KPIType });

                  for (const chunk of chunks) {
                    await CrudService.create("BenchMark", {
                      bulkItems: chunk.map((c) => {
                        let _disaggregations = [...disaggregations];
                        let result = _disaggregations.map((item) => {
                          let temp = {
                            name: "",
                            children: [],
                          };
                          temp.name = item.name;
                          temp.children = item.children;

                          if (temp.children.length > 1) {
                            let _temp = temp.children.reduce(
                              (acc, cell, index) => {
                                if (cell) {
                                  acc[cell.toLowerCase()] = parseFloat(
                                    c[capitalize(cell)]
                                  );
                                }
                                return acc;
                              },
                              {}
                            );
                            temp.children = _temp;
                          } else {
                            temp["value"] = c[item.name];
                          }
                          return temp;
                        });
                        return {
                          disaggregations: result,
                          KPIType,
                          total: parseFloat(c.Total),
                          country: c.Country,
                          region: c.Region,
                        };
                      }),
                    });
                  }
                  await refreshData();
                  setBulkUploadProcess({});
                }}
                className="px-2 py-1 text-sm bg-indigo-500 text-white rounded"
                disabled={loading}
              >
                {!loading ? "Import" : <Spin>Import</Spin>}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="font-bold flex items-center justify-between mt-5 mb-3">
              <div>Column of Imported File</div>
              <div>Target Column</div>
            </div>
            {bulkUploadProcess?.json?.[0] &&
              Object.keys(bulkUploadProcess?.json?.[0]).map((key, i) => (
                <div key={i} className="flex items-center justify-between mb-1">
                  <div>{key}</div>
                  <div>
                    <Select
                      className="min-w-[120px]"
                      value={bulkUploadProcess?.mappings?.[key]}
                      allowClear
                      onChange={(e) =>
                        setBulkUploadProcess((cur) => {
                          const current = { ...cur };
                          if (!current?.mappings) current.mappings = {};

                          current.mappings[key] = e;

                          localStorage[
                            `importfile_mapping_${Object.keys(
                              bulkUploadProcess.json[0]
                            ).join("_")}`
                          ] = JSON.stringify(current.mappings);

                          return current;
                        })
                      }
                    >
                      {targetFields
                        .filter((item) => {
                          return (
                            !bulkUploadProcess?.mappings ||
                            bulkUploadProcess?.mappings[key] === item.value ||
                            !Object.values(bulkUploadProcess.mappings).includes(
                              item.value
                            )
                          );
                        })
                        .map((item) => (
                          <Select.Option
                            key={item.value}
                            value={item.value}
                            label={item.label}
                          >
                            {item.label}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>
                </div>
              ))}

            <div className="flex justify-end mt-2">
              <button
                onClick={async () => {
                  const keys = Object.keys(bulkUploadProcess.mappings);
                  const values = Object.values(bulkUploadProcess.mappings);

                  const mappedItems = bulkUploadProcess.json
                    .map((item) => {
                      const mappedItem = {};
                      for (const key of keys)
                        mappedItem[bulkUploadProcess.mappings[key]] = item[key];
                      return mappedItem;
                    })
                    .filter((a) => {
                      if (Object.keys(a).every((key) => !a[key])) return false;

                      return true;
                    });
                  setBulkUploadProcess((current) => ({
                    ...current,
                    mappedItems,
                  }));
                }}
                className="px-2 py-1 text-sm bg-indigo-500 text-white rounded"
                disabled={loading}
              >
                {!loading ? "Import" : <Spin>Import</Spin>}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ImportModule;

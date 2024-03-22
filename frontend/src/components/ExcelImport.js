import React, { useState } from "react";

import { Alert, Modal, Select, Typography, message } from "antd";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { selectDarkMode } from "../redux/auth/selectors";

const handleXLSXTOJSON = async ({ sheet }, callback) => {
  const XLSXTOJSON = new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const jsonResult = jsonData.map((row) =>
        row.reduce((acc, cell, index) => {
          const header = jsonData[0][index];
          if (header) {
            acc[header] = cell;
          }
          return acc;
        }, {})
      );
      resolve(jsonResult);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsBinaryString(sheet);
  });
  const json = await XLSXTOJSON;
  callback(json);
};

const ExcelImport = ({
  targetMapping,
  handleImport,
  fileInputRef,
  modalName,
}) => {
  const [loading, setLoading] = useState(false);
  const [bulkUploadProcess, setBulkUploadProcess] = useState({});
  const darkMode = useSelector(selectDarkMode);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      handleXLSXTOJSON({ sheet: file }, async (json) => {
        json.shift();

        let mappings = {};
        try {
          mappings = JSON.parse(
            localStorage[
              `importfile_mapping_${modalName}_${Object.keys(json?.[0]).join(
                "_"
              )}`
            ]
          );
        } catch (e) {}

        setBulkUploadProcess((current) => ({
          ...current,
          json,
          mappings,
        }));
      });
    }
  };

  return (
    <>
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
                  {targetMapping.map((target) => (
                    <th
                      key={target.value}
                      scope="col"
                      className="px-6 py-3 text-left text-xs dark:text-white text-gray-500"
                    >
                      {target.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 dark:bg-gray-900 divide-y divide-gray-200">
                {bulkUploadProcess?.mappedItems?.map((line, i) => (
                  <tr key={i}>
                    {targetMapping.map((target) => (
                      <td
                        key={target.value}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        <Typography.Paragraph
                          editable={{
                            onChange: (e) => {
                              setBulkUploadProcess((cur) => {
                                const current = { ...cur };

                                current.mappedItems[i][target.value] = e;

                                return current;
                              });
                            },
                          }}
                        >
                          {line?.[target.value] ?? ""}
                        </Typography.Paragraph>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    for (const targetColumn of targetMapping) {
                      if (
                        targetColumn.type === "string" &&
                        !!targetColumn.enum &&
                        bulkUploadProcess.mappedItems?.some?.(
                          (m) =>
                            !targetColumn.enum.includes(
                              m?.[targetColumn.value]
                            ) &&
                            !(
                              !targetColumn.required && !m?.[targetColumn.value]
                            )
                        )
                      ) {
                        message.info(
                          `${
                            targetColumn.label
                          } can be one of the following: ${targetColumn.enum.join(
                            ", "
                          )}`
                        );
                        throw new Error("");
                      }
                      if (targetColumn.type === "boolean") {
                        bulkUploadProcess.mappedItems.forEach((m) => {
                          if (
                            !(
                              !targetColumn.required &&
                              m?.[targetColumn.value] === ""
                            )
                          )
                            return;
                          if (
                            !["1", "0", 1, 0].includes(m?.[targetColumn.value])
                          ) {
                            message.info(
                              `${targetColumn.label} can be one of the following: 1, 0. 1 maps to TRUE, and 0 maps to FALSE.`
                            );
                            throw new Error("");
                          }
                          m[targetColumn.value] = [1, "1"].includes(
                            m?.[targetColumn.value]
                          );
                        });
                      }
                      if (targetColumn.type === "number") {
                        bulkUploadProcess.mappedItems.forEach((m) => {
                          if (
                            !(
                              !targetColumn.required &&
                              m?.[targetColumn.value] === ""
                            )
                          )
                            return;
                          m[targetColumn.value] = parseFloat(
                            m?.[targetColumn.value]
                          );
                          if (
                            isNaN(m[targetColumn.value]) ||
                            typeof m[targetColumn.value] !== "number"
                          ) {
                            message.info(
                              `${targetColumn.label} could not be converted to a number in one of the rows.`
                            );
                            throw new Error("");
                          }
                        });
                      }
                    }

                    await handleImport(bulkUploadProcess);

                    setBulkUploadProcess({});
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                disabled={loading}
              >
                Import
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
                      showSearch
                      className="min-w-[120px]"
                      value={bulkUploadProcess?.mappings?.[key]}
                      allowClear
                      onChange={(e) =>
                        setBulkUploadProcess((cur) => {
                          const current = { ...cur };
                          if (!current?.mappings) current.mappings = {};

                          current.mappings[key] = e;

                          localStorage[
                            `importfile_mapping_${modalName}_${Object.keys(
                              bulkUploadProcess.json[0]
                            ).join("_")}`
                          ] = JSON.stringify(current.mappings);

                          return current;
                        })
                      }
                    >
                      {targetMapping
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

                  for (const targetColumn of targetMapping) {
                    if (
                      targetColumn.required &&
                      !values.includes(targetColumn.value)
                    )
                      return message.info(
                        `Please select a mapping column for ${targetColumn.label}`
                      );
                  }

                  const mappedItems = bulkUploadProcess.json
                    .map((item) => {
                      const mappedItem = {};
                      for (const key of keys)
                        mappedItem[bulkUploadProcess.mappings[key]] = item[key];

                      return mappedItem;
                    })
                    .filter((a) => {
                      let hasData = false;
                      for (const key of Object.keys(a)) {
                        if (a[key]) hasData = true;
                      }
                      return hasData;
                    });
                  setBulkUploadProcess((current) => ({
                    ...current,
                    mappedItems,
                  }));
                }}
                className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                disabled={loading}
              >
                Import
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* For bulk upload */}
      <input
        type="file"
        className="dark:bg-gray-900"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.csv"
      />
    </>
  );
};

export default ExcelImport;

import { Button, Skeleton, Space, Table } from "antd";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import LoadingSpinner from "../../../components/Loader";
import Select from "../../../components/Select";
import { selectUser } from "../../../redux/auth/selectors";
import CrudService from "../../../service/CrudService";
import ImportModule from "./ImportModule";

export const handleXLSXTOJSON = async ({ sheet, sheetName }, callback) => {
  const XLSXTOJSON = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsBinaryString(sheet);

    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });
      resolve(jsonData);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
  const json = await XLSXTOJSON;
  callback(json);
};

export const sectorOptions = {
  education: [
    { value: "out_of_school_rates", label: "Out-of-school rates" },
    {
      value: "adjusted__net_attendance_rates",
      label: "Adjusted net attendance rates",
    },
    { value: "completion_rates", label: "Completion rates" },
    {
      value: "foundational_learning_skills",
      label: "Foundational learning skills",
    },
    {
      value: "information_communication_technology_skills",
      label: "Information communication technology skills",
    },
    {
      value: "youth_and_adult_literacy_rates",
      label: "Youth and adult literacy rates",
    },
    {
      value: "school_age_digital_connectivity",
      label: "School-age digital connectivity",
    },
  ],
  health: [
    {
      value: "Maternal and Newborn Health Coverage",
      label: "Maternal and Newborn Health Coverage",
    },
    { value: "Stunting", label: "Stunting" },
    { value: "Wasting", label: "Wasting" },
    { value: "Overweight", label: "Overweight" },
    { value: "Malnutrition", label: "Malnutrition" },
  ],
};

const Benchmarks = () => {
  const user = useSelector(selectUser);
  const fileInputRef = useRef(null);
  const [KPIType, setKPIType] = useState(null);
  const [KPISTypeListOption, setKPISTypeListOptions] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [file, setFile] = useState(null);
  const [json, setJSON] = useState({});
  const [header, setHeader] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [workbook, setWorkbook] = useState();
  const [benchmarksData, setBenchmarksData] = useState([]);
  const [disaggregations, setDisaggregations] = useState([]);

  useEffect(() => {
    if (user) {
      setKPISTypeListOptions(Object.values(sectorOptions).flat());
      setKPIType(sectorOptions[user?.sector ?? "education"][0].value);
    }
    getData();
  }, [user]);

  const getData = async () => {
    await CrudService.search("BenchMark", 100000000, 1, {}).then((res) => {
      setBenchmarksData(res.data.items);
    });
  };

  const toSnakeCase = (str) => {
    if (str.includes("-")) {
      return str.replace(/-/g, "_").toLowerCase();
    } else if (
      str.match(/[A-Z]+/g)?.length > 1 ||
      str.match(/[^A-Za-z0-9]+/g)
    ) {
      return str.replace(/\s+/g, "_").toLowerCase();
    } else {
      return str.toLowerCase();
    }
  };

  const processData = (data, sheetName, benchMarkType, KPIType) => {
    const transformedHeaderData = [];
    const transformedData = [];

    const subHeaders = {};

    // Extract sub-headers from the second row
    for (const key in data[1]) {
      if (
        Object.prototype.hasOwnProperty.call(data[1], key) &&
        !key.startsWith("__EMPTY")
      ) {
        const parentKey = Object.keys(data[1]).find(
          (k) => k.startsWith("__EMPTY") && data[1][k] === key
        );
        if (parentKey) {
          if (!subHeaders[parentKey]) subHeaders[parentKey] = [];
          subHeaders[parentKey].push(key);
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      const row = data[i];
      const obj = {};
      // Initialize variables to store the previous key and its value
      let prevKey = null;
      let prevValue = null;

      // Iterate through each column of the row
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          const value = row[key];
          // Skip columns starting with "__EMPTY"
          if (key.startsWith("__EMPTY")) {
            // If the previous key exists, push the value into its array
            if (prevKey) {
              obj[prevKey].push(value);
            }
          } else {
            // If the key is not "__EMPTY", update the previous key and value
            prevKey = key;
            prevValue = value;

            // Initialize an array for the current key and push the value into it
            obj[key] = [value];
          }
        }
      }
      transformedHeaderData.push(obj);
    }

    // Iterate through each row of the Excel data starting from index 1 (index 0 is the header)
    for (let i = 3; i < data.length; i++) {
      const row = data[i];

      const obj = {};

      // Initialize variables to store the previous key and its value
      let prevKey = null;
      let prevValue = null;

      // Iterate through each column of the row
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          const value = row[key];

          // Skip columns starting with "__EMPTY"
          if (key.startsWith("__EMPTY")) {
            // If the previous key exists, push the value into its array
            if (prevKey) {
              obj[prevKey].push(value);
            }
          } else {
            // If the key is not "__EMPTY", update the previous key and value
            prevKey = key;
            prevValue = value;

            // Initialize an array for the current key and push the value into it
            obj[key] = [value];
          }
        }
      }
      transformedData.push(obj);
    }

    const result = [];
    // Iterate through each object in the values array
    transformedData.forEach((valueObj) => {
      // Initialize the current object
      const currentObj = {};

      // Iterate through each key in the value object
      for (const key in valueObj) {
        if (Object.prototype.hasOwnProperty.call(valueObj, key)) {
          const snakeCaseKey = toSnakeCase(key);

          // If the value exists in the value object and has length greater than 0
          if (valueObj[key] && valueObj[key].length > 0) {
            // If the key exists in the header array, set it according to the header structure
            const headerObj = transformedHeaderData.find(
              (header) => header[key]
            );
            if (headerObj) {
              if (valueObj[key].length > 1) {
                currentObj[snakeCaseKey] = {};
                headerObj[key].forEach((item, index) => {
                  currentObj[snakeCaseKey][item] = valueObj[key][index];
                });
              } else {
                currentObj[snakeCaseKey] = valueObj[key][0];
              }
            } else {
              currentObj[snakeCaseKey] = valueObj[key][0];
            }
          }
        }
      }

      // Push the current object into the result array
      result.push({
        sheetType: sheetName,
        KPIType,
        benchMarkType,
        ...currentObj,
      });
    });
    return result;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      handleXLSXTOJSON({ sheet: file }, async (sheetData) => {
        setShowLoader(true);
        if (sheetData) {
          await CrudService.create("BenchMark", { bulkItems: sheetData }).then(
            (res) => {
              if (res.data) {
                console.log("File Import successfully");
                setShowLoader(false);
              }
            }
          );
        }
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      // const data = new Uint8Array(event.target.result);
      // const workbook = XLSX.read(data, { type: 'array' });
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      setWorkbook(workbook);

      // Get sheet names
      const names = workbook.SheetNames;
      setSheetNames(names);

      // Select the first sheet for simplicity
      setSelectedSheet(names[0]);
      handleSheetSelect(names[0], workbook);
    };

    reader.readAsArrayBuffer(file);
  };

  function createHeaderWithSubheaders(data) {
    const headerWithSubheaders = {};

    data.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (key.startsWith("__EMPTY")) return; // Skip empty cells

        const headerParts = key.split(":").map((part) => part.trim());
        const mainHeader = headerParts[0];

        if (!headerWithSubheaders[mainHeader]) {
          headerWithSubheaders[mainHeader] = [];
        }

        if (headerParts.length === 1) {
          // Single-level header
          headerWithSubheaders[mainHeader].push(value);
        } else {
          // Multi-level header
          const subHeader = headerParts.slice(1).join(":").trim();
          if (!headerWithSubheaders[mainHeader][0]) {
            headerWithSubheaders[mainHeader][0] = {};
          }
          if (!headerWithSubheaders[mainHeader][0][subHeader]) {
            headerWithSubheaders[mainHeader][0][subHeader] = [];
          }
          headerWithSubheaders[mainHeader][0][subHeader].push(value);
        }
      });
    });

    console.log("headerWithSubheaders", headerWithSubheaders);
    return headerWithSubheaders;
  }

  const handleSheetSelect = (sheetName) => {
    if (workbook) {
      const sheet = workbook.Sheets[sheetName];
      setSelectedSheet(sheetName);

      handleXLSXTOJSON({ sheet: file, sheetName }, (json) => {
        const _header = json[0];
        const _subHeader = json[1];
        const disaggregations = [];
        let i = 0;
        while (i < _header.length) {
          let item = {
            name: "",
            children: [],
          };
          if (_header[i]) {
            item.name = _header[i].split(" ").join("_");
            if (!_subHeader[i]) {
              disaggregations.push(item);
            } else {
              item.children = [_subHeader[i].split(" ").join("_")];
              disaggregations.push(item);
            }
          } else {
            if (_subHeader[i]) {
              item = disaggregations.pop();
              item.children = [
                ...item.children,
                _subHeader[i].split(" ").join("_"),
              ];
              disaggregations.push(item);
            }
          }
          i++;
        }
        setDisaggregations(disaggregations);
        const flattenHeader = [];
        disaggregations.map((i) => {
          if (i.children.length > 1) {
            i.children.map((ch) => flattenHeader.push(ch));
          } else {
            flattenHeader.push(i.name);
          }
        });
        setHeader(flattenHeader);

        json.shift();
        json.shift();
        const _json = json.map((row) =>
          row.reduce((acc, cell, index) => {
            const header = flattenHeader[index];
            if (header) {
              acc[header.toLowerCase()] = cell;
            }
            return acc;
          }, {})
        );
        setJSON(_json);
      });
    }
  };

  const extractHeaderWithMapping = (jsonData) => {
    let headers = [];

    const jsonResult = jsonData.map((row) =>
      row.reduce((acc, cell, index) => {
        const header = jsonData[4][index];
        if (header) {
          acc[header] = cell;
        }
        return acc;
      }, {})
    );

    console.log("jsonResult", jsonResult);
    console.log("jsonData", jsonData);
    // Iterate over each row to find header rows with subheaders
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      console.log("row", row);
      let header = [];
      let isHeaderRow = false;

      // Check if all cells in the row are either null or objects (subheaders)
      if (row.every((cell) => cell === null || typeof cell === "object")) {
        isHeaderRow = true;

        // Flatten the header structure to create hierarchical list of headers with subheaders
        row.forEach((cell) => {
          if (cell !== null && typeof cell === "object") {
            const subheaders = Object.keys(cell);
            header.push({ [subheaders[0]]: subheaders.slice(1) });
          } else {
            header.push(cell);
          }
        });

        // Add the header to the list
        headers.push(header);
      }

      // If we found a header row, we can break the loop
      if (isHeaderRow) {
        break;
      }
    }

    return headers;
    // let headerRow = null;
    //
    // console.log('jsonData', jsonData)
    // for (let i = 0; i < jsonData.length; i++) {
    //     const row = jsonData[i];
    //     console.log('row', row)
    //     if (row.every(cell => cell === null || typeof cell === 'object')) {
    //         headerRow = row;
    //         break;
    //     }
    // }
    //
    // if (!headerRow) {
    //     return { header: [], mapping: {} };
    // }
    //
    //
    // const header = [];
    // const mapping = {};
    //
    // headerRow.forEach((cell, idx) => {
    //     if (typeof cell === 'object') {
    //         const { mainHeader, subHeaders } = flattenHeader(cell);
    //         header.push(mainHeader);
    //         mapping[mainHeader] = subHeaders;
    //     } else {
    //         header.push(cell);
    //         mapping[cell] = [];
    //     }
    // });
    //
    // return { header, mapping };
  };

  const flattenHeader = (headerObj) => {
    let mainHeader = "";
    const subHeaders = [];

    Object.entries(headerObj).forEach(([key, value]) => {
      if (typeof value === "object") {
        mainHeader = key;
        value.forEach((subHeader) => subHeaders.push(subHeader));
      } else {
        subHeaders.push(key);
      }
    });

    return { mainHeader, subHeaders };
  };

  const handleKPITypeChange = (selectedOption) => {
    setKPIType(selectedOption);
  };

  const dataColumns = [
    {
      title: "Sheet Type",
      dataIndex: "sheetType",
      key: "region",
      width: 200,
      render: (text) => text || "-",
    },
    {
      title: "ISO3",
      dataIndex: "iso3",
      key: "iso3",
      render: (text) => text || "-",
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      width: 250,
      render: (text) => text || "-",
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 250,
      render: (text) => text || "-",
    },
    {
      title: "Sub Region",
      dataIndex: "sub_region",
      key: "sub_region",
      width: 200,
      render: (text) => text || "-",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 250,
      render: (text) => text || "-",
    },

    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 350,
      render: (text) => (
        <time dateTime={text} className="mr-2">
          {moment(text).format("Do MMM, YYYY")}
        </time>
      ),
    },
  ];

  if (!user) return <Skeleton active />;
  return (
    <>
      {showLoader && (
        <>
          <LoadingSpinner />
        </>
      )}
      <div>
        <h5>
          Sector: <span className={"capitalize"}>{user.sector}</span>
        </h5>
        <h5 className={"my-2"}>
          KPIs:
          <div className="mt-1" style={{ width: 250 }}>
            <Select
              options={KPISTypeListOption}
              value={KPIType}
              onChange={handleKPITypeChange}
              isClearable={true}
              placeholder="Select KPIs"
            />
          </div>
        </h5>
        {sheetNames.length > 0 && (
          <div>
            <h3>Select Sheet:</h3>
            <select
              value={selectedSheet}
              onChange={(e) => handleSheetSelect(e.target.value, XLSX)}
            >
              {sheetNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
        {sheetNames.length > 0 && selectedSheet && (
          <div className="mt-5">
            <ImportModule
              json={json}
              KPIType={KPIType}
              header={header}
              disaggregations={disaggregations}
              refreshData={getData}
            />
          </div>
        )}
      </div>
      <div>
        <input
          type="file"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx,.csv"
        />
      </div>

      {!(sheetNames.length > 0) && !selectedSheet && (
        <Button
          disabled={!KPIType}
          className="mt-5"
          type="primary"
          onClick={() => {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
          }}
        >
          Import Benchmarks
        </Button>
      )}

      <div className={"mt-3"}>
        <Table
          dataSource={benchmarksData.filter((a) => a.KPIType === KPIType)}
          columns={dataColumns}
          pagination={false}
          bordered={false}
          scroll={{ x: "700px" }}
          rowKey="_id"
        />
      </div>
    </>
  );
};

export default Benchmarks;

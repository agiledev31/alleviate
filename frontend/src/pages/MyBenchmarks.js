import { Column, Pie } from "@ant-design/charts";
import { Line } from "@ant-design/plots";
import { Card, Progress, Skeleton, Space, Switch } from "antd";
import React, { useEffect, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import {
  MdOutlineCastForEducation,
  MdOutlineHealthAndSafety,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { countries } from "../data/constants";
import { selectUser } from "../redux/auth/selectors";
import CrudService from "../service/CrudService";
import { sectorOptions } from "./ngo-company/Benchmarks";

const avg = (arr) => {
  if (!arr || !arr.length) return 0;
  const sum = arr.reduce((acc, cur) => acc + cur);
  const average = sum / arr.length;
  return parseFloat(average.toPrecision(4));
};

const DashboardDetail = () => {
  const navigate = useNavigate();
  const [isOnlyMyCountry, setIsOnlyMyCountry] = useState(false);
  const [benchmarks, setBenchmarks] = useState([]);
  const user = useSelector(selectUser);
  const [country, setCountry] = useState();
  const [lineChartData, setLineChartData] = useState([]);
  const [selectedKPI, setSelectedKPI] = useState("out_of_school_rates");
  const [filteredAggregation, setFilteredAggregation] = useState([]);

  const config = {
    data: lineChartData,
    padding: "auto",
    xField: "year",
    yField: "total",
    xAxis: {
      // type: 'timeCat',
      tickCount: 1,
    },
  };

  useEffect(() => {
    setCountry(user.country);
  }, [user]);

  useEffect(() => {
    CrudService.search("BenchMark", 1000000, 1, {
      filters: {
        KPIType: { $in: user.relevantDataset },
      },
    }).then(({ data }) => {
      setBenchmarks(data.items);
      let temp = data.items.filter((item) => !!item.year === true);
      let temp_years = [
        ...Array.from(new Set(temp.map((b) => b.year)))
          .filter((a) => !!a)
          .sort((a, b) => parseInt(a) - parseInt(b)),
      ];
      let temp_chartdata = temp_years.map((year) => ({
        year: year,
        total: avg(temp.filter((i) => i.year === year).map((t) => t.total)),
      }));
      setLineChartData(temp_chartdata);
    });
  }, [user]);

  const selectKPI = (KPI) => {
    setSelectedKPI(KPI);
  };

  const generateChartDataForGender = () => {
    let _data = filteredAggregation.map((item) => {
      let temp = item.filter((i) => i.name === "Gender");
      return temp.length ? temp[0].children : [];
    });
    let data = [];
    if (_data.length) {
      let male = avg(_data.map((i) => i.male));
      let female = avg(_data.map((i) => i.female));
      if (!(male == 0 && female == 0)) {
        data = [
          {
            label: "Male",
            ratio: parseFloat(((100 * male) / (male + female)).toPrecision(4)),
          },
          {
            label: "Female",
            ratio: parseFloat(
              ((100 * female) / (male + female)).toPrecision(4)
            ),
          },
        ];
      }
    }

    return {
      appendPadding: 20,
      data: data,
      angleField: "ratio",
      colorField: "label",
      radius: 0.8,
      autoFit: true,
      label: {
        type: "inner",
        offset: "-40%",
        content: function content(_ref) {
          return "".concat(_ref.ratio, "%");
        },
        style: {
          fontSize: 12,
          textAlign: "center",
        },
      },
      legend: {
        position: "top",
        flipPage: false,
        style: {
          textAlign: "center",
        },
      },
      interactions: [{ type: "pie-legend-active" }, { type: "element-active" }],
    };
  };

  const generateChartDataForResidence = () => {
    let _data = filteredAggregation.map((item) => {
      let temp = item.filter((i) => i.name === "Residence");
      return temp.length ? temp[0].children : [];
    });
    let data = [];
    if (_data.length) {
      let rural = avg(_data.map((i) => i.rural));
      let urban = avg(_data.map((i) => i.urban));
      if (!(rural == 0 && urban == 0)) {
        data = [
          {
            label: "Rural",
            ratio: parseFloat(((100 * rural) / (rural + urban)).toPrecision(4)),
          },
          {
            label: "Urban",
            ratio: parseFloat(((100 * urban) / (rural + urban)).toPrecision(4)),
          },
        ];
      }
    }

    return {
      appendPadding: 20,
      data: data,
      angleField: "ratio",
      colorField: "label",
      radius: 0.8,
      autoFit: true,
      label: {
        type: "inner",
        offset: "-40%",
        content: function content(_ref) {
          return "".concat(_ref.ratio, "%");
        },
        style: {
          fontSize: 12,
          textAlign: "center",
        },
      },
      legend: {
        position: "top",
        flipPage: false,
        style: {
          textAlign: "center",
        },
      },
      interactions: [{ type: "pie-legend-active" }, { type: "element-active" }],
    };
  };

  const generateChartDataForWealth_quintile = () => {
    let _data = filteredAggregation.map((item) => {
      let temp = item.filter((i) => i.name === "Wealth_quintile");
      return temp.length ? temp[0].children : [];
    });
    let data = [];
    if (_data.length) {
      let poorest = avg(_data.map((i) => i.poorest));
      let second = avg(_data.map((i) => i.second));
      let middle = avg(_data.map((i) => i.middle));
      let fourth = avg(_data.map((i) => i.fourth));
      let richest = avg(_data.map((i) => i.richest));
      let total = poorest + second + middle + fourth + richest;
      if (
        !(
          poorest == 0 &&
          second == 0 &&
          middle == 0 &&
          fourth == 0 &&
          richest == 0
        )
      ) {
        data = [
          {
            label: "Poorest",
            ratio: parseFloat(((100 * poorest) / total).toPrecision(4)),
          },
          {
            label: "Second",
            ratio: parseFloat(((100 * second) / total).toPrecision(4)),
          },
          {
            label: "Middle",
            ratio: parseFloat(((100 * middle) / total).toPrecision(4)),
          },
          {
            label: "Fourth",
            ratio: parseFloat(((100 * fourth) / total).toPrecision(4)),
          },
          {
            label: "Richest",
            ratio: parseFloat(((100 * richest) / total).toPrecision(4)),
          },
        ];
      }
    }

    return {
      appendPadding: 20,
      data: data,
      angleField: "ratio",
      colorField: "label",
      radius: 0.8,
      autoFit: true,
      label: {
        type: "inner",
        offset: "-40%",
        content: function content(_ref) {
          return "".concat(_ref.ratio, "%");
        },
        style: {
          fontSize: 12,
          textAlign: "center",
        },
      },
      legend: {
        position: "top",
        flipPage: false,
        style: {
          textAlign: "center",
        },
      },
      interactions: [{ type: "pie-legend-active" }, { type: "element-active" }],
    };
  };

  const generateChartDataForSource = () => {
    let _data = filteredAggregation.map((item) => {
      let temp = item.filter((i) => i.name === "Source");
      return temp.length ? temp[0].children : [];
    });
    let data = [];
    if (_data.length) {
      let time_period = avg(_data.map((i) => i.time_period));
      let data_source = avg(_data.map((i) => i.data_source));
      if (!(time_period == 0 && data_source == 0)) {
        data = [
          {
            label: "Time Period",
            ratio: parseFloat(
              ((100 * time_period) / (time_period + data_source)).toPrecision(4)
            ),
          },
          {
            label: "Data Source",
            ratio: parseFloat(
              ((100 * data_source) / (time_period + data_source)).toPrecision(4)
            ),
          },
        ];
      }
    }

    return {
      appendPadding: 20,
      data: data,
      angleField: "ratio",
      colorField: "label",
      radius: 0.8,
      autoFit: true,
      label: {
        type: "inner",
        offset: "-40%",
        content: function content(_ref) {
          return "".concat(_ref.ratio, "%");
        },
        style: {
          fontSize: 12,
          textAlign: "center",
        },
      },
      legend: {
        position: "top",
        flipPage: false,
        style: {
          textAlign: "center",
        },
      },
      interactions: [{ type: "pie-legend-active" }, { type: "element-active" }],
    };
  };

  const generateChartDataForPopulation_data = () => {
    let _data = filteredAggregation.map((item) => {
      let temp = item.filter((i) => i.name === "Wealth_quintile");
      return temp.length ? temp[0].children : [];
    });
    let data = [];
    if (_data.length) {
      let _total = avg(_data.map((i) => i["pop,_total"]));
      let _female = avg(_data.map((i) => i["pop,_female"]));
      let _male = avg(_data.map((i) => i["pop,_male"]));
      let _rural = avg(_data.map((i) => i["pop,_rural"]));
      let _urban = avg(_data.map((i) => i["pop,_urban"]));
      let urban_percentage = avg(_data.map((i) => i.urban_percentage));
      let total = _total + _female + _male + _rural + _urban + urban_percentage;
      if (
        !(
          _total == 0 &&
          _female == 0 &&
          _male == 0 &&
          _rural == 0 &&
          _urban == 0
        )
      ) {
        data = [
          {
            label: "Total",
            ratio: parseFloat(((100 * _total) / total).toPrecision(4)),
          },
          {
            label: "Female",
            ratio: parseFloat(((100 * _female) / total).toPrecision(4)),
          },
          {
            label: "Male",
            ratio: parseFloat(((100 * _male) / total).toPrecision(4)),
          },
          {
            label: "Rural",
            ratio: parseFloat(((100 * _rural) / total).toPrecision(4)),
          },
          {
            label: "Urban",
            ratio: parseFloat(((100 * _urban) / total).toPrecision(4)),
          },
          {
            label: "Urban percentage",
            ratio: parseFloat(
              ((100 * urban_percentage) / total).toPrecision(4)
            ),
          },
        ];
      }
    }

    return {
      appendPadding: 20,
      data: data,
      angleField: "ratio",
      colorField: "label",
      radius: 0.8,
      autoFit: true,
      label: {
        type: "inner",
        offset: "-40%",
        content: function content(_ref) {
          return "".concat(_ref.ratio, "%");
        },
        style: {
          fontSize: 12,
          textAlign: "center",
        },
      },
      legend: {
        position: "top",
        flipPage: false,
        style: {
          textAlign: "center",
        },
      },
      interactions: [{ type: "pie-legend-active" }, { type: "element-active" }],
    };
  };

  useEffect(() => {
    setFilteredAggregation(
      benchmarks
        .filter(
          (b) =>
            b.KPIType === selectedKPI &&
            (!isOnlyMyCountry ||
              b.country === countries.find((c) => country === c.value)?.label)
        )
        .map((b) => b.disaggregations ?? [])
    );
    generateChartDataForGender();
    generateChartDataForResidence();
    generateChartDataForWealth_quintile();
    generateChartDataForSource();
    generateChartDataForPopulation_data();
  }, [selectedKPI, isOnlyMyCountry, country, benchmarks]);

  if (!benchmarks.length) return <Skeleton active />;

  return (
    <div className="">
      <div className={"mx-auto md:p-4 2xl:p-6 2xl:px-6 bg-[#f1f5f9]"}>
        <div className={"mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5 "}>
          <div
            className={
              "col-span-12 sm:col-span-7 xl:col-span-8 shadow-sm bg-white p-8"
            }
          >
            <div className="flex justify-between items-start mb-5">
              <h2 className={"text-gray-900 text-2xl font-bold pb-4"}>
                Benchmarks
              </h2>
              <Space className="min-h-[110px]" direction="vertical">
                <Switch
                  className="float-right"
                  checked={isOnlyMyCountry}
                  onChange={(e) => setIsOnlyMyCountry(e)}
                  unCheckedChildren="Global"
                  checkedChildren="My Country"
                />
                {isOnlyMyCountry && (
                  <div>
                    <label>Country</label>
                    <ReactFlagsSelect
                      className="min-w-[240px]"
                      selected={country}
                      onSelect={setCountry}
                      searchable
                    />
                  </div>
                )}
              </Space>
            </div>
            <div>
              {sectorOptions[user?.sector ?? "education"]
                ?.map((i) => i.value)
                .filter?.((dataset) =>
                  benchmarks?.some?.((b) => b.KPIType === dataset)
                )
                ?.map?.((dataset, i) => (
                  <div key={i}>
                    {dataset !== "Maternal and Newborn Health Coverage" ? (
                      <Card bordered={false}>
                        <div className="justify-between">
                          <div
                            className="flex items-center opacity-50 pb-4 gap-2 cursor-pointer text-[16px]"
                            onClick={() => selectKPI(dataset)}
                          >
                            {Object.values(sectorOptions.education).find(
                              (e) => e.value === dataset
                            ) ? (
                              <MdOutlineCastForEducation />
                            ) : (
                              <MdOutlineHealthAndSafety />
                            )}
                            {Object.values(sectorOptions)
                              .flat()
                              .find((e) => e.value === dataset)?.label ?? ""}
                          </div>
                          {benchmarks.filter(
                            (b) =>
                              b.KPIType === dataset &&
                              (!isOnlyMyCountry ||
                                b.country ===
                                  countries.find((c) => country === c.value)
                                    ?.label)
                          ).length ? (
                            avg(
                              benchmarks
                                .filter(
                                  (b) =>
                                    b.KPIType === dataset &&
                                    (!isOnlyMyCountry ||
                                      b.country ===
                                        countries.find(
                                          (c) => country === c.value
                                        )?.label)
                                )
                                .map((b) => b.total ?? 0)
                            ) ? (
                              <Progress
                                status="active"
                                percent={avg(
                                  benchmarks
                                    .filter(
                                      (b) =>
                                        b.KPIType === dataset &&
                                        (!isOnlyMyCountry ||
                                          b.country ===
                                            countries.find(
                                              (c) => country === c.value
                                            )?.label)
                                    )
                                    .map((b) => b.total ?? 0)
                                )}
                              />
                            ) : (
                              <div className="opacity-70">
                                No data Available
                              </div>
                            )
                          ) : (
                            <div className="opacity-70">No data Available</div>
                          )}
                        </div>
                      </Card>
                    ) : (
                      <Card bordered={false}>
                        <div className="justify-between">
                          <div className="flex items-center opacity-50 pb-4 gap-2 text-[16px]">
                            <MdOutlineHealthAndSafety />
                            {Object.values(sectorOptions)
                              .flat()
                              .find((e) => e.value === dataset)?.label ?? ""}
                          </div>
                          {lineChartData ? (
                            <Line className="max-h-60" {...config} />
                          ) : (
                            <div className="opacity-70">No data Available</div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div
            className={
              "col-span-12 sm:col-span-5 xl:col-span-4 shadow-sm bg-white p-8"
            }
          >
            <h2 className={"text-gray-900 text-2xl pb-4"}>Disaggregation</h2>

            <div>
              {selectedKPI ? (
                <>
                  <h2 className="font-bold">
                    {selectedKPI.slice(0, 1).toUpperCase() +
                      selectedKPI.replace(/_/g, " ").slice(1)}
                  </h2>
                  {generateChartDataForGender().data[0]?.ratio &&
                  generateChartDataForGender().data[0]?.ratio != NaN ? (
                    <div className="!h-[300px]">
                      <h4>Gender</h4>
                      <Pie {...generateChartDataForGender()} />
                    </div>
                  ) : null}

                  {generateChartDataForResidence().data[0]?.ratio &&
                  generateChartDataForResidence().data[0]?.ratio != NaN ? (
                    <div className="!h-[300px]">
                      <h4>Residence</h4>
                      <Pie {...generateChartDataForResidence()} />
                    </div>
                  ) : null}
                  {generateChartDataForWealth_quintile().data[0]?.ratio &&
                  generateChartDataForWealth_quintile().data[0]?.ratio !=
                    NaN ? (
                    <div className="!h-[300px]">
                      <h4>Source</h4>
                      <Pie {...generateChartDataForWealth_quintile()} />
                    </div>
                  ) : null}
                  {generateChartDataForPopulation_data().data[0]?.ratio &&
                  generateChartDataForPopulation_data().data[0]?.ratio !=
                    NaN ? (
                    <div className="!h-[300px]">
                      <h4>Population Data</h4>
                      <Pie {...generateChartDataForPopulation_data()} />
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetail;

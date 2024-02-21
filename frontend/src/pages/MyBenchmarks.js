import { Column, Pie } from "@ant-design/charts";
import {
  Card,
  Skeleton,
  Space,
  Progress,
  Switch,
} from "antd";
import { Line } from '@ant-design/plots';
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { countries } from "../data/constants";
import { selectUser } from "../redux/auth/selectors";
import CrudService from "../service/CrudService";
import { sectorOptions } from "./ngo-company/Benchmarks";
import ReactFlagsSelect from "react-flags-select";
import { MdOutlineCastForEducation } from "react-icons/md";
import { MdOutlineHealthAndSafety } from "react-icons/md";

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
  
  const config = {
    data: lineChartData,
    padding: 'auto',
    xField: 'year',
    yField: 'total',
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
      let temp = data.items.filter(item => !!item.year === true);
      let temp_years = [...Array.from(new Set(temp.map((b) => b.year))).filter((a) => !!a).sort((a, b) => parseInt(a) - parseInt(b))];
      let temp_chartdata = temp_years.map(year => ({
        year: year,
        total: avg(temp.filter(i => i.year === year).map(t => t.total))
      }));
      setLineChartData(temp_chartdata);
    });
  }, [user]);

  const selectKPI = (KPI) => {
    setSelectedKPI(KPI);
  }

  const generateChartData = () => {
    let filtered = benchmarks.filter((b) =>
          b.KPIType === selectedKPI &&
          (!isOnlyMyCountry || b.country === countries.find((c) => country === c.value)?.label)
        )
        .map((b) => b.disaggregations ?? []);
      let genderData = filtered.map(item => {
        let temp = item.filter(i => i.name === "Gender")
        return temp.length ? temp[0].children : [];
      })
    let data = [];
    if(genderData.length){
      let male = avg(genderData.map(i => i.male));
      let female = avg(genderData.map(i => i.female));
      if(!(male == 0 && female == 0)) {
        data = [
          {
            label: "Male",
            ratio: parseFloat((100 * male/(male + female)).toPrecision(4)) 
          },
          {
            label: "Female",
            ratio: parseFloat((100 * female/(male + female)).toPrecision(4)) 
          }
        ]
      }
    }
    
    return {
      appendPadding: 50,
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
    generateChartData()
  }, [selectedKPI])

  if (!benchmarks.length) return <Skeleton active />;

  return (
    <div className="">
      <div className={"mx-auto md:p-4 2xl:p-6 2xl:px-6 bg-[#f1f5f9]"}>
        <div className={"mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5 "}>
          <div className={"col-span-12 sm:col-span-5 xl:col-span-4 shadow-sm bg-white p-8"}>
            <h2 className={"text-gray-900 text-2xl font-bold pb-4"}>
              Disaggregation
            </h2>

            <div>
              {selectedKPI ? (
                <Pie {...generateChartData()} />
              ) : (
                <>No Disaggregation</>
              )}
            </div>
          </div>
          <div className={"col-span-12 sm:col-span-7 xl:col-span-8 shadow-sm bg-white p-8"}>
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
                {
                  isOnlyMyCountry &&
                  <div>
                    <label>Country</label>
                    <ReactFlagsSelect
                      className="min-w-[240px]"
                      selected={country}
                      onSelect={setCountry}
                    />
                  </div>
                }
              </Space>
            </div>
            <div>
              {sectorOptions[user?.sector]?.map(i => i.value).filter?.((dataset) =>
                  benchmarks?.some?.((b) => b.KPIType === dataset)
                )
                ?.map?.((dataset, i) => (
                    <div key={i}>
                      {dataset !== "Maternal and Newborn Health Coverage" ?
                        <Card bordered={false}>
                          <div className="justify-between">
                            <div className="flex items-center opacity-50 pb-4 gap-2 cursor-pointer"  onClick={() => selectKPI(dataset)}>
                              {Object.values(sectorOptions.education).find((e) => e.value === dataset) ?
                                <MdOutlineCastForEducation />
                                : <MdOutlineHealthAndSafety />
                              }
                              {Object.values(sectorOptions).flat().find((e) => e.value === dataset)?.label ?? ""}
                            </div>
                            {benchmarks.filter((b) =>
                              b.KPIType === dataset && (!isOnlyMyCountry || b.country === countries.find((c) => country === c.value)?.label)
                            ).length ?
                              <Progress 
                                status="active"
                                percent={
                                  avg(benchmarks.filter((b) =>
                                      b.KPIType === dataset &&
                                      (!isOnlyMyCountry || b.country === countries.find((c) => country === c.value)?.label)
                                    )
                                    .map((b) => b.total ?? 0))
                                }  
                              />
                              : <div>No data available!</div>
                          }
                          </div>
                        </Card>
                        : <Card bordered={false}>
                            <div className="justify-between">
                              <div className="flex items-center opacity-50 pb-4 gap-2">
                                <MdOutlineHealthAndSafety />
                                {Object.values(sectorOptions).flat().find((e) => e.value === dataset)?.label ?? ""}
                              </div>
                              {lineChartData ?
                                <Line className="max-h-60" {...config} />
                                : <div>No data available!</div>
                              }
                            </div>
                          </Card>
                      }
                    </div>
                ))}
            </div>
          </div>          
        </div>
      </div>
    </div>
  );
};

export default DashboardDetail;

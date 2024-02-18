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
      setLineChartData(temp_chartdata)
    });
  }, [user]);

  console.log("user", user)
  console.log("dataset", sectorOptions[user?.sector]);


  if (!benchmarks.length) return <Skeleton active />;

  return (
    <div className="">
      <div className={"mx-auto md:p-4 2xl:p-6 2xl:px-6 bg-[#f1f5f9]"}>
        <div className={"mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5 "}>
          <div className={"col-span-12 xl:col-span-6 shadow-sm bg-white p-8"}>
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
                            <div className="flex items-center opacity-50 pb-4 gap-2">
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

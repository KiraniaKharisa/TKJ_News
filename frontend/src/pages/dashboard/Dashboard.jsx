import { useState, useEffect } from "react"
import { LoadingText } from '../../components/ui/Loading';
import { Newspaper, Eye, ScrollText, PenLine, Trash } from "lucide-react";
import { formatDateCreatedAt, formatNumberLikes, potongText } from "../../lib/Helper"
import {Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import { api, overrideMethod } from "../../lib/api";
import { monthNames } from "../../lib/constanta";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const [berita, setBerita] = useState([]);
  const [loadingBerita, setLoadingBerita] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [totalBerita, setTotalBerita] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalKategori, setTotalKategori] = useState(0);
  const [trafic, setTrafic] = useState([]);
  const {user} = useAuth();

  const getBerita = async () => {
    setLoadingBerita(true);
    setBerita([]);
    try {
      const res = await overrideMethod("GET", api).post("/berita", {
        fixfilters: user ? {user_id: user.id} : null,
        order: 'DESC',
        sort: 'views',
        start: 0,
        end: 10
      });

      setBerita(res.data.data);
    } catch (err) {
      console.log(err);
      setBerita([]);
    } finally {
      setLoadingBerita(false);
    }
  };


  const getDetail = async () => {
    setLoadingDetail(true);
    try {
      const res = await api.get("/detailberitaku");
      const data = res.data.data
      setTotalBerita(data.berita)
      setTotalViews(data.views)
      setTotalKategori(data.kategori)

      // trafic chart
      const dataTraficChart = data.viewstrafic;
      const now = new Date();
      const bulansaatini = now.getMonth() + 1;

      const filled = Array.from({length: bulansaatini}, (_, i) => {
        const bulan = i + 1;
        const item = dataTraficChart.find((d) => d.bulan == bulan)
        return {
          name: monthNames[i],
          total: item ? parseInt(item.total_views) : 0
        }
      });

      setTrafic(filled)
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    getDetail();
    getBerita();
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p>Menampilkan tentang detail tentang perkembangan artikel anda</p>

      <div className="grid grid-cols-3 gap-x-5 mt-5">
        <div className="bg-[rgb(32_31_31)] py-3 shadow shadow-blue-500/25 px-5 rounded flex flex-col justify-between">
          <div className="flex gap-x-2 items-center">
            <div className="p-3 rounded bg-blue-800"><Newspaper/></div>
            <h3 className="text-lg font-semibold">Jumlah Beritamu</h3>
          </div>
          <div className="flex justify-end mt-3">
            <h3 className="text-4xl font-bold">{totalBerita}</h3>
          </div>
        </div>
        <div className="bg-[rgb(32_31_31)] py-3 shadow shadow-blue-500/25 px-5 rounded flex flex-col justify-between">
          <div className="flex gap-x-2 items-center">
            <div className="p-3 rounded bg-blue-800"><Eye/></div>
            <h3 className="text-lg font-semibold">Jumlah Penonton</h3>
          </div>
          <div className="flex justify-end mt-3">
            <h3 className="text-4xl font-bold">{totalViews}</h3>
          </div>
        </div>
        <div className="bg-[rgb(32_31_31)] py-3 shadow shadow-blue-500/25 px-5 rounded flex flex-col justify-between">
          <div className="flex gap-x-2 items-center">
            <div className="p-3 rounded bg-blue-800"><ScrollText/></div>
            <h3 className="text-lg font-semibold">Seluruh Kategori</h3>
          </div>
          <div className="flex justify-end mt-3">
            <h3 className="text-4xl font-bold">{totalKategori}</h3>
          </div>
        </div>
      </div>

      <div className="bg-[rgb(32_31_31)] px-5 py-3 my-5 rounded-lg shadow shadow-blue-500/25">
      <h1 className="text-lg font-bold mt-2 mb-5">Traffic View Berita 2025</h1>
        <ResponsiveContainer
              width="100%"
              height={300}
          >
              <AreaChart
                  data={trafic}
                  margin={{
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 0,
                  }}
              >
                  <defs>
                      <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                      >
                          <stop
                              offset="5%"
                              stopColor="#2563eb"
                              stopOpacity={0.8}
                          />
                          <stop
                              offset="95%"
                              stopColor="#2563eb"
                              stopOpacity={0}
                          />
                      </linearGradient>
                  </defs>
                  <Tooltip
                      cursor={false}
                      formatter={(value) => `${value}`}
                  />

                  <XAxis
                      dataKey="name"
                      strokeWidth={0}
                      // stroke={theme === "light" ? "#475569" : "#94a3b8"}
                      tickMargin={6}
                  />
                  <YAxis
                      dataKey="total"
                      strokeWidth={0}
                      // stroke={theme === "light" ? "#475569" : "#94a3b8"}
                      tickFormatter={(value) => `${value}`}
                      tickMargin={6}
                  />

                  <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#2563eb"
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                  />
              </AreaChart>
          </ResponsiveContainer>
      </div>

      <div className="bg-[rgb(32_31_31)] px-5 py-3 my-5 rounded-lg shadow shadow-blue-500/25">
        <h1 className="text-lg font-bold mt-2">Top Artikel Kamu</h1>
        <table className="table mt-5">
          <thead className="table-header">
            <tr className="table-row">
              <th className="table-cell-header">No</th>
              <th className="table-cell-header">Artikel</th>
              <th className="table-cell-header">Views</th>
              <th className="table-cell-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loadingBerita ? (
              <tr>
                <td colSpan={4}>
                  <div className="flex justify-center items-center py-3 font-bold"><LoadingText text={"Memuat Data..."}/></div>
                </td>
              </tr>
            ) : (
              berita && berita.length != 0 ? (
                berita.map((item, i) => (
                  <tr className="table-row">
                    <td className="table-cell-me text-center">{i + 1}</td>
                    <td className="table-cell-me flex items-center gap-x-2">
                      <img src={import.meta.env.VITE_BERITA_API_IMAGE + item.banner} alt="" className="size-12 rounded object-cover" />
                      <div>
                        <h3 className="font-semibold">{potongText(item.judul, 70)}</h3>
                        <span className="text-sm text-gray-400">
                          {item.kategori.map(k => k.kategori).join(', ')} - {formatDateCreatedAt(item.created_at, {nameMonth: true})}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell-me text-center">{formatNumberLikes(item.views)}</td>
                    <td className="table-cell-me">
                      <div className="flex justify-around">
                        <a className="text-sky-500" href={'/berita/' + item.id}><Eye size={18}/></a>
                        <a className="text-purple-500" href={"/dashboard/beritaku/edit/" + item.id}><PenLine size={18}/></a>
                        <a className="text-red-500" href=""><Trash size={18}/></a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
              <tr>
                <td colSpan={4}>
                  <div className="flex justify-center items-center py-3 font-bold">Data Tidak Ditemukan</div>
                </td>
              </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
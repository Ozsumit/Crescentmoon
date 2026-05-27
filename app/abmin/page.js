import { getFeedback, getAnalyticsData, getVideoSources } from "./action";

import DeleteButton from "./deletebutton";
import AnalyticsDashboard from "./AnalyticsDashboard";
import SourceManagement from "./SourceManagement";

export default async function AdminPage() {
  const feedbacks = await getFeedback();
  const analyticsData = await getAnalyticsData();
  const videoSources = await getVideoSources();

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-5xl pt-24 mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
            Admin Panel
          </h1>

          <p className="text-neutral-500 font-medium">
            Project management & analytics
          </p>
        </header>

        <AnalyticsDashboard data={analyticsData} />

        <SourceManagement initialSources={videoSources} />

        <header className="mb-8 mt-12">
          <h2 className="text-2xl font-bold tracking-tight">User Feedback</h2>
        </header>

        <section className="bg-white rounded-[2rem] p-8 shadow-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-neutral-400 text-[11px] uppercase tracking-[0.2em]">
                <th className="pb-6 font-semibold">Type</th>

                <th className="pb-6 font-semibold">Email</th>

                <th className="pb-6 font-semibold">Message</th>

                <th className="pb-6 font-semibold text-right">Action</th>
              </tr>
            </thead>

            <tbody className="text-neutral-900">
              {feedbacks.map((f) => (
                <tr
                  key={f.id}
                  className="group border-t border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="py-6">
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-neutral-100 px-3 py-1 rounded-full text-neutral-600">
                      {f.type}
                    </span>
                  </td>

                  <td className="py-6 text-sm font-medium opacity-70">
                    {f.email || "—"}
                  </td>

                  <td className="py-6 text-sm max-w-sm truncate">
                    {f.message}
                  </td>

                  <td className="py-6 text-right">
                    <DeleteButton id={f.id} />
                  </td>
                </tr>
              ))}

              {feedbacks.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-12 text-center text-neutral-400"
                  >
                    No feedback found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

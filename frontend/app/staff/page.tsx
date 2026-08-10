'use client';

import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { useStaffStore } from '@/stores/cms/staffStore';

export default function StaffPage() {
  const { staff, departments } = useStaffStore();

  const getDeptName = (id: string) =>
    departments.find((d) => d.id === id)?.name ?? 'General';

  const grouped = departments
    .map((dept) => ({
      dept,
      members: staff.filter((s) => s.departmentId === dept.id),
    }))
    .filter((g) => g.members.length > 0);

  const ungrouped = staff.filter(
    (s) => !departments.find((d) => d.id === s.departmentId)
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 relative bg-cover bg-center text-white" style={{ backgroundImage: "url('/Background.jpeg')" }}>
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              OUR TEAM
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Cathedral Staff
            </h1>
            <p className="text-lg text-blue-200 leading-relaxed max-w-2xl mx-auto">
              Meet the dedicated staff who serve behind the scenes to keep ACK Mombasa Memorial Cathedral
              running smoothly and ministering effectively to the congregation and community.
            </p>
          </div>
        </div>
      </section>

      {/* Staff by Department */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {grouped.map(({ dept, members }) => (
            <div key={dept.id}>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gray-200" />
                <div className="inline-block bg-blue-100 text-blue-900 px-5 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                  {dept.name}
                </div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                  <div key={member.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                    <div className="h-64 bg-gradient-to-br from-blue-700 to-indigo-700 overflow-hidden">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover [object-position:center_25%] group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                        {member.role}
                      </p>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {member.title} {member.name}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3">{getDeptName(member.departmentId)}</p>
                      {member.bio && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{member.bio}</p>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {member.email}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {ungrouped.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gray-200" />
                <div className="inline-block bg-gray-100 text-gray-600 px-5 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                  General Staff
                </div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ungrouped.map((member) => (
                  <div key={member.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                    <div className="h-64 bg-gradient-to-br from-blue-700 to-indigo-700 overflow-hidden">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover [object-position:center_25%] group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{member.role}</p>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{member.title} {member.name}</h3>
                      {member.bio && <p className="text-sm text-gray-600 leading-relaxed mb-3">{member.bio}</p>}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {member.email}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact prompt */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Need to get in touch?</h2>
          <p className="text-blue-200 mb-6">
            You can reach any of our staff through the Cathedral Office during working hours,
            Monday to Friday, 8:00 AM – 5:00 PM.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-blue-900 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Contact the Cathedral Office
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
